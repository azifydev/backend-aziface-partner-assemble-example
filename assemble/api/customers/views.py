from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from ..models import Customer
from ..serializers import CustomerSerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication

@extend_schema(tags=['customers'])
class CustomerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing customers.
    
    This endpoint allows you to:
    * List all customers
    * Create new customers
    * Retrieve specific customer details
    * Update customer information
    * Delete customers
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
    
    @action(detail=False, methods=['get'])
    def list_customers(self, request):
        """
        List all customers.
        """
        return Response({"message": "Hello world - List Customers"})
    
    @action(detail=True, methods=['get'])
    def get_customer(self, request, pk=None):
        """
        Get a specific customer.
        """
        return Response({"message": "Hello world - Get Customer"})
    
    @action(detail=False, methods=['post'])
    def create_customer(self, request):
        """
        Create a new customer.
        """
        return Response({"message": "Hello world - Create Customer"})
    
    @action(detail=True, methods=['put'])
    def update_customer(self, request, pk=None):
        """
        Update a customer.
        """
        return Response({"message": "Hello world - Update Customer"})
    
    @action(detail=True, methods=['delete'])
    def delete_customer(self, request, pk=None):
        """
        Delete a customer.
        """
        return Response({"message": "Hello world - Delete Customer"}) 