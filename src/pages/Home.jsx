import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../services/supabase";

const Home = () => {
  const [matricNumber, setMatricNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!matricNumber.trim()) {
      setErrorMsg("Please enter a matriculation number");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('matric_number', matricNumber.trim())
      .single();

    setLoading(false);

    if (error || !data) {
      setErrorMsg("Record not found. Please check your number and try again.");
      return;
    }

    // Checking if there is a photo
    if (data.photo_url) {
      navigate(`/card/${data.id}`);
    } else {
      navigate(`/capture/${data.id}`);
    }
  };

  return (
    <div className="page home" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column' }}>
      <h2>Student Portal</h2>
      <p style={{ marginBottom: "20px", textAlign: 'center' }}>Enter your Matriculation Number to view or print your ID card.</p>

      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '400px' }}>
        <input
          type="text"
          placeholder="Enter Matric Number"
          value={matricNumber}
          onChange={(e) => setMatricNumber(e.target.value)}
          style={{ padding: "12px", fontSize: "16px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <button disabled={loading} style={{ padding: "12px", fontSize: "16px", cursor: "pointer", borderRadius: "8px", backgroundColor: "#var(--primary)", color: "white", border: "none" }}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {errorMsg && (
        <div style={{ marginTop: "20px", color: "#d32f2f", backgroundColor: "#ffebee", padding: "10px", borderRadius: "8px", textAlign: "center", width: "100%", maxWidth: "400px" }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default Home;