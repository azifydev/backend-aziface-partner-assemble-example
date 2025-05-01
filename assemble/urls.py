from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from assemble.api.schema_view import CustomSchemaView
from assemble.api.customers.views import CustomerViewSet
from assemble.api.onboarding.views import OnboardingViewSet
from assemble.api.accounts.views import AccountViewSet
from assemble.api.transactions.views import TransactionViewSet
from assemble.api.dict.views import DictionaryViewSet
from assemble.api.webhooks.views import WebhookViewSet
from assemble.api.limits.views import (
    PixLimitViewSet, PixNightLimitViewSet, TedLimitViewSet, BookLimitViewSet
)
from assemble.api.meta.views import HealthCheckViewSet
from rest_framework.routers import DefaultRouter

# Change admin site title
admin.site.site_header = 'Assemble Management'
admin.site.site_title = 'Assemble Management'
admin.site.index_title = 'Welcome to Assemble Management'

# Create a router and register our viewsets with it
router = DefaultRouter()
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
router.register(r'health-check', HealthCheckViewSet, basename='health-check')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/schema/', CustomSchemaView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Add static and media URLs in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)