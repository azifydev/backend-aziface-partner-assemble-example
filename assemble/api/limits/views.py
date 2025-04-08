from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from ..models import PixLimit, PixNightLimit, TedLimit, BookLimit
from ..serializers import PixLimitSerializer, PixNightLimitSerializer, TedLimitSerializer, BookLimitSerializer
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication
from rest_framework import permissions

@extend_schema(tags=['limits'])
class PixLimitViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing PIX transaction limits.
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
    
    def list(self, request, *args, **kwargs):
        """
        List all PIX limits for the authenticated tenant.
        """
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific PIX limit by ID.
        """
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new PIX limit.
        """
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Update a PIX limit's information.
        """
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a PIX limit.
        """
        return super().destroy(request, *args, **kwargs)


@extend_schema(tags=['limits'])
class PixNightLimitViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing PIX night transaction limits.
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
    
    def list(self, request, *args, **kwargs):
        """
        List all PIX night limits for the authenticated tenant.
        """
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific PIX night limit by ID.
        """
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new PIX night limit.
        """
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Update a PIX night limit's information.
        """
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a PIX night limit.
        """
        return super().destroy(request, *args, **kwargs)


@extend_schema(tags=['limits'])
class TedLimitViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing TED transaction limits.
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
    
    def list(self, request, *args, **kwargs):
        """
        List all TED limits for the authenticated tenant.
        """
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific TED limit by ID.
        """
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new TED limit.
        """
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Update a TED limit's information.
        """
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a TED limit.
        """
        return super().destroy(request, *args, **kwargs)


@extend_schema(tags=['limits'])
class BookLimitViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing book transaction limits.
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
    
    def list(self, request, *args, **kwargs):
        """
        List all book limits for the authenticated tenant.
        """
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a specific book limit by ID.
        """
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new book limit.
        """
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        Update a book limit's information.
        """
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a book limit.
        """
        return super().destroy(request, *args, **kwargs) 