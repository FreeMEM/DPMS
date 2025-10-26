"""Compo and HasCompo ViewSets"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from dpms.compos.models import Compo, HasCompo
from dpms.compos.serializers import (
    CompoSerializer,
    CompoDetailSerializer,
    HasCompoSerializer,
    ProductionSerializer,
)
from dpms.compos.permissions import IsAdminOrReadOnly, IsOwnerOrAdmin


class CompoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Compos (competition types).

    list: Return list of all compos
    retrieve: Get detailed compo with edition associations
    create: Create new compo (admin only)
    update: Update compo (admin only)
    destroy: Delete compo (admin only)
    productions: List all productions for this compo
    """

    queryset = Compo.objects.all().select_related('created_by')
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return CompoDetailSerializer
        return CompoSerializer

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve', 'productions']:
            return [AllowAny()]
        return [IsAuthenticated(), IsOwnerOrAdmin()]

    @action(detail=True, methods=['get'])
    def productions(self, request, pk=None):
        """
        Get all productions for this compo across all editions.

        GET /api/compos/{id}/productions/
        Query params:
        - edition: Filter by edition ID
        """
        compo = self.get_object()
        productions = compo.productions.all().select_related('uploaded_by', 'edition')

        # Filter by edition if specified
        edition_id = request.query_params.get('edition')
        if edition_id:
            productions = productions.filter(edition_id=edition_id)

        serializer = ProductionSerializer(productions, many=True, context={'request': request})
        return Response(serializer.data)


class HasCompoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing HasCompo (Edition-Compo associations).

    list: Return list of all edition-compo associations
    retrieve: Get specific association
    create: Create new association (admin only)
    update: Update association config (admin only)
    destroy: Remove association (admin only)
    """

    queryset = HasCompo.objects.all().select_related('edition', 'compo', 'created_by')
    serializer_class = HasCompoSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        """Filter by edition or compo if specified"""
        queryset = super().get_queryset()

        edition_id = self.request.query_params.get('edition')
        compo_id = self.request.query_params.get('compo')

        if edition_id:
            queryset = queryset.filter(edition_id=edition_id)

        if compo_id:
            queryset = queryset.filter(compo_id=compo_id)

        return queryset.order_by('-created')

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated(), IsOwnerOrAdmin()]
