import React, { useState } from "react";
import Pitch from "./components/Pitch";
import FormationSelector from "./components/FormationSelector";
import FormationLayouts from "./components/FormationLayouts";
import "./App.css";
import headerImg from "./assets/header.png";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { getTeamColor } from "./teamColors";

function App() {
  const [formation, setFormation] = useState("4-4-2(2)");
  const [players, setPlayers] = useState({});
  const [captain, setCaptain] = useState(null);

  const [showSquadSearch, setShowSquadSearch] = useState(false);
  const [showPitchOptions, setShowPitchOptions] = useState(false);

  const [teamColor, setTeamColor] = useState("#282828");
  const [searchQuery, setSearchQuery] = useState("");
  const [clubName, setClubName] = useState("");

  const updatePlayer = (pos, value) => setPlayers(prev => ({ ...prev, [pos]: value }));
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const [pitchStyle, setPitchStyle] = useState("normal"); // "normal" or "simple"
  const [pitchHue, setPitchHue] = useState("#008A2B");

  const [showFilename, setShowFilename] = useState(true);

      // Handler for Enter key press in input
const handleSearchKeyDown = (e) => {
  if (e.key === "Enter") {
    const clubNameInput = searchQuery.trim().toLowerCase();  // <--- lowercase here

    if (clubNameInput === "") {
      // User cleared the input and pressed Enter
      setTeamColor("#282828");   // Reset to default color
      setClubName("");           // Clear club name
    } else {
const color = getTeamColor(clubNameInput);
if (color) {
  setTeamColor(color);
  setClubName(searchQuery.trim());
} else {
  alert("Team not found");
}
    }
  }
};
 return (
  <DndProvider backend={HTML5Backend}>
    <div className="min-h-screen bg-green-900 text-white pt-2 pb-4">
      <h1 className="text-3xl font-bold h-full  text-center">Lineup Builder</h1>

      <div
        className="relative flex flex-col justify-center items-center mt-3 rounded-lg max-w-[900px] mx-auto"
        style={{
          backgroundImage: `url(${headerImg})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          boxShadow: "0 0 15px rgba(0,0,0,0.5)",
          height: "60px",
        }}
      >
        <div className="flex items-center gap-5">
          <label className="text-white font-semibold text-xl">Formation:</label>
          <FormationSelector setFormation={setFormation} />

          {/* Pitch Options Button */}
          <button
            onClick={() => setShowPitchOptions((prev) => !prev)}
            style={{
              padding: "6px 12px",
              fontSize: "18px",
              borderRadius: "4px",
              cursor: "pointer",
              backgroundColor: teamColor,
            }}
          >
            {showPitchOptions ? "Hide Pitch Options" : "Show Pitch Options"}
          </button>

          {/* Search Club Squad Button */}
          <button
            onClick={() => setShowSquadSearch((prev) => !prev)}
            style={{
              padding: "6px 12px",
              fontSize: "18px",
              borderRadius: "4px",
              cursor: "pointer",
              backgroundColor: teamColor,
            }}
          >
            Search Club Squad
          </button>
        </div>
      </div>

      <Pitch
        formation={formation}
        players={players}
        updatePlayer={updatePlayer}
        pitchHue={pitchHue}
        teamColor={teamColor}
        clubName={clubName}
        pitchStyle={pitchStyle}
        captain={captain}
        setCaptain={setCaptain}
        showFilename={showFilename}
      />

      {/* Sidebar for Pitch Options */}
      {showPitchOptions && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            width: "300px",
            backgroundColor: "#222",
            padding: "20px",
            color: "white",
            boxShadow: "2px 0 5px rgba(0,0,0,0.7)",
            zIndex: 1000,
            overflowY: "auto",
          }}
        >
          <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "15px" }}>
            Pitch Options
          </h3>

          <label htmlFor="pitchColor" style={{ display: "block", margin: "20px 0 10px" }}>
            Pitch Color:
          </label>

          <input
            id="pitchColor"
            type="color"
            value={pitchHue}
            onChange={(e) => setPitchHue(e.target.value)}
            style={{ width: "100%", height: "40px", padding: "0", border: "none", cursor: "pointer" }}
          />
          <button
            style={{
              marginTop: "10px",
              padding: "6px 12px",
              backgroundColor: "#555",
              border: "none",
              color: "white",
              cursor: "pointer",
              borderRadius: "4px",
              width: "100%",
            }}
            onClick={() => setPitchHue("#008A2B")}
          >
            Reset Pitch Color
          </button>

          <h3 style={{ marginTop: "30px" }}>Pitch Background</h3>
          <div style={{ marginTop: "10px" }}>
            <label>
              <input
                type="radio"
                name="pitchStyle"
                value="normal"
                checked={pitchStyle === "normal"}
                onChange={() => setPitchStyle("normal")}
                style={{ marginRight: "8px" }}
              />
              Normal Pitch
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="pitchStyle"
                value="striped"
                checked={pitchStyle === "striped"}
                onChange={() => setPitchStyle("striped")}
                style={{ marginRight: "8px" }}
              />
              Striped Pitch
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="pitchStyle"
                value="simple"
                checked={pitchStyle === "simple"}
                onChange={() => setPitchStyle("simple")}
                style={{ marginRight: "8px" }}
              />
              Simple Pitch
            </label>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => setShowFilename((prev) => !prev)}
              style={{
                padding: "6px 12px",
                fontSize: "18px",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: teamColor,
                width: "100%",
                marginBottom: "20px",
              }}
            >
              {showFilename ? "Hide Filename" : "Show Filename"}
            </button>
          </div>

          <div>
            <button
              style={{
                padding: "6px 12px",
                backgroundColor: "#444",
                border: "none",
                color: "white",
                cursor: "pointer",
                borderRadius: "4px",
                width: "100%",
              }}
              onClick={() => setShowPitchOptions(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Search Club Squad Sidebar (Right Side) */}
      {showSquadSearch && (
        <div
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            bottom: 0,
            width: "300px",
            backgroundColor: "#222",
            padding: "20px",
            color: "white",
            boxShadow: "-2px 0 5px rgba(0,0,0,0.7)",
            zIndex: 1000,
            overflowY: "auto",
          }}
        >
          <h3>Search Club Squad</h3>

          <input
            type="text"
            placeholder="Enter club name..."
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              borderRadius: "4px",
              border: "1px solid #444",
              backgroundColor: "#333",
              color: "white",
            }}
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
          />

          <div style={{ display: "flex", marginTop: "20px", justifyContent: "center", gap: "50px" }}>
            <button
              style={{
                padding: "6px 12px",
                backgroundColor: "#666",
                border: "none",
                color: "white",
                cursor: "pointer",
                borderRadius: "4px",
                flexShrink: 0,
              }}
              onClick={() => {
                setSearchQuery("");
                setTeamColor("#282828"); // Reset to default
                setClubName("");
              }}
            >
              Clear
            </button>

            <button
              style={{
                padding: "6px 12px",
                backgroundColor: "#444",
                border: "none",
                color: "white",
                cursor: "pointer",
                borderRadius: "4px",
              }}
              onClick={() => setShowSquadSearch(false)}
            >
              Close
            </button>
          </div>

          {/* Captain dropdown */}
          <div style={{ margin: "20px auto", textAlign: "center" }}>
            <label htmlFor="captain-select" style={{ marginRight: "10px" }}>
              Select Captain:
            </label>
            <select
              id="captain-select"
              value={captain || ""}
              onChange={(e) => setCaptain(e.target.value || null)}
              style={{
                padding: "6px 12px",
                fontSize: "16px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "#282828",
                color: "white",
                minWidth: "120px",
                cursor: "pointer",
              }}
            >
              <option value="">-- None --</option>
              {FormationLayouts[formation]?.map(({ pos }) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  </DndProvider>
)}
export default App;