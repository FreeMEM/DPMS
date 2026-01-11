"""Production ViewSet"""

from django.db.models import Q
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

    Productions visibility:
    - Admins can see all productions
    - If edition.productions_public=True: everyone can see all productions
    - If edition.productions_public=False: users can only see their own productions
    """

    queryset = Production.objects.all().select_related(
        'uploaded_by', 'edition', 'compo'
    ).prefetch_related('files')

    def _is_admin(self):
        """Check if current user is admin"""
        user = self.request.user
        if not user.is_authenticated:
            return False
        return user.is_staff or user.groups.filter(name='DPMS Admins').exists()

    def get_queryset(self):
        """Filter productions based on query params and visibility rules"""
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
        else:
            # Apply visibility rules if not explicitly requesting own productions
            # Admins can see everything
            if not self._is_admin():
                # Non-admins: show productions from public editions OR their own
                if self.request.user.is_authenticated:
                    queryset = queryset.filter(
                        Q(edition__productions_public=True) |
                        Q(uploaded_by=self.request.user)
                    )
                else:
                    # Anonymous users: only public productions
                    queryset = queryset.filter(edition__productions_public=True)

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
