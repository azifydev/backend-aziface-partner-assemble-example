from django.contrib.auth.models import Group, User
from rest_framework import serializers
from .models import (
    Tenant, APIKey, Customer, Onboarding, Account, Statement, 
    Transaction, Dictionary, Webhook, PixLimit, PixNightLimit, 
    TedLimit, BookLimit, IPWhitelist, WebhookEvent
)
import ipaddress


# Tenant and APIKey Serializers
class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['id', 'name', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class IPWhitelistSerializer(serializers.ModelSerializer):
    class Meta:
        model = IPWhitelist
        fields = ['id', 'ip_address', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_ip_address(self, value):
        """
        Validate that the IP address is in the correct format.
        """
        try:
            ipaddress.ip_address(value)
        except ValueError:
            raise serializers.ValidationError("Invalid IP address format")
        return value


class APIKeySerializer(serializers.ModelSerializer):
    ip_whitelist = IPWhitelistSerializer(many=True, read_only=True)
    
    class Meta:
        model = APIKey
        fields = ['id', 'key', 'name', 'is_active', 'created_by', 'created_at']
        read_only_fields = ['id', 'key', 'created_at']


# Customer Serializers
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'document', 'email', 'phone', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


# Onboarding Serializers
class OnboardingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Onboarding
        fields = ['id', 'tenant', 'customer', 'status', 'submitted_at', 'approved_at', 'rejected_at', 'rejection_reason', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'status', 'submitted_at', 'approved_at', 'rejected_at', 'created_at', 'updated_at']


# Account Serializers
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'tenant', 'customer', 'account_number', 'account_type', 'balance', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'balance', 'created_at', 'updated_at']


class StatementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statement
        fields = ['id', 'tenant', 'account', 'date', 'description', 'amount', 'balance', 'transaction_type', 'created_at']
        read_only_fields = ['id', 'tenant', 'created_at']


# Transaction Serializers
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'tenant', 'account', 'transaction_type', 'amount', 'status', 'description', 'idempotency_key', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'status', 'created_at', 'updated_at']
    
    def validate(self, data):
        """
        Validate the transaction data.
        """
        # Ensure the account belongs to the tenant
        request = self.context.get('request')
        if request and hasattr(request, 'auth') and request.auth:
            tenant = request.auth.tenant
            account = data.get('account')
            if account and account.customer.tenant != tenant:
                raise serializers.ValidationError({'account': 'Account does not belong to the authenticated tenant'})
        
        return data


# Dictionary Serializers
class DictionarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Dictionary
        fields = ['id', 'tenant', 'key', 'value', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


# Webhook Serializers
class WebhookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Webhook
        fields = ['id', 'tenant', 'url', 'event_type', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


# Limits Serializers
class PixLimitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PixLimit
        fields = ['id', 'tenant', 'customer', 'daily_limit', 'monthly_limit', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class PixNightLimitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PixNightLimit
        fields = ['id', 'tenant', 'customer', 'daily_limit', 'monthly_limit', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class TedLimitSerializer(serializers.ModelSerializer):
    class Meta:
        model = TedLimit
        fields = ['id', 'tenant', 'customer', 'daily_limit', 'monthly_limit', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class BookLimitSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookLimit
        fields = ['id', 'tenant', 'customer', 'daily_limit', 'monthly_limit', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class WebhookEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookEvent
        fields = ['id', 'webhook', 'payload', 'status', 'response_code', 'response_body', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']