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

### Step 2: Photo Capture (`/capture/:id`)

Students who have no photo on record are guided through a strict photo capture flow:

**Hybrid Capture Logic:**
- **Primary:** `react-webcam` library for stable browser support.
- **Fallback:** Native **MediaDevices API** (`getUserMedia`) — the system automatically switches if the library fails.

**On-screen instructions displayed to the student:**
- Use a clean, solid **white backdrop**
- Ensure your face is well-lit and clearly visible
- Look directly at the camera

The student takes a photo, previews it, and can retake before confirming. On confirmation:

1. The image blob is uploaded to Supabase Storage (`student-photos` bucket)
2. The student's `photo_url` record is updated in the database
3. The student is redirected to `/card/:id`

---

### Step 3: ID Card View & 3D Interaction (`/card/:id`)

The student sees their fully generated **3D digital identity card** in a horizontal CR80 format.

**Key Features:**
- **3D Flip**: The card is interactive; clicking it flips it over using premium CSS animations to reveal the back.
- **Front Face**: Displays Student Photo, Name, Matric No, Course, and Level.
- **Back Face**: Contains the **Verification Scan** (QR Code) and university return instructions.
- **Watermark**: Repeated diagonal "MTU" text watermark background for security.

**Download Button:**
Clicking "Download ID Card" generates a high-resolution, hardware-accurate 2-page PDF (Front/Back) perfectly sized (85.6mm x 54mm) for PVC card printers.

---

### Phase 13: Public Verification Portal

Whenever the student's ID card is scanned via the QR code on the back:
- **Instant Access**: Opens a public verification portal at `/verify/:matricNumber`.
- **Portal View**: Displays a professional record with the student's photo, an **"ACTIVE STUDENT"** status badge, and a verified list of currently registered courses fetched from the database.
- **Security Check**: Provides security personnel with a reliable, digital alternative to physical card inspection.

---

## Administrative Dashboard

The command center allows administrators to manage institutional-level limits and monitor student issuance.

### Dashboard Sections
1. **Global Limit Control**: Authority to set institutional print caps for all students.
2. **Exhausted Limits Queue**: Monitoring system for students who have reached their limits, providing manual overrides (+1 Reprint or Full Reset).
3. **Global Student Monitor**: Searchable directory of all registered students with live print statistics. 
   - **Enrollment View**: Admins can click any student to see their full course registration details.

---

## Technical Highlights

| Feature | Implementation |
|---|---|
| Component | 3D Perspective + Preserve-3D CSS Transforms |
| PDF Engine | `react-to-pdf` (Hardware-accurate CR80 scaling) |
| Verification | `qrcode.react` encoding deep-links to `/verify` |
| Navigation | React Router v6 for SPA transitions |
| Backend | Supabase Real-time PostgreSQL & Storage |
