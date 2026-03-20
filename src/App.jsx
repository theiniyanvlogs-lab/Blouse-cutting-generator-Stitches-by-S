import React, { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

const defaultMeasurements = {
  customerName: "Radha",
  blouseLength: 14.5,
  upperChest: 33,
  bustChest: 33,
  waist: 29.5,
  bodyLength: 10.5,
  frontNeckDepth: 6,
  backNeckDepth: 7,
  shoulder: 14.5,
  armRound: 16.5,
  sleeveLength: 7,
  sleeveBottomRound: 11,
  seamAllowance: 0.5,
  neckWidthBack: 2.75,
  neckWidthFront: 3.25,
  scale: 28
};

function round2(n) {
  return Math.round(n * 100) / 100;
}

function calculateDraft(m) {
  const backShoulder = round2(m.shoulder / 2 - 1.25);
  const frontShoulder = round2(m.shoulder / 2 - 1.75);
  const backChest = round2(m.upperChest / 4 + 0.75);
  const frontChest = round2(m.upperChest / 4 + 0.25);
  const armholeHalf = round2((m.armRound + 0.5) / 2);
  const waistQuarter = round2(m.waist / 4);
  const waistWithEase = round2(waistQuarter + 1.5);
  const splitBase = round2((m.bodyLength || 10.3) / 2);
  const bchDiv10 = round2(m.bustChest / 10);
  const bchDiv13 = round2(m.bustChest / 13);
  const sleeveX = round2(m.armRound / 2 - 1);
  const sleeveY = round2(sleeveX / 2);

  return {
    backShoulder,
    frontShoulder,
    backChest,
    frontChest,
    armholeHalf,
    waistQuarter,
    waistWithEase,
    splitBase,
    bchDiv10,
    bchDiv13,
    sleeveX,
    sleeveY
  };
}

function PatternSVG({ measurements, calc }) {
  const s = measurements.scale;

  // Back block
  const back = {
    x: 40,
    y: 60,
    w: calc.backChest * s,
    h: measurements.blouseLength * s,
    neckW: measurements.neckWidthBack * s,
    neckD: Math.min(measurements.backNeckDepth, 3) * s,
    shoulder: calc.backShoulder * s,
    armDepth: 5.5 * s,
    waist: calc.waistWithEase * s
  };

  // Front block
  const front = {
    x: 420,
    y: 60,
    w: calc.frontChest * s,
    h: measurements.blouseLength * s,
    neckW: measurements.neckWidthFront * s,
    neckD: measurements.frontNeckDepth * s,
    shoulder: calc.frontShoulder * s,
    armDepth: 5.5 * s,
    waist: calc.waistQuarter * s
  };

  // Sleeve block
  const sleeve = {
    x: 40,
    y: back.y + back.h + 80,
    w: calc.sleeveX * s,
    h: measurements.sleeveLength * s,
    cap: calc.sleeveY * s
  };

  // Back points
  const backTopLeft = [back.x, back.y];
  const backTopRight = [back.x + back.w, back.y];
  const backBottomLeft = [back.x, back.y + back.h];
  const backBottomRight = [back.x + back.w, back.y + back.h];
  const backNeck = [back.x + back.neckW, back.y];
  const backNeckDepthPoint = [back.x, back.y + back.neckD];
  const backShoulderEnd = [back.x + back.shoulder, back.y + 20];
  const backArmDepthY = back.y + back.armDepth;
  const backSideAtArm = [back.x + back.w, backArmDepthY];
  const backWaistSide = [back.x + back.waist * s / s, back.y + back.h];

  // Front points
  const frontTopLeft = [front.x, front.y];
  const frontTopRight = [front.x + front.w, front.y];
  const frontBottomLeft = [front.x, front.y + front.h];
  const frontBottomRight = [front.x + front.w, front.y + front.h];
  const frontNeck = [front.x + front.neckW, front.y];
  const frontNeckDepthPoint = [front.x, front.y + front.neckD];
  const frontShoulderEnd = [front.x + front.shoulder, front.y + 24];
  const frontArmDepthY = front.y + front.armDepth;
  const frontSideAtArm = [front.x + front.w, frontArmDepthY];
  const frontWaistSide = [front.x + front.waist * s / s, front.y + front.h];

  // Sleeve points
  const slTopLeft = [sleeve.x, sleeve.y + sleeve.cap];
  const slTopCenter = [sleeve.x + sleeve.w / 2, sleeve.y];
  const slTopRight = [sleeve.x + sleeve.w, sleeve.y + sleeve.cap];
  const slBottomLeft = [sleeve.x, sleeve.y + sleeve.h];
  const slBottomRight = [sleeve.x + sleeve.w, sleeve.y + sleeve.h];

  return (
    <svg viewBox="0 0 900 1100">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#111827" />
        </marker>
      </defs>

      <text x="30" y="30" fontSize="22" fontWeight="700">Blouse Cutting Drawing Generator</text>
      <text x="30" y="50" fontSize="14">Customer: {measurements.customerName}</text>

      {/* BACK */}
      <text x={back.x} y={back.y - 15} fontSize="18" fontWeight="700">BACK</text>
      <rect x={back.x} y={back.y} width={back.w} height={back.h} fill="none" stroke="#9ca3af" strokeDasharray="5 5" />
      <path d={`M ${back.x} ${back.y + back.neckD} Q ${back.x + back.neckW * 0.2} ${back.y + back.neckD * 0.1} ${back.x + back.neckW} ${back.y}`} fill="none" stroke="#111827" strokeWidth="2.2" />
      <line x1={back.x + back.neckW} y1={back.y} x2={backShoulderEnd[0]} y2={backShoulderEnd[1]} stroke="#111827" strokeWidth="2.2" />
      <path d={`M ${backShoulderEnd[0]} ${backShoulderEnd[1]} C ${back.x + back.w - 30} ${back.y + 90}, ${back.x + back.w - 10} ${back.y + 120}, ${back.x + back.w} ${backArmDepthY}`} fill="none" stroke="#111827" strokeWidth="2.2" />
      <line x1={back.x} y1={back.y} x2={back.x} y2={back.y + back.h} stroke="#111827" strokeWidth="2" />
      <line x1={back.x + back.w} y1={backArmDepthY} x2={backWaistSide[0]} y2={back.y + back.h} stroke="#111827" strokeWidth="2.2" />
      <line x1={back.x} y1={back.y + back.h} x2={backWaistSide[0]} y2={back.y + back.h} stroke="#111827" strokeWidth="2" />
      {/* back dart */}
      <line x1={back.x + back.w * 0.45} y1={back.y + back.h} x2={back.x + back.w * 0.52} y2={back.y + back.h - 100} stroke="#111827" strokeWidth="1.8" />
      <line x1={back.x + back.w * 0.58} y1={back.y + back.h} x2={back.x + back.w * 0.52} y2={back.y + back.h - 100} stroke="#111827" strokeWidth="1.8" />

      {/* FRONT */}
      <text x={front.x} y={front.y - 15} fontSize="18" fontWeight="700">FRONT</text>
      <rect x={front.x} y={front.y} width={front.w} height={front.h} fill="none" stroke="#9ca3af" strokeDasharray="5 5" />
      <path d={`M ${front.x} ${front.y + front.neckD} Q ${front.x + front.neckW * 0.25} ${front.y + front.neckD * 0.15} ${front.x + front.neckW} ${front.y}`} fill="none" stroke="#111827" strokeWidth="2.2" />
      <line x1={front.x + front.neckW} y1={front.y} x2={frontShoulderEnd[0]} y2={frontShoulderEnd[1]} stroke="#111827" strokeWidth="2.2" />
      <path d={`M ${frontShoulderEnd[0]} ${frontShoulderEnd[1]} C ${front.x + front.w - 40} ${front.y + 80}, ${front.x + front.w - 12} ${front.y + 135}, ${front.x + front.w} ${frontArmDepthY}`} fill="none" stroke="#111827" strokeWidth="2.2" />
      <line x1={front.x} y1={front.y} x2={front.x} y2={front.y + front.h} stroke="#111827" strokeWidth="2" />
      <line x1={front.x + front.w} y1={frontArmDepthY} x2={frontWaistSide[0]} y2={front.y + front.h} stroke="#111827" strokeWidth="2.2" />
      <line x1={front.x} y1={front.y + front.h} x2={frontWaistSide[0]} y2={front.y + front.h} stroke="#111827" strokeWidth="2" />
      {/* front bust dart */}
      <line x1={front.x + front.w * 0.42} y1={front.y + front.h} x2={front.x + front.w * 0.54} y2={front.y + front.h - 120} stroke="#111827" strokeWidth="1.8" />
      <line x1={front.x + front.w * 0.66} y1={front.y + front.h} x2={front.x + front.w * 0.54} y2={front.y + front.h - 120} stroke="#111827" strokeWidth="1.8" />

      {/* SLEEVE */}
      <text x={sleeve.x} y={sleeve.y - 15} fontSize="18" fontWeight="700">SLEEVE</text>
      <path d={`M ${slTopLeft[0]} ${slTopLeft[1]} Q ${slTopCenter[0]} ${slTopCenter[1]} ${slTopRight[0]} ${slTopRight[1]}`} fill="none" stroke="#111827" strokeWidth="2.2" />
      <line x1={slTopLeft[0]} y1={slTopLeft[1]} x2={slBottomLeft[0]} y2={slBottomLeft[1]} stroke="#111827" strokeWidth="2" />
      <line x1={slTopRight[0]} y1={slTopRight[1]} x2={slBottomRight[0]} y2={slBottomRight[1]} stroke="#111827" strokeWidth="2" />
      <line x1={slBottomLeft[0]} y1={slBottomLeft[1]} x2={slBottomRight[0]} y2={slBottomRight[1]} stroke="#111827" strokeWidth="2" />

      {/* measurement labels */}
      <text x={back.x} y={back.y + back.h + 24} fontSize="12">Back shoulder: {calc.backShoulder}\"</text>
      <text x={back.x} y={back.y + back.h + 42} fontSize="12">Back chest: {calc.backChest}\"</text>
      <text x={front.x} y={front.y + front.h + 24} fontSize="12">Front shoulder: {calc.frontShoulder}\"</text>
      <text x={front.x} y={front.y + front.h + 42} fontSize="12">Front chest: {calc.frontChest}\"</text>
      <text x={sleeve.x} y={sleeve.y + sleeve.h + 24} fontSize="12">Sleeve X: {calc.sleeveX}\" | Sleeve cap Y: {calc.sleeveY}\"</text>
    </svg>
  );
}

export default function App() {
  const [m, setM] = useState(defaultMeasurements);
  const drawingRef = useRef(null);

  const calc = useMemo(() => calculateDraft(m), [m]);

  const update = (key, value) => {
    setM((prev) => ({
      ...prev,
      [key]: key === "customerName" ? value : Number(value)
    }));
  };

  const resetDefaults = () => setM(defaultMeasurements);

  const downloadPNG = async () => {
    if (!drawingRef.current) return;
    const dataUrl = await toPng(drawingRef.current, { cacheBust: true, pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${m.customerName || "blouse"}-cutting-drawing.png`;
    a.click();
  };

  const downloadPDF = async () => {
    if (!drawingRef.current) return;
    const dataUrl = await toPng(drawingRef.current, { cacheBust: true, pixelRatio: 2 });
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = 190;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.text(`Blouse Cutting Drawing - ${m.customerName}`, 10, 10);
    pdf.addImage(dataUrl, "PNG", 10, 15, pdfWidth, Math.min(pdfHeight, 270));
    pdf.save(`${m.customerName || "blouse"}-cutting-drawing.pdf`);
  };

  return (
    <div className="container">
      <div className="header">
        <div className="title-row">
          <div>
            <h1 style={{ margin: 0 }}>Blouse Cutting Drawing Generator</h1>
            <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>
              Enter measurements → auto calculate → generate front, back, sleeve cutting drawing
            </p>
          </div>
          <div className="badge">GitHub + Vercel Ready</div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Measurements</h2>

          <div className="form-grid">
            <div className="field">
              <label>Customer Name</label>
              <input value={m.customerName} onChange={(e) => update("customerName", e.target.value)} />
            </div>

            <div className="field">
              <label>Blouse Length</label>
              <input type="number" step="0.1" value={m.blouseLength} onChange={(e) => update("blouseLength", e.target.value)} />
            </div>

            <div className="field">
              <label>Upper Chest (UCH)</label>
              <input type="number" step="0.1" value={m.upperChest} onChange={(e) => update("upperChest", e.target.value)} />
            </div>

            <div className="field">
              <label>Bust Chest (BCH)</label>
              <input type="number" step="0.1" value={m.bustChest} onChange={(e) => update("bustChest", e.target.value)} />
            </div>

            <div className="field">
              <label>Waist</label>
              <input type="number" step="0.1" value={m.waist} onChange={(e) => update("waist", e.target.value)} />
            </div>

            <div className="field">
              <label>Body Length</label>
              <input type="number" step="0.1" value={m.bodyLength} onChange={(e) => update("bodyLength", e.target.value)} />
            </div>

            <div className="field">
              <label>Front Neck Depth (FND)</label>
              <input type="number" step="0.1" value={m.frontNeckDepth} onChange={(e) => update("frontNeckDepth", e.target.value)} />
            </div>

            <div className="field">
              <label>Back Neck Depth (BND)</label>
              <input type="number" step="0.1" value={m.backNeckDepth} onChange={(e) => update("backNeckDepth", e.target.value)} />
            </div>

            <div className="field">
              <label>Shoulder (SH)</label>
              <input type="number" step="0.1" value={m.shoulder} onChange={(e) => update("shoulder", e.target.value)} />
            </div>

            <div className="field">
              <label>Arm Round</label>
              <input type="number" step="0.1" value={m.armRound} onChange={(e) => update("armRound", e.target.value)} />
            </div>

            <div className="field">
              <label>Sleeve Length</label>
              <input type="number" step="0.1" value={m.sleeveLength} onChange={(e) => update("sleeveLength", e.target.value)} />
            </div>

            <div className="field">
              <label>Sleeve Bottom Round</label>
              <input type="number" step="0.1" value={m.sleeveBottomRound} onChange={(e) => update("sleeveBottomRound", e.target.value)} />
            </div>

            <div className="field">
              <label>Back Neck Width</label>
              <input type="number" step="0.1" value={m.neckWidthBack} onChange={(e) => update("neckWidthBack", e.target.value)} />
            </div>

            <div className="field">
              <label>Front Neck Width</label>
              <input type="number" step="0.1" value={m.neckWidthFront} onChange={(e) => update("neckWidthFront", e.target.value)} />
            </div>

            <div className="field">
              <label>Seam Allowance</label>
              <input type="number" step="0.1" value={m.seamAllowance} onChange={(e) => update("seamAllowance", e.target.value)} />
            </div>

            <div className="field">
              <label>Drawing Scale (px per inch)</label>
              <input type="number" step="1" value={m.scale} onChange={(e) => update("scale", e.target.value)} />
            </div>
          </div>

          <div className="actions">
            <button className="btn-primary" onClick={downloadPNG}>Download PNG</button>
            <button className="btn-secondary" onClick={downloadPDF}>Download PDF</button>
            <button className="btn-light" onClick={resetDefaults}>Reset</button>
          </div>

          <div className="metrics">
            <div className="metric">Back Shoulder: <b>{calc.backShoulder}\"</b></div>
            <div className="metric">Front Shoulder: <b>{calc.frontShoulder}\"</b></div>
            <div className="metric">Back Chest: <b>{calc.backChest}\"</b></div>
            <div className="metric">Front Chest: <b>{calc.frontChest}\"</b></div>
            <div className="metric">Armhole Half: <b>{calc.armholeHalf}\"</b></div>
            <div className="metric">Waist + Ease: <b>{calc.waistWithEase}\"</b></div>
            <div className="metric">BCH / 10: <b>{calc.bchDiv10}\"</b></div>
            <div className="metric">BCH / 13: <b>{calc.bchDiv13}\"</b></div>
            <div className="metric">Sleeve X: <b>{calc.sleeveX}\"</b></div>
            <div className="metric">Sleeve Y: <b>{calc.sleeveY}\"</b></div>
          </div>

          <div className="note">
            Note: This app is built from your tailor sheet formulas. You can later extend this for princess cut, churidar, frock, and kids dress patterns.
          </div>
        </div>

        <div className="pattern-wrap">
          <div className="card pattern-card">
            <h3>Auto Cutting Drawing</h3>
            <div ref={drawingRef}>
              <PatternSVG measurements={m} calc={calc} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}