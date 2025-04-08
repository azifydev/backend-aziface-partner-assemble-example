from rest_framework import authentication
from rest_framework import exceptions
from django.utils import timezone
from django.conf import settings
from .models import APIKey, IPWhitelist, Tenant
import ipaddress

class APIKeyAuthentication(authentication.BaseAuthentication):
    """
    Authentication class for API key-based authentication.
    """
    def authenticate(self, request):
        # Try X-API-Key header first
        api_key = request.headers.get('X-API-Key')
        
        # If not found, try Authorization header
        if not api_key:
            auth_header = request.headers.get('Authorization')
            if auth_header:
                # Remove 'Bearer ' prefix if present
                api_key = auth_header.replace('Bearer ', '').strip()
        
        if not api_key:
            return None
            
        try:
            api_key_obj = APIKey.objects.select_related('tenant').get(key=api_key, is_active=True)
            
            # Update last used timestamp
            api_key_obj.last_used = timezone.now()
            api_key_obj.save(update_fields=['last_used'])
            
            # Check if tenant is active
            if not api_key_obj.tenant.is_active:
                raise exceptions.AuthenticationFailed('Tenant is inactive')
                
            # Set the tenant on the request for later use
            request.auth = api_key_obj
            request.tenant = api_key_obj.tenant
            
            # Check if the IP is in the whitelist
            client_ip = self._get_client_ip(request)
            
            # Validate the IP address
            if not self._is_valid_ip(client_ip):
                raise exceptions.AuthenticationFailed('Invalid IP address format')
                
            ip_allowed = self._is_ip_allowed(api_key_obj, client_ip)
            
            if not ip_allowed:
                # Handle IP not in whitelist based on settings
                if getattr(settings, 'API_KEY_IP_WHITELIST', {}).get('REVOKE_KEY_ON_IP_MISMATCH', False):
                    # Revoke the API key
                    api_key_obj.is_active = False
                    api_key_obj.save()
                    raise exceptions.AuthenticationFailed('API key has been revoked due to unauthorized IP access')
                else:
                    raise exceptions.AuthenticationFailed('IP address not allowed for this API key')
            
            return (api_key_obj.tenant, api_key_obj)
            
        except APIKey.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid API key')
        except Exception as e:
            raise exceptions.AuthenticationFailed(str(e))
            
    def authenticate_header(self, request):
        return 'Bearer'
    
    def _get_client_ip(self, request):
        """
        Get the client IP address from the request.
        """
        # Get settings with defaults
        settings_dict = getattr(settings, 'API_KEY_IP_WHITELIST', {})
        use_x_forwarded_for = settings_dict.get('USE_X_FORWARDED_FOR', True)
        trusted_proxies = settings_dict.get('TRUSTED_PROXIES', [])
        
        # Get the client IP
        if use_x_forwarded_for:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                # Get the first IP in the list (client IP)
                ip = x_forwarded_for.split(',')[0].strip()
                
                # If we have trusted proxies configured, check if the request is coming from a trusted proxy
                if trusted_proxies:
                    # Get the remote address (proxy IP)
                    remote_addr = request.META.get('REMOTE_ADDR')
                    
                    # If the remote address is not in the trusted proxies list, use it instead
                    if remote_addr not in trusted_proxies:
                        ip = remote_addr
                
                return ip
        
        # Fallback to REMOTE_ADDR
        return request.META.get('REMOTE_ADDR')
    
    def _is_valid_ip(self, ip_address):
        """
        Validate that the IP address is in the correct format.
        """
        try:
            ipaddress.ip_address(ip_address)
            return True
        except ValueError:
            return False
    
    def _is_ip_allowed(self, api_key, client_ip):
        """
        Check if the client IP is allowed for the API key.
        """
        # Get all active IP whitelist entries for this API key
        whitelist_entries = IPWhitelist.objects.filter(api_key=api_key, is_active=True)
        
        # If there are no whitelist entries and ALLOW_ALL_IPS_IF_NO_WHITELIST is True,
        # allow all IPs
        if not whitelist_entries.exists() and getattr(settings, 'API_KEY_IP_WHITELIST', {}).get('ALLOW_ALL_IPS_IF_NO_WHITELIST', True):
            return True
        
        # Check if the client IP is in the whitelist
        return whitelist_entries.filter(ip_address=client_ip).exists() 