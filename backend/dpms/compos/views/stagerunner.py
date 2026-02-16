"""StageRunner ViewSets"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Sum, Count

from dpms.compos.models import (
    StageRunnerConfig,
    StageSlide,
    SlideElement,
    StagePresentation,
    PresentationSlide,
    StageControl,
    Production,
    HasCompo,
    Edition,
    Sponsor,
    Vote,
)
from dpms.compos.serializers import (
    StageRunnerConfigSerializer,
    StageRunnerConfigDetailSerializer,
    StageRunnerFullStateSerializer,
    StageSlideSerializer,
    StageSlideListSerializer,
    StageSlideDetailSerializer,
    SlideElementSerializer,
    StagePresentationSerializer,
    StagePresentationListSerializer,
    StagePresentationDetailSerializer,
    StageControlSerializer,
    StageControlDetailSerializer,
    StageControlNavigateSerializer,
    StageControlCommandSerializer,
    ProductionForStageSerializer,
    SponsorForStageSerializer,
    CreateFromTemplateSerializer,
)
from dpms.compos.permissions import IsAdminUser


class StageRunnerConfigViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing StageRunner configurations.

    list: Return list of configs (admin only)
    retrieve: Get config detail (public for visualizer)
    create: Create new config (admin only)
    update: Update config (admin only)
    destroy: Delete config (admin only)
    full_state: Get complete state for visualizer
    """

    queryset = StageRunnerConfig.objects.all().select_related('edition')
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return StageRunnerConfigDetailSerializer
        elif self.action == 'full_state':
            return StageRunnerFullStateSerializer
        return StageRunnerConfigSerializer

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['retrieve', 'full_state', 'by_edition']:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        """Filter configs based on query params"""
        queryset = super().get_queryset()

        # Filter by edition
        edition_id = self.request.query_params.get('edition')
        if edition_id:
            queryset = queryset.filter(edition_id=edition_id)

        return queryset

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='by-edition')
    def by_edition(self, request):
        """
        Get config for a specific edition.

        GET /api/stagerunner-config/by-edition/?edition=<id>
        """
        edition_id = request.query_params.get('edition')
        if not edition_id:
            return Response(
                {'error': 'edition parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        config = get_object_or_404(StageRunnerConfig, edition_id=edition_id)
        serializer = StageRunnerConfigDetailSerializer(config)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny], url_path='full-state')
    def full_state(self, request, pk=None):
        """
        Get complete state for the visualizer.
        Includes config, all slides with elements, presentations, and control state.

        GET /api/stagerunner-config/<id>/full-state/
        """
        config = self.get_object()

        # Prefetch related data for performance
        config = StageRunnerConfig.objects.prefetch_related(
            'slides__elements',
            'presentations__presentation_slides__slide',
            'control'
        ).select_related('edition').get(pk=config.pk)

        # Ensure control object exists
        StageControl.objects.get_or_create(config=config)

        serializer = StageRunnerFullStateSerializer(config)
        return Response(serializer.data)


class StageSlideViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing StageRunner slides.

    list: Return list of slides (public for visualizer)
    retrieve: Get slide detail with elements (public for visualizer)
    create: Create new slide (admin only)
    update: Update slide (admin only)
    destroy: Delete slide (admin only)
    reorder: Reorder slides (admin only)
    duplicate: Duplicate a slide (admin only)
    """

    queryset = StageSlide.objects.all().select_related('config', 'has_compo')
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return StageSlideListSerializer
        elif self.action == 'retrieve':
            return StageSlideDetailSerializer
        return StageSlideSerializer

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        """Filter slides based on query params"""
        queryset = super().get_queryset()

        # Filter by config
        config_id = self.request.query_params.get('config')
        if config_id:
            queryset = queryset.filter(config_id=config_id)

        # Filter by edition (convenience)
        edition_id = self.request.query_params.get('edition')
        if edition_id:
            queryset = queryset.filter(config__edition_id=edition_id)

        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        return queryset.order_by('display_order', 'created')

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def reorder(self, request):
        """
        Reorder slides.

        POST /api/stage-slides/reorder/
        Body: {"slide_ids": [3, 1, 2, 5, 4]}
        """
        slide_ids = request.data.get('slide_ids', [])
        if not slide_ids:
            return Response(
                {'error': 'slide_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        for order, slide_id in enumerate(slide_ids):
            StageSlide.objects.filter(id=slide_id).update(display_order=order)

        return Response({'status': 'ok'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def duplicate(self, request, pk=None):
        """
        Duplicate a slide with all its elements.

        POST /api/stage-slides/<id>/duplicate/
        """
        original = self.get_object()

        # Create new slide with all fields
        new_slide = StageSlide.objects.create(
            config=original.config,
            name=f"{original.name} (copy)",
            slide_type=original.slide_type,
            background_effect=original.background_effect,
            background_image=original.background_image,
            background_color=original.background_color,
            has_compo=original.has_compo,
            production=original.production,
            countdown_target=original.countdown_target,
            countdown_label=original.countdown_label,
            auto_advance_productions=original.auto_advance_productions,
            production_display_time=original.production_display_time,
            display_order=original.display_order + 1,
            duration=original.duration,
            is_active=False,  # Start as inactive
        )

        # Duplicate elements with all fields
        for element in original.elements.all():
            SlideElement.objects.create(
                slide=new_slide,
                element_type=element.element_type,
                name=element.name,
                x=element.x,
                y=element.y,
                width=element.width,
                height=element.height,
                rotation=element.rotation,
                z_index=element.z_index,
                content=element.content,
                image=element.image,
                video=element.video,
                styles=element.styles,
                list_max_items=element.list_max_items,
                list_show_position=element.list_show_position,
                list_show_score=element.list_show_score,
                podium_show_points=element.podium_show_points,
                video_mode=element.video_mode,
                enter_transition=element.enter_transition,
                exit_transition=element.exit_transition,
                enter_duration=element.enter_duration,
                exit_duration=element.exit_duration,
                enter_delay=element.enter_delay,
                is_visible=element.is_visible,
            )

        serializer = StageSlideDetailSerializer(new_slide)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SlideElementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing slide elements.

    list: Return list of elements (public for visualizer)
    retrieve: Get element detail (public for visualizer)
    create: Create new element (admin only)
    update: Update element (admin only)
    destroy: Delete element (admin only)
    """

    queryset = SlideElement.objects.all().select_related('slide')
    serializer_class = SlideElementSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        """Filter elements based on query params"""
        queryset = super().get_queryset()

        # Filter by slide
        slide_id = self.request.query_params.get('slide')
        if slide_id:
            queryset = queryset.filter(slide_id=slide_id)

        return queryset.order_by('z_index', 'created')


class StageControlViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing StageRunner control state.

    retrieve: Get current control state (public for visualizer)
    update: Update control state (admin only)
    navigate: Navigate to a specific slide (admin only)
    next: Go to next slide/production (admin only)
    previous: Go to previous slide/production (admin only)
    toggle_play: Toggle auto-advance (admin only)
    """

    queryset = StageControl.objects.all().select_related(
        'config', 'current_slide', 'current_production'
    )
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return StageControlDetailSerializer
        return StageControlSerializer

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['retrieve', 'by_config']:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        """Filter controls based on query params"""
        queryset = super().get_queryset()

        # Filter by config
        config_id = self.request.query_params.get('config')
        if config_id:
            queryset = queryset.filter(config_id=config_id)

        # Filter by edition (convenience)
        edition_id = self.request.query_params.get('edition')
        if edition_id:
            queryset = queryset.filter(config__edition_id=edition_id)

        return queryset

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='by-config')
    def by_config(self, request):
        """
        Get control for a specific config.

        GET /api/stage-control/by-config/?config=<id>
        """
        config_id = request.query_params.get('config')
        if not config_id:
            return Response(
                {'error': 'config parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        control, created = StageControl.objects.get_or_create(
            config_id=config_id
        )
        serializer = StageControlDetailSerializer(control)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def navigate(self, request, pk=None):
        """
        Navigate to a specific slide.

        POST /api/stage-control/<id>/navigate/
        Body: {"slide_id": 5, "slide_index": 0}
        """
        control = self.get_object()

        serializer = StageControlNavigateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        slide_id = serializer.validated_data['slide_id']
        slide_index = request.data.get('slide_index')

        slide = get_object_or_404(
            StageSlide,
            id=slide_id,
            config=control.config
        )

        control.current_slide = slide

        # Calculate slide index if not provided
        if slide_index is not None:
            control.current_slide_index = slide_index
        else:
            slides = list(control.config.slides.filter(is_active=True).order_by('display_order'))
            try:
                control.current_slide_index = slides.index(slide)
            except ValueError:
                control.current_slide_index = 0

        control.command = 'navigate'
        control.save()

        return Response(StageControlDetailSerializer(control).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def next(self, request, pk=None):
        """
        Go to next slide or production.

        POST /api/stage-control/<id>/next/
        """
        control = self.get_object()
        slides = list(control.config.slides.filter(is_active=True).order_by('display_order'))

        if not slides:
            return Response(
                {'error': 'No active slides'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if control.current_slide:
            try:
                current_index = slides.index(control.current_slide)
                next_index = (current_index + 1) % len(slides)
            except ValueError:
                next_index = 0
        else:
            next_index = 0

        control.current_slide = slides[next_index]
        control.current_slide_index = next_index
        control.command = 'next'
        control.save()

        return Response(StageControlDetailSerializer(control).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def previous(self, request, pk=None):
        """
        Go to previous slide or production.

        POST /api/stage-control/<id>/previous/
        """
        control = self.get_object()
        slides = list(control.config.slides.filter(is_active=True).order_by('display_order'))

        if not slides:
            return Response(
                {'error': 'No active slides'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if control.current_slide:
            try:
                current_index = slides.index(control.current_slide)
                prev_index = (current_index - 1) % len(slides)
            except ValueError:
                prev_index = 0
        else:
            prev_index = 0

        control.current_slide = slides[prev_index]
        control.current_slide_index = prev_index
        control.command = 'prev'
        control.save()

        return Response(StageControlDetailSerializer(control).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser], url_path='toggle-play')
    def toggle_play(self, request, pk=None):
        """
        Toggle auto-advance.

        POST /api/stage-control/<id>/toggle-play/
        """
        control = self.get_object()
        control.is_playing = not control.is_playing
        control.command = 'play' if control.is_playing else 'pause'
        control.save()

        return Response(StageControlDetailSerializer(control).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser], url_path='set-countdown')
    def set_countdown(self, request, pk=None):
        """
        Set countdown target.

        POST /api/stage-control/<id>/set-countdown/
        Body: {"target": "2025-12-31T23:59:59Z"}
        """
        control = self.get_object()
        target = request.data.get('target')

        if target:
            from django.utils.dateparse import parse_datetime
            control.countdown_target = parse_datetime(target)
        else:
            control.countdown_target = None

        control.save()

        return Response(StageControlDetailSerializer(control).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def command(self, request, pk=None):
        """
        Send a command to the visualizer.

        POST /api/stage-control/<id>/command/
        Body: {"command": "next"}
        """
        control = self.get_object()
        serializer = StageControlCommandSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cmd = serializer.validated_data['command']
        control.command = cmd
        control.save()

        return Response(StageControlDetailSerializer(control).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser], url_path='set-presentation')
    def set_presentation(self, request, pk=None):
        """
        Set the current presentation.

        POST /api/stage-control/<id>/set-presentation/
        Body: {"presentation_id": 5}
        """
        control = self.get_object()
        presentation_id = request.data.get('presentation_id')

        if presentation_id:
            presentation = get_object_or_404(
                StagePresentation,
                id=presentation_id,
                config=control.config
            )
            control.current_presentation = presentation
            control.current_slide_index = 0

            # Set first slide of presentation
            first_slide = presentation.presentation_slides.first()
            if first_slide:
                control.current_slide = first_slide.slide
        else:
            control.current_presentation = None

        control.save()
        return Response(StageControlDetailSerializer(control).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser], url_path='reveal-next')
    def reveal_next(self, request, pk=None):
        """
        Reveal next position in results.

        POST /api/stage-control/<id>/reveal-next/
        """
        control = self.get_object()
        control.revealed_positions += 1
        control.command = 'reveal_next'
        control.save()

        return Response(StageControlDetailSerializer(control).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser], url_path='reset-reveal')
    def reset_reveal(self, request, pk=None):
        """
        Reset results revelation.

        POST /api/stage-control/<id>/reset-reveal/
        """
        control = self.get_object()
        control.revealed_positions = 0
        control.command = 'reset_reveal'
        control.save()

        return Response(StageControlDetailSerializer(control).data)


class StagePresentationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing StageRunner presentations.

    Presentations group slides for specific purposes:
    - Idle: All-day presentation with sponsors, clock, countdown
    - Compo: Show productions one by one
    - Awards: Reveal results with podium
    """

    queryset = StagePresentation.objects.all().select_related('config', 'has_compo')
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == 'list':
            return StagePresentationListSerializer
        elif self.action == 'retrieve':
            return StagePresentationDetailSerializer
        return StagePresentationSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()

        config_id = self.request.query_params.get('config')
        if config_id:
            queryset = queryset.filter(config_id=config_id)

        edition_id = self.request.query_params.get('edition')
        if edition_id:
            queryset = queryset.filter(config__edition_id=edition_id)

        return queryset

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser], url_path='add-slide')
    def add_slide(self, request, pk=None):
        """
        Add a slide to the presentation.

        POST /api/stage-presentations/<id>/add-slide/
        Body: {"slide_id": 5, "display_order": 0}
        """
        presentation = self.get_object()
        slide_id = request.data.get('slide_id')
        display_order = request.data.get('display_order', 0)

        slide = get_object_or_404(StageSlide, id=slide_id, config=presentation.config)

        PresentationSlide.objects.create(
            presentation=presentation,
            slide=slide,
            display_order=display_order
        )

        return Response(StagePresentationDetailSerializer(presentation).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser], url_path='remove-slide')
    def remove_slide(self, request, pk=None):
        """
        Remove a slide from the presentation.

        POST /api/stage-presentations/<id>/remove-slide/
        Body: {"slide_id": 5}
        """
        presentation = self.get_object()
        slide_id = request.data.get('slide_id')

        PresentationSlide.objects.filter(
            presentation=presentation,
            slide_id=slide_id
        ).delete()

        return Response(StagePresentationDetailSerializer(presentation).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser], url_path='reorder-slides')
    def reorder_slides(self, request, pk=None):
        """
        Reorder slides in the presentation.

        POST /api/stage-presentations/<id>/reorder-slides/
        Body: {"slide_ids": [3, 1, 2]}
        """
        presentation = self.get_object()
        slide_ids = request.data.get('slide_ids', [])

        for order, slide_id in enumerate(slide_ids):
            PresentationSlide.objects.filter(
                presentation=presentation,
                slide_id=slide_id
            ).update(display_order=order)

        return Response(StagePresentationDetailSerializer(presentation).data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser], url_path='from-template')
    def from_template(self, request):
        """
        Create presentation from a predefined template.

        POST /api/stage-presentations/from-template/
        Body: {"config_id": 1, "template_type": "compo_presentation", "name": "Demo Compo", "has_compo_id": 5}
        """
        serializer = CreateFromTemplateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        config_id = request.data.get('config_id')
        template_type = serializer.validated_data['template_type']
        name = serializer.validated_data['name']
        has_compo_id = serializer.validated_data.get('has_compo_id')

        config = get_object_or_404(StageRunnerConfig, id=config_id)
        has_compo = None
        if has_compo_id:
            has_compo = get_object_or_404(HasCompo, id=has_compo_id)

        # Create presentation
        presentation = StagePresentation.objects.create(
            config=config,
            name=name,
            presentation_type=template_type.replace('_presentation', '').replace('_ceremony', ''),
            has_compo=has_compo
        )

        # Create slides based on template
        if template_type == 'idle':
            self._create_idle_template(presentation, config)
        elif template_type == 'compo_presentation':
            self._create_compo_template(presentation, config, has_compo)
        elif template_type == 'awards_ceremony':
            self._create_awards_template(presentation, config, has_compo)

        return Response(
            StagePresentationDetailSerializer(presentation).data,
            status=status.HTTP_201_CREATED
        )

    def _create_idle_template(self, presentation, config):
        """Create slides for idle/all-day presentation"""
        # Slide 1: Welcome with logo and clock
        slide1 = StageSlide.objects.create(
            config=config,
            name="Welcome",
            slide_type='idle',
            background_effect='inherit',
            duration=30000,
            is_active=True,
            display_order=0
        )
        SlideElement.objects.create(
            slide=slide1,
            element_type='edition_logo',
            x=35, y=20, width=30, height=30,
            z_index=10
        )
        SlideElement.objects.create(
            slide=slide1,
            element_type='clock',
            x=35, y=60, width=30, height=10,
            styles={'fontSize': 72, 'color': '#ffffff'},
            z_index=10
        )
        PresentationSlide.objects.create(presentation=presentation, slide=slide1, display_order=0)

        # Slide 2: Sponsors
        slide2 = StageSlide.objects.create(
            config=config,
            name="Sponsors",
            slide_type='sponsors',
            background_effect='inherit',
            duration=20000,
            is_active=True,
            display_order=1
        )
        SlideElement.objects.create(
            slide=slide2,
            element_type='text',
            content='Thanks to our sponsors!',
            x=10, y=5, width=80, height=10,
            styles={'fontSize': 48, 'color': '#ffffff', 'textAlign': 'center'},
            z_index=10
        )
        SlideElement.objects.create(
            slide=slide2,
            element_type='sponsor_grid',
            x=10, y=20, width=80, height=70,
            z_index=10
        )
        PresentationSlide.objects.create(presentation=presentation, slide=slide2, display_order=1)

    def _create_compo_template(self, presentation, config, has_compo):
        """Create slides for compo presentation"""
        # Slide 1: Compo intro
        slide1 = StageSlide.objects.create(
            config=config,
            name="Compo Intro",
            slide_type='compo_intro',
            has_compo=has_compo,
            background_effect='inherit',
            is_active=True,
            display_order=0
        )
        SlideElement.objects.create(
            slide=slide1,
            element_type='compo_name',
            x=10, y=30, width=80, height=20,
            styles={'fontSize': 72, 'color': '#ffffff', 'textAlign': 'center'},
            z_index=10
        )
        SlideElement.objects.create(
            slide=slide1,
            element_type='compo_description',
            x=10, y=55, width=80, height=20,
            styles={'fontSize': 24, 'color': '#cccccc', 'textAlign': 'center'},
            z_index=10
        )
        PresentationSlide.objects.create(presentation=presentation, slide=slide1, display_order=0)

        # Slide 2: Production list
        slide2 = StageSlide.objects.create(
            config=config,
            name="Production List",
            slide_type='production_list',
            has_compo=has_compo,
            background_effect='inherit',
            is_active=True,
            display_order=1
        )
        SlideElement.objects.create(
            slide=slide2,
            element_type='compo_name',
            x=10, y=5, width=80, height=10,
            styles={'fontSize': 48, 'color': '#ffffff', 'textAlign': 'center'},
            z_index=10
        )
        SlideElement.objects.create(
            slide=slide2,
            element_type='production_list',
            x=10, y=20, width=80, height=75,
            list_max_items=15,
            list_show_position=True,
            styles={'fontSize': 28, 'color': '#ffffff'},
            z_index=10
        )
        PresentationSlide.objects.create(presentation=presentation, slide=slide2, display_order=1)

        # Slide 3: Production show (template)
        slide3 = StageSlide.objects.create(
            config=config,
            name="Production Show",
            slide_type='production_show',
            has_compo=has_compo,
            background_effect='inherit',
            auto_advance_productions=False,
            production_display_time=10000,
            is_active=True,
            display_order=2
        )
        SlideElement.objects.create(
            slide=slide3,
            element_type='production_number',
            x=10, y=5, width=80, height=10,
            styles={'fontSize': 36, 'color': '#888888', 'textAlign': 'center'},
            z_index=10
        )
        SlideElement.objects.create(
            slide=slide3,
            element_type='production_title',
            x=10, y=30, width=80, height=15,
            styles={'fontSize': 64, 'color': '#ffffff', 'textAlign': 'center'},
            z_index=10
        )
        SlideElement.objects.create(
            slide=slide3,
            element_type='production_authors',
            x=10, y=50, width=80, height=10,
            styles={'fontSize': 36, 'color': '#cccccc', 'textAlign': 'center'},
            z_index=10
        )
        PresentationSlide.objects.create(presentation=presentation, slide=slide3, display_order=2)

    def _create_awards_template(self, presentation, config, has_compo):
        """Create slides for awards ceremony"""
        # Slide 1: Compo intro
        slide1 = StageSlide.objects.create(
            config=config,
            name="Awards Intro",
            slide_type='compo_intro',
            has_compo=has_compo,
            background_effect='inherit',
            is_active=True,
            display_order=0
        )
        SlideElement.objects.create(
            slide=slide1,
            element_type='text',
            content='Results',
            x=10, y=20, width=80, height=15,
            styles={'fontSize': 48, 'color': '#ffd700', 'textAlign': 'center'},
            z_index=10
        )
        SlideElement.objects.create(
            slide=slide1,
            element_type='compo_name',
            x=10, y=40, width=80, height=20,
            styles={'fontSize': 72, 'color': '#ffffff', 'textAlign': 'center'},
            z_index=10
        )
        PresentationSlide.objects.create(presentation=presentation, slide=slide1, display_order=0)

        # Slide 2: Results table
        slide2 = StageSlide.objects.create(
            config=config,
            name="Final Results",
            slide_type='results_final',
            has_compo=has_compo,
            background_effect='inherit',
            is_active=True,
            display_order=1
        )
        SlideElement.objects.create(
            slide=slide2,
            element_type='compo_name',
            x=10, y=5, width=80, height=10,
            styles={'fontSize': 36, 'color': '#ffd700', 'textAlign': 'center'},
            z_index=10
        )
        SlideElement.objects.create(
            slide=slide2,
            element_type='results_table',
            x=10, y=18, width=80, height=77,
            list_max_items=10,
            list_show_position=True,
            list_show_score=True,
            styles={'fontSize': 28, 'color': '#ffffff'},
            z_index=10
        )
        PresentationSlide.objects.create(presentation=presentation, slide=slide2, display_order=1)

        # Slide 3: Podium
        slide3 = StageSlide.objects.create(
            config=config,
            name="Podium",
            slide_type='podium',
            has_compo=has_compo,
            background_effect='inherit',
            is_active=True,
            display_order=2
        )
        SlideElement.objects.create(
            slide=slide3,
            element_type='compo_name',
            x=10, y=5, width=80, height=10,
            styles={'fontSize': 36, 'color': '#ffd700', 'textAlign': 'center'},
            z_index=10
        )
        SlideElement.objects.create(
            slide=slide3,
            element_type='podium',
            x=10, y=20, width=80, height=75,
            podium_show_points=True,
            z_index=10
        )
        PresentationSlide.objects.create(presentation=presentation, slide=slide3, display_order=2)


