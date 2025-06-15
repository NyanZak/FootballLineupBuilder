import React, { useState, useEffect, useRef } from "react";
import FormationLayouts from './FormationLayouts';
import "./Pitch.css";
import normalpitchPng from "../assets/normalpitch.png";
import simplepitchPng from "../assets/simplepitch.png";
import stripedpitchPng from "../assets/stripedpitch.png";
import html2canvas from "html2canvas"; 

import { rgbToHsl, hslToRgb } from "./colorUtils";

// helper to convert hex to rgb
function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

// convert rgb to hue in degrees [0-360]
function rgbToHue(r, g, b) {
  const [h, , ] = rgbToHsl(r, g, b);
  return h * 360;
}

function EditablePlayerInput({
  pos,
  x,
  y,
  playerName,
  updatePlayer,
  draggedPos,
  isDragging,
  filename,
  onMouseDown = () => {},
  onMouseUp = () => {},
}){
  const [localValue, setLocalValue] = useState(playerName);
  const [inputWidth, setInputWidth] = useState(60);
  const spanRef = useRef(null);
  const debounceTimeout = useRef(null);
  useEffect(() => {
    setLocalValue(playerName);
    setInputWidth(100);
  }, [playerName]);

useEffect(() => {
  const span = spanRef.current;
  if (span) {
    requestAnimationFrame(() => {
      const width = Math.min(Math.max(span.offsetWidth + 20, 100), 240);
      setInputWidth(width);
    });
  }
}, [localValue]);


 const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    updatePlayer(pos, val);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (val.trim() === "") {
      setInputWidth(100);
      return;
    }

    debounceTimeout.current = setTimeout(() => {
      const span = spanRef.current;
      if (span) {
        const width = Math.min(Math.max(span.offsetWidth + 20, 40), 240);
        setInputWidth(width);
      }
    }, 1000);
  };

return (
    <>
      <div
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        style={{
          position: "absolute",
          left: `${x * 125 + 30}px`,
          top: `${y * 100 + 34}px`,
          transform: "translate(-50%, 80%)",
          cursor:
            draggedPos && draggedPos.current === pos && isDragging
              ? "grabbing"
              : "grab",
          userSelect: "none",
        }}
      >
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={`${pos} Player`}
          style={{
            width: `${inputWidth}px`,
            padding: "1px 8px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            outline: "none",
            zIndex: 10,
            backgroundColor: "#282828",
            color: "white",
            textAlign: "center",
            boxSizing: "border-box",
            transition: "width 0.15s ease",
            lineHeight: "24px",
            cursor: "text", // <- explicitly text cursor for input
          }}
        />
      </div>

      <span
        ref={spanRef}
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          whiteSpace: "pre",
          fontSize: "14px",
          fontFamily: "inherit",
          padding: "5px 8px",
          visibility: "hidden",
        }}
      >
        {localValue || ""}
      </span>
    </>
  );
}

  // Pitch component
export default function Pitch({ formation, players, updatePlayer, pitchHue, teamColor, clubName, pitchStyle, captain, setCaptain, showFilename,}) {
  const [editingPositions, setEditingPositions] = useState([]);
const [filename, setFilename] = useState(formation);
const lastFormationRef = useRef(formation);
const layout = FormationLayouts[formation];
const pitchRef = useRef(null);

const [positions, setPositions] = useState(FormationLayouts[formation] || []);
const [isDragging, setIsDragging] = useState(false);
const draggedPos = useRef(null);
const dragOffset = useRef({ x: 0, y: 0 });
const mouseDownPos = useRef({ x: 0, y: 0 });
const dragStarted = useRef(false);

const [processedPitch, setProcessedPitch] = useState(null);

const lastClubNameRef = useRef(clubName);

const getBaseHueFromPitchImage = () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
img.src =
  pitchStyle === "normal"
    ? normalpitchPng
    : pitchStyle === "striped"
    ? stripedpitchPng
    : simplepitchPng;  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    // Sample pixel roughly center of the pitch
    const imageData = ctx.getImageData(img.width / 2, img.height / 2, 1, 1);
    const [r, g, b] = imageData.data; // r,g,b,a
    const baseHue = rgbToHue(r, g, b);
    console.log("Base pitch hue:", baseHue);
  };
};

