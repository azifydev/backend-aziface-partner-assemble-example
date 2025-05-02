from rest_framework import viewsets, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample, OpenApiTypes
from ..permissions import HasValidAPIKey, TenantPermission
from ..authentication import APIKeyAuthentication
from datetime import datetime

@extend_schema(tags=['meta'])
class HealthCheckViewSet(viewsets.ViewSet):
    """
    API endpoint for health check.
    """
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]
    
    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='Health check response',
                examples=[
                    OpenApiExample(
                        'Health Check',
                        value={
                            "status": "ok",
                            "timestamp": "2024-01-01T00:00:00Z"
                        }
                    )
                ]
            )
        }
    )
    def list(self, request, *args, **kwargs):
        """
        Perform a health check.
        """
        return Response({
            "status": "ok",
            "timestamp": datetime.utcnow().isoformat() + 'Z'
        }, status=status.HTTP_200_OK)
    
@extend_schema(tags=['meta'])
class BanksViewSet(viewsets.ViewSet):
    """
    API endpoint for banks.
    """
    authentication_classes = [APIKeyAuthentication]
    permission_classes = [HasValidAPIKey, TenantPermission]
    
    @extend_schema(
        responses={
            200: OpenApiResponse(
                response=OpenApiTypes.OBJECT,
                description='List of banks',
                examples=[
                    OpenApiExample(
                        'Banks List',
                        value=[
                            {
                                "id": 1,
                                "name": "Bank A"
                            },
                            {
                                "id": 2,
                                "name": "Bank B"
                            }
                        ]
                    )
                ]
            )
        }
    )
    def list(self, request, *args, **kwargs):
        """
        List all banks.
        """
        # Dummy data for demonstration purposes
        banks = [
            {"id": 1, "name": "Bank A"},
            {"id": 2, "name": "Bank B"}
        ]
        return Response(banks, status=status.HTTP_200_OK)