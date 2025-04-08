from django.urls import include, path
from django.contrib import admin
from rest_framework import routers, permissions
from drf_spectacular.views import SpectacularSwaggerView, SpectacularRedocView
from django.conf import settings

from assemble.api import views
from assemble.api.customers.views import CustomerViewSet
from assemble.api.onboarding.views import OnboardingViewSet
from assemble.api.accounts.views import AccountViewSet
from assemble.api.transactions.views import TransactionViewSet
from assemble.api.dict.views import DictionaryViewSet
from assemble.api.webhooks.views import WebhookViewSet
from assemble.api.limits.views import (
    PixLimitViewSet, PixNightLimitViewSet, TedLimitViewSet, BookLimitViewSet
)
from assemble.api.authentication import APIKeyAuthentication
from assemble.api.schema_view import CustomSchemaView

# Change admin site title
admin.site.site_header = 'Assemble Management'
admin.site.site_title = 'Assemble Management'
admin.site.index_title = 'Welcome to Assemble Management'

router = routers.DefaultRouter()
# Default views
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'ip-whitelist', views.IPWhitelistViewSet, basename='ip-whitelist')

# API views
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'onboarding', OnboardingViewSet, basename='onboarding')
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'dict', DictionaryViewSet, basename='dict')
router.register(r'webhooks', WebhookViewSet, basename='webhook')
router.register(r'limits/pix', PixLimitViewSet, basename='pix-limit')
router.register(r'limits/pix-night', PixNightLimitViewSet, basename='pix-night-limit')
router.register(r'limits/ted', TedLimitViewSet, basename='ted-limit')
router.register(r'limits/book', BookLimitViewSet, basename='book-limit')

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.APIRootView.as_view(), name='api-root'),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    
    # OpenAPI 3 documentation with Spectacular
    path('api/schema/', CustomSchemaView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]