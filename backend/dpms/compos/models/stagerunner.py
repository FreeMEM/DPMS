""" StageRunner models for presentation display system """

import os
import uuid
from django.db import models
from django.utils.text import slugify

from dpms.utils.models import BaseModel


def stagerunner_background_upload_to(instance, filename):
    """
    Constructs the upload path for slide background images.
    Path: stagerunner/backgrounds/<slide-id>_<uuid>.<ext>
    """
    ext = filename.split(".")[-1].lower()
    unique_filename = f"bg_{uuid.uuid4().hex}.{ext}"
    return os.path.join("stagerunner", "backgrounds", unique_filename)


def stagerunner_element_image_upload_to(instance, filename):
    """
    Constructs the upload path for element images.
    Path: stagerunner/elements/<uuid>.<ext>
    """
    ext = filename.split(".")[-1].lower()
    unique_filename = f"img_{uuid.uuid4().hex}.{ext}"
    return os.path.join("stagerunner", "elements", unique_filename)


def stagerunner_video_upload_to(instance, filename):
    """
    Constructs the upload path for element videos.
    Path: stagerunner/videos/<uuid>.<ext>
    """
    ext = filename.split(".")[-1].lower()
    unique_filename = f"vid_{uuid.uuid4().hex}.{ext}"
    return os.path.join("stagerunner", "videos", unique_filename)


class StageRunnerConfig(BaseModel):
    """
    Global StageRunner configuration per edition.
    One edition can have one StageRunner configuration.
    """
    BACKGROUND_EFFECT_CHOICES = [
        ('hyperspace', 'Hyperspace'),
        ('wave', 'Wave'),
        ('energy-grid', 'Energy Grid'),
        ('tron-grid', 'Tron Grid'),
        ('wuhu-boxes', 'Wuhu Boxes'),
        ('wuhu-boxes-fire', 'Wuhu Boxes Fire'),
        ('wuhu-boxes-purple', 'Wuhu Boxes Purple'),
        ('floating-spheres', 'Floating Spheres'),
        ('spinning-toroids', 'Spinning Toroids'),
        ('crystal-pyramids', 'Crystal Pyramids'),
        ('infinite-tunnel', 'Infinite Tunnel'),
        ('none', 'None'),
    ]

    edition = models.OneToOneField(
        "compos.Edition",
        on_delete=models.CASCADE,
        related_name="stagerunner_config"
    )
    default_background_effect = models.CharField(
        max_length=20,
        choices=BACKGROUND_EFFECT_CHOICES,
        default='hyperspace',
        help_text="Default background effect for all slides"
    )
    canvas_width = models.PositiveIntegerField(
        default=1920,
        help_text="Canvas width in pixels"
    )
    canvas_height = models.PositiveIntegerField(
        default=1080,
        help_text="Canvas height in pixels"
    )
    auto_advance_interval = models.PositiveIntegerField(
        default=5000,
        help_text="Interval in ms for auto-advancing slides"
    )

    class Meta:
        verbose_name = "StageRunner Config"
        verbose_name_plural = "StageRunner Configs"

    def __str__(self):
        return f"StageRunner Config for {self.edition.title}"


class StageSlide(BaseModel):
    """
    A single slide/screen in StageRunner.
    Each slide can contain multiple elements positioned freely.
    """
    SLIDE_TYPE_CHOICES = [
        # Static slides
        ('custom', 'Custom Layout'),
        ('idle', 'Idle/Waiting'),

        # Compo slides (require has_compo)
        ('compo_intro', 'Compo Introduction'),
        ('production_list', 'Production List'),
        ('production_show', 'Single Production'),

        # Results slides (require has_compo)
        ('results_live', 'Live Results'),
        ('results_final', 'Final Results'),
        ('podium', 'Podium/Top 3'),

        # Special slides
        ('countdown', 'Countdown'),
        ('sponsors', 'Sponsors Showcase'),
        ('video', 'Video Player'),
    ]

    BACKGROUND_EFFECT_CHOICES = [
        ('hyperspace', 'Hyperspace'),
        ('wave', 'Wave'),
        ('energy-grid', 'Energy Grid'),
        ('tron-grid', 'Tron Grid'),
        ('wuhu-boxes', 'Wuhu Boxes'),
        ('wuhu-boxes-fire', 'Wuhu Boxes Fire'),
        ('wuhu-boxes-purple', 'Wuhu Boxes Purple'),
        ('floating-spheres', 'Floating Spheres'),
        ('spinning-toroids', 'Spinning Toroids'),
        ('crystal-pyramids', 'Crystal Pyramids'),
        ('infinite-tunnel', 'Infinite Tunnel'),
        ('none', 'None'),
        ('inherit', 'Use Default'),
    ]

    config = models.ForeignKey(
        StageRunnerConfig,
        on_delete=models.CASCADE,
        related_name="slides"
    )
    name = models.CharField(
        max_length=255,
        help_text="Name of this slide for identification"
    )
    slide_type = models.CharField(
        max_length=20,
        choices=SLIDE_TYPE_CHOICES,
        default='custom'
    )
    background_effect = models.CharField(
        max_length=20,
        choices=BACKGROUND_EFFECT_CHOICES,
        default='inherit'
    )
    background_image = models.ImageField(
        upload_to=stagerunner_background_upload_to,
        blank=True,
        null=True,
        help_text="Optional background image (overlays the effect)"
    )
    background_color = models.CharField(
        max_length=7,
        default='#000000',
        help_text="Background color in hex format"
    )
    has_compo = models.ForeignKey(
        "compos.HasCompo",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="For compo/results screens"
    )

    # For production_show slide type
    production = models.ForeignKey(
        "compos.Production",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="For slide type 'production_show'"
    )

    # For countdown slide type
    countdown_target = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Target datetime for countdown"
    )
    countdown_label = models.CharField(
        max_length=255,
        blank=True,
        help_text="Label for countdown (e.g., 'Demo Compo starts in')"
    )

    # Auto-advance settings for production slides
    auto_advance_productions = models.BooleanField(
        default=False,
        help_text="Automatically advance between productions"
    )
    production_display_time = models.PositiveIntegerField(
        default=10000,
        help_text="Time per production in ms (if auto-advance)"
    )

    display_order = models.PositiveIntegerField(
        default=0,
        help_text="Order in which slides are displayed"
    )
    duration = models.PositiveIntegerField(
        default=0,
        help_text="Duration in ms, 0=manual advance"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'created']

    def __str__(self):
        return f"{self.name} ({self.get_slide_type_display()})"

    def get_effective_background_effect(self):
        """Returns the actual background effect, resolving 'inherit'."""
        if self.background_effect == 'inherit':
            return self.config.default_background_effect
        return self.background_effect


