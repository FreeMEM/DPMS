"""Edition ViewSet"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q

from dpms.compos.models import Edition
from dpms.compos.serializers import (
    EditionSerializer,
    EditionDetailSerializer,
    EditionListSerializer,
    ProductionSerializer,
    HasCompoSerializer,
)
from dpms.compos.permissions import IsAdminOrReadOnly, IsOwnerOrAdmin


class EditionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Editions (demo party events).

    list: Return list of editions (public only for non-authenticated users)
    retrieve: Get detailed edition with compos
    create: Create new edition (admin only)
    update: Update edition (admin only)
    destroy: Delete edition (admin only)
    compos: List compos for this edition
    productions: List productions for this edition
    """

    queryset = Edition.objects.all().select_related('uploaded_by').prefetch_related('compos')
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        """Filter editions based on user authentication"""
        queryset = super().get_queryset()

        # Non-authenticated users can only see public editions
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(public=True)

        # Filter by query params
        public = self.request.query_params.get('public')
        open_to_upload = self.request.query_params.get('open_to_upload')
        upcoming = self.request.query_params.get('upcoming')

        if public is not None:
            queryset = queryset.filter(public=public.lower() == 'true')

        if open_to_upload is not None:
            queryset = queryset.filter(open_to_upload=open_to_upload.lower() == 'true')

        # TODO: Add date filtering for upcoming editions when date fields are added

        return queryset.order_by('-created')

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return EditionDetailSerializer
        elif self.action == 'list':
            return EditionListSerializer
        return EditionSerializer

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve', 'compos', 'productions']:
            # Allow anyone to view public editions
            return [AllowAny()]
        return [IsAuthenticated(), IsOwnerOrAdmin()]

    @action(detail=True, methods=['get'])
    def compos(self, request, pk=None):
        """
        Get all compos for this edition with their configuration (HasCompo).

        GET /api/editions/{id}/compos/
        """
        edition = self.get_object()
        has_compos = edition.hascompo_set.all().select_related('compo', 'created_by')
        serializer = HasCompoSerializer(has_compos, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def productions(self, request, pk=None):
        """
        Get all productions for this edition.

        GET /api/editions/{id}/productions/
        Query params:
        - compo: Filter by compo ID
        """
        edition = self.get_object()
        productions = edition.productions.all().select_related('uploaded_by', 'compo')

        # Filter by compo if specified
        compo_id = request.query_params.get('compo')
        if compo_id:
            productions = productions.filter(compo_id=compo_id)

        serializer = ProductionSerializer(productions, many=True, context={'request': request})
        return Response(serializer.data)
