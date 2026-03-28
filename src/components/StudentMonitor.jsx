import { useState, useEffect } from 'react';
import supabase from '../services/supabase';

const StudentMonitor = ({ refreshTrigger, onBack }) => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Detailed View State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);

    const fetchAllStudents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('students')
            .select('id, name, matric_number, level, department, print_count, print_limit')
            .order('name');
            
        if (!error && data) {
            setStudents(data);
            setFilteredStudents(data);
        } else {
            console.error('Failed to fetch students:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAllStudents();
    }, [refreshTrigger]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredStudents(students);
            return;
        }
        
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = students.filter(s => 
            (s.name && s.name.toLowerCase().includes(lowerQuery)) || 
            (s.matric_number && s.matric_number.toLowerCase().includes(lowerQuery)) ||
            (s.department && s.department.toLowerCase().includes(lowerQuery))
        );
        setFilteredStudents(filtered);
    }, [searchQuery, students]);

    const handleStudentClick = async (student) => {
        setSelectedStudent(student);
        setLoadingCourses(true);
        
        const { data, error } = await supabase
            .from('enrolled_courses')
            .select('course_code, course_title, unit')
            .eq('matric_number', student.matric_number);
            
        if (!error && data) {
            setEnrolledCourses(data);
        } else {
            console.error('Failed to fetch courses:', error);
            setEnrolledCourses([]);
        }
        
        setLoadingCourses(false);
    };

    const handleBackToMonitor = () => {
        setSelectedStudent(null);
        setEnrolledCourses([]);
    };

    return (
        <div style={{
            background: '#0a2540', // Deep naval blue
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '1px solid #1c3d5a'
        }}>
            {selectedStudent ? (
                /* --- DETAILED STUDENT VIEW --- */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1c3d5a', paddingBottom: '16px', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: 700 }}>{selectedStudent.name}</h3>
                            <div style={{ fontSize: '19px', color: '#cbd5e1' }}>
                                {selectedStudent.matric_number} • {selectedStudent.department} • {selectedStudent.level}
                            </div>
                        </div>
                        <button onClick={handleBackToMonitor} style={{ background: '#1c3d5a', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            ← Back
                        </button>
                    </div>

                    {/* Form-Like Detail Area */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px' }}>
                            <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#93c5fd', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                                Enrolled Courses
                            </h4>
                            
                            {loadingCourses ? (
                                <p style={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>Loading courses...</p>
                            ) : enrolledCourses.length === 0 ? (
                                <p style={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>No courses registered for this student.</p>
                            ) : (
                                <div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1' }}>
                                                <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>Code</th>
                                                <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>Title</th>
                                                <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600 }}>Units</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enrolledCourses.map((course, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '12px 10px', fontWeight: 700 }}>{course.course_code}</td>
                                                    <td style={{ padding: '12px 10px', color: '#e2e8f0' }}>{course.course_title}</td>
                                                    <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 700, color: '#86efac' }}>{course.unit}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    
                                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', padding: '15px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid #1c3d5a' }}>
                                        <span style={{ fontSize: '14px', color: '#cbd5e1', marginRight: '15px' }}>Total Registered Units:</span>
                                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>
                                            {enrolledCourses.reduce((sum, course) => sum + (course.unit || 0), 0)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* --- GLOBAL STUDENT LIST VIEW --- */
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px', borderBottom: '1px solid #1c3d5a', paddingBottom: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                            📊 Global Student Monitor
                        </h3>
                        {onBack && (
                            <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #555', color: '#ccc', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                                ✕ Exit
                            </button>
                        )}
                    </div>
                    
                    <input
                        type="text"
                        placeholder="Search by Name, Matric No, or Dept..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            fontSize: '14px',
                            background: '#041424',
                            color: 'white',
                            border: '1px solid #2d4a6a',
                            borderRadius: '8px',
                            outline: 'none',
                            marginBottom: '20px',
                            boxSizing: 'border-box'
                        }}
                    />

                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                        {loading ? (
                            <p style={{ color: '#aaa', fontStyle: 'italic' }}>Loading directory...</p>
                        ) : filteredStudents.length === 0 ? (
                            <p style={{ color: '#aaa', fontStyle: 'italic' }}>No students found matching your search.</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                                {filteredStudents.map(student => {
                                    const limit = student.print_limit || 3;
                                    const count = student.print_count || 0;
                                    const left = Math.max(0, limit - count);
                                    const isExhausted = count >= limit;

                                    return (
                                        <div 
                                            key={student.id} 
                                            onClick={() => handleStudentClick(student)}
                                            style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                padding: '16px',
                                                borderRadius: '10px',
                                                border: isExhausted ? '1px solid rgba(229, 62, 62, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                                            }}
                                        >
                                            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={student.name}>
                                                {student.name}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#93c5fd', marginBottom: '12px' }}>
                                                {student.matric_number} • {student.level}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '12px', fontStyle: 'italic' }}>
                                                {student.department || 'No Dept Specified'}
                                            </div>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px' }}>
                                                <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                                                    Printed: <span style={{ fontWeight: 700, color: 'white' }}>{count}</span>
                                                </div>
                                                <div style={{ fontSize: '11px', color: isExhausted ? '#fca5a5' : '#86efac', fontWeight: 700 }}>
                                                    Left: {left}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentMonitor;
