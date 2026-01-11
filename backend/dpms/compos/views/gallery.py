"""Gallery Image ViewSet"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser

from dpms.compos.models import GalleryImage, Edition
from dpms.compos.serializers import (
    GalleryImageSerializer,
    GalleryImageUploadSerializer,
    GalleryImageUpdateSerializer,
    GalleryImageDetailSerializer,
)
from dpms.compos.permissions import IsOwnerOrAdmin


class GalleryImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Gallery Images.

    list: Return list of public gallery images
    retrieve: Get image details
    create: Upload new image (multipart/form-data)
    update: Update image metadata only
    destroy: Delete image (owner or admin)
    my_images: Get current user's images
    by_edition: Get images by edition
    """

    queryset = GalleryImage.objects.filter(
        is_deleted=False,
        is_active=True
    ).select_related('uploaded_by', 'edition')
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        """Return appropriate permissions based on action"""
        if self.action in ['list', 'retrieve', 'by_edition']:
            return [AllowAny()]
        return [IsAuthenticated(), IsOwnerOrAdmin()]

    def get_queryset(self):
        """Filter images based on action and user"""
        queryset = super().get_queryset()

        # For list action, show only public images
        if self.action == 'list':
            queryset = queryset.filter(public=True)

            # Optional filter by edition
            edition_id = self.request.query_params.get('edition')
            if edition_id:
                queryset = queryset.filter(edition_id=edition_id)

        # For update/delete actions, only show own images (unless admin)
        elif self.action in ['update', 'partial_update', 'destroy']:
            if not self.request.user.groups.filter(name='DPMS Admins').exists():
                queryset = queryset.filter(uploaded_by=self.request.user)

        return queryset.order_by('-created')

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return GalleryImageUploadSerializer
        elif self.action in ['update', 'partial_update']:
            return GalleryImageUpdateSerializer
        elif self.action == 'retrieve':
            return GalleryImageDetailSerializer
        return GalleryImageSerializer

    def perform_destroy(self, instance):
        """Soft delete: mark as deleted instead of actually deleting"""
        instance.is_deleted = True
        instance.is_active = False
        instance.save()

    @action(detail=False, methods=['get'])
    def my_images(self, request):
        """
        Get current user's gallery images.

        GET /api/gallery/my_images/
        """
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        queryset = GalleryImage.objects.filter(
            uploaded_by=request.user,
            is_deleted=False
        ).select_related('edition').order_by('-created')

        # Optional filter by edition
        edition_id = request.query_params.get('edition')
        if edition_id:
            queryset = queryset.filter(edition_id=edition_id)

        serializer = GalleryImageSerializer(
            queryset,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-edition/(?P<edition_id>[^/.]+)')
    def by_edition(self, request, edition_id=None):
        """
        Get all public images for a specific edition.

        GET /api/gallery/by-edition/{edition_id}/
        """
        try:
            edition = Edition.objects.get(id=edition_id)
        except Edition.DoesNotExist:
            return Response(
                {'detail': 'Edition not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        queryset = GalleryImage.objects.filter(
            edition=edition,
            public=True,
            is_active=True,
            is_deleted=False
        ).select_related('uploaded_by').order_by('-created')

        serializer = GalleryImageSerializer(
            queryset,
            many=True,
            context={'request': request}
        )
        return Response({
            'edition': {
                'id': edition.id,
                'title': edition.title,
            },
            'images': serializer.data,
            'count': queryset.count()
        })

    @action(detail=False, methods=['get'])
    def editions_with_images(self, request):
        """
        Get list of editions that have gallery images.

        GET /api/gallery/editions_with_images/
        """
        editions = Edition.objects.filter(
            gallery_images__is_deleted=False,
            gallery_images__is_active=True,
            gallery_images__public=True
        ).distinct().order_by('-start_date')

        data = []
        for edition in editions:
            image_count = GalleryImage.objects.filter(
                edition=edition,
                is_deleted=False,
                is_active=True,
                public=True
            ).count()
            data.append({
                'id': edition.id,
                'title': edition.title,
                'start_date': edition.start_date,
                'image_count': image_count
            })

        return Response(data)
