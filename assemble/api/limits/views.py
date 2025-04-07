from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import PixLimit, PixNightLimit, TedLimit, BookLimit
from ..serializers import PixLimitSerializer, PixNightLimitSerializer, TedLimitSerializer, BookLimitSerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication
from rest_framework import permissions

class PixLimitViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing PIX transaction limits.
    
    This endpoint allows you to:
    * Set PIX transaction limits
    * View current limits
    * Update limit configurations
    * Handle limit exceptions
    """
    queryset = PixLimit.objects.all()
    serializer_class = PixLimitSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]
    swagger_tags = ['Limits']
    
    def get_queryset(self):
        """
        Filter PIX limits by tenant.
        """
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return PixLimit.objects.none()
            
        return PixLimit.objects.filter(tenant=self.request.auth.tenant)
    
    def perform_create(self, serializer):
        """
        Set the tenant when creating a PIX limit.
        """
        serializer.save(tenant=self.request.auth.tenant)
    
    @action(detail=False, methods=['get'])
    def get_pix_limit(self, request):
        """
        Get PIX limits.
        """
        return Response({"message": "Hello world - Get PIX Limit"})


class PixNightLimitViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing PIX night transaction limits.
    
    This endpoint allows you to:
    * Set PIX night transaction limits
    * Configure night time windows
    * Manage night limit exceptions
    * View night limit history
    """
    queryset = PixNightLimit.objects.all()
    serializer_class = PixNightLimitSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]
    swagger_tags = ['Limits']
    
    def get_queryset(self):
        """
        Filter PIX night limits by tenant.
        """
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return PixNightLimit.objects.none()
            
        return PixNightLimit.objects.filter(tenant=self.request.auth.tenant)
    
    def perform_create(self, serializer):
        """
        Set the tenant when creating a PIX night limit.
        """
        serializer.save(tenant=self.request.auth.tenant)
    
    @action(detail=False, methods=['get'])
    def get_pix_night_limit(self, request):
        """
        Get PIX night limits.
        """
        return Response({"message": "Hello world - Get PIX Night Limit"})
    
    @action(detail=True, methods=['put'])
    def update_pix_night_limit(self, request, pk=None):
        """
        Update PIX night limits.
        """
        return Response({"message": "Hello world - Update PIX Night Limit"})


class TedLimitViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing TED transaction limits.
    
    This endpoint allows you to:
    * Set TED transaction limits
    * Configure TED parameters
    * Manage TED exceptions
    * Track TED usage
    """
    queryset = TedLimit.objects.all()
    serializer_class = TedLimitSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]
    swagger_tags = ['Limits']
    
    def get_queryset(self):
        """
        Filter TED limits by tenant.
        """
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return TedLimit.objects.none()
            
        return TedLimit.objects.filter(tenant=self.request.auth.tenant)
    
    def perform_create(self, serializer):
        """
        Set the tenant when creating a TED limit.
        """
        serializer.save(tenant=self.request.auth.tenant)
    
    @action(detail=False, methods=['get'])
    def get_ted_limit(self, request):
        """
        Get TED limits.
        """
        return Response({"message": "Hello world - Get TED Limit"})


class BookLimitViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing book transaction limits.
    
    This endpoint allows you to:
    * Set book transaction limits
    * Configure book parameters
    * Manage book exceptions
    * Track book usage
    """
    queryset = BookLimit.objects.all()
    serializer_class = BookLimitSerializer
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]
    swagger_tags = ['Limits']
    
    def get_queryset(self):
        """
        Filter book limits by tenant.
        """
        # Handle Swagger schema generation
        if getattr(self, 'swagger_fake_view', False):
            return BookLimit.objects.none()
            
        return BookLimit.objects.filter(tenant=self.request.auth.tenant)
    
    def perform_create(self, serializer):
        """
        Set the tenant when creating a Book limit.
        """
        serializer.save(tenant=self.request.auth.tenant)
    
    @action(detail=False, methods=['get'])
    def get_book_limit(self, request):
        """
        Get Book limits.
        """
        return Response({"message": "Hello world - Get Book Limit"}) 