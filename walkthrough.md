# MTU One ID Portal — Project Walkthrough

## Project Overview

The **MTU One ID Portal** is a self-service web application built for Mountain Top University. It allows students to retrieve, complete, and download their official student identity cards without needing to visit any administrative office.

---

## Student Flow

### Step 1: Home — Matric Number Search

The landing page presents a single centered input. The student enters their matriculation number and the system queries the Supabase database.

**Outcome A — Not Found:**
An inline error message is shown: *"No student found. Please check your matric number and try again."*

**Outcome B — Found, No Photo:**
The student is redirected to `/capture/:id` to complete their profile with a webcam photo.

**Outcome C — Found, With Photo:**
The student is routed directly to `/card/:id` to view and download their ID.

---

### Step 2: Webcam Photo Capture (`/capture/:id`)

Students who have no photo on record are guided through a strict photo capture flow:

**On-screen instructions displayed to the student:**
- Use a clean, solid **white backdrop**
- Ensure your face is well-lit and clearly visible
- No hats, sunglasses, or face coverings
- Look directly at the camera

The student takes a photo, previews it, and can retake before confirming. On confirmation:

1. The image blob is uploaded to Supabase Storage (`student-photos` bucket)
2. The student's `photo_url` record is updated in the database
3. The student is redirected to `/card/:id`

---

### Step 3: ID Card View (`/card/:id`)

The student sees their fully generated **digital identity card** in a horizontal CR80 format — the same dimensions as a standard physical ID card.

**Card Contents:**
- University header with name and "Student Identity Card" subtitle
- Student photo (fixed frame with `object-fit: cover` to prevent stretching)
- Student details: Name, Matric No, Course, Level
- Barcode (generated locally via `react-barcode`, encoding name and matric number)
- Validity period
- Repeating diagonal "MTU" watermark background

**Download Button:**
Clicking "Download ID Card" calls `react-to-pdf` to generate a PDF of the card at correct print dimensions.

---

## Print Control Logic

### First-Time Print
- `last_printed_level` is `null` → button is active
- After download: `has_printed = true`, `last_printed_level = "200 Level"` (current level)

### Same Level — Reprinting Blocked
- On page load: `last_printed_level === student.level` → `has_printed` confirmed true
- Button hidden, notice shown: *"Your ID card for 200 Level has already been printed. Contact administration for reprints."*

### Level Change — Reprinting Unlocked
- `last_printed_level = "200 Level"`, `student.level = "300 Level"` → mismatch detected
- System auto-sets `has_printed = false` in Supabase
- Print button re-enabled — student can download a new card for their new level

---

## Admin Flow

### Accessing the Admin Panel

A subtle **🔐 lock icon** floats in the bottom-right corner of every student-facing page. Clicking it opens an overlay modal with a password input.

- Correct password → session stored, nav bar transitions to **dark purple admin theme** with "ADMIN MODE" badge
- User is navigated to `/admin/dashboard`

### Admin Dashboard

The admin sees a clean search interface. They can type a student's matric number to retrieve their record, which displays:
- Student name and details
- Current academic level
- Last printed level
- Print lock status badge (🔒 Print Locked / ✅ Can Print)

If the print lock is active, a **"Reset Print Lock"** button appears. Clicking it:
1. Sets `has_printed = false` in Supabase
2. Clears `last_printed_level` to `null`
3. The status badge on-screen instantly updates to ✅ Can Print

### Logging Out

The nav bar shows a "Logout" button in admin mode. Clicking it:
- Clears the `sessionStorage` admin session
- Restores the normal teal nav bar
- Redirects to the Home page

---

## Technical Highlights

| Feature | Implementation |
|---|---|
| Client-side PDF | `react-to-pdf` — renders the card DOM node to PDF |
| Local barcode | `react-barcode` — no external API dependency |
| Webcam access | `react-webcam` — browser-native camera access |
| Admin auth | `sessionStorage` + env variable password (MVP approach) |
| Print lock | Dual-column DB tracking: `has_printed` + `last_printed_level` |
| Background watermark | Inline SVG data URI repeated as `background-image` in CSS |
| Dark admin nav | React state + `sessionStorage` check on every route change |
