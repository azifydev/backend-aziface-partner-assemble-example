from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import MethodNotAllowed
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse
from ..models import Transaction
from ..serializers import TransactionSerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication

@extend_schema(tags=['transactions'])
class TransactionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing transactions.
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
    
    def list(self, request, *args, **kwargs):
        """
        List all transactions for the authenticated tenant.
        """
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific transaction by ID.
        """
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(exclude=True)
    def create(self, request, *args, **kwargs):
        """
        Create a new transaction.
        This endpoint is not available. Please use one of the specific transaction type endpoints:
        - POST /api/transactions/create_pix/
        - POST /api/transactions/create_ted/
        - POST /api/transactions/create_book/
        - POST /api/transactions/create_tecban/
        """
        raise MethodNotAllowed('POST', detail='Please use one of the specific transaction type endpoints')
    
    def update(self, request, *args, **kwargs):
        """
        Update a transaction's information.
        """
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a transaction.
        """
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    def create_pix(self, request):
        """
        Create a new PIX transaction.
        """
        serializer = self.get_serializer(data={**request.data, 'transaction_type': 'PIX'})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def create_ted(self, request):
        """
        Create a new TED transaction.
        """
        serializer = self.get_serializer(data={**request.data, 'transaction_type': 'TED'})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def create_book(self, request):
        """
        Create a new book transaction.
        """
        serializer = self.get_serializer(data={**request.data, 'transaction_type': 'BOOK'})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def create_tecban(self, request):
        """
        Create a new TECBAN transaction.
        """
        serializer = self.get_serializer(data={**request.data, 'transaction_type': 'TECBAN'})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED) 