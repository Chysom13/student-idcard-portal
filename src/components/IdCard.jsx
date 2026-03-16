import { useState } from 'react';
import Barcode from 'react-barcode';

const IdCard = ({ student }) => {
  const [barcodeError, setBarcodeError] = useState(false);
  const barcodeValue = `${student.name}|${student.matric_number}`;

  // Primary: Orca Scan API URL
  const barcodeApiUrl = `https://api.orcascan.com/barcode/code128?data=${encodeURIComponent(barcodeValue)}`;

  return (
    <div className="id-card-container">
      {/* Dynamic MTU Watermark Background */}
      <div className="id-card-bg-pattern"></div>

      <div className="id-card-header">
        <h2>MOUNTAIN TOP UNIVERSITY</h2>
        <p>STUDENT IDENTITY CARD</p>
      </div>

      <div className="id-card-body">
        {/* Left Side: Photo */}
        <div className="id-card-left">
          <div className="id-card-photo-wrapper">
            <img
              src={student.photo_url}
              alt={student.name}
              className="id-card-photo"
            />
          </div>
        </div>

        {/* Right Side: Details & Barcode */}
        <div className="id-card-right">
          <div className="id-card-details">
            <div className="id-detail-row">
              <span className="id-label">Name:</span>
              <span className="id-value name-value">{student.name}</span>
            </div>
            <div className="id-detail-row">
              <span className="id-label">Matric No:</span>
              <span className="id-value">{student.matric_number}</span>
            </div>
            <div className="id-detail-row">
              <span className="id-label">Course:</span>
              <span className="id-value">{student.department}</span>
            </div>
            <div className="id-detail-row">
              <span className="id-label">Level:</span>
              <span className="id-value">{student.level}</span>
            </div>
          </div>

          <div className="id-card-footer">
            {!barcodeError ? (
              <Barcode
                value={barcodeValue}
                width={1}
                height={25}
                displayValue={false}
                background="transparent"
                lineColor="#000"
                margin={0}
              />
            ) : (
              <img
                src={barcodeApiUrl}
                alt="Student Barcode"
                style={{ height: '25px', maxWidth: '100px' }}
              />
            )}
            <div className="id-card-validity">
              <p>Valid till: 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdCard;