from django.contrib.auth.models import Group, User
from rest_framework import serializers
from .models import (
    Tenant, APIKey, Customer, Onboarding, Account, Statement, 
    Transaction, Dictionary, Webhook, PixLimit, PixNightLimit, 
    TedLimit, BookLimit, IPWhitelist
)
import ipaddress


# Tenant and APIKey Serializers
class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['id', 'name', 'created_at', 'updated_at', 'is_active']


class IPWhitelistSerializer(serializers.ModelSerializer):
    class Meta:
        model = IPWhitelist
        fields = ['id', 'api_key', 'ip_address', 'description', 'created_at', 'is_active']
        read_only_fields = ['created_at']
    
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
        fields = ['id', 'tenant', 'key', 'name', 'created_at', 'last_used', 'is_active', 'ip_whitelist']
        read_only_fields = ['key']


# Customer Serializers
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'tenant', 'external_id', 'name', 'document', 'document_type', 
                 'email', 'phone', 'created_at', 'updated_at']


# Onboarding Serializers
class OnboardingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Onboarding
        fields = ['id', 'customer', 'status', 'data', 'created_at', 'updated_at', 'submitted_at']
        read_only_fields = ['submitted_at']


# Account Serializers
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'customer', 'account_number', 'branch', 'status', 
                 'balance', 'created_at', 'updated_at']


class StatementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statement
        fields = ['id', 'account', 'date', 'description', 'amount', 
                 'balance', 'transaction_type', 'created_at']


# Transaction Serializers
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'account', 'transaction_id', 'transaction_type', 'amount', 
                 'status', 'data', 'created_at', 'updated_at']
        read_only_fields = ['transaction_id']


# Dictionary Serializers
class DictionarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Dictionary
        fields = ['id', 'tenant', 'key', 'value', 'created_at', 'updated_at']


# Webhook Serializers
class WebhookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Webhook
        fields = ['id', 'tenant', 'url', 'events', 'is_active', 'created_at', 'updated_at']


# Limits Serializers
class PixLimitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PixLimit
        fields = ['id', 'tenant', 'daily_limit', 'transaction_limit', 'created_at', 'updated_at']


class PixNightLimitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PixNightLimit
        fields = ['id', 'tenant', 'daily_limit', 'transaction_limit', 'created_at', 'updated_at']


class TedLimitSerializer(serializers.ModelSerializer):
    class Meta:
        model = TedLimit
        fields = ['id', 'tenant', 'daily_limit', 'transaction_limit', 'created_at', 'updated_at']


class BookLimitSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookLimit
        fields = ['id', 'tenant', 'daily_limit', 'transaction_limit', 'created_at', 'updated_at']