getBaseHueFromPitchImage();

function rotateHue(image, degrees, callback) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  image.crossOrigin = "anonymous";
  image.onload = () => {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      let [h, s, l] = rgbToHsl(r, g, b);
      h = (h + degrees / 360) % 1;
      const [newR, newG, newB] = hslToRgb(h, s, l);
      [data[i], data[i + 1], data[i + 2]] = [newR, newG, newB];
    }

    ctx.putImageData(imageData, 0, 0);
    callback(canvas.toDataURL());
  };
}

useEffect(() => {
  const img = new Image();

  img.onload = () => {
    const [r, g, b] = hexToRgb(pitchHue);
    const targetHue = rgbToHue(r, g, b);

    // hardcode or get baseHue from step 1; e.g., 120 for green pitch
    const baseHue = 138; // adjust this to the actual base pitch hue

    const hueDegrees = targetHue - baseHue;

    rotateHue(img, hueDegrees, setProcessedPitch);
  };

const src =
  pitchStyle === "normal"
    ? normalpitchPng
    : pitchStyle === "striped"
    ? stripedpitchPng
    : simplepitchPng;  if (typeof src === "string" && (src.startsWith("http") || src.startsWith("//"))) {
    img.crossOrigin = "anonymous";
  }

  img.src = src;
}, [pitchHue, pitchStyle]);


const toggleEditing = (pos) => {
  setEditingPositions((prev) =>
    prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
  );
};



useEffect(() => {
  const expectedFilename = clubName && clubName.trim() !== ""
    ? `${formation} - ${clubName.trim()}`
    : formation;

  const lastExpectedFilename = lastClubNameRef.current && lastClubNameRef.current.trim() !== ""
    ? `${lastFormationRef.current} - ${lastClubNameRef.current.trim()}`
    : lastFormationRef.current;

  // Use case-insensitive comparison here:
  if (
    filename.toLowerCase() === lastExpectedFilename.toLowerCase() ||
    filename.toLowerCase() === lastFormationRef.current.toLowerCase()
  ) {
    setFilename(expectedFilename);
  }

  lastFormationRef.current = formation;
  lastClubNameRef.current = clubName;
}, [formation, clubName]);

useEffect(() => {
  setPositions(FormationLayouts[formation] || []);
}, [formation]);

const dragThreshold = 5; // pixels

const editingPositionsAtDragStart = useRef([]);

