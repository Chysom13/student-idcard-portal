# MTU One ID Portal — Implementation Plan

A self-service Student Identity Card portal for Mountain Top University, transforming a legacy admin dashboard into a modern student-facing application backed by Supabase.

---

## System Architecture

```
Student Browser
      │
      ▼
React SPA (Create React App)
      │
      ├── Supabase DB (PostgreSQL) — students table
      └── Supabase Storage — student-photos bucket
```

---

## Database Schema

**Table:** `students`

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | uuid | auto | Primary key |
| `name` | text | — | Student full name |
| `matric_number` | text | — | Unique matriculation number |
| `department` | text | — | Course / Department |
| `level` | text | — | Academic level (e.g. `200 Level`) |
| `college` | text | — | College name |
| `photo_url` | text | null | Public URL of student photo |
| `has_printed` | boolean | false | Whether print is currently locked |
| `last_printed_level` | text | null | Level at which card was last printed |

**Supabase Storage Bucket:** `student-photos` (public read access)

---

## Routing Structure

| Route | Component | Description |
|---|---|---|
| `/` | [Home.jsx](file:///c:/Users/Admin/Documents/Project/finals-project/src/pages/Home.jsx) | Matric number search |
| `/card/:id` | [DisplayCard.jsx](file:///c:/Users/Admin/Documents/Project/finals-project/src/pages/DisplayCard.jsx) | ID card view & PDF download |
| `/capture/:id` | [CapturePhoto.jsx](file:///c:/Users/Admin/Documents/Project/finals-project/src/pages/CapturePhoto.jsx) | Webcam photo capture |
| `/admin/dashboard` | [AdminDashboard.jsx](file:///c:/Users/Admin/Documents/Project/finals-project/src/pages/AdminDashboard.jsx) | Admin control panel |

> Admin login is a **modal overlay** triggered by a floating FAB, not a page route.

---

## Phase 1 — Student Portal

### Home Page (`/`)
- Centered matric number input
- Supabase query on `matric_number` field
- If not found → inline error message
- If found with `photo_url` → navigate to `/card/:id`
- If found without `photo_url` → navigate to `/capture/:id`

### Webcam Capture (`/capture/:id`)
- Guided photo capture via `react-webcam`
- Strict on-screen instructions (white backdrop, no coverings, face the camera)
- Preview before confirming
- Upload to `student-photos` bucket in Supabase Storage
- Update student record with `photo_url`
- Redirect to `/card/:id` on success

### ID Card View (`/card/:id`)
- Fetch full student record from Supabase by UUID
- Render [IdCard](file:///c:/Users/Admin/Documents/Project/finals-project/src/components/IdCard.jsx#3-69) component — horizontal CR80 format
  - Photo (fixed 130×150px with `object-fit: cover`)
  - Student details (Name, Matric No, Course, Level)
  - `react-barcode` barcode encoding `name|matric_number`
  - Repeating "MTU" diagonal text watermark background
- `react-to-pdf` generates a PDF on button click

---

## Phase 2 — Level-Based Print Control

### Logic (runs on page load in [DisplayCard.jsx](file:///c:/Users/Admin/Documents/Project/finals-project/src/pages/DisplayCard.jsx))
```
levelsMatch = (last_printed_level === level)

if levelsMatch AND has_printed is false  → set has_printed = true  in DB
if NOT levelsMatch AND has_printed is true → set has_printed = false in DB
```

### On Print Click
```
1. Generate PDF via toPDF()
2. Update DB: has_printed = true, last_printed_level = student.level
3. Update local state to reflect locked status
```

### Result
| State | Button |
|---|---|
| Never printed | ✅ Enabled |
| Printed at same level | 🔒 Disabled — shows notice |
| Level changed since last print | ✅ Auto re-enabled |

---

## Phase 3 — Admin Dashboard

### Access
- Floating 🔐 FAB at bottom-right of every non-admin page
- Clicking opens a modal overlay (blurred backdrop)
- Password checked against `REACT_APP_ADMIN_PASS` env variable
- On success: session stored in `sessionStorage`, navigates to `/admin/dashboard`

### Nav Bar Behaviour
- Normal mode: teal gradient, shows "Search Student" link
- Admin mode: dark purple gradient, shows "ADMIN MODE" badge + "Logout" button
- Logout clears `sessionStorage` and returns to Home

### Admin Dashboard Features
- Search student by matric number
- Displays: name, level, last printed level, print lock status badge
- **Reset Print Lock** button: sets `has_printed = false` and `last_printed_level = null`
- Instant UI update on reset without page reload

---

## Environment Variables

```env
REACT_APP_SUPABASE_URL=your_project_url
REACT_APP_ANON_KEY=your_anon_key
REACT_APP_ADMIN_PASS=your_secure_password
```

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `react-router-dom` | Client-side routing |
| `@supabase/supabase-js` | Database & storage access |
| `react-webcam` | Webcam access for photo capture |
| `react-to-pdf` | In-browser PDF generation |
| `react-barcode` | Local barcode rendering |
