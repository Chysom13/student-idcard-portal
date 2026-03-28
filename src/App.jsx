import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Link } from "react-router-dom";

// pages
import Home from "./pages/Home";
import DisplayCard from "./pages/DisplayCard";
import CapturePhoto from "./pages/CapturePhoto";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import VerifyStudent from "./pages/VerifyStudent";

// The main layout wrapper (needs to be inside BrowserRouter to use useLocation)
function Layout() {
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check admin session on every route change
  useEffect(() => {
    setIsAdminSession(sessionStorage.getItem("admin_session") === "true");
  }, [location]);

  const isAdminPage = location.pathname.startsWith("/admin");
  const isVerifyPage = location.pathname.startsWith("/verify");

  return (
    <>
      {/* Nav Bar - darkens when admin session is active */}
      {!isVerifyPage && (
        <nav className="main-nav" style={{
        background: isAdminSession
          ? "#0a0a0a"
          : "#12bca2",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h1>MTU One ID Portal</h1>
          {isAdminSession && (
            <span style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.7)",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "999px",
              padding: "2px 10px",
              letterSpacing: "0.5px"
            }}>
              ADMIN MODE
            </span>
          )}
        </div>

        {isAdminSession ? (
  <button
    onClick={() => {
      sessionStorage.removeItem('admin_session');
      setIsAdminSession(false);
      navigate('/');
    }}
    style={{
      background: 'rgba(255,255,255,0.15)',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '8px',
      padding: '8px 18px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      margin: '10px 0 0 0'
    }}
  >
    Logout
  </button>
) : (
  <Link
    to="/"
  >
    Student Search
  </Link>
  )}
        </nav>
      )}

      {/* Page Content */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/card/:id" element={<DisplayCard />} />
        <Route path="/capture/:id" element={<CapturePhoto />} />
        <Route path="/admin/dashboard" element={<AdminDashboard onLogout={() => setIsAdminSession(false)} />} />
        <Route path="/verify/:token" element={<VerifyStudent />} />
      </Routes>

      {/* Floating Admin FAB — hidden on admin dashboard and verify pages */}
      {!isAdminPage && !isVerifyPage && (
        <button
          onClick={() => setAdminModalOpen(true)}
          title="Admin Login"
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0a3d34, #2a0660)",
            color: "white",
            border: "none",
            fontSize: "22px",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          🔐
        </button>
      )}

      {/* Admin Login Modal */}
      {adminModalOpen && (
        <AdminLogin
          onClose={() => setAdminModalOpen(false)}
          onSuccess={() => {
            setAdminModalOpen(false);
            setIsAdminSession(true);
            navigate('/admin/dashboard');
          }}
        />
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;