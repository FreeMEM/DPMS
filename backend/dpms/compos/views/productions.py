"""Production ViewSet"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from dpms.compos.models import Production
from dpms.compos.serializers import (
    ProductionSerializer,
    ProductionDetailSerializer,
    ProductionCreateSerializer,
)
from dpms.compos.permissions import IsOwnerOrAdmin


class ProductionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Productions (submitted works).

    list: Return list of productions
    retrieve: Get detailed production with files
    create: Submit new production (authenticated users)
    update: Update production (owner or admin, if updates allowed)
    destroy: Delete production (owner or admin)
    my_productions: List current user's productions
    """

    queryset = Production.objects.all().select_related(
        'uploaded_by', 'edition', 'compo'
    ).prefetch_related('files')

    def get_queryset(self):
        """Filter productions based on query params"""
        queryset = super().get_queryset()

        # Filter by edition
        edition_id = self.request.query_params.get('edition')
        if edition_id:
            queryset = queryset.filter(edition_id=edition_id)

        # Filter by compo
        compo_id = self.request.query_params.get('compo')
        if compo_id:
            queryset = queryset.filter(compo_id=compo_id)

        # Filter by user (my productions)
        my_productions = self.request.query_params.get('my_productions')
        if my_productions and self.request.user.is_authenticated:
            queryset = queryset.filter(uploaded_by=self.request.user)

        return queryset.order_by('-created')

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return ProductionDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductionCreateSerializer
        return ProductionSerializer

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve']:
            # Anyone can view productions
            return [AllowAny()]
        elif self.action == 'create':
            # Any authenticated user can create productions
            return [IsAuthenticated()]
        else:
            # Only owner or admin can update/delete
            return [IsAuthenticated(), IsOwnerOrAdmin()]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_productions(self, request):
        """
        Get all productions created by the current user.

        GET /api/productions/my-productions/
        """
        productions = self.get_queryset().filter(uploaded_by=request.user)
        serializer = self.get_serializer(productions, many=True)
        return Response(serializer.data)
