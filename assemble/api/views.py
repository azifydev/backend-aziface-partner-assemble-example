from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings

from assemble.api.serializers import GroupSerializer, UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ['Authentication']


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ['Authentication']


class APIRootView(APIView):
    """
    API root view that provides an overview of all available endpoints.
    """
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ['Overview']
    
    def get(self, request, format=None):
        return Response({
            'customers': {
                'list': '/api/customers/',
                'detail': '/api/customers/{id}/',
                'description': 'Customer management endpoints'
            },
            'onboarding': {
                'list': '/api/onboarding/',
                'detail': '/api/onboarding/{id}/',
                'description': 'Customer onboarding process endpoints'
            },
            'accounts': {
                'list': '/api/accounts/',
                'detail': '/api/accounts/{id}/',
                'description': 'Bank account management endpoints'
            },
            'transactions': {
                'list': '/api/transactions/',
                'detail': '/api/transactions/{id}/',
                'description': 'Transaction management endpoints'
            },
            'dictionary': {
                'list': '/api/dict/',
                'detail': '/api/dict/{id}/',
                'description': 'Dictionary management endpoints'
            },
            'webhooks': {
                'list': '/api/webhooks/',
                'detail': '/api/webhooks/{id}/',
                'description': 'Webhook management endpoints'
            },
            'limits': {
                'pix': {
                    'list': '/api/limits/pix/',
                    'detail': '/api/limits/pix/{id}/',
                    'description': 'PIX transaction limits'
                },
                'pix-night': {
                    'list': '/api/limits/pix-night/',
                    'detail': '/api/limits/pix-night/{id}/',
                    'description': 'PIX night transaction limits'
                },
                'ted': {
                    'list': '/api/limits/ted/',
                    'detail': '/api/limits/ted/{id}/',
                    'description': 'TED transaction limits'
                },
                'book': {
                    'list': '/api/limits/book/',
                    'detail': '/api/limits/book/{id}/',
                    'description': 'Book transaction limits'
                }
            },
            'users': {
                'list': '/api/users/',
                'detail': '/api/users/{id}/',
                'description': 'User management endpoints'
            },
            'groups': {
                'list': '/api/groups/',
                'detail': '/api/groups/{id}/',
                'description': 'Group management endpoints'
            }
        })