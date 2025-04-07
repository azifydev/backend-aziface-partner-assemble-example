from rest_framework import viewsets, status, permissions
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Onboarding
from ..serializers import OnboardingSerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication

class OnboardingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing customer onboarding process.
    
    This endpoint allows you to:
    * Track onboarding status
    * Update onboarding steps
    * Manage document verification
    * Handle KYC process
    """
    queryset = Onboarding.objects.all()
    serializer_class = OnboardingSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]
    swagger_tags = ['Onboarding']
    
    def get_queryset(self):
        """
        Filter onboarding records by tenant.
        """
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Onboarding.objects.none()
            
        return Onboarding.objects.filter(customer__tenant=self.request.auth.tenant)
    
    @action(detail=False, methods=['get'])
    def list_onboardings(self, request):
        """
        List all onboardings.
        """
        return Response({"message": "Hello world - List Onboardings"})
    
    @action(detail=True, methods=['get'])
    def get_onboarding(self, request, pk=None):
        """
        Get a specific onboarding.
        """
        return Response({"message": "Hello world - Get Onboarding"})
    
    @action(detail=False, methods=['post'])
    def create_onboarding(self, request):
        """
        Create a new onboarding.
        """
        return Response({"message": "Hello world - Create Onboarding"})
    
    @action(detail=True, methods=['put'])
    def update_onboarding(self, request, pk=None):
        """
        Update an onboarding.
        """
        return Response({"message": "Hello world - Update Onboarding"})
    
    @action(detail=True, methods=['post'])
    def submit_onboarding(self, request, pk=None):
        """
        Submit an onboarding.
        """
        return Response({"message": "Hello world - Submit Onboarding"})
    
    @action(detail=True, methods=['delete'])
    def delete_onboarding(self, request, pk=None):
        """
        Delete an onboarding.
        """
        return Response({"message": "Hello world - Delete Onboarding"}) 