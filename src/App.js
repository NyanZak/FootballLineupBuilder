import React, { useState } from "react";
import Pitch from "./components/Pitch";
import FormationSelector from "./components/FormationSelector";
import "./App.css";
import headerImg from "./assets/header.png";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import teamColors from "./teamColors";

function App() {
  const [formation, setFormation] = useState("4-4-2(2)");
  const [players, setPlayers] = useState({});
  
  const [pitchHue, setPitchHue] = useState(0);

  const [showSquadSearch, setShowSquadSearch] = useState(false);
  const [showPitchOptions, setShowPitchOptions] = useState(false);

  const [teamColor, setTeamColor] = useState("#282828");
  const [searchQuery, setSearchQuery] = useState("");
  const [clubName, setClubName] = useState("");

  const updatePlayer = (pos, value) => setPlayers(prev => ({ ...prev, [pos]: value }));
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

      // Handler for Enter key press in input
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      const clubName = searchQuery.trim();
      const color = teamColors[clubName];
      const club = searchQuery.trim();
       if (color) {
      setTeamColor(color);
      setClubName(club); // Save club name here
    } else {
      alert("Team not found");
    }
  }
};

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-green-900 text-white pt-2 pb-4">
        <h1 className="text-3xl font-bold h-full mt-2 text-center">Lineup Builder</h1>

        <div
          className="relative flex flex-col justify-center items-center mt-12 rounded-lg max-w-[900px] mx-auto"
          style={{
            backgroundImage: `url(${headerImg})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            boxShadow: "0 0 15px rgba(0,0,0,0.5)",
            height: "75px",
          }}
        >
          <div className="flex items-center gap-4">
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
                backgroundColor: teamColor,   // <--- add this
              }}
            >
  {showPitchOptions ? "Hide Pitch Options" : "Show Pitch Options"}
</button>

            {/* Search Club Squad Button */}
            <button
            onClick={() => setShowSquadSearch((prev) => !prev)} //
              style={{
                padding: "6px 12px",
                fontSize: "18px",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: teamColor,   // <--- add this
              }}
            >
              Search Club Squad
            </button>
          </div>
        </div>

        {/* Pass pitchHue prop to Pitch component */}
        <Pitch
          formation={formation}
          players={players}
          updatePlayer={updatePlayer}
          pitchHue={pitchHue}
          teamColor={teamColor} 
          clubName={clubName} // Pass clubName
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
            <h3>Pitch Options</h3>

            <label
              htmlFor="hueRange"
              style={{ display: "block", margin: "20px 0 10px" }}
            >
              Hue Rotation: {pitchHue}°
            </label>

            <input
              id="hueRange"
              type="range"
              min="0"
              max="360"
              value={pitchHue}
              onChange={(e) => setPitchHue(Number(e.target.value))}
              style={{ width: "100%" }}
            />

            <button
              style={{
                marginTop: "20px",
                padding: "6px 12px",
                backgroundColor: "#444",
                border: "none",
                color: "white",
                cursor: "pointer",
                borderRadius: "4px",
              }}
              onClick={() => setShowPitchOptions(false)}
            >
              Close
            </button>
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

            <button
              style={{
                marginTop: "20px",
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
        )}
      </div>
    </DndProvider>
  );
}
export default App;