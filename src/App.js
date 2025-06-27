import React, { useState, useEffect } from "react";
import Pitch from "./components/Pitch";
import FormationSelector from "./components/FormationSelector";
import FormationLayouts from "./components/FormationLayouts";
import "./App.css";
import headerImg from "./assets/header.png";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { getTeamColor } from "./teamColors";
import { FaCog, FaSearch } from "react-icons/fa";

function App() {
  const [formation, setFormation] = useState("4-4-2(2)");
  const [players, setPlayers] = useState({});
  const [captain, setCaptain] = useState(null);
  const [showSquadSearch, setShowSquadSearch] = useState(false);
  const [showPitchOptions, setShowPitchOptions] = useState(false);
  const [teamColor, setTeamColor] = useState("#282828");
  const [searchQuery, setSearchQuery] = useState("");
  const [clubName, setClubName] = useState("");
  const [numPlayers, setNumPlayers] = useState(11);
  const [pitchStyle, setPitchStyle] = useState("normal");
  const [pitchHue, setPitchHue] = useState("#008A2B");
  const [lineColor, setPitchLineHue] = useState("#CCCCCC");
  const [showFilename, setShowFilename] = useState(true);
  const [showSubs, setShowSubs] = useState(false);
  const [showManager, setShowManager] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768); // Adjust threshold as needed
  };

  handleResize(); // Run on load
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  const updatePlayer = (pos, value) =>
    setPlayers((prev) => ({ ...prev, [pos]: value }));

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      const clubNameInput = searchQuery.trim().toLowerCase();
      if (clubNameInput === "") {
        setTeamColor("#282828");
        setClubName("");
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
        <h1 className="text-[1.375rem] sm:text-3xl font-bold h-full text-center" style={{ whiteSpace: "nowrap" }}>
          Nyan's Football Lineup Builder
        </h1>

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
          <div className="flex items-center gap-5 top-controls">
            <label className="text-white font-semibold text-xl top-control-label hide-on-mobile" style={{ whiteSpace: "nowrap" }}>
              Formation:
            </label>
            <FormationSelector setFormation={setFormation} />

            <button
              onClick={() => setShowPitchOptions((prev) => !prev)}
              className="top-control-button flex items-center gap-1"
              style={{
                padding: "6px 12px",
                fontSize: "18px",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: teamColor,
              }}
            >
              <FaCog className="text-white" />
              <span className="hide-on-mobile">Show Pitch Options</span>
            </button>

            <button
              onClick={() => setShowSquadSearch((prev) => !prev)}
              className="top-control-button flex items-center gap-1"
              style={{
                padding: "6px 12px",
                fontSize: "18px",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: teamColor,
              }}
            >
              <FaSearch className="text-white" />
              <span className="hide-on-mobile">Search Club Squad</span>
            </button>
          </div>
        </div>

        <Pitch
          formation={formation}
          players={players}
          updatePlayer={updatePlayer}
          pitchHue={pitchHue}
          lineColor={lineColor}
          teamColor={teamColor}
          clubName={clubName}
          pitchStyle={pitchStyle}
          captain={captain}
          setCaptain={setCaptain}
          showFilename={showFilename}
          numPlayers={numPlayers}
          showSubs={showSubs}
          showManager={showManager}
        />

        {showPitchOptions && (
          <div className="pitch-options-sidebar" style={{
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            padding: "20px",
            color: "white",
            boxShadow: "2px 0 5px rgba(0,0,0,0.7)",
            zIndex: 1000,
            overflowY: "auto",
          }}>
            <h3 className="pitch-options-heading">Pitch Options</h3>

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
            <button className="reset-pitch-color-btn" onClick={() => setPitchHue("#008A2B")}>
              Reset Pitch Color
            </button>

            <label htmlFor="lineColor" style={{ display: "block", margin: "20px 0 10px" }}>
              Pitch Line Color:
            </label>
            <input
              id="lineColor"
              type="color"
              value={lineColor}
              onChange={(e) => setPitchLineHue(e.target.value)}
              style={{ width: "100%", height: "40px", padding: "0", border: "none", cursor: "pointer" }}
            />
            <button className="reset-line-button" onClick={() => setPitchLineHue("#CCCCCC")}>
              Reset Line Color
            </button>

            <h3 style={{ marginTop: "20px" }}>Pitch Background</h3>
            <div style={{ marginTop: "10px" }}>
              {["normal", "striped", "simple"].map((style) => (
                <label key={style}>
                  <input
                    type="radio"
                    name="pitchStyle"
                    value={style}
                    checked={pitchStyle === style}
                    onChange={() => setPitchStyle(style)}
                    style={{ marginRight: "8px" }}
                  />
                  {style.charAt(0).toUpperCase() + style.slice(1)} Pitch
                  <br />
                </label>
              ))}
            </div>

            <div style={{ textAlign: "center", marginBottom: "20px", marginTop: "20px" }}>
              <label style={{ color: "white", marginRight: "8px", fontWeight: "bold" }}>
                Players on pitch:
              </label>
              <select
                value={numPlayers}
                onChange={(e) => setNumPlayers(Number(e.target.value))}
                style={{
                  padding: "6px 10px",
                  fontSize: "16px",
                  borderRadius: "6px",
                  backgroundColor: "#282828",
                }}
              >
                {[11, 7, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between" style={{ marginTop: "20px" }}>
              <label htmlFor="showSubs" style={{ color: "white", fontWeight: "bold" }}>
                Show Subs
              </label>
              <input
                id="showSubs"
                type="checkbox"
                checked={showSubs}
                onChange={(e) => setShowSubs(e.target.checked)}
                style={{ cursor: "pointer", width: "20px", height: "20px" }}
              />
            </div>

            <div className="flex items-center justify-between" style={{ marginTop: "20px" }}>
              <label htmlFor="showManager" style={{ color: "white", fontWeight: "bold" }}>
                Show Manager
              </label>
              <input
                id="showManager"
                type="checkbox"
                checked={showManager}
                onChange={(e) => setShowManager(e.target.checked)}
                style={{ cursor: "pointer", width: "20px", height: "20px" }}
              />
            </div>

            <div style={{ marginTop: "20px" }} className="button-container">
              <button
                className="toggle-filename-btn"
                onClick={() => setShowFilename((prev) => !prev)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor: teamColor,
                  width: "100%",
                  marginBottom: "20px",
                  fontSize: "18px",
                }}
              >
                {showFilename ? "Hide Filename" : "Show Filename"}
              </button>

              <button
                className="close-btn"
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#444",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  borderRadius: "4px",
                  width: "100%",
                  fontSize: "16px",
                }}
                onClick={() => setShowPitchOptions(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showSquadSearch && (
          <div className="squad-search-panel">
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

            <div style={{ display: "flex", marginTop: "20px", justifyContent: "center", gap: "50px" }}>
              <button
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#666",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  borderRadius: "4px",
                  width: "120px",
                }}
                onClick={() => setShowSquadSearch(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

export default App;