import React, { useState, useEffect, useRef } from "react";
import FormationLayouts from "./FormationLayouts";
import "./Pitch.css";
import normalpitchPng from "../assets/normalpitch.png";
import simplepitchPng from "../assets/simplepitch.png";
import stripedpitchPng from "../assets/stripedpitch.png";
import html2canvas from "html2canvas";
import { FaDownload } from "react-icons/fa";
import { rgbToHsl, hslToRgb } from "./colorUtils";
import teamLogos from "../teamLogos";
import { getTeamManager } from "../teamManagers";
import defaultManagerImage from "../assets/defaultmanager.png";

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

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

    if (!val.trim()) {
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
  onTouchStart={onMouseDown}
  onMouseUp={onMouseUp}
  onTouchEnd={onMouseUp}

  className="player-input-wrapper"
  style={{
    position: "absolute",
    "--left-pos": `${x * 125 + 25}px`,
    "--top-pos": `${y * 100 + 25}px`,
    left: "var(--left-pos)",
    top: "var(--top-pos)",
    transform: "translate(-50%, 80%)",
    cursor: draggedPos?.current === pos && isDragging ? "grabbing" : "grab",
    userSelect: "none",
  }}
      >
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={`${pos} Player`}
          className="player-input"
          style={{
            width: `${inputWidth}px`,
            padding: "1px 8px",
            fontSize: "13px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            outline: "none",
            zIndex: 10,
            backgroundColor: teamColor || "#282828",
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
  showSubs = false,
  showManager,
}) {
  const [editingPositions, setEditingPositions] = useState([]);
  const [filename, setFilename] = useState(formation);
  const lastFormationRef = useRef(formation);
  const lastClubNameRef = useRef(clubName);
  const layout = FormationLayouts[formation];
  const pitchRef = useRef(null);

  const [positions, setPositions] = useState(layout || []);
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
        : simplepitchPng;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(img.width / 2, img.height / 2, 1, 1);
      const [r, g, b] = imageData.data;
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
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        const maxDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
        const isLinePixel = brightness > 180 && maxDiff < 50 && a > 100;

        if (isLinePixel) {
          data[i] = targetR;
          data[i + 1] = targetG;
          data[i + 2] = targetB;
        } else {

    const GRAYSCALE_THEMES = [
    { hex: "#ffffff", l: 0.95 }, 
    { hex: "#cccccc", l: 0.75 },
    { hex: "#888888", l: 0.45 }, 
    { hex: "#111111", l: 0.15 }, 
    { hex: "#000000", l: 0.0 }
  ];
  let [h, s, l] = rgbToHsl(r, g, b);
  const [_, hueS, hueL] = rgbToHsl(...hexToRgb(pitchHue));
  const isGrayscale = hueS < 0.05;

              if (isGrayscale) {
              s = 0
              const closest = GRAYSCALE_THEMES.reduce((prev, curr) =>
              Math.abs(curr.l - hueL) < Math.abs(prev.l - hueL) ? curr : prev
               );
               l = brightness < 40 && closest.hex === "#000000" ? 0.02 : closest.l;
              } else {
             const baseHue = 138 / 360;
             const targetHue = rgbToHue(...hexToRgb(pitchHue)) / 360;
             h = (h + targetHue - baseHue + 1) % 1;
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
      const baseHue = 138;
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
    const expectedFilename =
      clubName && clubName.trim() !== "" ? `${formation} - ${clubName.trim()}` : formation;

    const lastExpectedFilename =
      lastClubNameRef.current && lastClubNameRef.current.trim() !== ""
        ? `${lastFormationRef.current} - ${lastClubNameRef.current.trim()}`
        : lastFormationRef.current;

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
  const isMobile = window.innerWidth <= 768;
  let formationKey;

  if (numPlayers === 11) {
    formationKey =
      isMobile && FormationLayouts[`${formation} MOBILE`]
        ? `${formation} MOBILE`
        : formation;
  } else if (numPlayers === 7) {
    formationKey =
      isMobile && FormationLayouts["7-player MOBILE"]
        ? "7-player MOBILE"
        : "7-player";
  } else if (numPlayers === 5) {
    formationKey =
      isMobile && FormationLayouts["5-player MOBILE"]
        ? "5-player MOBILE"
        : "5-player";
  } else {
    formationKey =
      isMobile && FormationLayouts[`${formation} MOBILE`]
        ? `${formation} MOBILE`
        : formation;
  }

  setPositions(FormationLayouts[formationKey] || []);
}, [numPlayers, formation]);

const PITCH_WIDTH = 4.45;
const PITCH_LENGTH = 7.04;
const DRAG_THRESHOLD = 5; 

const editingPositionsAtDragStart = useRef([]);

const handleMouseDown = (pos) => (e) => {
  e.preventDefault();
  draggedPos.current = pos;
  setIsDragging(false);
  dragStarted.current = false;

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  mouseDownPos.current = { x: clientX, y: clientY };

  if (!pitchRef.current) return;

  const pitchRect = pitchRef.current.getBoundingClientRect();
  const playerPos = positions.find((p) => p.pos === pos);
  if (!playerPos) return;

  const playerPixelX = pitchRect.left + (playerPos.x / PITCH_WIDTH) * pitchRect.width;
  const playerPixelY = pitchRect.top + (playerPos.y / PITCH_LENGTH) * pitchRect.height;

  dragOffset.current = {
    x: clientX - playerPixelX,
    y: clientY - playerPixelY,
  };
};

const handleMouseMove = (e) => {
  if (!draggedPos.current || !mouseDownPos.current || !pitchRef.current) return;

  const dx = e.clientX - mouseDownPos.current.x;
  const dy = e.clientY - mouseDownPos.current.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (!dragStarted.current) {
    if (distance <= DRAG_THRESHOLD) return;
    dragStarted.current = true;
    setIsDragging(true);
  }

  const pitchEl = pitchRef.current;
  const pitchWidth = pitchEl.offsetWidth;
  const pitchHeight = pitchEl.offsetHeight;

  const relativeX = ((e.clientX - pitchEl.offsetLeft - dragOffset.current.x) / pitchWidth) * PITCH_WIDTH;
  const relativeY = ((e.clientY - pitchEl.offsetTop - dragOffset.current.y) / pitchHeight) * PITCH_LENGTH;

  const isMobile = window.innerWidth <= 768;

  const maxX = isMobile ? 2.65 : PITCH_WIDTH;
  const maxY = isMobile ? 4 : PITCH_LENGTH;

  const clampedX = Math.min(Math.max(relativeX, 0), maxX);
  const clampedY = Math.min(Math.max(relativeY, 0), maxY);

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
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < DRAG_THRESHOLD) {
    toggleEditing(draggedPos.current);
  }

  draggedPos.current = null;
  setIsDragging(false);
  mouseDownPos.current = null;
  dragStarted.current = false;
};

useEffect(() => {
  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      handleMouseMove({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      });
    }
  };

  const handleTouchEnd = () => {
    handleGlobalMouseUp({ clientX: 0, clientY: 0 }); // dummy coords
  };

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleGlobalMouseUp);
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd);

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleGlobalMouseUp);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  };
}, [positions]);

