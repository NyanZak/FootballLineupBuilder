import React from "react";

const formations = [
    "4-4-2(2)",
    "4-4-2",
    "4-4-1-1",
    "4-2-2-2",
    "4-2-3-1",
    "4-3-3",
    "4-3-2-1",
    "4-1-4-1",
    "4-5-1",
    "5-4-1",
    "3-5-2",
    "3-4-3",
    "3-4-2-1",
    "3-4-1-2",
    "3-2-4-1"
  ];

  export default function FormationSelector({ setFormation }) {
    return (
        <select
        onChange={(e) => setFormation(e.target.value)}
        className="formation-select"
      >
        {formations.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    );
  }
  