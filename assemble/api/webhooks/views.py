from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from ..models import Webhook
from ..serializers import WebhookSerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication

@extend_schema(tags=['webhooks'])
class WebhookViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing webhooks.
    """
    queryset = Webhook.objects.all()
    serializer_class = WebhookSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]
    swagger_tags = ['Webhooks']
    
    def get_queryset(self):
        """
        Filter webhooks by tenant.
        """
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Webhook.objects.none()
            
        return Webhook.objects.filter(tenant=self.request.auth.tenant)
    
    def perform_create(self, serializer):
        """
        Set the tenant when creating a webhook.
        """
        serializer.save(tenant=self.request.auth.tenant)
    
    def list(self, request, *args, **kwargs):
        """
        List all webhooks for the authenticated tenant.
        """
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific webhook by ID.
        """
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new webhook.
        """
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Update a webhook's information.
        """
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a webhook.
        """
        return super().destroy(request, *args, **kwargs) 