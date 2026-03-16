import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase';
import GlobalLimitControl from '../components/GlobalLimitControl';
import ExhaustedStudents from '../components/ExhaustedStudents';
import StudentMonitor from '../components/StudentMonitor';

const AdminDashboard = ({ onLogout }) => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [currentView, setCurrentView] = useState('menu'); // 'menu', 'global', 'exhausted', 'monitor'
    const [exhaustedCount, setExhaustedCount] = useState(0);

    // Guard: redirect to home if not authenticated
    useEffect(() => {
        if (sessionStorage.getItem('admin_session') !== 'true') {
            navigate('/');
        }
    }, [navigate]);

    // Fetch exhausted count for the badge
    useEffect(() => {
        const fetchExhaustedCount = async () => {
            const { data, error } = await supabase
                .from('students')
                .select('print_count, print_limit');
                
            if (!error && data) {
                const count = data.filter(s => (s.print_count || 0) >= (s.print_limit || 3)).length;
                setExhaustedCount(count);
            }
        };

        // Fetch when on the menu, or when refresh is triggered
        if (currentView === 'menu') {
            fetchExhaustedCount();
        }
    }, [currentView, refreshTrigger]);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentView('menu');
        handleRefresh(); // Ensure badge updates when returning to menu
    };

    // --- RENDER MENU ---
    const renderMenu = () => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            marginTop: '20px',
            color: 'white'
        }}>
            {/* Global Limit Control Card */}
            <div 
                onClick={() => setCurrentView('global')}
                style={{
                    background: '#1a1a2e', 
                    borderRadius: '16px',
                    padding: '32px 24px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    border: '1px solid #2a2a4a',
                    transition: 'transform 0.2s ease, background 0.2s ease',
                    textAlign: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#22223b'}
                onMouseOut={(e) => e.currentTarget.style.background = '#1a1a2e'}
            >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌐</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>Global Limit Control</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>Set uniform print limits across the entire system.</p>
            </div>

            {/* Exhausted Limits Queue Card */}
            <div 
                onClick={() => setCurrentView('exhausted')}
                style={{
                    background: '#2b1b3d', 
                    borderRadius: '16px',
                    padding: '32px 24px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    border: '1px solid #3d2b4f',
                    transition: 'transform 0.2s ease, background 0.2s ease',
                    textAlign: 'center',
                    position: 'relative'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#322147'}
                onMouseOut={(e) => e.currentTarget.style.background = '#2b1b3d'}
            >
                {exhaustedCount > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: '#e53e3e',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        boxShadow: '0 2px 8px rgba(229, 62, 62, 0.5)'
                    }}>
                        {exhaustedCount} Action{exhaustedCount !== 1 ? 's' : ''} Needed
                    </div>
                )}
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛑</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>Exhausted Limits</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>Manage students who have hit their max prints.</p>
            </div>

            {/* Global Student Monitor Card */}
            <div 
                onClick={() => setCurrentView('monitor')}
                style={{
                    background: '#0a2540', 
                    borderRadius: '16px',
                    padding: '32px 24px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    border: '1px solid #1c3d5a',
                    transition: 'transform 0.2s ease, background 0.2s ease',
                    textAlign: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#0e3153'}
                onMouseOut={(e) => e.currentTarget.style.background = '#0a2540'}
            >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '20px' }}>Student Monitor</h3>
                <p style={{ margin: 0, fontSize: '14px'}}>Search and view all student print statistics.</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px'}}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* Header Area */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '32px',
                    borderBottom: '1px solid #333',
                    paddingBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <div>
                        <h1 style={{ fontSize: 'min(7vw, 28px)', fontWeight: 800, margin: '0 0 8px' }}>
                            Admin Dashboard
                        </h1>
                        <p style={{ fontSize: '14px', margin: 0, opacity: 0.8 }}>
                            Mountain Top University · ID System Command Center
                        </p>
                    </div>
                </div>

                {/* Dashboard View Switching */}
                {currentView === 'menu' && renderMenu()}

                {currentView === 'global' && (
                    <div style={{ minHeight: '400px' }}>
                        <GlobalLimitControl onUpdateSuccess={handleRefresh} onBack={handleBack} />
                    </div>
                )}

                {currentView === 'exhausted' && (
                    <div style={{ minHeight: '600px', maxHeight: '800px' }}>
                        <ExhaustedStudents refreshTrigger={refreshTrigger} onBack={handleBack} />
                    </div>
                )}

                {currentView === 'monitor' && (
                    <div style={{ height: '700px' }}>
                        <StudentMonitor refreshTrigger={refreshTrigger} onBack={handleBack} />
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminDashboard;
