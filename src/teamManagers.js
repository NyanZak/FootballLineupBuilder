const teamManagers = {
  "arsenal": {
    name: "Mikel Arteta",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/24011.png",
  },
    "aston villa": {
    name: "Unai Emery",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/96940.png",
  },
    "bournemouth": {
    name: "Andoni Iraola",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/33025.png",
  },
 //   "brentford": {
 //   name: "Thomas Frank",
 //   photoUrl: "https://images.fotmob.com/image_resources/playerimages/24011.png",
 // },
    "brighton": {
    name: "Fabian Hürzeler",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/208516.png",
  },
    "burnley": {
    name: "Scott Parker",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/24223.png",
  },
    "chelsea": {
    name: "Enzo Maresca",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/34000.png",
  },
    "crystal palace": {
    name: "Oliver Glasner",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/43009.png",
  },
    "everton": {
    name: "David Moyes",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/78626.png",
  },
    "fulham": {
    name: "Marco Silva",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/164124.png",
  },
  //  "hornchurch": {
 //   name: "Daryl McMahon",
  //  photoUrl: "https://images.fotmob.com/image_resources/playerimages/24011.png",
 // },
      "leeds united": {
    name: "Daniel Farke",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/849545.png",
  },
      "liverpool": {
    name: "Arne Slot",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/26630.png",
  },
      "manchester city": {
    name: "Pep Guardiola",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/41636.png",
  },
  "manchester united": {
    name: "Rúben Amorim",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/11754.png",
  },
      "newcastle united": {
    name: "Eddie Howe",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/23630.png",
  },
      "nottingham forest": {
    name: "Nuno Espirito Santo",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/25941.png",
  },
      "sunderland": {
    name: "Régis Le Bris",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/1381583.png",
  },
        "tottenham hotspur": {
    name: "Thomas Frank",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/11238.png",
  },
        "west ham united": {
    name: "Graham Potter",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/24347.png",
  },
        "wolves": {
    name: "Vitor Pereira",
    photoUrl: "https://images.fotmob.com/image_resources/playerimages/282115.png",
  },

};

const teamAliases = {
  villa: "aston villa",
  brighton: "brighton",                // changed from "brighton & hove albion"
  palace: "crystal palace",
  leeds: "leeds united",
  "man city": "manchester city",
  "man utd": "manchester united",
  "newcastle utd": "newcastle united",
  forest: "nottingham forest",
  spurs: "tottenham hotspur",
  "west ham": "west ham united",
  wolves: "wolves",                    // changed from "wolverhampton wanderers"
};

function getTeamManager(teamName) {
  if (!teamName) return null;
  const lowerName = teamName.trim().toLowerCase();
  const primaryName = teamAliases[lowerName] || lowerName;
  console.log(`getTeamManager input: "${teamName}" -> normalized: "${lowerName}" -> primaryName: "${primaryName}"`);
  console.log('Manager found:', teamManagers[primaryName] || null);
  return teamManagers[primaryName] || null;
}

export { teamManagers, getTeamManager };
