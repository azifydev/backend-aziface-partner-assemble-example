from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from ..models import Onboarding
from ..serializers import OnboardingSerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication
from django.utils import timezone

@extend_schema(tags=['onboarding'])
class OnboardingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing customer onboarding process.
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
    
    def list(self, request, *args, **kwargs):
        """
        List all onboarding records for the authenticated tenant.
        """
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific onboarding record by ID.
        """
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new onboarding record.
        """
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Update an onboarding record's information.
        """
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete an onboarding record.
        """
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        Submit an onboarding record for approval.
        """
        onboarding = self.get_object()
        onboarding.status = 'SUBMITTED'
        onboarding.submitted_at = timezone.now()
        onboarding.save()
        return Response({'status': 'submitted'}) 