class SlideElement(BaseModel):
    """
    A positionable element within a slide.
    Elements can be positioned freely using X/Y coordinates (as percentages).
    """
    ELEMENT_TYPE_CHOICES = [
        # Static elements
        ('text', 'Static Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('scrolling_text', 'Scrolling Text'),
        ('clock', 'Clock'),
        ('countdown', 'Countdown Timer'),

        # Dynamic elements (data from DB)
        ('compo_name', 'Compo Name'),
        ('compo_description', 'Compo Description'),
        ('production_number', 'Production Number'),
        ('production_title', 'Production Title'),
        ('production_authors', 'Production Authors'),
        ('production_video', 'Production Video/Preview'),
        ('production_list', 'Production List'),
        ('results_table', 'Results Table'),
        ('podium', 'Podium Display'),
        ('sponsor_bar', 'Sponsor Bar'),
        ('sponsor_grid', 'Sponsor Grid'),
        ('edition_logo', 'Edition Logo'),
        ('edition_poster', 'Edition Poster'),
    ]

    TRANSITION_CHOICES = [
        ('none', 'None'),
        ('fade', 'Fade'),
        ('slide_left', 'Slide from Left'),
        ('slide_right', 'Slide from Right'),
        ('slide_up', 'Slide from Bottom'),
        ('slide_down', 'Slide from Top'),
        ('zoom', 'Zoom In'),
        ('bounce', 'Bounce'),
    ]

    VIDEO_MODE_CHOICES = [
        ('inline', 'Inline (plays in slide)'),
        ('external', 'External (info only, video separate)'),
        ('none', 'No video'),
    ]

    slide = models.ForeignKey(
        StageSlide,
        on_delete=models.CASCADE,
        related_name="elements"
    )
    element_type = models.CharField(
        max_length=20,
        choices=ELEMENT_TYPE_CHOICES
    )
    name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Optional name for this element"
    )

    # Position and size (percentages of canvas, 0-100)
    x = models.FloatField(
        default=0,
        help_text="X position as percentage (0-100)"
    )
    y = models.FloatField(
        default=0,
        help_text="Y position as percentage (0-100)"
    )
    width = models.FloatField(
        default=20,
        help_text="Width as percentage (0-100)"
    )
    height = models.FloatField(
        default=10,
        help_text="Height as percentage (0-100)"
    )
    rotation = models.FloatField(
        default=0,
        help_text="Rotation in degrees"
    )
    z_index = models.PositiveIntegerField(
        default=0,
        help_text="Stacking order (higher = on top)"
    )

    # Content
    content = models.TextField(
        blank=True,
        help_text="Text content or URL"
    )
    image = models.ImageField(
        upload_to=stagerunner_element_image_upload_to,
        blank=True,
        null=True
    )
    video = models.FileField(
        upload_to=stagerunner_video_upload_to,
        blank=True,
        null=True
    )

    # Styles (JSON: fontSize, fontFamily, color, textAlign, etc.)
    styles = models.JSONField(
        default=dict,
        blank=True,
        help_text="CSS-like styles as JSON"
    )

    # For list elements
    list_max_items = models.PositiveIntegerField(
        default=10,
        help_text="Maximum items to show in lists"
    )
    list_show_position = models.BooleanField(
        default=True,
        help_text="Show position number"
    )
    list_show_score = models.BooleanField(
        default=False,
        help_text="Show score (results only)"
    )

    # For podium element
    podium_show_points = models.BooleanField(
        default=True,
        help_text="Show points on podium"
    )

    # For production video elements
    video_mode = models.CharField(
        max_length=10,
        choices=VIDEO_MODE_CHOICES,
        default='inline',
        help_text="How to handle production video"
    )

    # Transitions
    enter_transition = models.CharField(
        max_length=20,
        choices=TRANSITION_CHOICES,
        default='fade'
    )
    exit_transition = models.CharField(
        max_length=20,
        choices=TRANSITION_CHOICES,
        default='fade'
    )
    enter_duration = models.PositiveIntegerField(
        default=500,
        help_text="Enter transition duration in ms"
    )
    exit_duration = models.PositiveIntegerField(
        default=500,
        help_text="Exit transition duration in ms"
    )
    enter_delay = models.PositiveIntegerField(
        default=0,
        help_text="Delay before entering in ms"
    )

    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ['z_index', 'created']

    def __str__(self):
        display_name = self.name or self.get_element_type_display()
        return f"{display_name} @ ({self.x:.0f}%, {self.y:.0f}%)"


