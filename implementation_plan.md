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
| `print_limit` | integer | 1 | Max allowed prints |
| `print_count` | integer | 0 | Current print count |

**Table:** `courses`

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | uuid | auto | Primary key |
| `course_code` | text | — | e.g. CSC 101 |
| `course_title` | text | — | e.g. Introduction to Computer Science |
| `units` | integer | — | Course unit load |

**Table:** `enrolled_courses`

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | uuid | auto | Primary key |
| `matric_number` | text | — | Foreign key mapping to `students.matric_number` |
| `student_name` | text | — | Student's name |
| `department` | text | — | Student's department |
| `course_code` | text | — | Foreign key mapping to `courses.course_code` |
| `course_title` | text | — | Title of the course |
| `unit` | integer | — | Unit/credit load of the course |

**Supabase Storage Bucket:** `student-photos` (public read access)

---

## Routing Structure

| Route | Component | Description |
|---|---|---|
| `/` | `Home.jsx` | Matric number search |
| `/card/:id` | `DisplayCard.jsx` | ID card view & PDF download |
| `/capture/:id` | `CapturePhoto.jsx` | Webcam photo capture |
| `/admin/dashboard` | `AdminDashboard.jsx` | Admin control panel |
| `/verify/:matricNumber` | `VerifyStudent.jsx` | Public verification portal |

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
- Render `IdCard` component — horizontal CR80 format
- `react-to-pdf` generates a PDF on button click

---

## Phase 12: 3D Card Flip & Back Face
- **Interactive Logic**: CSS `perspective` and `preserve-3d` used for a premium flip animation.
- **Dual Sides**: Separated `FrontFace` and `BackFace` components.
- **Back Side**: Encodes the QR code and secondary university details.

---

## Phase 13: Public Verification Portal
- **Verification Page**: Direct link from QR code to `/verify/:matricNumber`.
- **Live Records**: Fetches real-time student and course data.
- **Mobile Optimized**: Designed for gate security to verify student status instantly.

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
| `qrcode.react` | 2D verification scanning |
