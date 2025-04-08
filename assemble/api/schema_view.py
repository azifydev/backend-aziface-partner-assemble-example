from drf_spectacular.views import SpectacularAPIView
from drf_spectacular.extensions import OpenApiAuthenticationExtension
from .authentication import APIKeyAuthentication

class APIKeyScheme(OpenApiAuthenticationExtension):
    target_class = APIKeyAuthentication
    name = 'ApiKey'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'apiKey',
            'in': 'header',
            'name': 'X-API-Key',
            'description': 'API key authentication. Add your API key with header "X-API-Key: your-api-key"'
        }

# Register the authentication scheme using the class method
APIKeyScheme.register(APIKeyAuthentication)

class CustomSchemaView(SpectacularAPIView):
    """
    Custom schema view that doesn't rely on drf-spectacular's extensions.
    """
    def get_schema(self, request=None, public=False):
        schema = super().get_schema(request, public)
        # Force security on all operations
        for path in schema['paths'].values():
            for operation in path.values():
                operation['security'] = [{'ApiKey': ['read', 'write']}]
        return schema 