from django.db import models
from django.contrib.auth.models import User
import uuid

# API Key and Tenant Models
class Tenant(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class APIKey(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='api_keys')
    key = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} - {self.tenant.name}"

# Customer Models
class Customer(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='customers')
    external_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    document = models.CharField(max_length=20)  # CPF or CNPJ
    document_type = models.CharField(max_length=10, choices=[('CPF', 'CPF'), ('CNPJ', 'CNPJ')])
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.document}"

# Onboarding Models
class Onboarding(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='onboardings')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Onboarding for {self.customer.name} - {self.status}"

# Account Models
class Account(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('BLOCKED', 'Blocked'),
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='accounts')
    account_number = models.CharField(max_length=20, unique=True)
    branch = models.CharField(max_length=10)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.account_number} - {self.customer.name}"

class Statement(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='statements')
    date = models.DateField()
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    balance = models.DecimalField(max_digits=15, decimal_places=2)
    transaction_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.account.account_number} - {self.date} - {self.amount}"

# Transaction Models
class Transaction(models.Model):
    TYPE_CHOICES = [
        ('PIX', 'Pix'),
        ('TED', 'TED'),
        ('BOOK', 'Book'),
        ('TECBAN', 'Tecban'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    transaction_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.transaction_type} - {self.amount} - {self.status}"

# Dictionary Models
class Dictionary(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='dictionaries')
    key = models.CharField(max_length=255)
    value = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('tenant', 'key')
    
    def __str__(self):
        return f"{self.key} - {self.tenant.name}"

# Webhook Models
class Webhook(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='webhooks')
    url = models.URLField()
    events = models.JSONField()  # List of events to subscribe to
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.url} - {self.tenant.name}"

# Limits Models
class PixLimit(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='pix_limits')
    daily_limit = models.DecimalField(max_digits=15, decimal_places=2)
    transaction_limit = models.DecimalField(max_digits=15, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Pix Limits - {self.tenant.name}"

class PixNightLimit(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='pix_night_limits')
    daily_limit = models.DecimalField(max_digits=15, decimal_places=2)
    transaction_limit = models.DecimalField(max_digits=15, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Pix Night Limits - {self.tenant.name}"

class TedLimit(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='ted_limits')
    daily_limit = models.DecimalField(max_digits=15, decimal_places=2)
    transaction_limit = models.DecimalField(max_digits=15, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"TED Limits - {self.tenant.name}"

class BookLimit(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='book_limits')
    daily_limit = models.DecimalField(max_digits=15, decimal_places=2)
    transaction_limit = models.DecimalField(max_digits=15, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Book Limits - {self.tenant.name}"
