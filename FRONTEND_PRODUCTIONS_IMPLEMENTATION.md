# Frontend Productions Implementation

This document describes the React frontend implementation for the productions/competitions system.

## Components Implemented

### 1. API Service Layer (`frontend/src/services/api.js`)

Centralized API service layer with token authentication:

- **editionsAPI**: CRUD operations for editions + custom actions (getCompos, getProductions)
- **composAPI**: CRUD operations for compos + getProductions action
- **productionsAPI**: CRUD operations + myProductions action
- **filesAPI**: Upload (multipart), download (blob), CRUD operations
- **hasComposAPI**: CRUD operations for Edition↔Compo relationships

All requests automatically include authentication token from localStorage.

### 2. FileUpload Component (`frontend/src/components/productions/FileUpload.js`)

Reusable file upload component with features:

- Multiple file selection
- Progress tracking with LinearProgress bar
- 100MB per-file size validation
- FormData multipart upload
- File list display with original filename and size
- Delete functionality
- Error handling with dismissible alerts
- Callback to parent with uploaded file IDs

**Props:**
- `onFilesUploaded(fileIds)`: Callback with array of uploaded file IDs
- `initialFiles`: Array of existing file objects for edit mode

### 3. ComposList Component (`frontend/src/components/productions/ComposList.js`)

Competition browsing and selection:

- Edition selector dropdown (filters `open_to_upload: true`)
- Grid layout of competition cards with Material-UI
- Competition info: name, description, start time
- Status chips: "Open for submissions" or "Closed"
- "Submit Production" button (disabled if closed)
- Navigates to ProductionForm with pre-filled query params

**URL navigation:**
```
/productions/new?edition=1&compo=2
```

### 4. ProductionForm Component (`frontend/src/components/productions/ProductionForm.js`)

Production submission and editing form:

**Features:**
- Dual mode: Create new or edit existing (based on URL param `:id`)
- Pre-fills from URL query params (`?edition=X&compo=Y`)
- Dynamic compo loading based on selected edition
- Integrated FileUpload component
- Field validation with error display
- Edition and compo selectors (disabled when editing)
- Title, authors, description fields
- Cancel button returns to My Productions

**Validation:**
- Required fields: edition, compo, title, authors
- Handles field-level errors from API
- Handles non-field errors (e.g., submission closed)

**URLs:**
- Create: `/productions/new?edition=1&compo=2`
- Edit: `/productions/edit/:id`

### 5. MyProductions Component (`frontend/src/components/productions/MyProductions.js`)

User's production list and management:

**Features:**
- Grid layout of production cards
- Displays: title, authors, edition, compo, description, file count, submission date
- Empty state with "Browse Competitions" CTA
- Action buttons: View, Edit, Delete
- Delete confirmation dialog
- "Submit New Production" button → navigates to /compos

**Permissions:**
- Only shows user's own productions (via `/api/productions/my-productions/`)
- Edit/delete only available to production owner

### 6. ProductionDetail Component (`frontend/src/components/productions/ProductionDetail.js`)

Full production information view:

**Features:**
- Displays all production metadata
- Edition and compo chips
- Full description with line breaks preserved
- File list with download buttons
- File download with progress indicator
- Shows submission and modification dates
- Edit button (only for production owner)
- Back button for navigation

**File download:**
- Fetches blob from `/api/files/:id/download/`
- Triggers browser download with original filename
- Shows loading state during download

**Permissions:**
- Public view (anyone can see)
- Edit button only visible to owner

## Routes Added

Updated `frontend/src/routes.js`:

```javascript
// Public routes
<Route path="/compos" element={<ComposList />} />
<Route path="/productions/:id" element={<ProductionDetail />} />

// Protected routes (require authentication)
<Route path="/productions/new" element={<PrivateRoute><ProductionForm /></PrivateRoute>} />
<Route path="/productions/edit/:id" element={<PrivateRoute><ProductionForm /></PrivateRoute>} />
<Route path="/my-productions" element={<PrivateRoute><MyProductions /></PrivateRoute>} />
```

## Navigation Updates

Updated `frontend/src/@dpms-freemem/MainBar.js`:

Added to user panel sidebar:
- **Competitions** (`/compos`) - EmojiEventsIcon
- **My Productions** (`/my-productions`) - FolderIcon

Replaced old placeholder routes with functional production routes.

## User Workflows

### 1. Submit New Production

