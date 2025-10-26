# StageRunner - Presentation Display System

StageRunner is a fullscreen React application for displaying competition entries and information during demo parties. It consumes the DPMS REST API to show real-time production information on the big screen.

## Overview

StageRunner is inspired by Wuhu's Beamer but modernized with:
- **Real-time REST API consumption** (no file polling)
- **Modern React with hooks** and Material-UI
- **WebSocket support** for remote control (optional Phase 2)
- **Responsive fullscreen** optimized for 1920x1080 projectors
- **Smooth transitions** between screens with animations
- **Offline capability** with data caching

## Project Structure

```
stagerunner/                    (New standalone React app)
├── public/
│   ├── index.html
│   └── assets/
│       ├── logo.png
│       └── transitions/
│           └── effects.css
├── src/
│   ├── components/
│   │   ├── Countdown.js
│   │   ├── ProductionSlide.js
│   │   ├── CompoHeader.js
│   │   ├── ResultsTable.js
│   │   ├── AnnouncementSlide.js
│   │   └── WaitingScreen.js
│   ├── screens/
│   │   ├── CountdownScreen.js
│   │   ├── ProductionListScreen.js
│   │   ├── ProductionShowScreen.js
│   │   ├── ResultsScreen.js
│   │   └── IdleScreen.js
│   ├── services/
│   │   ├── api.js              (DPMS API client)
│   │   ├── cache.js            (Local storage caching)
│   │   └── keyboard.js         (Hotkey handlers)
│   ├── hooks/
│   │   ├── useStageControl.js
│   │   ├── useSlideshow.js
│   │   └── useKeyboard.js
│   ├── context/
│   │   └── StageContext.js     (Global state)
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Display Modes

### 1. Idle/Waiting Screen
**Purpose**: Default screen when nothing is happening
**Content**:
- Event logo and name
- Current time
- Next competition info (name, start time)
- Animated background or slideshow

**Data needed**:
- Current edition info (name, logo)
- Next scheduled HasCompo (with `compo_start` time)

**API calls**:
```
GET /api/editions/?current=true
GET /api/hascompos/?edition=X&status=upcoming&ordering=compo_start
```

---

### 2. Countdown Screen
**Purpose**: Show countdown before competition starts
**Content**:
- Competition name (large)
- Competition type/category
- Countdown timer (minutes:seconds)
- Compo rules summary
- Sponsor logos (optional)

**Data needed**:
- HasCompo info (compo name, start time, description)
- Edition info

**API calls**:
```
GET /api/hascompos/{id}/
GET /api/compos/{id}/
```

**Controls**:
- Arrow Up/Down: Adjust timer by ±1 minute
- SPACE: Start/pause countdown
- ENTER: Finish and move to next screen

---

### 3. Production List Screen
**Purpose**: Show all entries in the competition before voting
**Content**:
- Competition header (name, type)
- Numbered list of productions:
  - #01, #02, #03...
  - Title (large)
  - Author/Group (if `show_authors_on_slide` is true)
  - Comment (if available)
- Smooth scroll for long lists

**Data needed**:
- Productions for specific compo
- show_authors_on_slide flag from HasCompo

**API calls**:
```
GET /api/productions/?compo={id}&edition={id}
GET /api/hascompos/?edition={id}&compo={id}
```

**Controls**:
- Arrow Up/Down: Scroll through list
- ENTER: Move to Production Show mode

---

### 4. Production Show Screen
**Purpose**: Display single production with full details while it's being shown
**Content**:
- Large production title
- Author/Group (stylized)
- Production number (#05 / 15)
- Competition name (smaller, top)
- Visual accent (borders, animations)
- Optional: Preview image if available

**Data needed**:
- Single production detail
- Total count in compo

**API calls**:
```
GET /api/productions/{id}/
```

**Controls**:
- Arrow Left/Right: Navigate between productions
- Arrow Up/Down: Adjust display time
- HOME/END: Jump to first/last production
- R: Rotate through all productions automatically

---

### 5. Results Screen
**Purpose**: Show voting results after competition ends
**Content**:
- Competition name header
- Results table:
  - Rank (1st, 2nd, 3rd with trophies)
  - Production title
  - Author/Group
  - Score/Points
- Animated reveal (optional)

**Data needed**:
- Vote results (Phase 4 - not implemented yet)
- Productions ranked by score

**API calls** (future):
```
GET /api/votes/?compo={id}&edition={id}&results=true
```

**Controls**:
- SPACE: Reveal next position
- R: Reveal all at once

---

### 6. Announcement Screen
**Purpose**: Show custom announcements between compos
**Content**:
- Large text message
- Optional HTML formatting
- Background image or video
- Scrolling text for long messages

**Data needed**:
- Custom announcement (from future Announcements model)

**API calls** (future):
```
GET /api/announcements/?active=true
```

---

## Backend API Extensions Needed

### 1. Current Edition Endpoint
```python
@action(detail=False, methods=['get'])
def current(self, request):
    """Get the currently active edition"""
    edition = Edition.objects.filter(
        start_date__lte=timezone.now(),
        end_date__gte=timezone.now()
    ).first()
    serializer = self.get_serializer(edition)
    return Response(serializer.data)
