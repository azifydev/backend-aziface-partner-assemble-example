from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse
from ..models import Customer
from ..serializers import CustomerSerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication

@extend_schema(
    tags=['customers'],
    responses={
        200: OpenApiResponse(
            response=CustomerSerializer,
            description='Customer details',
            examples=[
                OpenApiExample(
                    'Individual customer',
                    value={
                        "id": "uuid",
                        "name": "John Doe",
                        "secondary_name": "John's Trading",
                        "document": "12345678900",
                        "email": "john@example.com",
                        "phone": "+5511999999999",
                        "nature": "INDIVIDUAL",
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z"
                    }
                ),
                OpenApiExample(
                    'Corporate customer',
                    value={
                        "id": "uuid",
                        "name": "Acme Corp",
                        "secondary_name": "Acme Trading",
                        "document": "12345678000199",
                        "email": "contact@acme.com",
                        "phone": "+5511999999999",
                        "nature": "CORPORATE",
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z"
                    }
                )
            ]
        )
    }
)
class CustomerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing customers.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]
    swagger_tags = ['Customers']
    
    def get_queryset(self):
        """
        Filter customers by tenant.
        """
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Customer.objects.none()
            
        return Customer.objects.filter(tenant=self.request.auth.tenant)
    
    def perform_create(self, serializer):
        """
        Set the tenant when creating a customer.
        """
        serializer.save(tenant=self.request.auth.tenant)
    
    def list(self, request, *args, **kwargs):
        """
        List all customers for the authenticated tenant.
        """
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific customer by ID.
        """
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new customer for the authenticated tenant.
        """
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Update customer contact information.
        Only email and phone can be updated.
        """
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Partially update customer contact information.
        Only email and phone can be updated.
        """
        return super().partial_update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a customer.
        """
        return super().destroy(request, *args, **kwargs) 