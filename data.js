// Sample data + shared constants. Later: replace with a real backend / DB.
const DAY = 86400000;
const daysAgo = (n) => new Date(Date.now() - n * DAY).toISOString().slice(0, 10);

// Rarity is driven by relationship strength (1–5), like card rarity.
const RARITY = [
  null,
  { name: "Common",    cls: "common" },
  { name: "Uncommon",  cls: "uncommon" },
  { name: "Rare",      cls: "rare" },
  { name: "Epic",      cls: "epic" },
  { name: "Legendary", cls: "legendary" },
];

// "Type" is like a Pokémon type – colours the card.
const TYPES = {
  Founder:   { hue: 18,  icon: "🚀" },
  Engineer:  { hue: 210, icon: "⚡" },
  Designer:  { hue: 300, icon: "🎨" },
  Investor:  { hue: 140, icon: "💎" },
  Creator:   { hue: 340, icon: "🎬" },
  Mentor:    { hue: 45,  icon: "🧭" },
  Friend:    { hue: 190, icon: "🍻" },
};

const SEED = [
  { id: "p1", name: "Maya Okafor", title: "Co-founder & CEO", company: "Lumen Health", type: "Founder",
    place: "Demo Night, Phoenix", event: "ASU Startup Demo Night", date: daysAgo(12),
    notes: "Building AI intake for clinics. Loves climbing. Wants intro to anyone in healthcare ops.",
    tags: ["startup", "healthcare"], strength: 4, cadence: 14, last: daysAgo(12),
    socials: { instagram: "mayaokafor", linkedin: "mayaokafor", x: "maya_builds", email: "maya@lumen.health", phone: "+14805550101" },
    log: [{ d: daysAgo(12), t: "Met at demo night. Swapped cards." }] },
  { id: "p2", name: "Diego Ramírez", title: "Staff Engineer", company: "Vercel", type: "Engineer",
    place: "JSConf Tempe", event: "JSConf 2026", date: daysAgo(40),
    notes: "Talked about edge runtimes. Recommended the 'Designing Data-Intensive Apps' book. Has a corgi named Byte.",
    tags: ["dev", "conference"], strength: 3, cadence: 30, last: daysAgo(40),
    socials: { github: "diegor", x: "diego_dev", linkedin: "diegoramirez" },
    log: [{ d: daysAgo(40), t: "Chatted after his talk." }] },
  { id: "p3", name: "Priya Nair", title: "Product Designer", company: "Figma", type: "Designer",
    place: "Coffee, Mill Ave", event: "Intro by Sam", date: daysAgo(6),
    notes: "Offered to review my portfolio. Follow up with the case study link.",
    tags: ["design", "mentor?"], strength: 2, cadence: 7, last: daysAgo(6),
    socials: { instagram: "priya.designs", linkedin: "priyanair", email: "priya@example.com" },
    log: [{ d: daysAgo(6), t: "Coffee. She'll review portfolio." }] },
  { id: "p4", name: "Jordan Wells", title: "Partner", company: "Cactus Ventures", type: "Investor",
    place: "Demo Night, Phoenix", event: "ASU Startup Demo Night", date: daysAgo(12),
    notes: "Pre-seed, consumer + fintech. Said to send a 3-line update in a month.",
    tags: ["startup", "fundraising"], strength: 2, cadence: 30, last: daysAgo(12),
    socials: { linkedin: "jwells", x: "jwells_vc" }, log: [] },
  { id: "p5", name: "Kai Tanaka", title: "YouTuber / Filmmaker", company: "Independent", type: "Creator",
    place: "Creator Meetup, LA", event: "VidCon after-party", date: daysAgo(95),
    notes: "Shoots street photography reels. Wants to collab on a short about campus life.",
    tags: ["creator", "collab"], strength: 3, cadence: 45, last: daysAgo(95),
    socials: { instagram: "kaitanaka", youtube: "kaitanaka", x: "kaishoots" },
    log: [{ d: daysAgo(95), t: "Swapped IG at the after-party." }] },
  { id: "p6", name: "Dr. Elena Vasquez", title: "Professor", company: "ASU", type: "Mentor",
    place: "ASU Campus", event: "Office hours", date: daysAgo(150),
    notes: "Wrote my rec letter. Genuinely cares — send a yearly update and thank-you.",
    tags: ["mentor", "asu"], strength: 5, cadence: 60, last: daysAgo(30),
    socials: { email: "elena@asu.edu", linkedin: "elenavasquez" },
    log: [{ d: daysAgo(30), t: "Emailed a semester update." }, { d: daysAgo(150), t: "Met in office hours." }] },
  { id: "p7", name: "Sam Patel", title: "Grad Student", company: "ASU", type: "Friend",
    place: "ASU Campus", event: "Hackathon", date: daysAgo(200),
    notes: "Teammate from hackathon. Always down for ramen.",
    tags: ["friend", "asu", "dev"], strength: 5, cadence: 21, last: daysAgo(3),
    socials: { instagram: "sampatel", phone: "+14805550177" },
    log: [{ d: daysAgo(3), t: "Grabbed ramen." }] },
  { id: "p8", name: "Aisha Rahman", title: "Growth Lead", company: "Notion", type: "Founder",
    place: "JSConf Tempe", event: "JSConf 2026", date: daysAgo(40),
    notes: "Ex-founder. Great advice on activation loops.",
    tags: ["growth", "conference"], strength: 1, cadence: 30, last: daysAgo(40),
    socials: { linkedin: "aisharahman", x: "aisha_grows" }, log: [] },
];

// Fake “scanned” cards for the Add → Scan demo.
const SCAN_SAMPLES = [
  { name: "Lucas Bennett", title: "iOS Engineer", company: "Airbnb", type: "Engineer", socials: { linkedin: "lucasbennett", github: "lbennett" } },
  { name: "Noor Haddad", title: "Founder", company: "Sawa Labs", type: "Founder", socials: { instagram: "noorhaddad", email: "noor@sawa.io" } },
  { name: "Tessa Grant", title: "Creative Director", company: "Studio Mesa", type: "Designer", socials: { instagram: "tessa.creates", x: "tessagrant" } },
];

const SOCIAL_META = {
  instagram: { label: "Instagram", short: "IG", url: (h) => `https://instagram.com/${h}`, prefix: "@" },
  linkedin:  { label: "LinkedIn",  short: "in", url: (h) => `https://linkedin.com/in/${h}`, prefix: "" },
  x:         { label: "X",         short: "𝕏",  url: (h) => `https://x.com/${h}`, prefix: "@" },
  github:    { label: "GitHub",    short: "GH", url: (h) => `https://github.com/${h}`, prefix: "" },
  youtube:   { label: "YouTube",   short: "▶",  url: (h) => `https://youtube.com/@${h}`, prefix: "@" },
  email:     { label: "Email",     short: "✉",  url: (h) => `mailto:${h}`, prefix: "" },
  phone:     { label: "Phone",     short: "☎",  url: (h) => `sms:${h}`, prefix: "" },
};
