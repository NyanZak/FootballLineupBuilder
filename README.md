# Nyan's Football Lineup Builder ⚽

A web app to create football (soccer) lineups with ease. Built in React, this tool lets you drag players around a customizable pitch, switch formations, add names, and export your team sheet as an image.

## 🌐 Live Demo

[Click here to try it out!](https://nyanzak.github.io/FootballLineupBuilder/)

---

## 🔧 Features

### 🧩 Interactive Lineup Editor
- Default 4-4-2(2) formation with 11 players.
- Click a player position to type a name — textbox resizes automatically.
- Click again to hide the textbox.
- Move players freely anywhere on the pitch.

### 🔁 Reset Button
- Clears all player name inputs.
- Resets player positions to default locations based on the selected formation.

### 📁 Export Options
- Set a custom **filename** before export. Default name includes the current formation and selected club name (if applicable).
- **Export as PNG** — downloads a high-quality image of the current pitch layout to your default Downloads folder.

---

## 🎛️ UI Controls

### 🧠 Formation Selector
- Choose from a list of popular and commonly used football formations.

### 🎨 Pitch Appearance Settings
- Change **pitch color** and **line color** using a color picker.
- Toggle **pitch background styles**:  
  - Normal  
  - Striped  
  - Simple  

- Choose between **11, 7, or 5 players.**  Player positions update automatically, and unused spots are hidden.
- Toggle display of **filename label** shown on the bottom-left of the pitch.

---

## 🔍 Club Integration

### 🏟️ Club Squad Search
- Enter a Premier League club name to:
  - Apply club colors to player position circles and selected UI elements.
  - Add the club badge next to the pitch filename.
  
### 🧢 Captain Selection
- Assign a player as captain by selecting a position.
- Adds a small yellow “C” circle to represent the armband.

---

## 🚀 Getting Started

### Prerequisites

- Node.js and npm installed.  
  [Download Node.js](https://nodejs.org/)

### Install & Run

```bash
npm install
npm start
```

Runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.  
The page reloads automatically when you make edits.

### `npm run build`

Builds the app for production to the `build` folder.  
Bundles React in production mode and optimizes for best performance.

---

## Project Structure

- `/src` - React components, pitch UI, and lineup logic  
- `/public` - Static assets like images and fonts  
- `/data` - Sample squads and formation presets (if applicable)

---

## Learn More

- [React Documentation](https://reactjs.org/) — for learning React basics and advanced concepts  
- [Create React App Documentation](https://create-react-app.dev/docs/getting-started/) — for tooling details  

---

## Contributing

Feel free to open issues or submit pull requests for new features, bug fixes, or lineup presets!