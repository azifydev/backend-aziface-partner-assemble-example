#!/usr/bin/env python3
"""
This module provides a Python version of the Maestro API client.
"""

import uuid
import json
import logging
import requests
import urllib.parse
import zlib
from assemble.settings import env

API_ENDPOINT = 'https://maestro.aztech.rest/api/v1.0'
API_ENDPOINT_STAGING = 'https://maestro.azify.dev/api/v1.0'

# Cache for instances
_instances = {}


class MaestroApi:
    def __init__(self, client_id=None, client_secret=None, scopes=None, environment='prod', log=None):
        if scopes is None:
            scopes = "*"

        self.client_id = client_id
        self.client_secret = client_secret
        self.scopes = scopes
        self.env = environment
        self.log = log or logging.getLogger(__name__)

        # Create basic auth header (base64 encoding)
        credentials = f"{self.client_id}:{self.client_secret}".encode('utf-8')
        import base64
        self.auth_header = "Basic " + base64.b64encode(credentials).decode('utf-8')

    def _get_host(self):
        return API_ENDPOINT if self.env == 'prod' else API_ENDPOINT_STAGING

    def _log_response(self, event_name, url, init, response, response_body, error=None):
        log_data = {
            'eventName': event_name,
            'request': {
                'url': url,
                **init
            },
            'response': {
                'status': response.status_code,
                'reason': response.reason,
                'headers': dict(response.headers),
                'body': response_body
            }
        }
        if error:
            log_data['error'] = str(error)
        self.log.info(log_data)

    def _fetch(self, url, method, headers=None, params=None, data=None, json_data=None, files=None):
        # Build default headers
        default_headers = {
            'Authorization': self.auth_header,
            'X-Correlation-ID': str(uuid.uuid4()),
            'API-Version': '1.0'
        }
        if headers:
            default_headers.update(headers)

        # Use requests to make the HTTP call
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=default_headers,
                params=params,
                data=data,
                json=json_data,
                files=files
            )
            response_text = response.text
            # print(response_text)
            try:
                json_response = response.json()
                self._log_response('MaestroCallOk', url, {'method': method, 'headers': default_headers}, response, json_response)
                return json_response
            except json.JSONDecodeError as e:
                self._log_response('MaestroCallFail', url, {'method': method, 'headers': default_headers}, response, response_text, error=e)
                raise e
        except Exception as e:
            self.log.error("Request failed", exc_info=e)
            raise e

    def _get(self, endpoint, variables=None, headers=None):
        if variables is None:
            variables = {}
        url = self._get_host() + endpoint
        return self._fetch(url, method='GET', headers=headers, params=variables)

    def _get_raw(self, endpoint, variables=None, headers=None):
        if variables is None:
            variables = {}
        url = self._get_host() + endpoint
        # Return the raw requests.Response object
        default_headers = {
            'Authorization': self.auth_header,
            'X-Correlation-ID': str(uuid.uuid4()),
            'API-Version': '1.0'
        }
        if headers:
            default_headers.update(headers)
        response = requests.get(url, headers=default_headers, params=variables)
        return response

    def _post(self, endpoint, variables=None, headers=None):
        url = self._get_host() + endpoint
        if variables is None:
            variables = {}
        # If variables exist, send as application/x-www-form-urlencoded
        hdrs = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        if headers:
            hdrs.update(headers)
        encoded = urllib.parse.urlencode(variables)
        return self._fetch(url, method='POST', headers=hdrs, data=encoded)

    def _put_form_data(self, endpoint, form_data, headers=None):
        url = self._get_host() + endpoint
        # 'form_data' is expected to be a dict of key-value pairs.
        # requests will set the proper multipart/form-data headers automatically.
        hdrs = {}
        if headers:
            hdrs.update(headers)
        return requests.put(url, headers=hdrs, files=form_data)

    def _put_json(self, endpoint, variables=None, headers=None):
        url = self._get_host() + endpoint
        return requests.put(url,
                            headers={**{'Content-Type': 'application/json',
                                        'Authorization': self.auth_header,
                                        'X-Correlation-ID': str(uuid.uuid4()),
                                        'API-Version': '1.0'},
                                     **(headers or {})},
                            json=variables)

    def _post_json_raw(self, endpoint, variables=None, headers=None):
        url = self._get_host() + endpoint
        response = requests.post(url,
                                 headers={**{'Content-Type': 'application/json',
                                             'Authorization': self.auth_header,
                                             'X-Correlation-ID': str(uuid.uuid4()),
                                             'API-Version': '1.0'},
                                          **(headers or {})},
                                 json=variables)
        return response

    def _post_json(self, endpoint, variables=None, headers=None):
        url = self._get_host() + endpoint
        return self._fetch(url, method='POST', headers={**{'Content-Type': 'application/json'}, **(headers or {})}, json_data=variables)

    def _delete(self, endpoint, variables=None, headers=None):
        if variables is None:
            variables = {}
        url = self._get_host() + endpoint
        return self._fetch(url, method='DELETE', headers=headers, params=variables)

    # API endpoint methods
    def create_onboarding(self, data):
        """
        Create a new onboarding.
        
        :param data: Dictionary with keys such as 'customerId', 'countryCode', and optionally 'customerProfile'.
        :return: JSON response containing the onboarding ID.
        """
        return self._post_json('/Onboardings', data)

    def update_onboarding(self, onboarding_id, update_onboarding_data, update_onboarding_metadata=None):
        """
        Update the onboarding.

        :param onboarding_id: The onboarding identifier.
        :param update_onboarding_data: List of dictionaries representing updates to the onboarding items.
        :param update_onboarding_metadata: Dictionary with metadata (optional).
        :return: JSON response.
        """
        if update_onboarding_metadata is None:
            update_onboarding_metadata = {}
        endpoint = f'/Onboardings/{onboarding_id}'
        payload = {
            'updateOnboardingData': update_onboarding_data,
            'updateOnboardingMetadata': update_onboarding_metadata
        }
        return self._put_json(endpoint, payload)

    def set_complete_onboarding(self, onboarding_id, status):
        """
        Set the onboarding complete.

        :param onboarding_id: The onboarding identifier.
        :param status: The status to set.
        :return: JSON response containing the KYC ID.
        """
        endpoint = f'/Onboardings/{onboarding_id}/Result'
        payload = {'status': status}
        return self._put_json(endpoint, payload)

    def delete_onboarding(self, onboarding_id):
        """
        Delete an onboarding.

        :param onboarding_id: The onboarding identifier.
        :return: JSON response (typically 'ok' if successful).
        """
        endpoint = f'/Onboardings/{onboarding_id}'
        return self._delete(endpoint)

    def delete_data_onboarding(self, onboarding_id, data):
        """
        Delete data from an onboarding.

        :param onboarding_id: The onboarding identifier.
        :param data: Dictionary containing keys such as 'propertyIds' (list) and optionally 'groupIndex'.
        :return: JSON response (typically 'ok' if successful).
        """
        endpoint = f'/Onboardings/{onboarding_id}/DestroyData'
        
        return self._delete(endpoint)

    def get_onboarding(self, onboarding_id):
        """
        Get the data for the onboarding.

        :param onboarding_id: The onboarding identifier.
        :return: JSON response with the onboarding data.
        """
        endpoint = f'/Onboardings/{onboarding_id}'
        return self._get(endpoint)

    def get_list_onboardings(self, query):
        """
        Get a list of onboardings.

        :param query: Dictionary with optional keys: 'page', 'limit', 'customerId'.
        :return: JSON response containing the onboardings.
        """
        # Set defaults if necessary
        query.setdefault('page', 1)
        query.setdefault('limit', 100)
        endpoint = '/Onboardings'
        return self._get(endpoint, query)

    def create_customer(self, customer_id, data):
        """
        Create a new customer.

        :param customer_id: The customer identifier (UUID string).
        :param data: Dictionary with keys 'type', 'countryCode', 'settings', and optionally 'status'.
        :return: JSON response containing the customer ID.
        """
        endpoint = f'/Customers/{customer_id}'
        return self._post_json(endpoint, data)

    def update_customer(self, customer_id, data):
        """
        Update a customer.

        :param customer_id: The customer identifier.
        :param data: Dictionary with keys 'type', 'countryCode', 'settings', and optionally 'status'.
        :return: JSON response containing the customer ID.
        """
        endpoint = f'/Customers/{customer_id}'
        return self._put_json(endpoint, data)

    def delete_customer(self, customer_id):
        """
        Delete a customer.

        :param customer_id: The customer identifier.
        :return: JSON response (typically true if successful).
        """
        endpoint = f'/Customers/{customer_id}'
        return self._delete(endpoint)

    def get_customer(self, customer_id):
        """
        Get a customer.

        :param customer_id: The customer identifier.
        :return: JSON response with customer details.
        """
        endpoint = f'/Customers/{customer_id}'
        return self._get(endpoint)

    def get_list_customers(self, query):
        """
        Get a list of customers.

        :param query: Dictionary with optional keys: 'page', 'limit', 'type', 'status', 'kycStatus', 'groupId',
                      'includeData', 'includeSettings'.
        :return: JSON response containing the customers collection.
        """
        query.setdefault('page', 1)
        query.setdefault('limit', 100)
        endpoint = '/Customers'
        return self._get(endpoint, query)

    def create_transfer_service(self, data):
        """
        Create a transfer service.
        (This is a placeholder implementation.)

        :param data: Dictionary with transfer details.
        :return: None (or extend to perform an actual call)
        """
        self.log.info("Creating transfer service with data: %s", data)
        # Uncomment and implement the POST call if needed:
        # return self._post('/transfer', data)
        return None
    
    def get_account_balance(self, account_id):
        """
        Get the account balance.

        :param account_id: The account identifier.
        :return: JSON response with the account balance.
        """
        endpoint = f'/Br/BankAccounts/{account_id}/Balances'
        return self._get(endpoint)
    
    def get_account_info(self, account_id):
        """
        Get the account information.

        :param account_id: The account identifier.
        :return: JSON response with the account information.
        """
        endpoint = f'/Br/BankAccounts/{account_id}'
        return self._get(endpoint)

    def get_account_statement(self, account_id, page=1, perPage=100):
        """
        Get the account statement.

        :param account_id: The account identifier.
        :param page: The page number (default 1).
        :param perPage: Number of items per page (default 100).
        :return: JSON response with the account statement.
        """
        endpoint = f'/Br/BankAccounts/{account_id}/Statement'
        params = {'page': page, 'perPage': perPage}
        return self._get(endpoint, variables=params)
    
    def get_pix_keys(self, account_id):
        """
        Get the PIX keys for the account.

        :param account_id: The account identifier.
        :return: JSON response with the PIX keys.
        """
        endpoint = f'/Br/Spi/Dict/Entries/{account_id}'
        return self._get(endpoint)
    
    def create_evp_pix_key(self, account_id):
        """
        Create an EVP PIX key for the account.

        :param account_id: The account identifier.
        :return: JSON response with the PIX key.
        """
        endpoint = f'/Br/Spi/Dict/Entries/{account_id}'

        body = {
            "type": "EVP"
        }

        return self._post(endpoint, body)
    
    def delete_evp_pix_key(self, account_id, key_id):
        """
        Delete an EVP PIX key for the account.

        :param account_id: The account identifier.
        :param key_id: The key identifier.
        :return: JSON response (typically 'ok' if successful).
        """
        endpoint = f'/Br/Spi/Dict/Entries/{account_id}/{key_id}?reason=USER_REQUESTED'
        print(endpoint)
        return self._delete(endpoint)
    
    def get_banks_list(self):
        """
        Get the list of banks.

        :return: JSON response with the list of banks.
        """
        endpoint = '/Br/Banks'
        return self._get(endpoint)

    def send_pix_manual(self, account_id, bank_ispb, branch, account, receiver_name, receiver_taxpayer, account_type, value):
        # generate UUID
        transaction_id = str(uuid.uuid4())

        # remove non-numbers from account number and taxpayer
        account = ''.join(filter(str.isdigit, account))
        receiver_taxpayer = ''.join(filter(str.isdigit, receiver_taxpayer))

        # convert account_type to uppercase
        account_type = account_type.upper()

        endpoint = f'/Br/Spi/Transactional/Outbound/{account_id}/{transaction_id}'
        body = {
            "type": "manual",
            "value": value,
            "requisite": {
                "bankIspb": bank_ispb,
                "branch": branch,
                "account": account,
                "accountType": account_type,
                "holderName": receiver_name,
                "holderTaxpayer": receiver_taxpayer
            }
        }

        print(body)

        return self._post_json(endpoint, body)
    
    def dict_resolve(self, account_id, key_type, key_value):
        """
        Resolve a dictionary key.

        :param account_id: The account identifier.
        :param key_type: The key type.
        :param key_value: The key value.
        :return: JSON response with the resolved key.
        """
        endpoint = f'/Br/Spi/Dict/Entries/{account_id}/Lookup'
        params = {'keyType': key_type, 'value': key_value}
        return self._get(endpoint, params)
    
    def send_pix_dict(self, account_id, e2e_id, value):
        """
        Send a PIX transaction using a dictionary key.

        :param account_id: The account identifier.
        :param e2e_id: The end-to-end identifier.
        :param value: The transaction value.
        :return: JSON response with the transaction details.
        """
        # generate UUID
        transaction_id = str(uuid.uuid4())

        endpoint = f'/Br/Spi/Transactional/Outbound/{account_id}/{transaction_id}'
        body = {
            "type": "key",
            "value": value,
            "requisite": {
                'endToEndId': e2e_id
            }
        }

        return self._post_json(endpoint, body)
    
    def brcode_resolve(self, account_id, brcode):
        """
        Resolve a BRCode.

        :param account_id: The account identifier.
        :param brcode: The BRCode value.
        :return: JSON response with the resolved BRCode.
        """
        endpoint = f'/Br/Spi/Transactional/QrCode/{account_id}/Decode'
        params = {'emv': brcode}
        return self._get(endpoint, params)
    
    def send_pix_brcode(self, account_id, type, qr_code_id, memo = None):
        """
        Send a PIX transaction using a BRCode.

        :param account_id: The account identifier.
        :param type: The transaction type.
        :param qr_code_id: The QR Code identifier.
        :param memo: Optional memo.
        :return: JSON response with the transaction details.
        """
        # generate UUID
        transaction_id = str(uuid.uuid4())

        endpoint = f'/Br/Spi/Transactional/Outbound/{account_id}/{transaction_id}'
        body = {
            "type": type,
            'requisite': {
                "qrCodeId": qr_code_id,
            },
            #"memo": memo
        }

        return self._post_json(endpoint, body)



def Maestro(tenant, scopes=None):
    if scopes is None:
        scopes = "*"

    client_id = tenant.maestro_client_id
    client_secret = tenant.maestro_client_secret
    environment = tenant.maestro_env

    if not client_id or not client_secret or not environment:
        raise ValueError("Client ID and Client Secret must be provided.")

    # Create a cache key using crc32
    key_str = client_id + client_secret + environment + " ".join(scopes)
    cache_key = str(zlib.crc32(key_str.encode('utf-8')))

    if cache_key not in _instances:
        _instances[cache_key] = MaestroApi(client_id, client_secret, scopes, environment)
    return _instances[cache_key]

