from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from ..models import Transaction
from ..serializers import TransactionSerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication

@extend_schema(tags=['transactions'])
class TransactionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing transactions.
    
    This endpoint allows you to:
    * Create new transactions
    * View transaction history
    * Track transaction status
    * Handle transaction types (PIX, TED, etc.)
    * Manage transaction limits
    """
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]
    swagger_tags = ['Transactions']
    
    def get_queryset(self):
        """
        Filter transactions by tenant.
        """
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Transaction.objects.none()
            
        return Transaction.objects.filter(account__customer__tenant=self.request.auth.tenant)
    
    @action(detail=False, methods=['get'])
    def lookup(self, request):
        """
        Lookup a transaction.
        """
        return Response({"message": "Hello world - Lookup Transaction"})
    
    @action(detail=False, methods=['post'])
    def create_pix(self, request):
        """
        Create a PIX transaction.
        """
        return Response({"message": "Hello world - Create PIX Transaction"})
    
    @action(detail=False, methods=['post'])
    def create_ted(self, request):
        """
        Create a TED transaction.
        """
        return Response({"message": "Hello world - Create TED Transaction"})
    
    @action(detail=False, methods=['post'])
    def create_book(self, request):
        """
        Create a Book transaction.
        """
        return Response({"message": "Hello world - Create Book Transaction"})
    
    @action(detail=False, methods=['post'])
    def create_tecban(self, request):
        """
        Create a Tecban transaction.
        """
        return Response({"message": "Hello world - Create Tecban Transaction"}) 