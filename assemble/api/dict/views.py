from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from ..models import Dictionary
from ..serializers import DictionarySerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication

@extend_schema(tags=['dictionary'])
class DictionaryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing dictionary entries.
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
        Set the tenant when creating a dictionary entry.
        """
        serializer.save(tenant=self.request.auth.tenant)
    
    def list(self, request, *args, **kwargs):
        """
        List all dictionary entries for the authenticated tenant.
        """
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific dictionary entry by ID.
        """
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new dictionary entry.
        """
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Update a dictionary entry's information.
        """
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a dictionary entry.
        """
        return super().destroy(request, *args, **kwargs) 