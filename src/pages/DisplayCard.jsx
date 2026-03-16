import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import supabase from "../services/supabase"
import IdCard from "../components/IdCard"
import { usePDF } from 'react-to-pdf'

const DisplayCard = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [printingStatus, setPrintingStatus] = useState("")
  const { toPDF, targetRef } = usePDF({ filename: 'university-id.pdf' })

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("students")
        .select()
        .eq("id", id)
        .single()

      if (error) {
        navigate("/", { replace: true })
        return
      }

      if (data) {
        let updatedFields = {}
        let updatedCard = { ...data }

        // --- Core Phase 5 Logic: Level Change Detection ---
        // If level shifted since last session, reset print counts
        const levelChangedSinceDatabaseReset = data.last_printed_level && data.last_printed_level !== data.level

        if (levelChangedSinceDatabaseReset) {
          updatedFields = {
            has_printed: false,
            print_count: 0,
            print_limit: 3, // Standard 3-print cap per level
            last_printed_level: null,
            request_status: 'none'
          }
          updatedCard = { ...updatedCard, ...updatedFields }
          await supabase.from("students").update(updatedFields).eq("id", id)
        }

        setCard(updatedCard)
        setLoading(false)
      }

    }

    fetchData()
  }, [id, navigate])

  const handlePrint = async () => {
    // Ultimate Hard Cap (4 prints total including emergency)
    const currentLimit = card.print_limit || 3
    if ((card.print_count || 0) >= currentLimit) return

    // UI guard - must not be currently locked by has_printed
    if (card.has_printed && card.last_printed_level === card.level) return

    setPrintingStatus("Generating PDF...")
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      await toPDF()

      setPrintingStatus("Locking for Reprint...")

      // If we just printed our 4th (emergency) card, clear the approved status
      const isEmergencyFinalPrint = (card.print_count || 0) + 1 >= 4
      const updateData = {
        has_printed: true,
        last_printed_level: card.level,
        print_count: (card.print_count || 0) + 1
      }

      if (isEmergencyFinalPrint) {
        updateData.request_status = 'none'
      }

      const { error } = await supabase
        .from("students")
        .update(updateData)
        .eq("id", id)

      if (!error) {
        setCard(prev => ({
          ...prev,
          ...updateData
        }))
        setPrintingStatus("")
      } else {
        setPrintingStatus("Technical error updating status.")
      }
    } catch (err) {
      console.error(err)
      setPrintingStatus("Failed to generate PDF.")
    }
  }

  const handlePayFine = async () => {
    setPrintingStatus("Unlocking Print...")

    const { error } = await supabase
      .from("students")
      .update({ has_printed: false })
      .eq("id", id)

    if (!error) {
      setCard(prev => ({ ...prev, has_printed: false }))
      setPrintingStatus("")
      alert("Fine paid successfully! Print option enabled.")
    } else {
      setPrintingStatus("Payment error.")
      alert("Failed to process fine.")
    }
  }

  if (loading) return <h3 style={{ textAlign: "center", marginTop: "2rem" }}>Loading ID card...</h3>
  if (!card) return null

  // UI STATE DERIVATION
  const isPrintedAtCurrentLevel = card.has_printed && card.last_printed_level === card.level
  const standardLimit = 3
  const currentLimit = card.print_limit || standardLimit
  const isAtAbsoluteMax = (card.print_count || 0) >= currentLimit
  const remainingPrints = Math.max(0, currentLimit - (card.print_count || 0))

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: "2rem auto", maxWidth: "800px" }}>

      {/* The ID Card Container with Countdown Badge - Wrappped in Scaler */}
      <div className="id-card-responsive-wrapper">
        <div className="id-card-scaler" style={{ position: "relative", width: "fit-content" }}>
          {/* Live Countdown Badge */}
          <div style={{
            position: "absolute",
            top: "-15px",
            right: "-15px",
            backgroundColor: isAtAbsoluteMax ? "#e53e3e" : (isPrintedAtCurrentLevel ? "#ecc94b" : "#38a169"),
            color: isPrintedAtCurrentLevel && !isAtAbsoluteMax ? "#000" : "white",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 10,
            border: "2px solid white",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span style={{ opacity: 0.9 }}>Available:</span>
            <span style={{ fontWeight: "800" }}>{remainingPrints}</span>
          </div>

          {/* The Printable Area */}
          <div ref={targetRef} style={{ padding: "20px", background: "white", borderRadius: "8px" }}>
            <div className="student-card">
              <IdCard student={card} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "2rem", textAlign: "center", width: "100%", maxWidth: "400px" }}>
        {isAtAbsoluteMax ? (
          <div style={{ padding: "20px", backgroundColor: "#fff5f5", color: "#c53030", borderRadius: "12px", border: "1px solid #feb2b2" }}>
            <h4 style={{ margin: "0 0 10px 0" }}>Issuance Exhausted</h4>
            <p style={{ fontSize: "14px", margin: "0 0 5px 0" }}>You have reached the absolute maximum limit of {currentLimit} cards for this level.</p>
            <p style={{ fontSize: "12px", opacity: 0.8 }}>No further reprints are available until your level changes.</p>
          </div>
        ) : isPrintedAtCurrentLevel ? (
          <div style={{ padding: "20px", backgroundColor: "#fffbe6", color: "#856404", borderRadius: "12px", border: "1px solid #ffe58f" }}>
            <h4 style={{ margin: "0 0 10px 0" }}>Reprint Fine Required</h4>
            <p style={{ fontSize: "13px", margin: "0 0 15px 0" }}>You've already printed this level's ID. A fine is required to reprint.</p>
            <button
              onClick={handlePayFine}
              disabled={!!printingStatus}
              style={{
                padding: "12px 20px",
                backgroundColor: "#ecc94b",
                color: "#000",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "700",
                width: "100%"
              }}
            >
              {printingStatus || "Pay Reprint Fine"}
            </button>
          </div>
        ) : (
          <button
            onClick={handlePrint}
            disabled={!!printingStatus && printingStatus !== "Failed to generate PDF."}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "8px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              fontWeight: "bold",
              width: "100%"
            }}
          >
            {printingStatus || (card.print_count === 0 ? "Download Free ID Card" : "Download Reprint")}
          </button>
        )}
      </div>
    </div>
  );
};

export default DisplayCard;
