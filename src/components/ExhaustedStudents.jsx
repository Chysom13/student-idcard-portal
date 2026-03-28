import { useState, useEffect } from 'react';
import supabase from '../services/supabase';

const ExhaustedStudents = ({ refreshTrigger, onBack }) => {
    const [exhaustedStudents, setExhaustedStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchExhaustedStudents = async () => {
        setLoading(true);
        // Supabase RPG approach: We can't directly compare two columns in a single standard filter easily without RPC, 
        // so we fetch all students and filter on the client side since this is an admin dashboard, 
        // OR we can rely on standard print_count >= 3 if we assume a standard limit, but since limit is dynamic, client filter is safer.
        // If the dataset is huge, this should be an RPC. For now, fetch all relevant fields.
        const { data, error } = await supabase
            .from('students')
            .select('id, name, matric_number, level, print_count, print_limit, has_printed')
            .order('name');
            
        if (!error && data) {
            // Filter: where print_count >= print_limit OR (has_printed is true and no prints left based on limits)
            const exhausted = data.filter(s => (s.print_count || 0) >= (s.print_limit || 3));
            setExhaustedStudents(exhausted);
        } else {
            console.error('Failed to fetch exhausted students:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchExhaustedStudents();
    }, [refreshTrigger]);

    const handleAction = async (studentId, actionType, currentLimit) => {
        let updatePayload = {};
        
        if (actionType === 'allow_one') {
            updatePayload = { print_limit: (currentLimit || 3) + 1 };
        } else if (actionType === 'reset') {
            updatePayload = { print_count: 0, has_printed: false, last_printed_level: null };
        }

        const { error } = await supabase
            .from('students')
            .update(updatePayload)
            .eq('id', studentId);

        if (!error) {
            // Refresh the list after successful action
            fetchExhaustedStudents();
        } else {
            alert('Failed to update student state. Please try again.');
        }
    };

    return (
        <div style={{
            background: '#2b1b3d', // Deep purple
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '1px solid #3d2b4f'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                    🛑 Exhausted Limits Queue
                </h3>
                {onBack && (
                    <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #555', color: '#ccc', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                        ✕ Exit
                    </button>
                )}
            </div>
            
            <p style={{ fontSize: '14px', color: '#ccc', margin: '0 0 20px' }}>
                Students who have reached their maximum allowed prints.
            </p>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                {loading ? (
                    <p style={{ color: '#aaa', fontStyle: 'italic' }}>Loading students...</p>
                ) : exhaustedStudents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#999' }}>
                        <div style={{ fontSize: '30px', marginBottom: '10px' }}>🎉</div>
                        No students have exhausted their limits right now.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {exhaustedStudents.map(student => (
                            <div key={student.id} style={{
                                background: 'rgba(0,0,0,0.25)',
                                padding: '16px',
                                borderRadius: '10px',
                                border: '1px solid #4d3b5f',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{student.name}</div>
                                    <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                                        {student.matric_number} • {student.level}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#fca5a5', marginTop: '6px', fontWeight: 600 }}>
                                        Printed: {student.print_count} / Limit: {student.print_limit || 3}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        onClick={() => handleAction(student.id, 'allow_one', student.print_limit)}
                                        style={{
                                            padding: '8px 12px',
                                            background: '#3182ce',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            fontWeight: 600
                                        }}
                                        title="Increments their limit by 1"
                                    >
                                        +1 Print
                                    </button>
                                    <button 
                                        onClick={() => handleAction(student.id, 'reset', student.print_limit)}
                                        style={{
                                            padding: '8px 12px',
                                            background: '#e53e3e',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            fontWeight: 600
                                        }}
                                        title="Resets print count to 0 and unlocks"
                                    >
                                        Full Reset
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExhaustedStudents;
