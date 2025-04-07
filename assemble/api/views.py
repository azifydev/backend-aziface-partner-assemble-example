from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action

from assemble.api.serializers import GroupSerializer, UserSerializer, IPWhitelistSerializer
from assemble.api.models import IPWhitelist, APIKey
from assemble.api.authentication import APIKeyAuthentication
from assemble.api.permissions import HasValidAPIKey, TenantPermission

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ['Authentication']


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ['Authentication']


class APIRootView(APIView):
    """
    API root view that provides an overview of all available endpoints.
    """
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ['Overview']
    
    def get(self, request, format=None):
        return Response({
            'customers': {
                'list': '/api/customers/',
                'detail': '/api/customers/{id}/',
                'description': 'Customer management endpoints'
            },
            'onboarding': {
                'list': '/api/onboarding/',
                'detail': '/api/onboarding/{id}/',
                'description': 'Customer onboarding process endpoints'
            },
            'accounts': {
                'list': '/api/accounts/',
                'detail': '/api/accounts/{id}/',
                'description': 'Bank account management endpoints'
            },
            'transactions': {
                'list': '/api/transactions/',
                'detail': '/api/transactions/{id}/',
                'description': 'Transaction management endpoints'
            },
            'dictionary': {
                'list': '/api/dict/',
                'detail': '/api/dict/{id}/',
                'description': 'Dictionary management endpoints'
            },
            'webhooks': {
                'list': '/api/webhooks/',
                'detail': '/api/webhooks/{id}/',
                'description': 'Webhook management endpoints'
            },
            'limits': {
                'pix': {
                    'list': '/api/limits/pix/',
                    'detail': '/api/limits/pix/{id}/',
                    'description': 'PIX transaction limits'
                },
                'pix-night': {
                    'list': '/api/limits/pix-night/',
                    'detail': '/api/limits/pix-night/{id}/',
                    'description': 'PIX night transaction limits'
                },
                'ted': {
                    'list': '/api/limits/ted/',
                    'detail': '/api/limits/ted/{id}/',
                    'description': 'TED transaction limits'
                },
                'book': {
                    'list': '/api/limits/book/',
                    'detail': '/api/limits/book/{id}/',
                    'description': 'Book transaction limits'
                }
            },
            'users': {
                'list': '/api/users/',
                'detail': '/api/users/{id}/',
                'description': 'User management endpoints'
            },
            'groups': {
                'list': '/api/groups/',
                'detail': '/api/groups/{id}/',
                'description': 'Group management endpoints'
            }
        })

class IPWhitelistViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing IP whitelists for API keys.
    
    This endpoint allows you to:
    * Add IP addresses to the whitelist
    * Remove IP addresses from the whitelist
    * View all whitelisted IPs for an API key
    """
    queryset = IPWhitelist.objects.all()
    serializer_class = IPWhitelistSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]
    swagger_tags = ['Authentication']
    
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