1. User clicks "Competitions" in sidebar → `/compos`
2. Selects edition from dropdown
3. Views available competitions for that edition
4. Clicks "Submit Production" on a compo → `/productions/new?edition=X&compo=Y`
5. Form pre-fills edition and compo
6. User fills title, authors, description
7. Uploads files via FileUpload component
8. Clicks "Submit" → redirects to `/my-productions`

### 2. View My Productions

1. User clicks "My Productions" in sidebar → `/my-productions`
2. Sees grid of their submitted productions
3. Can click View icon → `/productions/:id`
4. Can click Edit icon → `/productions/edit/:id`
5. Can click Delete icon → shows confirmation dialog

### 3. Edit Existing Production

1. From My Productions, click Edit icon → `/productions/edit/:id`
2. Form loads with existing data
3. Edition and compo are disabled (cannot change)
4. User modifies title, authors, description
5. Can add/remove files
6. Clicks "Update" → redirects to `/my-productions`

### 4. View Production Details

1. From My Productions, click View icon → `/productions/:id`
2. Sees full production information
3. Can download files by clicking download button
4. If owner, can click "Edit" button → `/productions/edit/:id`

### 5. Delete Production

1. From My Productions, click Delete icon
2. Confirmation dialog appears
3. User confirms deletion
4. Production removed from API and UI updates

## API Integration

All components use the centralized API service from `services/api.js`:

```javascript
import { editionsAPI, productionsAPI, filesAPI } from '../../services/api';

// Example: Fetch user's productions
const response = await productionsAPI.myProductions();
setProductions(response.data);

// Example: Upload file
const formData = new FormData();
formData.append('file', file);
const response = await filesAPI.upload(formData);
```

## Error Handling

All components implement comprehensive error handling:

- Network errors displayed with Material-UI Alert
- Field-level validation errors shown below inputs
- Loading states with CircularProgress
- Dismissible error messages
- Graceful fallbacks for missing data

## Material-UI Components Used

- **Layout**: Box, Paper, Grid, Divider
- **Typography**: Typography, Chip
- **Forms**: TextField, Select, MenuItem, FormControl, InputLabel, Button
- **Lists**: List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction
- **Feedback**: Alert, CircularProgress, LinearProgress
- **Navigation**: IconButton
- **Dialogs**: Dialog, DialogTitle, DialogContent, DialogActions
- **Icons**: EmojiEvents, CloudUpload, Edit, Delete, Visibility, InsertDriveFile, Download, ArrowBack, Folder

## Internationalization

Components use react-i18next for translations:

```javascript
const { t } = useTranslation();
<ListItemText primary={t("My Productions")} />
```

Translations needed:
- "Competitions"
- "My Productions"
- "Submit Production"
- "Edit Production"
- "Delete Production"
- "Browse Competitions"
- "No productions yet"
- etc.

## Styling

All components use Material-UI's `sx` prop for styling:

- Responsive design with breakpoints
- Consistent spacing and padding
- Dark theme compatibility
- Mobile-friendly layouts

## Next Steps

Potential enhancements:

1. **Filtering and Sorting**: Add filters for edition/compo in My Productions
2. **Search**: Add search functionality for productions
3. **Pagination**: Implement pagination for large production lists
4. **Image Previews**: Show thumbnails for image files
5. **Voting System**: Implement voting UI (Phase 4 from TECHNICAL_SPEC.md)
6. **Social Features**: Add comments, likes, favorites
7. **Admin Features**: Production moderation, compo management UI
8. **Analytics**: Production view counts, download statistics
9. **Notifications**: Real-time updates for submission deadlines
10. **Bulk Actions**: Select multiple productions for bulk operations

## Testing Checklist

- [ ] File upload with multiple files
- [ ] File upload size limit validation (100MB)
- [ ] Production submission with pre-filled query params
- [ ] Production editing (disabled edition/compo fields)
- [ ] Production deletion with confirmation
- [ ] File download with correct filename
- [ ] Navigation between all routes
- [ ] Authentication checks (redirect to login)
- [ ] Owner-only actions (edit/delete buttons)
- [ ] Empty states (no productions, no files)
- [ ] Error states (network errors, validation errors)
- [ ] Loading states (spinners, progress bars)
- [ ] Responsive design (mobile, tablet, desktop)

## Dependencies

Required npm packages (already in package.json):

- react
- react-router-dom
- @mui/material
- @mui/icons-material
- react-i18next
- axios (via AxiosWrapper)

No additional dependencies needed.
