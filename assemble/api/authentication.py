from rest_framework import authentication
from rest_framework import exceptions
from django.utils import timezone
from .models import APIKey

class APIKeyAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class for API keys.
    """
    def authenticate(self, request):
        api_key = request.META.get('HTTP_X_API_KEY')
        
        if not api_key:
            return None
        
        try:
            api_key_obj = APIKey.objects.get(key=api_key, is_active=True)
            # Update last used timestamp
            api_key_obj.last_used = timezone.now()
            api_key_obj.save()
            
            # Return a tuple of (user, auth) where user is None since we're using API keys
            return (None, api_key_obj)
        except APIKey.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid API key')
    
    def authenticate_header(self, request):
        return 'ApiKey' 