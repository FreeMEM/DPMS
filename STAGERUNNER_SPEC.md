# StageRunner - Presentation Display System

StageRunner is a fullscreen presentation system for displaying competition entries and information during demo parties. It consists of two main parts:

1. **Admin Panel**: Visual editor integrated in DPMS admin for designing slides
2. **Visualizer/Beamer**: Fullscreen display that opens in a separate tab

## Overview

StageRunner is inspired by Wuhu's Beamer but modernized with:
- **Visual drag-and-drop editor** for designing slides (like desktop publishing software)
- **Positionable elements**: images, videos, text, scrolling text, clocks, countdowns
- **Transition effects** for element appearance/disappearance
- **Background effects** reused from the web (hyperspace, wave, energy-grid, tron-grid)
- **Real-time REST API consumption** (no file polling)
- **Remote control** from admin panel
- **Modern React with hooks** and Material-UI
- **Responsive fullscreen** optimized for 1920x1080 projectors

---

## Architecture

### Two-Part System

```
┌─────────────────────────────────────────┐     ┌─────────────────────────────┐
│         ADMIN PANEL                     │     │       VISUALIZER            │
│    (Integrated in DPMS Admin)           │     │   (Separate Browser Tab)    │
│                                         │     │                             │
│  ┌─────────────────────────────────┐   │     │  ┌───────────────────────┐  │
│  │  Visual Slide Editor            │   │     │  │  Fullscreen Display   │  │
│  │  - Drag & drop elements         │   │     │  │  - Renders slides     │  │
│  │  - Position with mouse          │   │     │  │  - Applies effects    │  │
│  │  - Configure transitions        │   │     │  │  - Keyboard controls  │  │
│  │  - Select backgrounds           │   │     │  │  - Background effects │  │
│  └─────────────────────────────────┘   │     │  └───────────────────────┘  │
│                                         │     │                             │
│  ┌─────────────────────────────────┐   │     │                             │
│  │  Remote Control                 │   │◄────┼──► Polling/WebSocket       │
│  │  - Navigate slides              │   │     │                             │
│  │  - Control playback             │   │     │                             │
│  └─────────────────────────────────┘   │     │                             │
└─────────────────────────────────────────┘     └─────────────────────────────┘
                    │                                         │
                    └──────────────┬──────────────────────────┘
                                   ▼
                          ┌───────────────────┐
                          │   Django REST API  │
                          │   - StageRunner    │
                          │     Config/Slides  │
                          │   - Control State  │
                          └───────────────────┘
```

---

## Project Structure

### Backend (New models in compos app)

```
backend/dpms/compos/
├── models/
│   └── stagerunner.py          # New: StageRunnerConfig, StageSlide, SlideElement, StageControl
├── serializers/
│   └── stagerunner.py          # New: Serializers for StageRunner models
├── views/
│   └── stagerunner.py          # New: ViewSets with CRUD + control actions
└── urls.py                     # Add new routes
```

### Frontend Admin (Integrated in existing frontend)

```
frontend/src/
├── pages/admin/stagerunner/
│   ├── StageRunnerPage.js          # Dashboard
│   ├── SlidesListPage.js           # List of slides
│   ├── SlideEditorPage.js          # Visual drag-and-drop editor ⭐
│   ├── LiveControlPage.js          # Remote control panel
│   └── SettingsPage.js             # Global settings
│
├── components/admin/stagerunner/
│   ├── editor/
│   │   ├── SlideCanvas.js          # 16:9 canvas with draggable elements
│   │   ├── ElementToolbar.js       # Toolbar to add elements
│   │   ├── PropertiesPanel.js      # Properties panel for selected element
│   │   ├── DraggableElement.js     # Wrapper for draggable/resizable elements
│   │   ├── TransitionPicker.js     # Transition selector with preview
│   │   ├── BackgroundPicker.js     # Background selector (effect/image/color)
│   │   └── LayersPanel.js          # Element layers/z-index management
│   │
│   ├── elements/                   # Editor versions of elements
│   │   ├── TextElement.js
│   │   ├── ImageElement.js
│   │   ├── VideoElement.js
│   │   ├── ScrollingTextElement.js
│   │   ├── ClockElement.js
│   │   ├── CountdownElement.js
│   │   ├── ProductionInfoElement.js
│   │   └── SponsorBarElement.js
│   │
│   └── common/
│       ├── SlidePreviewCard.js
│       ├── RemoteControl.js
│       └── BackgroundEffectSelector.js
```

