from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Account, Statement
from ..serializers import AccountSerializer, StatementSerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample

@extend_schema(tags=['accounts'])
class AccountViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing bank accounts.
    
    This endpoint allows you to:
    * Create new bank accounts
    * View account details
    * Update account information
    * Manage account status
    * Handle account balances
    """
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]
    swagger_tags = ['Accounts']
    
    def get_queryset(self):
        """
        Filter accounts by tenant.
        """
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Account.objects.none()
            
        return Account.objects.filter(customer__tenant=self.request.auth.tenant)
    
    @action(detail=False, methods=['get'])
    def list_accounts(self, request):
        """
        List all accounts.
        """
        return Response({"message": "Hello world - List Accounts"})
    
    @action(detail=True, methods=['get'])
    def get_account(self, request, pk=None):
        """
        Get a specific account.
        """
        return Response({"message": "Hello world - Get Account"})
    
    @action(detail=False, methods=['post'])
    def create_account(self, request):
        """
        Create a new account.
        """
        return Response({"message": "Hello world - Create Account"})
    
    @action(detail=True, methods=['delete'])
    def delete_account(self, request, pk=None):
        """
        Delete an account.
        """
        return Response({"message": "Hello world - Delete Account"})
    
    @action(detail=True, methods=['get'])
    def statement(self, request, pk=None):
        """
        Get account statement with pagination and filters.
        """
        return Response({"message": "Hello world - Account Statement"}) 