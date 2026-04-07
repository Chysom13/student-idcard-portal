import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';

const IdCard = ({ student, enrolledCourses = [], forceSide, barcodeFormat = 'qr' }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Build the verification URL using the unguessable student UUID
  const verifyUrl = `${window.location.origin}/verify/${student.id}`;
  const currentYear = new Date().getFullYear() + 1;


  const FrontFace = () => (
    <div className="id-card-container" style={forceSide === 'front' ? { position: 'relative' } : {}}>
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

        {/* Right Side: Details & Barcode/QR */}
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

          {/* <div className="id-card-footer" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: '100%', marginTop: 'auto', paddingTop: '10px' }}>
            <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic', color: '#555', cursor: 'pointer', opacity: 0.8 }}>
              Click to flip card ↺
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );

  const BackFace = () => (
    <div className="id-card-back" style={forceSide === 'back' ? { position: 'relative', transform: 'none' } : {}}>
      <div className="id-card-bg-pattern" style={{ opacity: 0.3 }}></div>


      {barcodeFormat === '1d' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', height: '100%', width: '100%', position: 'relative', zIndex: 2, border: '1px solid black', borderRadius: '5px' }}>
          <p style={{ textAlign: 'center', fontSize: '12px', zIndex: 2, fontSize: '10px' }}>This card remains the property of this institution. It must be shown or surrendered on request by the authroized personnel. The bearer is a bonafide student of</p>
          <h1 style={{ fontSize: '20px', color: 'white', zIndex: 2, fontWeight: '800', background: 'black', width: '100%', padding: '10px 0' }}>MOUNTAIN TOP UNIVERSITY</h1>
          <p>This card must be in ower's possession at all tmes. Impersonation, alteration, or transfer of the card is an offence</p>
          <p style={{ fontSize: '14px', fontWeight: 'bold' }}>IF FOUND, PLEASE RETURN TO:</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#444' }}>Registry Department<br />Mountain Top University</p>
          <p style={{ fontSize: '14px', fontWeight: '800', color: '#d32f2f', textTransform: 'uppercase' }}>Valid till: {currentYear}</p>
          <div style={{ background: 'white', borderRadius: '12px', zIndex: 2 }}>
            <Barcode
              value={verifyUrl}
              format="CODE128"
              width={0.7}
              height={40}
              displayValue={false}
              margin={0}
              background="transparent"
            />
          </div>
          
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '100%' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--secondary)', zIndex: 2, letterSpacing: 'normal' }}>
            VERIFICATION SCAN
          </h3>
          <div style={{ background: 'white', padding: '10px', borderRadius: '12px', display: 'flex', flexShrink: 0, width: '150px', height: '150px', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 2 }}>
            <QRCodeSVG
              value={verifyUrl}
              size={135}
              level={"L"}
              includeMargin={false}
            />
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center', zIndex: 2, background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 5px', fontSize: '14px', fontWeight: 'bold' }}>If found, please return to:</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#444' }}>Registry Department<br />Mountain Top University</p>
            <p style={{ marginTop: '10px', fontSize: '14px', fontWeight: '800', color: '#d32f2f', textTransform: 'uppercase' }}>Valid till: {currentYear}</p>
          </div>

        </div>
      )}

    </div>
  );

  if (forceSide === 'front') return <FrontFace />;
  if (forceSide === 'back') return <BackFace />;

  return (
    <div className="id-card-scene" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`id-card-inner ${isFlipped ? 'flipped' : ''}`}>
        <FrontFace />
        <BackFace />
      </div>
    </div>
  );
};

export default IdCard;