```

### 2. HasCompo List Filtering
Add query params to HasCompoViewSet:
- `status`: upcoming, active, finished
- `show_on_beamer`: boolean filter
- `ordering`: compo_start, -compo_start

### 3. Production List Enhancements
Add to ProductionSerializer:
- `position`: Sequential number in compo (1, 2, 3...)
- `total_in_compo`: Total productions in same compo
- Computed in get_queryset with annotation

### 4. StageRunner Control API (Phase 2)
```python
# New model: StageControl
class StageControl(models.Model):
    edition = models.OneToOneField(Edition)
    current_screen = models.CharField(choices=SCREEN_CHOICES)
    current_hascompo = models.ForeignKey(HasCompo, null=True)
    current_production = models.ForeignKey(Production, null=True)
    auto_advance = models.BooleanField(default=False)

# WebSocket or polling endpoint
GET /api/stage-control/current/
```

---

## Keyboard Controls

StageRunner uses keyboard shortcuts for operation:

### Global
- **F11**: Toggle fullscreen
- **ESC**: Return to Idle screen
- **SPACE**: Reload data from API
- **T**: Toggle theme/styling
- **D**: Show debug overlay (FPS, API status)

### Navigation
- **Arrow Left/Right**: Previous/Next production
- **Arrow Up/Down**: Scroll or adjust timers
- **HOME**: Jump to first item
- **END**: Jump to last item
- **ENTER**: Confirm/advance to next screen

### Modes
- **R**: Start rotation/slideshow mode
- **C**: Show countdown screen
- **L**: Show production list
- **S**: Show single production
- **V**: Show results (voting)
- **A**: Show announcement

### Numbers
- **1-9**: Jump to production number
- **0**: Return to start

---

## State Management

### StageContext

```javascript
const StageContext = createContext();

const stageState = {
  // Current display
  currentScreen: 'idle',           // idle, countdown, list, show, results, announcement
  currentEdition: null,            // Edition object
  currentCompo: null,              // Compo object
  currentHasCompo: null,           // HasCompo object
  currentProduction: null,         // Production object
  currentProductionIndex: 0,       // Position in list

  // Data
  productions: [],                 // All productions in current compo
  results: [],                     // Voting results

  // Controls
  autoAdvance: false,              // Automatic rotation
  autoAdvanceInterval: 5000,       // 5 seconds per production
  countdownTarget: null,           // Target datetime for countdown

  // UI
  showAuthors: true,               // From HasCompo.show_authors_on_slide
  theme: 'dark',
  fullscreen: false,

  // Cache
  lastApiUpdate: null,
  offlineMode: false,
};
```

---

## API Service Layer

```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const CACHE_DURATION = 60000; // 1 minute

class StageRunnerAPI {
  constructor() {
    this.client = axios.create({ baseURL: API_BASE });
    this.cache = new Map();
  }

  // Cache wrapper
  async cachedGet(url, ttl = CACHE_DURATION) {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    try {
      const response = await this.client.get(url);
      this.cache.set(url, {
        data: response.data,
        timestamp: Date.now()
      });
      return response.data;
    } catch (error) {
      // Return stale cache on error
      if (cached) return cached.data;
      throw error;
    }
  }

