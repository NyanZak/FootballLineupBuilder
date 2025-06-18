import React, { useState, useEffect, useRef } from "react";
import FormationLayouts from './FormationLayouts';
import "./Pitch.css";
import normalpitchPng from "../assets/normalpitch.png";
import simplepitchPng from "../assets/simplepitch.png";
import stripedpitchPng from "../assets/stripedpitch.png";
import html2canvas from "html2canvas"; 
import { FaDownload } from "react-icons/fa";

import { rgbToHsl, hslToRgb } from "./colorUtils";
import teamLogos from "../teamLogos";
import { getTeamManager } from '../teamManagers';
import defaultManagerImage from '../assets/defaultmanager.png';

// Helper to convert hex to rgb
function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

// Convert rgb to hue in degrees [0-360]
function rgbToHue(r, g, b) {
  const [h] = rgbToHsl(r, g, b);
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
  teamColor,
  onMouseDown = () => {},
  onMouseUp = () => {},
}) {
  const [localValue, setLocalValue] = useState(playerName);
  const [inputWidth, setInputWidth] = useState(60);
  const spanRef = useRef(null);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    setLocalValue(playerName);
    setInputWidth(80);
  }, [playerName]);

  useEffect(() => {
    if (spanRef.current) {
      requestAnimationFrame(() => {
        const width = Math.min(Math.max(spanRef.current.offsetWidth + 20, 80), 240);
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
      setInputWidth(80);
      return;
    }

    debounceTimeout.current = setTimeout(() => {
      if (spanRef.current) {
        const width = Math.min(Math.max(spanRef.current.offsetWidth + 20, 40), 240);
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
          left: `${x * 125 + 25}px`,
          top: `${y * 100 + 25}px`,
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
            fontSize: "13px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            outline: "none",
            zIndex: 10,
            backgroundColor: teamColor || "#282828", //
            color: "white",
            textAlign: "center",
            boxSizing: "border-box",
            transition: "width 0.15s ease",
            lineHeight: "22px",
            cursor: "text",
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

// Main Pitch component
export default function Pitch({
  formation,
  players,
  updatePlayer,
  pitchHue,
  teamColor,
  clubName,
  pitchStyle,
  captain,
  setCaptain,
  showFilename,
  lineColor,
  numPlayers,
  showSubs={showSubs},
  showManager,
}) {  
  
  const [editingPositions, setEditingPositions] = useState([]);
  const [filename, setFilename] = useState(formation);
  const lastFormationRef = useRef(formation);
  const lastClubNameRef = useRef(clubName);
  const layout = FormationLayouts[formation];
  const pitchRef = useRef(null);

  const [positions, setPositions] = useState(FormationLayouts[formation] || []);
  const [isDragging, setIsDragging] = useState(false);
  const draggedPos = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const mouseDownPos = useRef({ x: 0, y: 0 });
  const dragStarted = useRef(false);

  const [subInputs, setSubInputs] = useState({});

const [processedPitch, setProcessedPitch] = useState(null);

  const [managerImage, setManagerImage] = useState(null);

const updateSubInput = (pos, value) => {
  setSubInputs((prev) => ({
    ...prev,
    [pos]: value,
  }));
};

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
  };
};

getBaseHueFromPitchImage();

function recolorPitchLines(image, grassHueDegrees, lineColorHex, callback) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  image.crossOrigin = "anonymous";
  image.onload = () => {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const [targetR, targetG, targetB] = hexToRgb(lineColorHex);

for (let i = 0; i < data.length; i += 4) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];

  // Detect pitch lines (white-ish pixels)
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
  const isLinePixel = brightness > 180 && maxDiff < 50 && a > 100;

  if (isLinePixel) {
    // Recolor pitch lines with target line color
    data[i] = targetR;
    data[i + 1] = targetG;
    data[i + 2] = targetB;
  } else {
    // Recolor pitch grass pixels

    let [h, s, l] = rgbToHsl(r, g, b);

    // If pitchHue is close to green, shift hue normally:
    // Otherwise, if pitchHue is near white/grey/black, set s and l accordingly:

    if (pitchHue === "#ffffff") { // White pitch
      s = 0;
      l = 0.95;
    } else if (pitchHue === "#cccccc") { // Light grey pitch
      s = 0;
      l = 0.7;
    } else if (pitchHue === "#000000") { // Black pitch
      s = 0;
      l = 0.15;
    } else {
      // Normal hue shift
      const baseHue = 138 / 360; // your green hue in [0..1]
      const targetHue = rgbToHue(...hexToRgb(pitchHue)) / 360;
      h = (h + targetHue - baseHue + 1) % 1;
      // Keep original saturation and lightness
    }

    const [newR, newG, newB] = hslToRgb(h, s, l);
    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;
  }
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
    const baseHue = 138; // original green hue in the pitch image
    const hueDegrees = targetHue - baseHue;

    recolorPitchLines(img, hueDegrees, lineColor || "#CCCCCC", setProcessedPitch);
  };

  const src =
    pitchStyle === "normal"
      ? normalpitchPng
      : pitchStyle === "striped"
      ? stripedpitchPng
      : simplepitchPng;

  if (typeof src === "string" && (src.startsWith("http") || src.startsWith("//"))) {
    img.crossOrigin = "anonymous";
  }

  img.src = src;
}, [pitchHue, lineColor, pitchStyle]);

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
  let formationKey;

  if (numPlayers === 11) formationKey = formation;
  else if (numPlayers === 7) formationKey = "7-player";
  else if (numPlayers === 5) formationKey = "5-player";
  else formationKey = formation;  // fallback to formation if numPlayers unexpected

  setPositions(FormationLayouts[formationKey] || []);
}, [numPlayers, formation]);

const PITCH_WIDTH = 4.45;
const PITCH_LENGTH = 7.04;

const dragThreshold = 5; // minimum pixels movement to start dragging




const editingPositionsAtDragStart = useRef([]);

const handleMouseDown = (pos) => (e) => {
  e.preventDefault();
  draggedPos.current = pos;
  setIsDragging(false);
  dragStarted.current = false;
  mouseDownPos.current = { x: e.clientX, y: e.clientY };

  // Calculate drag offset so dragging feels smooth
  if (pitchRef.current) {
    const pitchRect = pitchRef.current.getBoundingClientRect();
    const playerPos = positions.find((p) => p.pos === pos);

    if (playerPos) {
      // Calculate pixel position of player circle
      const playerPixelX = pitchRect.left + (playerPos.x / PITCH_WIDTH) * pitchRect.width;
      const playerPixelY = pitchRect.top + (playerPos.y / PITCH_LENGTH) * pitchRect.height;

      dragOffset.current = {
        x: e.clientX - playerPixelX,
        y: e.clientY - playerPixelY,
      };
    }
  }
};

const handleMouseMove = (e) => {
  if (!draggedPos.current || !mouseDownPos.current || !pitchRef.current) return;

  const dx = e.clientX - mouseDownPos.current.x;
  const dy = e.clientY - mouseDownPos.current.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (!dragStarted.current) {
    if (dist > dragThreshold) {
      dragStarted.current = true;
      setIsDragging(true);
    } else {
      return; // don't update position if drag hasn't started yet
    }
  }

 const pitchRect = pitchRef.current.getBoundingClientRect();

  // Calculate relative x,y on pitch scaled 0-PITCH_WIDTH and 0-PITCH_LENGTH
  const relativeX = (e.clientX - pitchRect.left - dragOffset.current.x) / pitchRect.width * PITCH_WIDTH;
  const relativeY = (e.clientY - pitchRect.top - dragOffset.current.y) / pitchRect.height * PITCH_LENGTH;

  // Clamp values within pitch boundaries
  const clampedX = Math.min(Math.max(relativeX, 0), PITCH_WIDTH);
  const clampedY = Math.min(Math.max(relativeY, 0), PITCH_LENGTH);

  setPositions((prev) =>
    prev.map((p) =>
      p.pos === draggedPos.current ? { ...p, x: clampedX, y: clampedY } : p
    )
  );
};

const handleGlobalMouseUp = (e) => {
  if (!draggedPos.current || !mouseDownPos.current) return;

  const dx = e.clientX - mouseDownPos.current.x;
  const dy = e.clientY - mouseDownPos.current.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < dragThreshold) {
    // Treat as click -> toggle editing input for that position
    toggleEditing(draggedPos.current);
  }

  draggedPos.current = null;
  setIsDragging(false);
  mouseDownPos.current = null;
  dragStarted.current = false;
};

