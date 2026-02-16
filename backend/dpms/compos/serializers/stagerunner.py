"""StageRunner serializers"""

from rest_framework import serializers
from dpms.compos.models import (
    StageRunnerConfig,
    StageSlide,
    SlideElement,
    StagePresentation,
    PresentationSlide,
    StageControl,
    Production,
    Sponsor,
)


class SlideElementSerializer(serializers.ModelSerializer):
    """Serializer for SlideElement CRUD operations"""

    class Meta:
        model = SlideElement
        fields = [
            'id',
            'slide',
            'element_type',
            'name',
            'x',
            'y',
            'width',
            'height',
            'rotation',
            'z_index',
            'content',
            'image',
            'video',
            'styles',
            'list_max_items',
            'list_show_position',
            'list_show_score',
            'podium_show_points',
            'video_mode',
            'enter_transition',
            'exit_transition',
            'enter_duration',
            'exit_duration',
            'enter_delay',
            'is_visible',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified']


class SlideElementInlineSerializer(serializers.ModelSerializer):
    """Inline serializer for SlideElement (used within slide detail)"""

    class Meta:
        model = SlideElement
        fields = [
            'id',
            'element_type',
            'name',
            'x',
            'y',
            'width',
            'height',
            'rotation',
            'z_index',
            'content',
            'image',
            'video',
            'styles',
            'list_max_items',
            'list_show_position',
            'list_show_score',
            'podium_show_points',
            'video_mode',
            'enter_transition',
            'exit_transition',
            'enter_duration',
            'exit_duration',
            'enter_delay',
            'is_visible',
        ]
        read_only_fields = ['id']


class StageSlideSerializer(serializers.ModelSerializer):
    """Serializer for StageSlide CRUD operations"""

    class Meta:
        model = StageSlide
        fields = [
            'id',
            'config',
            'name',
            'slide_type',
            'background_effect',
            'background_image',
            'background_color',
            'has_compo',
            'production',
            'countdown_target',
            'countdown_label',
            'auto_advance_productions',
            'production_display_time',
            'display_order',
            'duration',
            'is_active',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified']


class StageSlideListSerializer(serializers.ModelSerializer):
    """Serializer for listing slides (minimal data)"""
    element_count = serializers.SerializerMethodField()

    class Meta:
        model = StageSlide
        fields = [
            'id',
            'name',
            'slide_type',
            'background_effect',
            'display_order',
            'duration',
            'is_active',
            'element_count',
        ]
        read_only_fields = ['id']

    def get_element_count(self, obj):
        return obj.elements.count()


class StageSlideDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for StageSlide with elements"""
    elements = SlideElementInlineSerializer(many=True, read_only=True)
    effective_background_effect = serializers.SerializerMethodField()
    has_compo_name = serializers.SerializerMethodField()
    production_title = serializers.SerializerMethodField()
    config_edition = serializers.IntegerField(source='config.edition.id', read_only=True)

    class Meta:
        model = StageSlide
        fields = [
            'id',
            'config',
            'config_edition',
            'name',
            'slide_type',
            'background_effect',
            'effective_background_effect',
            'background_image',
            'background_color',
            'has_compo',
            'has_compo_name',
            'production',
            'production_title',
            'countdown_target',
            'countdown_label',
            'auto_advance_productions',
            'production_display_time',
            'display_order',
            'duration',
            'is_active',
            'elements',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified']

    def get_effective_background_effect(self, obj):
        return obj.get_effective_background_effect()

    def get_has_compo_name(self, obj):
        if obj.has_compo:
            return f"{obj.has_compo.compo.name} - {obj.has_compo.edition.title}"
        return None

    def get_production_title(self, obj):
        if obj.production:
            return obj.production.title
        return None


class StageRunnerConfigSerializer(serializers.ModelSerializer):
    """Serializer for StageRunnerConfig CRUD operations"""

    class Meta:
        model = StageRunnerConfig
        fields = [
            'id',
            'edition',
            'default_background_effect',
            'canvas_width',
            'canvas_height',
            'auto_advance_interval',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified']


class StageRunnerConfigDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with slides included"""
    slides = StageSlideListSerializer(many=True, read_only=True)
    edition_title = serializers.CharField(source='edition.title', read_only=True)

    class Meta:
        model = StageRunnerConfig
        fields = [
            'id',
            'edition',
            'edition_title',
            'default_background_effect',
            'canvas_width',
            'canvas_height',
            'auto_advance_interval',
            'slides',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified']


class StageControlSerializer(serializers.ModelSerializer):
    """Serializer for StageControl"""

    class Meta:
        model = StageControl
        fields = [
            'id',
            'config',
            'current_presentation',
            'current_slide',
            'current_slide_index',
            'current_production',
            'current_production_index',
            'is_playing',
            'is_video_playing',
            'revealed_positions',
            'countdown_target',
            'command',
            'command_timestamp',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified', 'command_timestamp']


class StageControlDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for StageControl with related objects"""
    current_slide_detail = StageSlideDetailSerializer(
        source='current_slide',
        read_only=True
    )
    config_detail = StageRunnerConfigSerializer(
        source='config',
        read_only=True
    )
    current_presentation_name = serializers.SerializerMethodField()
    current_production_title = serializers.SerializerMethodField()

    class Meta:
        model = StageControl
        fields = [
            'id',
            'config',
            'config_detail',
            'current_presentation',
            'current_presentation_name',
            'current_slide',
            'current_slide_index',
            'current_slide_detail',
            'current_production',
            'current_production_title',
            'current_production_index',
            'is_playing',
            'is_video_playing',
            'revealed_positions',
            'countdown_target',
            'command',
            'command_timestamp',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified', 'command_timestamp']

    def get_current_presentation_name(self, obj):
        if obj.current_presentation:
            return obj.current_presentation.name
        return None

    def get_current_production_title(self, obj):
        if obj.current_production:
            return obj.current_production.title
        return None


class StageControlNavigateSerializer(serializers.Serializer):
    """Serializer for navigate action"""
    slide_id = serializers.IntegerField(required=True)


class StageControlProductionSerializer(serializers.Serializer):
    """Serializer for production navigation"""
    production_id = serializers.IntegerField(required=False)
    production_index = serializers.IntegerField(required=False)


class StageControlCommandSerializer(serializers.Serializer):
    """Serializer for sending commands"""
    command = serializers.ChoiceField(choices=[
        'next', 'prev', 'play', 'pause',
        'next_production', 'prev_production',
        'reveal_next', 'reveal_all', 'reset_reveal'
    ])


# Presentation serializers
class PresentationSlideInlineSerializer(serializers.ModelSerializer):
    """Inline serializer for slides within a presentation"""
    slide_name = serializers.CharField(source='slide.name', read_only=True)
    slide_type = serializers.CharField(source='slide.slide_type', read_only=True)

    class Meta:
        model = PresentationSlide
        fields = ['id', 'slide', 'slide_name', 'slide_type', 'display_order']
        read_only_fields = ['id']


class StagePresentationSerializer(serializers.ModelSerializer):
    """Serializer for StagePresentation CRUD"""

    class Meta:
        model = StagePresentation
        fields = [
            'id',
            'config',
            'name',
            'presentation_type',
            'has_compo',
            'is_active',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified']


class StagePresentationListSerializer(serializers.ModelSerializer):
    """List serializer for presentations"""
    slide_count = serializers.SerializerMethodField()
    has_compo_name = serializers.SerializerMethodField()
    slides = serializers.SerializerMethodField()

    class Meta:
        model = StagePresentation
        fields = [
            'id',
            'name',
            'presentation_type',
            'has_compo',
            'has_compo_name',
            'slide_count',
            'slides',
            'is_active',
        ]
        read_only_fields = ['id']

    def get_slide_count(self, obj):
        return obj.presentation_slides.count()

    def get_has_compo_name(self, obj):
        if obj.has_compo:
            return obj.has_compo.compo.name
        return None

    def get_slides(self, obj):
        """Return ordered slides for the presentation"""
        presentation_slides = obj.presentation_slides.select_related('slide').order_by('display_order')
        return [
            {
                'id': ps.slide.id,
                'name': ps.slide.name,
                'slide_type': ps.slide.slide_type,
                'display_order': ps.display_order,
            }
            for ps in presentation_slides
        ]


class StagePresentationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with slides"""
    presentation_slides = PresentationSlideInlineSerializer(many=True, read_only=True)
    has_compo_name = serializers.SerializerMethodField()

    class Meta:
        model = StagePresentation
        fields = [
            'id',
            'config',
            'name',
            'presentation_type',
            'has_compo',
            'has_compo_name',
            'presentation_slides',
            'is_active',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified']

    def get_has_compo_name(self, obj):
        if obj.has_compo:
            return obj.has_compo.compo.name
        return None


# Dynamic data serializers for the viewer
class ProductionForStageSerializer(serializers.ModelSerializer):
    """Production data for StageRunner display"""
    authors = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = Production
        fields = [
            'id',
            'title',
            'authors',
            'video_url',
            'created',
        ]

    def get_authors(self, obj):
        return obj.get_authors_display()

    def get_video_url(self, obj):
        video_extensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv']
        for file in obj.files.filter(is_active=True, is_deleted=False):
            ext = file.original_filename.lower().split('.')[-1]
            if f'.{ext}' in video_extensions:
                return file.file.url if file.file else None
        return None


class ProductionResultSerializer(serializers.Serializer):
    """Production with score for results display"""
    production = ProductionForStageSerializer()
    position = serializers.IntegerField()
    score = serializers.FloatField()
    votes_count = serializers.IntegerField()


class CompoDataSerializer(serializers.Serializer):
    """Compo data for StageRunner"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    description = serializers.CharField()
    show_authors = serializers.BooleanField()
    productions = ProductionForStageSerializer(many=True)
    total_count = serializers.IntegerField()


class SponsorForStageSerializer(serializers.ModelSerializer):
    """Sponsor data for StageRunner display"""

    class Meta:
        model = Sponsor
        fields = ['id', 'name', 'logo', 'website', 'tier', 'display_order']


class StageRunnerFullStateSerializer(serializers.ModelSerializer):
    """
    Complete state serializer for the visualizer.
    Includes config, all slides with elements, presentations, and control state.
    """
    slides = StageSlideDetailSerializer(many=True, read_only=True)
    presentations = StagePresentationListSerializer(many=True, read_only=True)
    control = StageControlSerializer(read_only=True)
    edition_title = serializers.CharField(source='edition.title', read_only=True)
    edition_logo = serializers.ImageField(source='edition.logo', read_only=True)
    edition_poster = serializers.ImageField(source='edition.poster', read_only=True)

    class Meta:
        model = StageRunnerConfig
        fields = [
            'id',
            'edition',
            'edition_title',
            'edition_logo',
            'edition_poster',
            'default_background_effect',
            'canvas_width',
            'canvas_height',
            'auto_advance_interval',
            'slides',
            'presentations',
            'control',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified']


# Template serializers for predefined presentations
class PresentationTemplateSerializer(serializers.Serializer):
    """Template definition for creating presentations"""
    TEMPLATE_CHOICES = [
        ('idle', 'Idle/All Day'),
        ('compo_presentation', 'Compo Presentation'),
        ('awards_ceremony', 'Awards Ceremony'),
    ]

    template_type = serializers.ChoiceField(choices=TEMPLATE_CHOICES)
    name = serializers.CharField(max_length=255)
    has_compo_id = serializers.IntegerField(required=False)


class CreateFromTemplateSerializer(serializers.Serializer):
    """Serializer for creating presentation from template"""
    template_type = serializers.ChoiceField(choices=[
        ('idle', 'Idle/All Day'),
        ('compo_presentation', 'Compo Presentation'),
        ('awards_ceremony', 'Awards Ceremony'),
    ])
    name = serializers.CharField(max_length=255)
    has_compo_id = serializers.IntegerField(required=False, allow_null=True)
