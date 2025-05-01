from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Account, Statement
from ..serializers import AccountSerializer, StatementSerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.openapi import OpenApiTypes as OA

@extend_schema(
    tags=['accounts'],
    parameters=[
        OpenApiParameter(
            name='includeCustomer',
            type=bool,
            location=OpenApiParameter.QUERY,
            description='Include full customer object in response (customer field)',
            required=False,
            default=False
        )
    ],
    responses={
        200: OpenApiResponse(
            response=AccountSerializer,
            description='Account details',
            examples=[
                OpenApiExample(
                    'Without customer details',
                    value={
                        "id": "uuid",
                        "customer_id": "customer-uuid",
                        "customer": None,
                        "account_number": "12345",
                        "account_type": "CHECKING",
                        "branch": "0001",
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z"
                    }
                ),
                OpenApiExample(
                    'With customer details',
                    value={
                        "id": "uuid",
                        "customer_id": "customer-uuid",
                        "customer": {
                            "id": "customer-uuid",
                            "name": "John Doe",
                            "document": "12345678900",
                            "email": "john@example.com",
                            "phone": "+5511999999999",
                            "is_active": True,
                            "created_at": "2024-01-01T00:00:00Z",
                            "updated_at": "2024-01-01T00:00:00Z"
                        },
                        "account_number": "12345",
                        "account_type": "CHECKING",
                        "branch": "0001",
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z"
                    }
                )
            ]
        )
    }
)
class AccountViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing bank accounts.
    """
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]
    swagger_tags = ['Accounts']
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        """
        Filter accounts by tenant.
        """
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Account.objects.none()
            
        return Account.objects.filter(tenant=self.request.auth.tenant)
    
    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=AccountSerializer,
                description='List of accounts',
                examples=[
                    OpenApiExample(
                        'Without customer details',
                        value={
                            "count": 1,
                            "next": None,
                            "previous": None,
                            "results": [{
                                "id": "uuid",
                                "customer_id": "customer-uuid",
                                "customer": None,
                                "account_number": "12345",
                                "account_type": "CHECKING",
                                "branch": "0001",
                                "created_at": "2024-01-01T00:00:00Z",
                                "updated_at": "2024-01-01T00:00:00Z"
                            }]
                        }
                    ),
                    OpenApiExample(
                        'With customer details',
                        value={
                            "count": 1,
                            "next": None,
                            "previous": None,
                            "results": [{
                                "id": "uuid",
                                "customer_id": "customer-uuid",
                                "customer": {
                                    "id": "customer-uuid",
                                    "name": "John Doe",
                                    "document": "12345678900",
                                    "email": "john@example.com",
                                    "phone": "+5511999999999",
                                    "is_active": True,
                                    "created_at": "2024-01-01T00:00:00Z",
                                    "updated_at": "2024-01-01T00:00:00Z"
                                },
                                "account_number": "12345",
                                "account_type": "CHECKING",
                                "branch": "0001",
                                "created_at": "2024-01-01T00:00:00Z",
                                "updated_at": "2024-01-01T00:00:00Z"
                            }]
                        }
                    )
                ]
            )
        }
    )
    def list(self, request, *args, **kwargs):
        """
        List all accounts for the authenticated tenant.
        Query Parameters:
            includeCustomer (bool): If true, includes full customer object in the customer field
        """
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific account by ID.
        Query Parameters:
            includeCustomer (bool): If true, includes full customer object in the customer field
        """
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new account for a customer.
        """
        return super().create(request, *args, **kwargs)
    
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