from django.contrib import admin
from .models import (
    Tenant, APIKey, IPWhitelist, Customer, Account, Transaction,
    Onboarding, PixLimit, Webhook, WebhookEvent, Statement,
    PixNightLimit, TedLimit, BookLimit
)

class APIKeyInline(admin.TabularInline):
    model = APIKey
    extra = 1
    readonly_fields = ('key', 'created_at')

class IPWhitelistInline(admin.TabularInline):
    model = IPWhitelist
    extra = 1
    fields = ('ip_address', 'description', 'is_active')

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = [APIKeyInline]

@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'key', 'is_active', 'created_at')
    list_filter = ('is_active', 'tenant')
    search_fields = ('name', 'key', 'tenant__name')
    readonly_fields = ('key', 'created_at')
    inlines = [IPWhitelistInline]

@admin.register(IPWhitelist)
class IPWhitelistAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'tenant', 'description', 'is_active', 'created_at')
    list_filter = ('is_active', 'tenant')
    search_fields = ('ip_address', 'description', 'tenant__name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'secondary_name', 'document', 'email', 'phone', 'nature', 'tenant')
    list_filter = ('nature', 'tenant')
    search_fields = ('name', 'secondary_name', 'document', 'email')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('account_number', 'customer', 'customer_tenant', 'account_type', 'branch', 'created_at')
    list_filter = ('account_type', 'customer__tenant')
    search_fields = ('account_number', 'customer__name', 'customer__tenant__name')
    readonly_fields = ('created_at', 'updated_at')

    def customer_tenant(self, obj):
        return obj.customer.tenant
    customer_tenant.short_description = 'Tenant'
    customer_tenant.admin_order_field = 'customer__tenant'

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'account', 'account_tenant', 'transaction_type', 'amount', 'status', 'created_at')
    list_filter = ('transaction_type', 'status', 'account__customer__tenant')
    search_fields = ('id', 'account__account_number', 'idempotency_key', 'account__customer__tenant__name')
    readonly_fields = ('id', 'status', 'created_at', 'updated_at')

    def account_tenant(self, obj):
        return obj.account.customer.tenant
    account_tenant.short_description = 'Tenant'
    account_tenant.admin_order_field = 'account__customer__tenant'

@admin.register(Onboarding)
class OnboardingAdmin(admin.ModelAdmin):
    list_display = ('customer', 'status', 'submitted_at', 'approved_at', 'rejected_at', 'created_at')
    list_filter = ('status', 'customer__tenant')
    search_fields = ('customer__name', 'customer__document')
    readonly_fields = ('status', 'submitted_at', 'approved_at', 'rejected_at', 'created_at', 'updated_at')

@admin.register(PixLimit)
class PixLimitAdmin(admin.ModelAdmin):
    list_display = ('customer', 'customer_tenant', 'daily_limit', 'monthly_limit', 'is_active', 'created_at')
    list_filter = ('is_active', 'customer__tenant')
    search_fields = ('customer__name', 'customer__document', 'customer__tenant__name')
    readonly_fields = ('created_at', 'updated_at')

    def customer_tenant(self, obj):
        return obj.customer.tenant
    customer_tenant.short_description = 'Tenant'
    customer_tenant.admin_order_field = 'customer__tenant'

@admin.register(PixNightLimit)
class PixNightLimitAdmin(admin.ModelAdmin):
    list_display = ('customer', 'customer_tenant', 'daily_limit', 'monthly_limit', 'is_active', 'created_at')
    list_filter = ('is_active', 'customer__tenant')
    search_fields = ('customer__name', 'customer__document', 'customer__tenant__name')
    readonly_fields = ('created_at', 'updated_at')

    def customer_tenant(self, obj):
        return obj.customer.tenant
    customer_tenant.short_description = 'Tenant'
    customer_tenant.admin_order_field = 'customer__tenant'

@admin.register(TedLimit)
class TedLimitAdmin(admin.ModelAdmin):
    list_display = ('customer', 'customer_tenant', 'daily_limit', 'monthly_limit', 'is_active', 'created_at')
    list_filter = ('is_active', 'customer__tenant')
    search_fields = ('customer__name', 'customer__document', 'customer__tenant__name')
    readonly_fields = ('created_at', 'updated_at')

    def customer_tenant(self, obj):
        return obj.customer.tenant
    customer_tenant.short_description = 'Tenant'
    customer_tenant.admin_order_field = 'customer__tenant'

@admin.register(BookLimit)
class BookLimitAdmin(admin.ModelAdmin):
    list_display = ('customer', 'customer_tenant', 'daily_limit', 'monthly_limit', 'is_active', 'created_at')
    list_filter = ('is_active', 'customer__tenant')
    search_fields = ('customer__name', 'customer__document', 'customer__tenant__name')
    readonly_fields = ('created_at', 'updated_at')

    def customer_tenant(self, obj):
        return obj.customer.tenant
    customer_tenant.short_description = 'Tenant'
    customer_tenant.admin_order_field = 'customer__tenant'

@admin.register(Webhook)
class WebhookAdmin(admin.ModelAdmin):
    list_display = ('url', 'tenant', 'event_type', 'is_active', 'created_at')
    list_filter = ('is_active', 'event_type', 'tenant')
    search_fields = ('url', 'event_type', 'tenant__name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ('webhook', 'status', 'response_code', 'created_at')
    list_filter = ('status', 'response_code', 'webhook__tenant')
    search_fields = ('webhook__url', 'payload')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Statement)
class StatementAdmin(admin.ModelAdmin):
    list_display = ('account', 'account_tenant', 'date', 'description', 'amount', 'balance', 'transaction_type', 'created_at')
    list_filter = ('transaction_type', 'account__customer__tenant')
    search_fields = ('account__account_number', 'description', 'account__customer__tenant__name')
    readonly_fields = ('created_at',)

    def account_tenant(self, obj):
        return obj.account.customer.tenant
    account_tenant.short_description = 'Tenant'
    account_tenant.admin_order_field = 'account__customer__tenant'