useEffect(() => {
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleGlobalMouseUp);
  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleGlobalMouseUp);
  };
}, [positions]);

    const handleResetPlayers = () => {
    setPositions(FormationLayouts[formation] || []);
    layout.forEach(({ pos }) => updatePlayer(pos, ""));
    setEditingPositions([]);
    setSubInputs({});
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
          backgroundSize: "100% 102.5%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          margin: "2px auto 0 auto",
          boxShadow: "0 8px 15px rgba(0, 0, 0, 0.5)",
          position: "relative",
          cursor: isDragging ? "grabbing" : "default",
        }}
      >
     {/* Manager Image positioned top-left */}
{showManager && (() => {
  const manager = getTeamManager(clubName); // e.g., returns { name, photoUrl } or undefined
  const managerImage = manager?.photoUrl || defaultManagerImage;

  return (
<img
  src={managerImage}
  alt={manager?.name ? `${manager.name} manager` : "Default manager"}
  className="manager-image"
  draggable={false}
/>
  );
})()}

{showFilename && (
  <div
  className="filename-label"
  style={{
    position: "absolute",
    bottom: "0px",
    left: "28px",
    color: "white",
    fontWeight: "bold",
    textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
    userSelect: "none",
    pointerEvents: "none",
  }}
>
    {clubName && teamLogos[clubName.toLowerCase()] ? (
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
       <img
  src={teamLogos[clubName.toLowerCase()]}
  alt={`${clubName} badge`}
  className="team-logo"
/>
        <span>{filename}</span>
      </div>
    ) : (
      <span>{filename}</span>
    )}
  </div>
)}

      
{positions.map(({ pos, x, y }) => {
  const playerName = players[pos] || "";

  return (
    <React.Fragment key={pos}>
      {/* Main Player Circle */}
      <div
        className="pitch-cell absolute"
        style={{
          left: `${x * 125}px`,
          top: `${y * 100}px`,
          width: "45px",
          height: "45px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: teamColor || "#282828",
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

        {/* Captain Badge */}
        {pos === captain && (
          <div
            style={{
              position: "absolute",
              bottom: "0px",
              right: "-10px",
              backgroundColor: "#FFD700",
              color: "#000",
              borderRadius: "50%",
              width: "16px",
              height: "16px",
              fontSize: "12px",
              fontWeight: "bold",
              lineHeight: "16px",
              textAlign: "center",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            C
          </div>
        )}

        {/* Sub "S" Badge */}
        {showSubs && (
          <div
            style={{
              position: "absolute",
              top: "-12px",
              right: "-12px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#858383",
              color: "#fff",
              fontSize: "13px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid black",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            S
          </div>
        )}
      </div>

      {/* Editable Input for main player */}
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
          teamColor={teamColor}
        />
      )}

{/* Sub input tied to this player */}
      {showSubs && (
        <div
          style={{
            position: "absolute",
            top: `${y * 100 - 40}px`,
            left: `${x * 125 + 45}px`,
            transform: "translateX(-50%)",
            zIndex: 9,
          }}
        >
<input
  type="text"
  value={subInputs[pos] || ""}
  onChange={(e) => updateSubInput(pos, e.target.value)}
  placeholder={`${pos} Sub`}
  style={{
    width: `${Math.max(9, (subInputs[pos]?.length || 0) + 4)}ch`,
    fontSize: "12px",
    padding: "2px 4px",
    borderRadius: "4px",
    backgroundColor: "#444",
    color: "white",
    border: "1px solid #ccc",
    textAlign: "center",
  }}
          />
        </div>
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
    }}
    onClick={handleResetPlayers}
  >
    Reset
  </button>

  <label
    htmlFor="filename-input"
    className="hide-on-mobile"
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
  style={{ backgroundColor: teamColor }}
  className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-md transition flex items-center gap-2"
>
  <FaDownload />
  <span className="hide-on-mobile">Export as PNG</span>
</button>
</div>
    </>
  );
}