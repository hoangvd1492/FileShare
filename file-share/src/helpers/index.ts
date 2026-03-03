export const getBrowser = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes("Firefox")) {
    return "Firefox";
  } else if (userAgent.includes("Chrome")) {
    return "Chrome";
  } else if (userAgent.includes("Safari")) {
    return "Safari";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
    return "Opera";
  } else if (userAgent.includes("Edg")) {
    return "Edge";
  } else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
    return "Internet Explorer";
  } else if (userAgent.includes("insomnia")) {
    return "Insomnia";
  } else {
    return "";
  }
};

export const getOS = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes("Win")) {
    return "Windows";
  } else if (userAgent.includes("Android")) {
    return "Android";
  } else if (userAgent.includes("Macintosh")) {
    return "macOS";
  } else if (
    userAgent.includes("iPhone") ||
    userAgent.includes("iPad") ||
    userAgent.includes("iPod")
  ) {
    return "iOS";
  } else if (userAgent.includes("X11")) {
    return "Linux";
  } else {
    return "";
  }
};

const adjectives = [
  "Dark",
  "Silent",
  "Crazy",
  "Fast",
  "Lucky",
  "Fierce",
  "Brave",
  "Swift",
  "Shadow",
  "Frozen",
  "Wild",
  "Savage",
  "Ghost",
  "Iron",
  "Crimson",
  "Golden",
  "Storm",
  "Night",
  "Royal",
  "Inferno",
];

const nouns = [
  "Tiger",
  "Wolf",
  "Dragon",
  "Shadow",
  "Knight",
  "Phoenix",
  "Raven",
  "Lion",
  "Falcon",
  "Viper",
  "Samurai",
  "Ninja",
  "Hunter",
  "Assassin",
  "Guardian",
  "Reaper",
  "Demon",
  "King",
  "Warrior",
  "Rogue",
];

export const generateName = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adj} ${noun}`;
};

export const generateId = () => {
  return Math.random().toString(36).substring(2, 10);
};
