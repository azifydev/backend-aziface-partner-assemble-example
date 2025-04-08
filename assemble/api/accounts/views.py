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
            
        return Account.objects.filter(tenant=self.request.auth.tenant)
    
    def list(self, request, *args, **kwargs):
        """
        List all accounts for the authenticated tenant.
        """
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific account by ID.
        """
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new account for a customer.
        """
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Update an account's information.
        """
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete an account.
        """
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def statement(self, request, pk=None):
        """
        Get account statement with pagination and filters.
        """
        account = self.get_object()
        statements = Statement.objects.filter(account=account)
        serializer = StatementSerializer(statements, many=True)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """
        Set the tenant when creating an account.
        """
        serializer.save(tenant=self.request.auth.tenant) 