const handleResetPlayers = () => {
  const isMobile = window.innerWidth <= 768;
  let formationKey;

  if (numPlayers === 11) {
    formationKey =
      isMobile && FormationLayouts[`${formation} MOBILE`]
        ? `${formation} MOBILE`
        : formation;
  } else if (numPlayers === 7) {
    formationKey =
      isMobile && FormationLayouts["7-player MOBILE"]
        ? "7-player MOBILE"
        : "7-player";
  } else if (numPlayers === 5) {
    formationKey =
      isMobile && FormationLayouts["5-player MOBILE"]
        ? "5-player MOBILE"
        : "5-player";
  } else {
    formationKey =
      isMobile && FormationLayouts[`${formation} MOBILE`]
        ? `${formation} MOBILE`
        : formation;
  }

  setPositions(FormationLayouts[formationKey] || []);
  layout.forEach(({ pos }) => updatePlayer(pos, ""));
  setEditingPositions([]);
  setSubInputs({});
};

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
      {showManager && (() => {
        const manager = getTeamManager(clubName);
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
            bottom: 0,
            left: 28,
            color: "white",
            fontWeight: "bold",
            textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {clubName && teamLogos[clubName.toLowerCase()] ? (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
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
    <div
      className="pitch-cell absolute player-circle"
      style={{
        left: `${x * 125}px`,
        top: `${y * 100}px`,
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
        fontSize: 18,
      }}
      onMouseDown={handleMouseDown(pos)}
      onTouchStart={handleMouseDown(pos)}
    >
      {pos}

      {pos === captain && (
        <div
        className="captain-badge"
          style={{
            position: "absolute",
            bottom: 0,
            right: -10,
            backgroundColor: "#FFD700",
            color: "#000",
            borderRadius: "50%",
            fontWeight: "bold",
            textAlign: "center",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          C
        </div>
      )}

      {showSubs && (
        <div
          className="subs-badge"
          style={{
            position: "absolute",
            top: -12,
            right: -12,
            borderRadius: "50%",
            backgroundColor: "#858383",
            color: "#fff",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "1px solid black",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          S
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
        teamColor={teamColor}
      />
    )}

    {showSubs && (
      <div
      className="sub-input-container"
        style={{
      "--top": `${y * 100 - 40}px`,
      "--left": `${x * 125 + 45}px`,
        }}
      >
        <input
          type="text"
          value={subInputs[pos] || ""}
          onChange={(e) => updateSubInput(pos, e.target.value)}
          placeholder={`${pos} Sub`}
          className="sub-input"
          style={{
            width: `${Math.max(9, (subInputs[pos]?.length || 0) + 4)}ch`,
          }}
        />
      </div>
    )}
  </React.Fragment>
);
})}

</div>

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