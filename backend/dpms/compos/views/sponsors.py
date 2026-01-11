"""Sponsor ViewSet"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from dpms.compos.models import Sponsor
from dpms.compos.serializers import (
    SponsorSerializer,
    SponsorListSerializer,
    SponsorDetailSerializer,
)
from dpms.compos.permissions import IsAdminUser


class SponsorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Sponsors.

    list: Return list of sponsors (public)
    retrieve: Get sponsor detail (public)
    create: Create new sponsor (admin only)
    update: Update sponsor (admin only)
    destroy: Delete sponsor (admin only)
    by_edition: Get sponsors for a specific edition
    """

    queryset = Sponsor.objects.all().prefetch_related('editions')
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return SponsorListSerializer
        elif self.action == 'retrieve':
            return SponsorDetailSerializer
        return SponsorSerializer

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve', 'by_edition']:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        """Filter sponsors based on query params"""
        queryset = super().get_queryset()

        # Filter by edition
        edition_id = self.request.query_params.get('edition')
        if edition_id:
            queryset = queryset.filter(editions__id=edition_id)

        return queryset.order_by('display_order', 'name')

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def by_edition(self, request):
        """
        Get sponsors for a specific edition.

        GET /api/sponsors/by-edition/?edition=<id>
        """
        edition_id = request.query_params.get('edition')
        if not edition_id:
            return Response(
                {'error': 'edition parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        sponsors = self.get_queryset().filter(editions__id=edition_id)
        serializer = SponsorListSerializer(sponsors, many=True)
        return Response(serializer.data)
