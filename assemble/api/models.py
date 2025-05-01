from django.db import models
from django.contrib.auth.models import User, Group
from django.core.exceptions import ValidationError
import uuid
import ipaddress
from django.utils import timezone
import secrets
import string

# API Key and Tenant Models
class BaseModel(models.Model):
    """
    Base model for all models in the API.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class Tenant(BaseModel):
    """
    Tenant model for multi-tenancy.
    """
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class APIKey(BaseModel):
    """
    API key model for authentication.
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='api_keys')
    key = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_api_keys')
    last_used = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.tenant.name})"

    def save(self, *args, **kwargs):
        if not self.key:
            # Generate a secure random API key
            alphabet = string.ascii_letters + string.digits
            self.key = ''.join(secrets.choice(alphabet) for _ in range(32))
        super().save(*args, **kwargs)

class IPWhitelist(BaseModel):
    """
    IP whitelist model for API access control.
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='ip_whitelists', null=True, blank=True)
    api_key = models.ForeignKey(APIKey, on_delete=models.CASCADE, related_name='ip_whitelists', null=True)
    ip_address = models.GenericIPAddressField()
    description = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('api_key', 'ip_address')
    
    def __str__(self):
        return f"{self.ip_address} ({self.api_key.name if self.api_key else self.tenant.name})"
        
    def save(self, *args, **kwargs):
        if self.api_key and not self.tenant:
            self.tenant = self.api_key.tenant
        super().save(*args, **kwargs)

# Customer Models
class Customer(BaseModel):
    """
    Customer model for the API.
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='customers')
    name = models.CharField(max_length=100)
    document = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.document})"

# Onboarding Models
class Onboarding(BaseModel):
    """
    Onboarding model for the API.
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='onboardings')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='onboardings')
    status = models.CharField(max_length=20, choices=[
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ], default='DRAFT')
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.customer.name} - {self.status}"

    def save(self, *args, **kwargs):
        if self.customer and not self.tenant:
            self.tenant = self.customer.tenant
        super().save(*args, **kwargs)

# Account Models
class Account(BaseModel):
    """
    Account model for the API.
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='accounts')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='accounts')
    account_number = models.CharField(max_length=20, unique=True)
    account_type = models.CharField(max_length=20, choices=[
        ('CHECKING', 'Checking'),
        ('SAVINGS', 'Savings'),
    ])
    branch = models.CharField(max_length=4, default='0000')
    
    def __str__(self):
        return f"{self.account_number} - {self.customer.name}"

    def save(self, *args, **kwargs):
        if self.customer and not self.tenant:
            self.tenant = self.customer.tenant
        if not self.branch:
            self.branch = self.tenant.branch if hasattr(self.tenant, 'branch') else '0000'
        super().save(*args, **kwargs)

class Statement(BaseModel):
    """
    Statement model for the API.
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='statements')
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='statements')
    date = models.DateField()
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    balance = models.DecimalField(max_digits=15, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=[
        ('CREDIT', 'Credit'),
        ('DEBIT', 'Debit'),
    ])
    
    def __str__(self):
        return f"{self.date} - {self.description} - {self.amount}"

    def save(self, *args, **kwargs):
        if self.account and not self.tenant:
            self.tenant = self.account.tenant
        super().save(*args, **kwargs)

# Transaction Models
class Transaction(BaseModel):
    """
    Transaction model for the API.
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='transactions')
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=[
        ('PIX', 'PIX'),
        ('TED', 'TED'),
        ('BOOK', 'Book Transfer'),
        ('TECBAN', 'TecBan'),
    ])
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    ], default='PENDING')
    description = models.TextField(blank=True)
    idempotency_key = models.CharField(max_length=100, unique=True, null=True, blank=True)
    
    def __str__(self):
        return f"{self.transaction_type} - {self.amount} - {self.status}"

    def save(self, *args, **kwargs):
        if self.account and not self.tenant:
            self.tenant = self.account.tenant
        super().save(*args, **kwargs)

# Dictionary Models
class Dictionary(BaseModel):
    """
    Dictionary model for the API.
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='dictionaries')
    key = models.CharField(max_length=255)
    value = models.JSONField()
    
    class Meta:
        unique_together = ('tenant', 'key')
    
    def __str__(self):
        return f"{self.key} - {self.tenant.name}"

# Webhook Models
class Webhook(BaseModel):
    """
    Webhook model for the API.
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='webhooks')
    url = models.URLField()
    event_type = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.event_type} - {self.url}"

class WebhookEvent(BaseModel):
    """
    Webhook event model for the API.
    """
    webhook = models.ForeignKey(Webhook, on_delete=models.CASCADE, related_name='events')
    payload = models.JSONField()
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
    ], default='PENDING')
    response_code = models.IntegerField(null=True, blank=True)
    response_body = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.webhook.event_type} - {self.status}"

# Limits Models
class PixLimit(BaseModel):
    """
    PIX limit model for the API.
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='pix_limits')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='pix_limits')
    daily_limit = models.DecimalField(max_digits=15, decimal_places=2)
    monthly_limit = models.DecimalField(max_digits=15, decimal_places=2)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.customer.name} - PIX Limits"

    def save(self, *args, **kwargs):
        if self.customer and not self.tenant:
            self.tenant = self.customer.tenant
        super().save(*args, **kwargs)

class PixNightLimit(BaseModel):
    """
    PIX night limit model for the API.
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='pix_night_limits')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='pix_night_limits')
    daily_limit = models.DecimalField(max_digits=15, decimal_places=2)
    monthly_limit = models.DecimalField(max_digits=15, decimal_places=2)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.customer.name} - PIX Night Limits"

    def save(self, *args, **kwargs):
        if self.customer and not self.tenant:
            self.tenant = self.customer.tenant
        super().save(*args, **kwargs)

class TedLimit(BaseModel):
    """
    TED limit model for the API.
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='ted_limits')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='ted_limits')
    daily_limit = models.DecimalField(max_digits=15, decimal_places=2)
    monthly_limit = models.DecimalField(max_digits=15, decimal_places=2)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.customer.name} - TED Limits"

    def save(self, *args, **kwargs):
        if self.customer and not self.tenant:
            self.tenant = self.customer.tenant
        super().save(*args, **kwargs)

class BookLimit(BaseModel):
    """
    Book limit model for the API.
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='book_limits')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='book_limits')
    daily_limit = models.DecimalField(max_digits=15, decimal_places=2)
    monthly_limit = models.DecimalField(max_digits=15, decimal_places=2)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.customer.name} - Book Limits"

    def save(self, *args, **kwargs):
        if self.customer and not self.tenant:
            self.tenant = self.customer.tenant
        super().save(*args, **kwargs)