class StagePresentation(BaseModel):
    """
    Predefined presentation (set of slides).
    Groups slides for different purposes like idle, compo, awards.
    """
    PRESENTATION_TYPE_CHOICES = [
        ('idle', 'Idle/All Day'),
        ('compo', 'Compo Presentation'),
        ('awards', 'Awards Ceremony'),
        ('custom', 'Custom'),
    ]

    config = models.ForeignKey(
        StageRunnerConfig,
        on_delete=models.CASCADE,
        related_name="presentations"
    )
    name = models.CharField(max_length=255)
    presentation_type = models.CharField(
        max_length=20,
        choices=PRESENTATION_TYPE_CHOICES,
        default='custom'
    )
    has_compo = models.ForeignKey(
        "compos.HasCompo",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Associated compo (for 'compo' or 'awards' types)"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Stage Presentation"
        verbose_name_plural = "Stage Presentations"

    def __str__(self):
        return f"{self.name} ({self.get_presentation_type_display()})"


class PresentationSlide(BaseModel):
    """
    Through model to order slides within a presentation.
    """
    presentation = models.ForeignKey(
        StagePresentation,
        on_delete=models.CASCADE,
        related_name="presentation_slides"
    )
    slide = models.ForeignKey(
        StageSlide,
        on_delete=models.CASCADE,
        related_name="in_presentations"
    )
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order']
        verbose_name = "Presentation Slide"
        verbose_name_plural = "Presentation Slides"

    def __str__(self):
        return f"{self.presentation.name} - {self.slide.name} (#{self.display_order})"


class StageControl(BaseModel):
    """
    Real-time state of the StageRunner visualizer.
    Used for remote control from admin panel.
    """
    COMMAND_CHOICES = [
        ('', 'None'),
        ('next', 'Next Slide'),
        ('prev', 'Previous Slide'),
        ('play', 'Play'),
        ('pause', 'Pause'),
        ('next_production', 'Next Production'),
        ('prev_production', 'Previous Production'),
        ('reveal_next', 'Reveal Next Position'),
        ('reveal_all', 'Reveal All Positions'),
        ('reset_reveal', 'Reset Revelation'),
    ]

    config = models.OneToOneField(
        StageRunnerConfig,
        on_delete=models.CASCADE,
        related_name="control"
    )

    # Active presentation
    current_presentation = models.ForeignKey(
        StagePresentation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+"
    )

    # Current slide
    current_slide = models.ForeignKey(
        StageSlide,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+"
    )
    current_slide_index = models.PositiveIntegerField(
        default=0,
        help_text="Current slide index in presentation"
    )

    # Current production (for compo slides)
    current_production = models.ForeignKey(
        "compos.Production",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+"
    )
    current_production_index = models.PositiveIntegerField(
        default=0,
        help_text="Current production index in slideshow"
    )

    # Playback control
    is_playing = models.BooleanField(
        default=False,
        help_text="Whether auto-advance is active"
    )
    is_video_playing = models.BooleanField(
        default=False,
        help_text="Whether a video is currently playing"
    )

    # Results revelation state (for awards ceremony)
    revealed_positions = models.PositiveIntegerField(
        default=0,
        help_text="Number of positions revealed (counts down from end)"
    )

    # Countdown target
    countdown_target = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Target datetime for countdown"
    )

    # Last command sent (for synchronization)
    command = models.CharField(
        max_length=20,
        choices=COMMAND_CHOICES,
        blank=True,
        default='',
        help_text="Last command sent"
    )
    command_timestamp = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp for sync"
    )

    class Meta:
        verbose_name = "Stage Control"
        verbose_name_plural = "Stage Controls"

    def __str__(self):
        return f"Control for {self.config}"
