from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Dictionary
from ..serializers import DictionarySerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication

class DictionaryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing dictionary entries.
    
    This endpoint allows you to:
    * Manage system dictionaries
    * Handle lookup values
    * Maintain reference data
    * Support multi-language entries
    """
    queryset = Dictionary.objects.all()
    serializer_class = DictionarySerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]
    swagger_tags = ['Dictionary']
    
    def get_queryset(self):
        """
        Filter dictionary entries by tenant.
        """
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Dictionary.objects.none()
            
        return Dictionary.objects.filter(tenant=self.request.auth.tenant)
    
    def perform_create(self, serializer):
        """
        Set the tenant when creating a dictionary.
        """
        serializer.save(tenant=self.request.auth.tenant)
    
    @action(detail=False, methods=['get'])
    def list_dict(self, request):
        """
        List all dictionary entries.
        """
        return Response({"message": "Hello world - List Dictionary"})
    
    @action(detail=False, methods=['post'])
    def create_dict(self, request):
        """
        Create a new dictionary entry.
        """
        return Response({"message": "Hello world - Create Dictionary"})
    
    @action(detail=True, methods=['delete'])
    def delete_dict(self, request, pk=None):
        """
        Delete a dictionary entry.
        """
        return Response({"message": "Hello world - Delete Dictionary"})
    
    @action(detail=False, methods=['get'])
    def resolve(self, request):
        """
        Resolve a dictionary entry.
        """
        return Response({"message": "Hello world - Resolve Dictionary"}) 