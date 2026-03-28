import { useState } from 'react';

// AdminLogin now renders as an overlay modal instead of a full page
const AdminLogin = ({ onClose, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        const adminPass = process.env.REACT_APP_ADMIN_PASS;

        if (password === adminPass) {
            sessionStorage.setItem('admin_session', 'true');
            onSuccess();
        } else {
            setError('Incorrect password. Please try again.');
            setPassword('');
        }
    };

    return (
        // Overlay backdrop
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
            }}
        >
            {/* Modal Card — stop clicks from closing */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '40px',
                    width: '100%',
                    maxWidth: '380px',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
                    textAlign: 'center',
                    position: 'relative',
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#999',
                        lineHeight: 1,
                    }}
                >
                    ✕
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0a3d34, #2a0660)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 14px',
                        fontSize: '26px',
                    }}>
                        🔐
                    </div>
                    <h2 style={{ margin: 0, fontSize: '22px', color: '#1a1a2e', fontWeight: 800 }}>Admin Login</h2>
                    <p style={{ margin: '6px 0 0', color: '#888', fontSize: '13px' }}>Mountain Top University · ID System</p>
                </div>

                <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>
                        Admin Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="Enter admin password"
                        autoFocus
                        required
                        style={{
                            width: '100%',
                            padding: '12px 14px',
                            fontSize: '15px',
                            border: error ? '2px solid #e53935' : '2px solid #e0e0e0',
                            borderRadius: '8px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            marginBottom: '10px',
                        }}
                    />
                    {error && (
                        <p style={{ color: '#e53935', fontSize: '13px', margin: '0 0 10px', fontWeight: 500 }}>{error}</p>
                    )}
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '13px',
                            fontSize: '15px',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #0a3d34, #2a0660)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        Login to Dashboard →
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
