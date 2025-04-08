from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from django.urls import reverse

from assemble.api.serializers import GroupSerializer, UserSerializer, IPWhitelistSerializer
from assemble.api.models import IPWhitelist, APIKey
from assemble.api.authentication import APIKeyAuthentication
from assemble.api.permissions import HasValidAPIKey, TenantPermission

@extend_schema(tags=['users'])
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing users.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]

@extend_schema(tags=['groups'])
class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing groups.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]

@extend_schema(tags=['security'])
class IPWhitelistViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing IP whitelist.
    """
    queryset = IPWhitelist.objects.all()
    serializer_class = IPWhitelistSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]

@extend_schema(tags=['api'])
class APIRootView(APIView):
    """
    API root view.
    """
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey]
    
    def get(self, request, format=None):
        """
        Return a list of available API endpoints.
        """
        return Response({
            'users': reverse('user-list', request=request, format=format),
            'groups': reverse('group-list', request=request, format=format),
            'ip-whitelist': reverse('ip-whitelist-list', request=request, format=format),
            'customers': reverse('customer-list', request=request, format=format),
            'onboarding': reverse('onboarding-list', request=request, format=format),
            'accounts': reverse('account-list', request=request, format=format),
            'transactions': reverse('transaction-list', request=request, format=format),
            'dict': reverse('dict-list', request=request, format=format),
            'webhooks': reverse('webhook-list', request=request, format=format),
            'limits/pix': reverse('pix-limit-list', request=request, format=format),
            'limits/pix-night': reverse('pix-night-limit-list', request=request, format=format),
            'limits/ted': reverse('ted-limit-list', request=request, format=format),
            'limits/book': reverse('book-limit-list', request=request, format=format),
        })

    def get_queryset(self):
        """
        Filter IP whitelist entries by tenant.
        """
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return IPWhitelist.objects.none()
        
        # Get the API key ID from the query parameters
        api_key_id = self.request.query_params.get('api_key_id')
        
        if api_key_id:
            # Filter by API key ID
            return IPWhitelist.objects.filter(api_key_id=api_key_id, api_key__tenant=self.request.auth.tenant)
        else:
            # Return all IP whitelist entries for the tenant
            return IPWhitelist.objects.filter(api_key__tenant=self.request.auth.tenant)
    
    def perform_create(self, serializer):
        """
        Set the API key when creating an IP whitelist entry.
        """
        api_key_id = self.request.data.get('api_key')
        if api_key_id:
            try:
                api_key = APIKey.objects.get(id=api_key_id, tenant=self.request.auth.tenant)
                serializer.save(api_key=api_key)
            except APIKey.DoesNotExist:
                raise ValidationError({'api_key': 'API key not found or not accessible'})
        else:
            raise ValidationError({'api_key': 'API key is required'})