from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Webhook
from ..serializers import WebhookSerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication

class WebhookViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing webhooks.
    
    This endpoint allows you to:
    * Register webhook endpoints
    * Configure webhook events
    * Manage webhook security
    * Monitor webhook delivery
    * Handle webhook retries
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
    
    @action(detail=False, methods=['get'])
    def list_webhooks(self, request):
        """
        List all webhooks.
        """
        return Response({"message": "Hello world - List Webhooks"})
    
    @action(detail=False, methods=['post'])
    def create_webhook(self, request):
        """
        Create a new webhook.
        """
        return Response({"message": "Hello world - Create Webhook"})
    
    @action(detail=True, methods=['delete'])
    def delete_webhook(self, request, pk=None):
        """
        Delete a webhook.
        """
        return Response({"message": "Hello world - Delete Webhook"}) 