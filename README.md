# 🎓 MTU One ID Portal

A self-service Student Identity Card portal for **Mountain Top University (MTU)**. Students can look up their records, capture a profile photo, and download a professionally formatted ID card as a PDF — all from a single interface.

---

## ✨ v3 Core Features

### Student Portal
- **Matric Number Search** — Students enter their matriculation number to retrieve their record. Invalid numbers are caught with a clear error message.
- **Webcam Photo Capture** — If a student has no photo on record, they are directed to a guided webcam capture page with strict instructions (white backdrop, no hats, direct eye contact).
- **Digital ID Card** — A horizontal CR80-format identity card displaying the student's name, matric number, course, level, and a barcode.
- **PDF Download** — Students can download their ID card as a PDF directly from the browser.

### Print Control (Level-Based)
- A student can only print their ID card **once per academic level**.
- The system tracks this using two Supabase columns: `has_printed` (boolean) and `last_printed_level` (text).
- If a student's level changes (e.g., 200L → 300L), the print button is **automatically re-enabled**.
- If the levels still match, the button stays locked with a friendly notice.

### Admin Dashboard
- Accessible via a floating 🔐 button at the bottom-right corner of every page.
- Password-protected login modal (configurable via `.env`).
- Admins can **search for any student by Matric Number** and view their current print status.
- A **"Reset Print Lock"** button allows admins to manually re-enable printing (e.g., for lost cards).
- The nav bar transitions to a **dark purple admin theme** when the admin session is active.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router DOM |
| Styling | Vanilla CSS |
| Camera | `react-webcam` |
| PDF Generation | `react-to-pdf` |
| Barcode | `react-barcode` |
| Backend / Database | Supabase (PostgreSQL + Storage) |

---

## 🗃️ Database Schema

Table: **`students`**

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Full name |
| `matric_number` | text | Unique matriculation number |
| `department` | text | Course / Department |
| `level` | text | Current academic level (e.g. `200 Level`) |
| `college` | text | College name |
| `photo_url` | text | Public URL of student photo in Supabase Storage |
| `has_printed` | boolean | Whether the card is currently locked (default: `false`) |
| `last_printed_level` | text | The academic level at which the card was last printed |

**Supabase Storage Bucket:** `student-photos`

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_ANON_KEY=your_supabase_anon_key
REACT_APP_ADMIN_PASS=your_admin_password
```

> ⚠️ **Important:** Change `REACT_APP_ADMIN_PASS` to a strong, unique password before deploying to production.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start
```

---

## 📁 Project Structure

```
src/
├── components/
│   └── IdCard.jsx          # Horizontal CR80 ID Card component
├── pages/
│   ├── Home.jsx            # Matric number search page
│   ├── CapturePhoto.jsx    # Webcam photo capture flow
│   ├── DisplayCard.jsx     # ID card view & PDF download
│   ├── AdminLogin.jsx      # Admin password modal
│   └── AdminDashboard.jsx  # Admin control panel
├── services/
│   └── supabase.js         # Supabase client instance
├── App.jsx                 # Routes & global layout
└── index.css               # Global styles & ID card CSS
```

---

## 🔒 Security Notes

- The admin password is stored client-side via an environment variable. This is suitable for an internal/intranet tool but should be replaced with **Supabase Auth** for a production-grade deployment.
- The Supabase Anon Key only has Row-Level Security (RLS) access. Ensure your Supabase policies are configured correctly to limit student data exposure.

---

## 📄 License

This project was built for academic purposes at Mountain Top University.
