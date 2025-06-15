const primaryTeamColors = {
  arsenal: "#EF0107",
  "aston villa": "#95BFE5",
  bournemouth: "#DA291C",
  brentford: "#D20000",
  "brighton & hove albion": "#0057B8",
  burnley: "#6C1D45",
  chelsea: "#034694",
  "crystal palace": "#1B458F",
  everton: "#003399",
  fulham: "#000000",
  hornchurch: "#B91C1C",
  "leeds united": "#FFCD00",
  liverpool: "#C8102E",
  "manchester city": "#6CABDD",
  "manchester united": "#DA291C",
  "newcastle united": "#241F20",
  "nottingham forest": "#DD0000",
  sunderland: "#E03A3E",
  "tottenham hotspur": "#132257",
  "west ham united": "#7A263A",
  "wolverhampton wanderers": "#FDB913",
  "real madrid": "#FEBE10",
};

const teamAliases = {
  villa: "aston villa",
  brighton: "brighton & hove albion",
  palace: "crystal palace",
  leeds: "leeds united",
  "man city": "manchester city",
  "man utd": "manchester united",
  "newcastle utd": "newcastle united",
  forest: "nottingham forest",
  spurs: "tottenham hotspur",
  "west ham": "west ham united",
  wolves: "wolverhampton wanderers",
};

function getTeamColor(teamName) {
  const lowerName = teamName.toLowerCase();
  const primaryName = teamAliases[lowerName] || lowerName;
  return primaryTeamColors[primaryName] || null;
}

export { getTeamColor };