const handleMouseDown = (pos) => (e) => {
  e.preventDefault();
  draggedPos.current = pos;
  setIsDragging(false);
  dragStarted.current = false;
  mouseDownPos.current = { x: e.clientX, y: e.clientY };

    editingPositionsAtDragStart.current = [...editingPositions];

    // Calculate drag offset for smooth dragging
    const playerPos = positions.find((p) => p.pos === pos);
    if (playerPos && pitchRef.current) {
      const pitchRect = pitchRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - (pitchRect.left + playerPos.x * (pitchRect.width / 7)),
        y: e.clientY - (pitchRect.top + playerPos.y * (pitchRect.height / 7)),
      };
    }
  };

  const handleMouseMove = (e) => {
    if (!draggedPos.current || !pitchRef.current) return;

    const dx = e.clientX - (mouseDownPos.current?.x || 0);
    const dy = e.clientY - (mouseDownPos.current?.y || 0);

    if (!dragStarted.current && Math.sqrt(dx * dx + dy * dy) > dragThreshold) {
      setIsDragging(true);
      dragStarted.current = true;
      // Also hide editing while dragging
      //setEditingPositions((prev) => prev.filter((p) => p !== draggedPos.current));
    }

    if (!isDragging) return;

    const pitchRect = pitchRef.current.getBoundingClientRect();

    const relativeX = (e.clientX - pitchRect.left - dragOffset.current.x) / (pitchRect.width / 7);
    const relativeY = (e.clientY - pitchRect.top - dragOffset.current.y) / (pitchRect.height / 7);

    const newX = Math.min(Math.max(relativeX, 0.45), 6.3);
    const newY = Math.min(Math.max(relativeY, 0), 7.25);

    setPositions((prevPositions) =>
      prevPositions.map((p) =>
        p.pos === draggedPos.current ? { ...p, x: newX, y: newY } : p
      )
    );
  };

  const handleGlobalMouseUp = (e) => {
    if (!draggedPos.current || !mouseDownPos.current) return;

    const dx = e.clientX - mouseDownPos.current.x;
    const dy = e.clientY - mouseDownPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < dragThreshold) {
      // treat as click -> toggle editing
      toggleEditing(draggedPos.current);
    }

    draggedPos.current = null;
    setIsDragging(false);
    mouseDownPos.current = null;
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, positions]);

    const handleResetPlayers = () => {
    setPositions(FormationLayouts[formation] || []);
    layout.forEach(({ pos }) => updatePlayer(pos, ""));
    setEditingPositions([]);
  };

  // Export handler
   const exportPitchAsPNG = () => {
    if (!pitchRef.current) return;
    let safeFilename = filename.trim();
    if (!safeFilename.toLowerCase().endsWith(".png")) {
      safeFilename += ".png";
    }

    html2canvas(pitchRef.current, { backgroundColor: null }).then((canvas) => {
      const link = document.createElement("a");
      link.download = safeFilename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <>
      <div
        id="pitch"
        ref={pitchRef}
        className="relative pitch-container"
        style={{
          backgroundImage: `url(${processedPitch})`,
          backgroundSize: "88% 102.5%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          width: "900px",
          height: "775px",
          margin: "2px auto 0 auto",
          boxShadow: "0 8px 15px rgba(0, 0, 0, 0.5)",
          position: "relative",
          cursor: isDragging ? "grabbing" : "default",
        }}
      >
 {showFilename && (
  <div
    style={{
      position: "absolute",
      bottom: "-3px",
      left: "60px",
      color: "white",
      fontWeight: "bold",
      fontSize: "16px",
      textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
      userSelect: "none",
      pointerEvents: "none",
    }}
  >
    {filename}
  </div>
)}
      
{positions.map(({ pos, x, y }) => {
  const playerName = players[pos] || "";

  return (
    <React.Fragment key={pos}>
      <div
        className="pitch-cell absolute"
        style={{
          left: `${x * 125}px`,
          top: `${y * 100}px`,
          width: "56px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: teamColor || "#282828",  // <-- use the teamColor here
          border: "1px solid black",
          cursor: "pointer",
          userSelect: "none",
          color: "white",
          textAlign: "center",
          position: "absolute",
          fontSize: "18px",
        }}
        onMouseDown={handleMouseDown(pos)}
      >
        {pos}
{/* Add Captain Badge */}
        {pos === captain && (
          <div
            style={{
              position: "absolute",
              bottom: "4px",
              right: "-5px",
              backgroundColor: "#FFD700",
              color: "#000",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              fontSize: "12px",
              fontWeight: "bold",
              lineHeight: "18px",
              textAlign: "center",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            C
          </div>
        )}
      </div>

{editingPositions.includes(pos) && (
  <EditablePlayerInput
    key={pos}
    pos={pos}
    x={x}
    y={y}
    playerName={playerName}
    updatePlayer={updatePlayer}
    draggedPos={draggedPos}
    isDragging={isDragging}
    onMouseUp={handleGlobalMouseUp}
    filename={filename}
  />
)}
    </React.Fragment>
  );
})}

      </div>

      {/* Input box to edit export filename */}
<div
  className="export-controls"
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  }}
>
  <button
    style={{
      padding: "6px 10px",
      fontSize: "16px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      backgroundColor: "#444",
      color: "white",
      pointerEvents: "auto",
      marginRight: "235px", 
    }}
    onClick={handleResetPlayers}
  >
    Reset
  </button>

  <label
    htmlFor="filename-input"
    style={{ color: "white", marginRight: "10px", whiteSpace: "nowrap" }}
  >
    Filename:
  </label>
  <input
    id="filename-input"
    type="text"
    value={filename}
    onChange={(e) => setFilename(e.target.value)}
    placeholder="Enter filename"
    style={{
      padding: "6px 10px",
      fontSize: "16px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      width: "200px",
      textAlign: "left",
      color: "white",
      backgroundColor: "#444",
    }}
  />
  <button
    onClick={exportPitchAsPNG}
    style={{
      backgroundColor: teamColor,
    }}
    className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-md transition"
  >
    Export Pitch as PNG
  </button>
</div>
    </>
  );
}