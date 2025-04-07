from django.contrib import admin
from .models import (
    Tenant, APIKey, Customer, Onboarding, Account, Statement,
    Transaction, Dictionary, Webhook, PixLimit, PixNightLimit,
    TedLimit, BookLimit
)

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'updated_at', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'key', 'created_at', 'last_used', 'is_active')
    list_filter = ('tenant', 'is_active')
    search_fields = ('name', 'tenant__name')
    readonly_fields = ('key',)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'document', 'document_type', 'email', 'created_at')
    list_filter = ('tenant', 'document_type')
    search_fields = ('name', 'document', 'email', 'tenant__name')


@admin.register(Onboarding)
class OnboardingAdmin(admin.ModelAdmin):
    list_display = ('customer', 'status', 'created_at', 'updated_at', 'submitted_at')
    list_filter = ('status', 'customer__tenant')
    search_fields = ('customer__name', 'customer__document')


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('account_number', 'branch', 'customer', 'status', 'balance', 'created_at')
    list_filter = ('status', 'customer__tenant')
    search_fields = ('account_number', 'customer__name', 'customer__document')


@admin.register(Statement)
class StatementAdmin(admin.ModelAdmin):
    list_display = ('account', 'date', 'description', 'amount', 'balance', 'transaction_type')
    list_filter = ('date', 'transaction_type', 'account__customer__tenant')
    search_fields = ('account__account_number', 'description')
    date_hierarchy = 'date'


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'account', 'transaction_type', 'amount', 'status', 'created_at')
    list_filter = ('transaction_type', 'status', 'account__customer__tenant')
    search_fields = ('transaction_id', 'account__account_number')
    readonly_fields = ('transaction_id',)


@admin.register(Dictionary)
class DictionaryAdmin(admin.ModelAdmin):
    list_display = ('key', 'tenant', 'created_at', 'updated_at')
    list_filter = ('tenant',)
    search_fields = ('key', 'tenant__name')


@admin.register(Webhook)
class WebhookAdmin(admin.ModelAdmin):
    list_display = ('url', 'tenant', 'is_active', 'created_at')
    list_filter = ('tenant', 'is_active')
    search_fields = ('url', 'tenant__name')


@admin.register(PixLimit)
class PixLimitAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'daily_limit', 'transaction_limit', 'created_at')
    list_filter = ('tenant',)
    search_fields = ('tenant__name',)


@admin.register(PixNightLimit)
class PixNightLimitAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'daily_limit', 'transaction_limit', 'created_at')
    list_filter = ('tenant',)
    search_fields = ('tenant__name',)


@admin.register(TedLimit)
class TedLimitAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'daily_limit', 'transaction_limit', 'created_at')
    list_filter = ('tenant',)
    search_fields = ('tenant__name',)


@admin.register(BookLimit)
class BookLimitAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'daily_limit', 'transaction_limit', 'created_at')
    list_filter = ('tenant',)
    search_fields = ('tenant__name',)
