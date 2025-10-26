"""Compos app URLs"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from dpms.compos.views import (
    EditionViewSet,
    CompoViewSet,
    HasCompoViewSet,
    ProductionViewSet,
    FileViewSet,
)

router = DefaultRouter()
router.register(r'editions', EditionViewSet, basename='editions')
router.register(r'compos', CompoViewSet, basename='compos')
router.register(r'hascompos', HasCompoViewSet, basename='hascompos')
router.register(r'productions', ProductionViewSet, basename='productions')
router.register(r'files', FileViewSet, basename='files')

urlpatterns = [
    path('', include(router.urls)),
]