  // Editions
  async getCurrentEdition() {
    return this.cachedGet('/editions/current/');
  }

  // Compos
  async getUpcomingCompos(editionId) {
    return this.cachedGet(`/hascompos/?edition=${editionId}&status=upcoming&ordering=compo_start`);
  }

  async getCompoInfo(hasCompoId) {
    return this.cachedGet(`/hascompos/${hasCompoId}/`);
  }

  // Productions
  async getCompoProductions(editionId, compoId) {
    return this.cachedGet(`/productions/?edition=${editionId}&compo=${compoId}&ordering=id`);
  }

  async getProduction(id) {
    return this.cachedGet(`/productions/${id}/`);
  }

  // Force refresh (SPACE key)
  clearCache() {
    this.cache.clear();
  }
}

export default new StageRunnerAPI();
```

---

## Custom Hooks

### useKeyboard

```javascript
// src/hooks/useKeyboard.js
import { useEffect } from 'react';

export const useKeyboard = (handlers) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      const handler = handlers[e.key] || handlers[e.code];
      if (handler) {
        e.preventDefault();
        handler(e);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlers]);
};
```

### useSlideshow

```javascript
// src/hooks/useSlideshow.js
import { useState, useEffect, useCallback } from 'react';

export const useSlideshow = (items, interval = 5000, autoStart = false) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoStart);

  useEffect(() => {
    if (!isPlaying || items.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex(i => (i + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, items.length, interval]);

  const next = useCallback(() => {
    setCurrentIndex(i => (i + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrentIndex(i => (i - 1 + items.length) % items.length);
  }, [items.length]);

  const goto = useCallback((index) => {
    setCurrentIndex(Math.max(0, Math.min(index, items.length - 1)));
  }, [items.length]);

  return {
    currentIndex,
    current: items[currentIndex],
    next,
    prev,
    goto,
    isPlaying,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    toggle: () => setIsPlaying(p => !p),
  };
};
```

---

## Styling & Theming

### Design Principles
1. **High contrast**: Readable from distance
2. **Large text**: Minimum 24px for body, 48px+ for titles
3. **Smooth animations**: 300-500ms transitions
4. **Dark theme**: Easier on projectors, better contrast
5. **Brand consistency**: Use party colors and logos
6. **Minimal UI**: Focus on content, hide controls

### Typography
- **Titles**: Bold, sans-serif, 72-96px
- **Subtitles**: Regular, 36-48px
- **Body**: 24-32px
- **Metadata**: Italic, 20-24px

### Color Scheme (Dark Theme)
```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --accent-primary: #ff6b35;    /* Party orange */
  --accent-secondary: #00d9ff;   /* Party cyan */
  --success: #4caf50;
  --warning: #ff9800;
  --error: #f44336;
}
```

---

## Implementation Phases

### Phase 1: Core Presentation (Week 1-2)
- [x] Project setup (Create React App)
- [ ] API service layer with caching
- [ ] StageContext and state management
- [ ] Keyboard controls hook
- [ ] Idle/Waiting screen
- [ ] Production List screen
- [ ] Production Show screen
- [ ] Countdown screen
- [ ] Basic transitions

### Phase 2: Advanced Features (Week 3)
- [ ] Results screen (when voting implemented)
- [ ] Announcement screen
- [ ] Slideshow/rotation mode
- [ ] Fullscreen API integration
- [ ] Local storage persistence
- [ ] Offline mode with stale cache
- [ ] Theme customization
- [ ] Debug overlay

### Phase 3: Remote Control (Week 4)
- [ ] Backend StageControl model
- [ ] Admin panel integration
- [ ] WebSocket or polling for real-time updates
- [ ] Remote screen switching
- [ ] Remote production navigation
- [ ] Control panel UI in DPMS admin

### Phase 4: Polish & Production (Week 5)
- [ ] Performance optimization
- [ ] Smooth transitions and animations
- [ ] Custom fonts and branding
- [ ] Multi-resolution support
- [ ] Error handling and recovery
- [ ] Production testing
- [ ] Documentation

---

## Configuration

### Environment Variables

```env
# .env.production
REACT_APP_API_URL=https://dpms.posadasparty.com/api
REACT_APP_REFRESH_INTERVAL=30000
REACT_APP_CACHE_DURATION=60000
REACT_APP_AUTO_ADVANCE_INTERVAL=5000
REACT_APP_FULLSCREEN_DEFAULT=true
REACT_APP_THEME=dark
```

---

## Deployment

### Standalone Deployment
StageRunner can be deployed separately:

```bash
# Build
cd stagerunner
npm run build

# Deploy to static hosting
# Option 1: Same server as DPMS
cp -r build/* /var/www/dpms/stagerunner/

# Option 2: Separate domain
# Upload to stage.posadasparty.com

# Option 3: Local laptop for party
# Just open build/index.html in browser
```

### URL Structure
- DPMS Admin: `https://dpms.posadasparty.com/admin/`
- DPMS App: `https://dpms.posadasparty.com/app/`
- StageRunner: `https://dpms.posadasparty.com/stage/`
  OR: `https://stage.posadasparty.com/`

---

## Usage Workflow

### During Party Setup
1. Organizer opens StageRunner on presentation laptop
2. Connects to projector/big screen
3. Presses F11 for fullscreen
4. StageRunner shows Idle screen with party logo

### Before Competition
1. Press **C** to show Countdown screen
2. System automatically detects next scheduled compo
3. Countdown starts from `compo_start` time
4. Adjust with Arrow Up/Down if needed

### During Competition
1. Countdown finishes → automatically shows Production List
2. Press **ENTER** or **L** to show list of all entries
3. Press **S** or **ENTER** to enter Show mode
4. Navigate with **Arrow Left/Right** between productions
5. Or press **R** for automatic rotation

### After Competition
1. Press **V** to show Results screen (when voting complete)
2. Press **SPACE** to reveal winners one by one
3. Press **ESC** to return to Idle screen

### Between Events
1. Press **A** to show custom announcements
2. Or let Idle screen show next compo info
3. Press **SPACE** to refresh data if schedule changes

---

## Testing Checklist

- [ ] All keyboard shortcuts work
- [ ] Fullscreen mode activates correctly
- [ ] API caching reduces network calls
- [ ] Offline mode works with stale cache
- [ ] Smooth transitions between screens
- [ ] Long production lists scroll smoothly
- [ ] Countdown timer is accurate
- [ ] Author visibility respects HasCompo setting
- [ ] Production rotation maintains timing
- [ ] Works on 1920x1080 projector
- [ ] Works on 4K displays (scaled)
- [ ] Text is readable from 10+ meters
- [ ] No CORS issues with production API
- [ ] Handles network interruptions gracefully

---

## Future Enhancements

- **Multi-screen support**: Different content on different screens
- **Live voting display**: Real-time vote counting visualization
- **QR codes**: For voting or information URLs
- **Video backgrounds**: Animated backgrounds for idle screen
- **Social media integration**: Live tweets/posts about party
- **Camera integration**: Show live audience reactions
- **Audio cues**: Sound effects for transitions
- **Mobile control**: Control StageRunner from phone
- **Analytics**: Track what was displayed and for how long
- **Export mode**: Generate static HTML slides for backup

---

## Differences from Wuhu Beamer

### Improvements
1. ✅ **REST API instead of file polling**: Real-time, no manual refresh
2. ✅ **Modern React**: Component-based, maintainable
3. ✅ **Responsive**: Works on any screen size
4. ✅ **Offline capable**: Caching for reliability
5. ✅ **Better UX**: Smooth transitions, animations
6. ✅ **No PHP dependency**: Pure JavaScript frontend
7. ✅ **WebSocket ready**: For future remote control

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
- ❌ No PHP admin panel (use DPMS React admin)

---

## Next Steps

1. ✅ **Commit current work** (DONE)
2. 🔄 **Create stagerunner/** directory
3. 🔄 **Initialize React project**
4. 🔄 **Implement Phase 1 features**
5. ⏳ **Test with real DPMS API**
6. ⏳ **Deploy for Posadas Party 2025**

