from rest_framework import permissions
from .models import Tenant, APIKey

class HasValidAPIKey(permissions.BasePermission):
    """
    Permission class to check if the API key is valid.
    """
    def has_permission(self, request, view):
        # Check if the request has a valid API key
        return bool(request.auth and isinstance(request.auth, APIKey))
    
    def has_object_permission(self, request, view, obj):
        # Check if the API key has access to the tenant of the object
        if hasattr(obj, 'tenant'):
            return obj.tenant == request.auth.tenant
        return True


class TenantPermission(permissions.BasePermission):
    """
    Permission class to check if the API key has access to the requested tenant.
    """
    def has_permission(self, request, view):
        # Check if the request has a valid API key
        if not request.auth or not isinstance(request.auth, APIKey):
            return False
        
        # Get tenant from request data or query params
        tenant_id = request.data.get('tenant') or request.query_params.get('tenant')
        
        # If no tenant is specified, use the tenant of the API key
        if not tenant_id:
            return True
        
        # Check if the API key has access to the requested tenant
        try:
            tenant = Tenant.objects.get(id=tenant_id)
            return tenant == request.auth.tenant
        except Tenant.DoesNotExist:
            return False 