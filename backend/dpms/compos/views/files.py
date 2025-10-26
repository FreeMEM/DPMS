"""File ViewSet"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse, Http404

from dpms.compos.models import File
from dpms.compos.serializers import (
    FileSerializer,
    FileUploadSerializer,
    FileUpdateSerializer,
)
from dpms.compos.permissions import IsOwnerOrAdmin


class FileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Files.

    list: Return list of user's files
    retrieve: Get file details
    create: Upload new file (multipart/form-data)
    update: Update file metadata only
    destroy: Delete file (owner or admin)
    download: Download file
    """

    queryset = File.objects.filter(is_deleted=False).select_related('uploaded_by')
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        """Filter files to show only user's own files (unless admin)"""
        queryset = super().get_queryset()

        # Admins can see all files
        if self.request.user.groups.filter(name='DPMS Admins').exists():
            return queryset

        # Regular users only see their own files
        return queryset.filter(uploaded_by=self.request.user)

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return FileUploadSerializer
        elif self.action in ['update', 'partial_update']:
            return FileUpdateSerializer
        return FileSerializer

    def perform_destroy(self, instance):
        """Soft delete: mark as deleted instead of actually deleting"""
        instance.is_deleted = True
        instance.is_active = False
        instance.save()

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download the file.

        GET /api/files/{id}/download/
        """
        file_obj = self.get_object()

        # Check if file is public or user has permission
        if not file_obj.public and file_obj.uploaded_by != request.user:
            # Check if user is admin
            if not request.user.groups.filter(name='DPMS Admins').exists():
                return Response(
                    {'detail': 'You do not have permission to download this file.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        if not file_obj.file:
            raise Http404("File not found")

        # Return file for download
        response = FileResponse(
            file_obj.file.open('rb'),
            as_attachment=True,
            filename=file_obj.get_download_filename()
        )
        return response