### Frontend Visualizer

```
frontend/src/
├── pages/stagerunner/
│   └── StageRunnerViewer.js        # Main fullscreen component
│
├── components/stagerunner/
│   ├── SlideRenderer.js            # Renders a slide with all elements
│   ├── ElementRenderer.js          # Renders an element with transitions
│   ├── TransitionWrapper.js        # Applies enter/exit transitions
│   │
│   └── renderers/                  # Visualization versions of elements
│       ├── TextRenderer.js
│       ├── ImageRenderer.js
│       ├── VideoRenderer.js
│       ├── ScrollingTextRenderer.js
│       ├── ClockRenderer.js
│       ├── CountdownRenderer.js
│       ├── ProductionInfoRenderer.js
│       └── SponsorBarRenderer.js
│
├── hooks/stagerunner/
│   ├── useStageRunner.js           # Global state management
│   ├── useKeyboardControls.js      # Keyboard shortcuts
│   ├── useSlideTransition.js       # Slide transitions
│   └── usePolling.js               # Poll control state from API
│
└── context/
    └── StageRunnerContext.js       # Context for visualizer state
```

---

## Backend Models

### File: `backend/dpms/compos/models/stagerunner.py`

```python
from django.db import models
from dpms.core.models import BaseModel


class StageRunnerConfig(BaseModel):
    """Global StageRunner configuration per edition"""
    edition = models.OneToOneField(
        "Edition",
        on_delete=models.CASCADE,
        related_name="stagerunner_config"
    )
    default_background_effect = models.CharField(
        max_length=20,
        choices=[
            ('hyperspace', 'Hyperspace'),
            ('wave', 'Wave'),
            ('energy-grid', 'Energy Grid'),
            ('tron-grid', 'Tron Grid'),
            ('none', 'None'),
        ],
        default='hyperspace'
    )
    canvas_width = models.PositiveIntegerField(default=1920)
    canvas_height = models.PositiveIntegerField(default=1080)
    auto_advance_interval = models.PositiveIntegerField(
        default=5000,
        help_text="Interval in ms for auto-advancing slides"
    )

    class Meta:
        verbose_name = "StageRunner Config"
        verbose_name_plural = "StageRunner Configs"


class StageSlide(BaseModel):
    """A single slide/screen in StageRunner"""
    SLIDE_TYPE_CHOICES = [
        ('custom', 'Custom Layout'),
        ('idle', 'Idle/Waiting'),
        ('countdown', 'Countdown'),
        ('production_list', 'Production List'),
        ('production_show', 'Production Show'),
        ('results', 'Results'),
    ]

    config = models.ForeignKey(
        StageRunnerConfig,
        on_delete=models.CASCADE,
        related_name="slides"
    )
    name = models.CharField(max_length=255)
    slide_type = models.CharField(
        max_length=20,
        choices=SLIDE_TYPE_CHOICES,
        default='custom'
    )
    background_effect = models.CharField(
        max_length=20,
        choices=[
            ('hyperspace', 'Hyperspace'),
            ('wave', 'Wave'),
            ('energy-grid', 'Energy Grid'),
            ('tron-grid', 'Tron Grid'),
            ('none', 'None'),
            ('inherit', 'Use Default'),
        ],
        default='inherit'
    )
    background_image = models.ImageField(
        upload_to='stagerunner/backgrounds/',
        blank=True,
        null=True
    )
    background_color = models.CharField(max_length=7, default='#000000')
    has_compo = models.ForeignKey(
        "HasCompo",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="For countdown/list/results screens"
    )
    display_order = models.PositiveIntegerField(default=0)
    duration = models.PositiveIntegerField(
        default=0,
        help_text="Duration in ms, 0=manual advance"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'created']

    def __str__(self):
        return f"{self.name} ({self.get_slide_type_display()})"


class SlideElement(BaseModel):
    """A positionable element within a slide"""
    ELEMENT_TYPE_CHOICES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('scrolling_text', 'Scrolling Text'),
        ('clock', 'Clock'),
        ('countdown', 'Countdown Timer'),
        ('production_info', 'Production Info'),
        ('sponsor_bar', 'Sponsor Bar'),
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

    slide = models.ForeignKey(
        StageSlide,
        on_delete=models.CASCADE,
        related_name="elements"
    )
    element_type = models.CharField(max_length=20, choices=ELEMENT_TYPE_CHOICES)
    name = models.CharField(max_length=100, blank=True)

    # Position and size (percentages of canvas, 0-100)
    x = models.FloatField(default=0, help_text="X position as percentage (0-100)")
    y = models.FloatField(default=0, help_text="Y position as percentage (0-100)")
    width = models.FloatField(default=20, help_text="Width as percentage (0-100)")
    height = models.FloatField(default=10, help_text="Height as percentage (0-100)")
    rotation = models.FloatField(default=0, help_text="Rotation in degrees")
    z_index = models.PositiveIntegerField(default=0)

    # Content
    content = models.TextField(blank=True, help_text="Text content or URL")
    image = models.ImageField(
        upload_to='stagerunner/elements/',
        blank=True,
        null=True
    )
    video = models.FileField(
        upload_to='stagerunner/videos/',
        blank=True,
        null=True
    )

    # Styles (JSON: fontSize, fontFamily, color, textAlign, etc.)
    styles = models.JSONField(default=dict)

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
    enter_duration = models.PositiveIntegerField(default=500, help_text="ms")
    exit_duration = models.PositiveIntegerField(default=500, help_text="ms")
    enter_delay = models.PositiveIntegerField(default=0, help_text="ms delay before entering")

    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ['z_index', 'created']

    def __str__(self):
        return f"{self.name or self.element_type} @ ({self.x}%, {self.y}%)"


class StageControl(BaseModel):
    """Real-time state of the StageRunner visualizer"""
    config = models.OneToOneField(
        StageRunnerConfig,
        on_delete=models.CASCADE,
        related_name="control"
    )
    current_slide = models.ForeignKey(
        StageSlide,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    current_production = models.ForeignKey(
        "Production",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    current_production_index = models.PositiveIntegerField(default=0)
    is_playing = models.BooleanField(default=False)
    countdown_target = models.DateTimeField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Stage Control"
        verbose_name_plural = "Stage Controls"
```

