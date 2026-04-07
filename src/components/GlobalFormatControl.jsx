import { useState, useEffect } from 'react';

const GlobalFormatControl = ({ onBack }) => {
    const [barcodeType, setBarcodeType] = useState('qr');
    const [message, setMessage] = useState('');

    useEffect(() => {
        setBarcodeType(localStorage.getItem('admin_barcode_preference') || 'qr');
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem('admin_barcode_preference', barcodeType);
        setMessage('✅ Successfully saved the preferred ID Card format.');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div style={{
            background: '#1a1a2e', // Matching dashboard theme
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '1px solid #2a2a4a'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                    🔲 ID Card Format Options
                </h3>
                {onBack && (
                    <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #555', color: '#ccc', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                        ✕ Exit
                    </button>
                )}
            </div>
            
            <p style={{ fontSize: '14px', color: '#aaa', margin: '0 0 20px' }}>
                Configure the primary verification format displayed on the rear side of all newly generated IDs.
            </p>

            <form onSubmit={handleSave} style={{ gap: '15px', marginTop: 'auto', background: 'transparent', display: 'flex', flexDirection: 'column'}}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Select Encoding Approach:</label>
                    <select
                        value={barcodeType}
                        onChange={(e) => { setBarcodeType(e.target.value); setMessage(''); }}
                        style={{
                            padding: '12px 16px',
                            fontSize: '14px',
                            background: '#0f0f1a',
                            color: 'white',
                            border: '1px solid #444',
                            borderRadius: '8px',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="qr">2D QR Code (Modern / Verify Link)</option>
                        <option value="1d">1D Barcode (Legacy / Matriculation Target)</option>
                    </select>
                </div>

                <div style={{ marginTop: '10px', fontSize: '13px', color: '#888', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                    <strong>Note:</strong> Changes apply instantly to your current session when generating new PDF exports.
                </div>

                <button
                    type="submit"
                    style={{
                        padding: '10px 18px',
                        marginTop: '10px',
                        background: '#12bca2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >
                    Save Preferences
                </button>
            </form>

            {message && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: message.startsWith('✅') ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                    color: message.startsWith('✅') ? '#81c784' : '#e57373',
                    border: `1px solid ${message.startsWith('✅') ? '#4CAF50' : '#f44336'}`
                }}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default GlobalFormatControl;
