from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import MethodNotAllowed, ValidationError
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse
from ..models import Transaction
from ..serializers import TransactionSerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication
from django.db import transaction
from django.utils import timezone

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
            
        return Transaction.objects.filter(tenant=self.request.auth.tenant)
    
    def perform_create(self, serializer):
        """
        Set the tenant when creating a transaction.
        """
        serializer.save(tenant=self.request.auth.tenant)
    
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
    
    def _handle_idempotency(self, request, transaction_type):
        """
        Handle idempotency for transaction creation.
        """
        idempotency_key = request.headers.get('X-Idempotency-Key')
        
        if not idempotency_key:
            return None
            
        # Check if a transaction with this idempotency key already exists
        existing_transaction = Transaction.objects.filter(
            idempotency_key=idempotency_key,
            account__customer__tenant=self.request.auth.tenant
        ).first()
        
        if existing_transaction:
            return existing_transaction
            
        return None
    
    @action(detail=False, methods=['post'])
    def create_pix(self, request):
        """
        Create a new PIX transaction.
        
        To ensure idempotency, include an X-Idempotency-Key header with a unique value.
        If a transaction with the same idempotency key already exists, the existing transaction will be returned.
        """
        # Check for idempotency
        existing_transaction = self._handle_idempotency(request, 'PIX')
        if existing_transaction:
            serializer = self.get_serializer(existing_transaction)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        # Create new transaction
        serializer = self.get_serializer(data={
            **request.data, 
            'transaction_type': 'PIX',
            'idempotency_key': request.headers.get('X-Idempotency-Key')
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def create_ted(self, request):
        """
        Create a new TED transaction.
        
        To ensure idempotency, include an X-Idempotency-Key header with a unique value.
        If a transaction with the same idempotency key already exists, the existing transaction will be returned.
        """
        # Check for idempotency
        existing_transaction = self._handle_idempotency(request, 'TED')
        if existing_transaction:
            serializer = self.get_serializer(existing_transaction)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        # Create new transaction
        serializer = self.get_serializer(data={
            **request.data, 
            'transaction_type': 'TED',
            'idempotency_key': request.headers.get('X-Idempotency-Key')
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def create_book(self, request):
        """
        Create a new book transaction.
        
        To ensure idempotency, include an X-Idempotency-Key header with a unique value.
        If a transaction with the same idempotency key already exists, the existing transaction will be returned.
        """
        # Check for idempotency
        existing_transaction = self._handle_idempotency(request, 'BOOK')
        if existing_transaction:
            serializer = self.get_serializer(existing_transaction)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        # Create new transaction
        serializer = self.get_serializer(data={
            **request.data, 
            'transaction_type': 'BOOK',
            'idempotency_key': request.headers.get('X-Idempotency-Key')
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def create_tecban(self, request):
        """
        Create a new TECBAN transaction.
        
        To ensure idempotency, include an X-Idempotency-Key header with a unique value.
        If a transaction with the same idempotency key already exists, the existing transaction will be returned.
        """
        # Check for idempotency
        existing_transaction = self._handle_idempotency(request, 'TECBAN')
        if existing_transaction:
            serializer = self.get_serializer(existing_transaction)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        # Create new transaction
        serializer = self.get_serializer(data={
            **request.data, 
            'transaction_type': 'TECBAN',
            'idempotency_key': request.headers.get('X-Idempotency-Key')
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED) 