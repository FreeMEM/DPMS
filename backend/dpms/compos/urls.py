"""Compos app URLs"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from dpms.compos.views import (
    EditionViewSet,
    CompoViewSet,
    HasCompoViewSet,
    ProductionViewSet,
    FileViewSet,
    GalleryImageViewSet,
    SponsorViewSet,
    StageRunnerConfigViewSet,
    StageSlideViewSet,
    SlideElementViewSet,
    StagePresentationViewSet,
    StageControlViewSet,
    StageRunnerDataViewSet,
    VotingConfigurationViewSet,
    AttendanceCodeViewSet,
    AttendeeVerificationViewSet,
    JuryMemberViewSet,
    VoteViewSet,
    VotingPeriodViewSet,
    VotingResultsViewSet,
)

router = DefaultRouter()
router.register(r'editions', EditionViewSet, basename='editions')
router.register(r'compos', CompoViewSet, basename='compos')
router.register(r'hascompos', HasCompoViewSet, basename='hascompos')
router.register(r'productions', ProductionViewSet, basename='productions')
router.register(r'files', FileViewSet, basename='files')
router.register(r'gallery', GalleryImageViewSet, basename='gallery')
router.register(r'sponsors', SponsorViewSet, basename='sponsors')

# StageRunner routes
router.register(r'stagerunner-config', StageRunnerConfigViewSet, basename='stagerunner-config')
router.register(r'stage-slides', StageSlideViewSet, basename='stage-slides')
router.register(r'slide-elements', SlideElementViewSet, basename='slide-elements')
router.register(r'stage-presentations', StagePresentationViewSet, basename='stage-presentations')
router.register(r'stage-control', StageControlViewSet, basename='stage-control')
router.register(r'stagerunner-data', StageRunnerDataViewSet, basename='stagerunner-data')

# Voting system routes
router.register(r'voting-config', VotingConfigurationViewSet, basename='voting-config')
router.register(r'attendance-codes', AttendanceCodeViewSet, basename='attendance-codes')
router.register(r'attendee-verification', AttendeeVerificationViewSet, basename='attendee-verification')
router.register(r'jury-members', JuryMemberViewSet, basename='jury-members')
router.register(r'votes', VoteViewSet, basename='votes')
router.register(r'voting-periods', VotingPeriodViewSet, basename='voting-periods')
router.register(r'voting-results', VotingResultsViewSet, basename='voting-results')

urlpatterns = [
    path('', include(router.urls)),
]