---

## Visual Editor (SlideEditorPage.js)

### Editor Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [← Back]  Slide: "Welcome Screen"            [Save] [Preview] [Open Beamer] │
├───────────┬─────────────────────────────────────────────────┬───────────────┤
│  TOOLBAR  │                                                 │  PROPERTIES   │
│           │                                                 │               │
│  [T Text] │      ┌─────────────────────────────────┐       │  Element:     │
│  [🖼 Image]│      │                                 │       │  "Title"      │
│  [🎬 Video]│      │      Canvas 16:9                │       │               │
│  [↔ Scroll]│      │      (1920x1080)                │       │  Position     │
│  [🕐 Clock]│      │                                 │       │  X: [50] %    │
│  [⏱ Count]│      │    ┌─────────────────────┐      │       │  Y: [10] %    │
│  [📦 Prod] │      │    │   Title Text       │←drag │       │  W: [80] %    │
│  [🤝Sponsr]│      │    └─────────────────────┘      │       │  H: [10] %    │
│           │      │                                 │       │               │
│───────────│      │    ┌────────┐                   │       │  Style        │
│  LAYERS   │      │    │  Logo  │                   │       │  Font: [72px] │
│           │      │    └────────┘                   │       │  Color: [#FFF]│
│  ○ Title  │      │                                 │       │               │
│  ○ Logo   │      │         ┌──────────┐            │       │  Transition   │
│  ○ Clock  │      │         │  Clock   │            │       │  Enter: [Fade]│
│           │      └─────────────────────────────────┘       │  Exit: [Slide]│
│           │                                                 │  Duration:500 │
└───────────┴─────────────────────────────────────────────────┴───────────────┘
│ Background: [Hyperspace ▾]    [🖼 Upload Image]    Color: [#000000]         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Features

1. **Canvas**: 16:9 aspect ratio, represents 1920x1080 output
2. **Drag & Drop**: Elements can be moved with mouse
3. **Resize Handles**: Elements can be resized from corners/edges
4. **Properties Panel**: Real-time editing of selected element
5. **Layers Panel**: Z-index management, visibility toggles
6. **Background Picker**: Choose effect, image, or solid color

---

## Element Types

| Type | Content | Special Properties |
|------|---------|-------------------|
| **text** | Static text | fontSize, fontFamily, color, textAlign, fontWeight, textShadow |
| **image** | Uploaded image or URL | objectFit (cover/contain), borderRadius, boxShadow |
| **video** | Uploaded video or URL | autoplay, loop, muted, controls |
| **scrolling_text** | Moving text | scrollSpeed, direction (left/right/up/down), pauseOnHover |
| **clock** | Current time | format (12h/24h), showSeconds, timezone |
| **countdown** | Countdown timer | targetTime, format, showDays, onComplete (action) |
| **production_info** | Current production info | showTitle, showAuthors, showNumber, showCompo |
| **sponsor_bar** | Sponsor logos | scrollSpeed, logoSize, gap |

---

## Transition Effects

### Available Transitions

| Name | Description | CSS Animation |
|------|-------------|---------------|
| `none` | Instant appear/disappear | - |
| `fade` | Opacity 0→1 or 1→0 | opacity |
| `slide_left` | Slide from/to left | translateX |
| `slide_right` | Slide from/to right | translateX |
| `slide_up` | Slide from/to bottom | translateY |
| `slide_down` | Slide from/to top | translateY |
| `zoom` | Scale 0→1 or 1→0 | scale |
| `bounce` | Elastic entrance | spring animation |

### Configuration Per Element

```javascript
{
  enter_transition: 'fade',
  enter_duration: 500,      // ms
  enter_delay: 200,         // ms (for sequencing elements)
  exit_transition: 'slide_left',
  exit_duration: 300        // ms
}
```

### Sequencing Elements

Using `enter_delay`, elements can appear in sequence:
- Title: delay 0ms
- Subtitle: delay 300ms
- Image: delay 600ms
- Author: delay 900ms

---

## Background Effects

Reuses existing effects from the main website:

| Effect | Description |
|--------|-------------|
| `hyperspace` | Star Wars-style particles approaching camera |
| `wave` | Floating particles with wave motion |
| `energy-grid` | 3D grid with pulsing connections |
| `tron-grid` | TRON-style grid with light cycles |
| `none` | No particle effect (just background color/image) |
| `inherit` | Use default from StageRunnerConfig |

Each slide can have:
- A background effect (from above)
- A background image (optional, overlays effect)
- A background color (fallback)

---

## API Endpoints

### New Routes in `backend/dpms/compos/urls.py`

```python
router.register(r'stagerunner-config', StageRunnerConfigViewSet, basename='stagerunner-config')
router.register(r'stage-slides', StageSlidesViewSet, basename='stage-slides')
router.register(r'slide-elements', SlideElementsViewSet, basename='slide-elements')
router.register(r'stage-control', StageControlViewSet, basename='stage-control')
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stagerunner-config/` | List all configs |
| GET | `/api/stagerunner-config/{id}/` | Get config by ID |
| GET | `/api/stagerunner-config/?edition={id}` | Get config for edition |
| POST | `/api/stagerunner-config/` | Create config |
| PUT | `/api/stagerunner-config/{id}/` | Update config |
| GET | `/api/stagerunner-config/{id}/full_state/` | Get complete state for visualizer |
| GET | `/api/stage-slides/` | List slides |
| GET | `/api/stage-slides/?config={id}` | Slides for config |
| POST | `/api/stage-slides/` | Create slide |
| PUT | `/api/stage-slides/{id}/` | Update slide |
| DELETE | `/api/stage-slides/{id}/` | Delete slide |
| GET | `/api/slide-elements/?slide={id}` | Elements for slide |
| POST | `/api/slide-elements/` | Create element |
| PUT | `/api/slide-elements/{id}/` | Update element |
| DELETE | `/api/slide-elements/{id}/` | Delete element |
| GET | `/api/stage-control/?config={id}` | Get control state |
| POST | `/api/stage-control/{id}/navigate/` | Navigate to slide |
| POST | `/api/stage-control/{id}/next/` | Next slide/production |
| POST | `/api/stage-control/{id}/previous/` | Previous slide/production |
| POST | `/api/stage-control/{id}/toggle_play/` | Toggle auto-advance |

---

## Frontend Routes

### Add to `frontend/src/routes.js`

```javascript
// Admin StageRunner
<Route path="/admin/stagerunner" element={<AdminRoute><StageRunnerPage /></AdminRoute>} />
<Route path="/admin/stagerunner/slides" element={<AdminRoute><SlidesListPage /></AdminRoute>} />
<Route path="/admin/stagerunner/slides/new" element={<AdminRoute><SlideEditorPage /></AdminRoute>} />
<Route path="/admin/stagerunner/slides/:id" element={<AdminRoute><SlideEditorPage /></AdminRoute>} />
<Route path="/admin/stagerunner/control" element={<AdminRoute><LiveControlPage /></AdminRoute>} />
<Route path="/admin/stagerunner/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />

// Visualizer (public for projector laptop)
<Route path="/stagerunner/:editionId" element={<StageRunnerViewer />} />
```

### Add to Admin Menu in `MainBar.js`

```javascript
{ path: '/admin/stagerunner', icon: SlideshowIcon, label: 'StageRunner' }
```

---

## Keyboard Controls (Visualizer)

### Global

| Key | Action |
|-----|--------|
| F11 | Toggle fullscreen |
| ESC | Return to Idle/first slide |
| SPACE | Reload data / Toggle auto-advance |
| D | Toggle debug overlay |

### Navigation

| Key | Action |
|-----|--------|
| ← / → | Previous/Next slide |
| ↑ / ↓ | Scroll or adjust timer |
| HOME | First slide |
| END | Last slide |
| ENTER | Advance to next screen |
| 1-9 | Jump to slide N |

### Modes

| Key | Action |
|-----|--------|
| R | Toggle rotation/auto-advance |
| C | Show countdown screen |
| L | Show production list |
| S | Show single production |
| V | Show results |

---

## Implementation Phases

### Phase 1: Backend + Basic Structure
- [ ] Create models in `stagerunner.py`
- [ ] Create serializers
- [ ] Create ViewSets with CRUD
- [ ] Add URLs
- [ ] Run migrations

### Phase 2: Basic Visual Editor
- [ ] `StageRunnerPage.js` - Dashboard with edition selector
- [ ] `SlidesListPage.js` - List slides with preview cards
- [ ] `SlideEditorPage.js` - Editor layout structure
- [ ] `SlideCanvas.js` - 16:9 canvas component
- [ ] `DraggableElement.js` - react-rnd wrapper
- [ ] `ElementToolbar.js` - Add element buttons
- [ ] `PropertiesPanel.js` - Edit selected element
- [ ] Elements: Text, Image (basic)

### Phase 3: More Elements + Transitions
- [ ] Elements: Video, ScrollingText, Clock, Countdown
- [ ] Elements: ProductionInfo, SponsorBar
- [ ] `TransitionPicker.js` with preview animations
- [ ] Integrate framer-motion for transitions
- [ ] `LayersPanel.js` for z-index management

### Phase 4: Visualizer
- [ ] `StageRunnerViewer.js` - Main fullscreen component
- [ ] `SlideRenderer.js` - Render slide with elements
- [ ] `ElementRenderer.js` - Render element with transitions
- [ ] `TransitionWrapper.js` - Apply enter/exit animations
- [ ] Integrate ThreeBackground for effects
- [ ] Keyboard controls

### Phase 5: Remote Control
- [ ] `StageControl` endpoints
- [ ] `LiveControlPage.js` in admin
- [ ] Polling in visualizer for state changes
- [ ] Sync between admin and beamer

### Phase 6: Polish
- [ ] Undo/Redo in editor
- [ ] Copy/Paste elements
- [ ] Duplicate slides
- [ ] Predefined templates
- [ ] Export/Import configuration
- [ ] Performance optimization

---

## Dependencies

### Backend
No new dependencies required (uses existing Django/DRF)

### Frontend

```bash
docker compose -f local.yml exec frontend yarn add react-rnd framer-motion react-colorful
```

| Package | Purpose |
|---------|---------|
| `react-rnd` | Draggable and resizable elements |
| `framer-motion` | Smooth animations and transitions |
| `react-colorful` | Color picker for backgrounds and text |

---

## Testing Checklist

### Editor
- [ ] Can create new slides
- [ ] Can add all element types
- [ ] Drag and drop works smoothly
- [ ] Resize from corners/edges works
- [ ] Properties panel updates in real-time
- [ ] Background effect selector works
- [ ] Transitions can be configured
- [ ] Changes save correctly to API

### Visualizer
- [ ] Loads slide configuration from API
- [ ] Renders all element types correctly
- [ ] Enter/exit transitions animate properly
- [ ] Background effects display correctly
- [ ] Keyboard shortcuts work
- [ ] Fullscreen mode works
- [ ] Works on 1920x1080 projector
- [ ] Text readable from 10+ meters

### Remote Control
- [ ] Changes in admin reflect in visualizer
- [ ] Navigate commands work
- [ ] Auto-advance toggle works
- [ ] Multiple tabs stay in sync

---

## Security Considerations

1. **Visualizer Access**: The `/stagerunner/:editionId` route is public so it works on the projector laptop without login
2. **Admin Routes**: All `/admin/stagerunner/*` routes require DPMS Admins group
3. **API Control**: Control endpoints require authentication
4. **File Uploads**: Images/videos validated for type and size
5. **CORS**: Configure for projector laptop if different domain

---

## Future Enhancements

- [ ] Multi-screen support (different content per screen)
- [ ] Live voting display
- [ ] QR codes for voting URLs
- [ ] Video backgrounds for slides
- [ ] Social media integration
- [ ] Audio cues for transitions
- [ ] Mobile remote control app
- [ ] Analytics (what was displayed, for how long)
- [ ] Offline mode with cached slides
- [ ] WebSocket for real-time sync (instead of polling)

---

## Differences from Original Wuhu Beamer

### Improvements
1. ✅ **Visual editor**: Design slides with drag-and-drop instead of code
2. ✅ **REST API**: Real-time data, no file polling
3. ✅ **Modern React**: Component-based, maintainable
4. ✅ **Flexible layouts**: Position any element anywhere
5. ✅ **Transition effects**: Smooth animations for elements
6. ✅ **Background effects**: Reuse existing particle effects
7. ✅ **Remote control**: Control from admin panel

### Maintained Features
- ✅ Keyboard-based control
- ✅ Fullscreen operation
- ✅ Multiple display modes
- ✅ Author visibility toggle
- ✅ Countdown functionality
- ✅ Production rotation

### Simplified
- ❌ No `.data` file generation
- ❌ No JSONP support (just modern REST)
- ❌ No PHP admin panel (use React visual editor)
