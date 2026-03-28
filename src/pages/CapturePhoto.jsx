import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import supabase from '../services/supabase';

const CapturePhoto = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Refs for Native Implementation
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Ref for React-Webcam Implementation
    const webcamRef = useRef(null);

    const [preview, setPreview] = useState(null);
    const [capturing, setCapturing] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [useNative, setUseNative] = useState(false); // Primary: react-webcam
    const [cameraActive, setCameraActive] = useState(false);

    // Initialize Native Camera
    useEffect(() => {
        let stream = null;
        if (useNative && !preview) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
                .then(s => {
                    stream = s;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        setCameraActive(true);
                    }
                })
                .catch(err => {
                    console.error("Native camera failed:", err);
                    setUseNative(false); // Fallback to React-Webcam
                });
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [useNative, preview]);

    const handleCapture = () => {
        if (useNative) {
            // Capture from Video Element to Canvas
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (video && canvas) {
                const context = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageSrc = canvas.toDataURL('image/jpeg');
                setPreview(imageSrc);
                setCameraActive(false);
            }
        } else {
            // Capture from React-Webcam
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                setPreview(imageSrc);
            }
        }
    };

    const handleRetake = () => {
        setPreview(null);
        setErrorMsg(null);
        if (useNative) setCameraActive(true);
    };

    const handleUpload = async () => {
        if (!preview) return;

        setCapturing(true);
        setErrorMsg(null);

        try {
            // Convert base64 to Blob
            const res = await fetch(preview);
            const blob = await res.blob();

            const fileName = `students/${id}-${crypto.randomUUID()}.jpg`;

            // Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from("student-photos")
                .upload(fileName, blob, { contentType: "image/jpeg" });

            if (uploadError) {
                throw new Error("Failed to upload photo. Please try again.");
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from("student-photos")
                .getPublicUrl(fileName);

            // Update Student Record
            const { error: updateError } = await supabase
                .from("students")
                .update({ photo_url: publicUrl })
                .eq("id", id);

            if (updateError) {
                throw new Error("Failed to update student record.");
            }

            // Success, route to card view
            navigate(`/card/${id}`);

        } catch (err) {
            console.error(err);
            setErrorMsg(err.message);
            setCapturing(false);
        }
    };

    return (
        <div className="page capture" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: "2rem auto", padding: "0 20px" }}>
            <h2 style={{ marginBottom: "10px", color: "#d32f2f" }}>Action Required: Photo Capture</h2>

            <div style={{ backgroundColor: "#f8f9fa", borderLeft: "4px solid #007bff", padding: "15px", marginBottom: "20px", maxWidth: "600px", borderRadius: "4px" }}>
                <h4 style={{ margin: "0 0 10px 0" }}>Strict Photo Guidelines:</h4>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    <li>You <strong>MUST</strong> use a clean, solid <strong>white backdrop</strong>.</li>
                    <li>Ensure your face is well-lit and clearly visible.</li>
                    <li>No hats, sunglasses, or face coverings.</li>
                    <li>Look directly at the camera.</li>
                </ul>
            </div>

            <div style={{ width: "100%", maxWidth: "400px", border: "2px dashed #ccc", padding: "10px", borderRadius: "8px", textAlign: "center", backgroundColor: "white" }}>

                {!preview ? (
                    <>
                        {useNative ? (
                            <div style={{ position: 'relative', width: '100%', marginBottom: '15px' }}>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    style={{ width: "100%", borderRadius: "4px", backgroundColor: '#000' }}
                                />
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                                {!cameraActive && <p style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white' }}>Initializing Camera...</p>}
                            </div>
                        ) : (
                            <Webcam
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                width="100%"
                                videoConstraints={{ facingMode: "user" }}
                                style={{ borderRadius: "4px", marginBottom: "15px" }}
                            />
                        )}
                        <button
                            onClick={handleCapture}
                            style={{ padding: "12px 24px", fontSize: "16px", cursor: "pointer", borderRadius: "8px", backgroundColor: "#007bff", color: "white", border: "none", width: "100%" }}
                        >
                            Take Photo
                        </button>
                    </>
                ) : (
                    <>
                        <img src={preview} alt="Captured Preview" style={{ width: "100%", borderRadius: "4px", marginBottom: "15px" }} />
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                onClick={handleRetake}
                                disabled={capturing}
                                style={{ flex: 1, padding: "10px", fontSize: "16px", cursor: "pointer", borderRadius: "8px", backgroundColor: "#6c757d", color: "white", border: "none" }}
                            >
                                Retake
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={capturing}
                                style={{ flex: 1, padding: "10px", fontSize: "16px", cursor: "pointer", borderRadius: "8px", backgroundColor: "#28a745", color: "white", border: "none" }}
                            >
                                {capturing ? "Uploading..." : "Confirm & Upload"}
                            </button>
                        </div>
                    </>
                )}

                {errorMsg && (
                    <div style={{ marginTop: "15px", color: "red", fontSize: "14px" }}>
                        {errorMsg}
                    </div>
                )}


            </div>
        </div>
    );
};

export default CapturePhoto;
