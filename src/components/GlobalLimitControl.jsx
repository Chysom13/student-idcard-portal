import { useState } from 'react';
import supabase from '../services/supabase';

const GlobalLimitControl = ({ onUpdateSuccess, onBack }) => {
    const [globalLimit, setGlobalLimit] = useState('');
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpdateGlobalLimit = async (e) => {
        e.preventDefault();
        const limitValue = parseInt(globalLimit, 10);
        
        if (isNaN(limitValue) || limitValue < 1) {
            setMessage('Please enter a valid number greater than 0.');
            return;
        }

        setUpdating(true);
        setMessage('');

        // Update all students' print_limit in Supabase
        const { error } = await supabase
            .from('students')
            .update({ print_limit: limitValue })
            .not('id', 'is', null); // match all

        setUpdating(false);

        if (!error) {
            setMessage(`✅ Successfully updated global print limit to ${limitValue} for all students.`);
            setGlobalLimit('');
            if (onUpdateSuccess) onUpdateSuccess();
        } else {
            console.error(error);
            setMessage('❌ Failed to update global limit. Please try again.');
        }
    };

    return (
        <div style={{
            background: '#1a1a2e', // Dark blue background for this square
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
                    🌐 Global Limit Control
                </h3>
                {onBack && (
                    <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #555', color: '#ccc', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                        ✕ Exit
                    </button>
                )}
            </div>
            
            <p style={{ fontSize: '14px', color: '#aaa', margin: '0 0 20px' }}>
                Set a uniform print limit for every student in the system at once.
            </p>

            <form onSubmit={handleUpdateGlobalLimit} style={{ gap: '10px', marginTop: 'auto', background: 'transparent', display: 'flex', flexDirection: 'column'}}>
                <input
                    type="number"
                    min="1"
                    value={globalLimit}
                    onChange={(e) => { setGlobalLimit(e.target.value); setMessage(''); }}
                    placeholder="New Limit (e.g. 3)"
                    required
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        fontSize: '14px',
                        background: '#0f0f1a',
                        color: 'white',
                        border: '1px solid #444',
                        borderRadius: '8px',
                        outline: 'none',
                    }}
                />
                <button
                    type="submit"
                    disabled={updating}
                    style={{
                        padding: '8px 18px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: updating ? 'not-allowed' : 'pointer',
                        opacity: updating ? 0.7 : 1,
                    }}
                >
                    {updating ? 'Updating...' : 'Set All'}
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

export default GlobalLimitControl;
