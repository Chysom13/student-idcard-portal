import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import supabase from "../services/supabase"

const VerifyStudent = () => {
  const { token } = useParams()
  const [student, setStudent] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVerificationData = async () => {
      setLoading(true)
      try {
        // Fetch Student using unguessable UUID token
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("id", token)
          .single()

        if (studentError || !studentData) {
          setError("Invalid or expired verification token.")
          setLoading(false)
          return
        }

        setStudent(studentData)

        // Fetch Courses using the securely retrieved matric_number
        const { data: coursesData } = await supabase
          .from("enrolled_courses")
          .select("*")
          .eq("matric_number", studentData.matric_number)

        setCourses(coursesData || [])
      } catch (err) {
        setError("An error occurred while verifying the student.")
      } finally {
        setLoading(false)
      }
    }

    fetchVerificationData()
  }, [token])

  if (loading) {
    return (
      <div className="verify-container loading">
        <div className="loader"></div>
        <p>Verifying Student Credentials...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="verify-container error">
        <div className="error-icon">⚠️</div>
        <h1>Verification Failed</h1>
        <p>{error}</p>
        <Link to="/" className="back-btn">Return to Home</Link>
      </div>
    )
  }

  const totalUnits = courses.reduce((sum, c) => sum + (c.unit || 0), 0)
  const currentYear = new Date().getFullYear();
  const schoolSession = `${currentYear}/${currentYear + 1}`;

  return (
    <div className="verify-page">
      <div className="verify-container">
        <header className="verify-header">
          <div className="university-logo">MTU</div>
          <h1>Official Student Verification</h1>
          <div className="status-badge">ACTIVE STUDENT</div>
        </header>

        <section className="verify-profile">
          <div className="verify-photo-wrapper">
            <img src={student.photo_url} alt={student.name} className="verify-photo" />
          </div>
          <div className="verify-info">
            <h2 className="student-name">{student.name}</h2>
            <p className="matric-sub">{student.matric_number}</p>
          </div>
        </section>

        <section className="verify-details">
          <div className="detail-grid">
            <div className="detail-item">
              <label>Department</label>
              <span>{student.department}</span>
            </div>
            <div className="detail-item">
              <label>Level</label>
              <span>{student.level}</span>
            </div>
            <div className="detail-item">
              <label>Academic Session</label>
              <span>{schoolSession}</span>
            </div>
            <div className="detail-item">
              <label>Verified Date</label>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </section>

        <section className="verify-courses">
          <h3>Registered Courses</h3>
          <div className="course-table-wrapper">
            <table className="course-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                {courses.length > 0 ? (
                  courses.map((c, i) => (
                    <tr key={i}>
                      <td>{c.course_code}</td>
                      <td>{c.course_title}</td>
                      <td>{c.unit}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>No courses registered</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2">Total Registered Units</td>
                  <td>{totalUnits}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <footer className="verify-footer">
          <p className="security-note">
            This is an official real-time verification record from Mountain Top University. 
            Any alteration to this digital record is strictly prohibited.
          </p>
          <div className="seal-watermark">MTU OFFICIAL</div>
        </footer>
      </div>
    </div>
  )
}

export default VerifyStudent