class StageRunnerDataViewSet(viewsets.ViewSet):
    """
    ViewSet for dynamic data used by StageRunner visualizer.
    Provides endpoints for compo data, results, sponsors, etc.
    """

    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='compo/(?P<has_compo_id>[^/.]+)')
    def compo_data(self, request, has_compo_id=None):
        """
        Get compo data with productions list.

        GET /api/stagerunner-data/compo/<has_compo_id>/
        """
        has_compo = get_object_or_404(HasCompo, pk=has_compo_id)
        productions = Production.objects.filter(
            edition=has_compo.edition,
            compo=has_compo.compo
        ).order_by('created')

        return Response({
            'compo': {
                'id': has_compo.id,
                'name': has_compo.compo.name,
                'description': has_compo.compo.description,
                'show_authors': has_compo.show_authors_on_slide,
            },
            'productions': ProductionForStageSerializer(productions, many=True).data,
            'total_count': productions.count()
        })

    @action(detail=False, methods=['get'], url_path='results/(?P<has_compo_id>[^/.]+)')
    def compo_results(self, request, has_compo_id=None):
        """
        Get compo results with scores.

        GET /api/stagerunner-data/results/<has_compo_id>/
        """
        has_compo = get_object_or_404(HasCompo, pk=has_compo_id)

        productions = Production.objects.filter(
            edition=has_compo.edition,
            compo=has_compo.compo
        )

        results = []
        for prod in productions:
            # Calculate score from votes
            votes = Vote.objects.filter(production=prod)
            total_score = votes.aggregate(
                total=Sum('score')
            )['total'] or 0

            results.append({
                'production': ProductionForStageSerializer(prod).data,
                'score': float(total_score),
                'votes_count': votes.count(),
                'position': 0  # Will be set after sorting
            })

        # Sort by score descending
        results.sort(key=lambda x: x['score'], reverse=True)

        # Set positions
        for i, r in enumerate(results):
            r['position'] = i + 1

        return Response({
            'compo': {
                'id': has_compo.id,
                'name': has_compo.compo.name,
            },
            'results': results,
            'total_count': len(results)
        })

    @action(detail=False, methods=['get'], url_path='sponsors/(?P<edition_id>[^/.]+)')
    def sponsors(self, request, edition_id=None):
        """
        Get sponsors for an edition.

        GET /api/stagerunner-data/sponsors/<edition_id>/
        """
        edition = get_object_or_404(Edition, pk=edition_id)
        sponsors = Sponsor.objects.filter(edition=edition).order_by('display_order')

        return Response(SponsorForStageSerializer(sponsors, many=True).data)

    @action(detail=False, methods=['get'], url_path='production/(?P<production_id>[^/.]+)')
    def production_detail(self, request, production_id=None):
        """
        Get production details including video URL.

        GET /api/stagerunner-data/production/<production_id>/
        """
        production = get_object_or_404(Production, pk=production_id)
        return Response(ProductionForStageSerializer(production).data)

    @action(detail=False, methods=['get'], url_path='edition/(?P<edition_id>[^/.]+)')
    def edition_info(self, request, edition_id=None):
        """
        Get edition info for display.

        GET /api/stagerunner-data/edition/<edition_id>/
        """
        edition = get_object_or_404(Edition, pk=edition_id)

        return Response({
            'id': edition.id,
            'title': edition.title,
            'subtitle': edition.subtitle,
            'logo': edition.logo.url if edition.logo else None,
            'poster': edition.poster.url if edition.poster else None,
            'start_date': edition.start_date,
            'end_date': edition.end_date,
        })
