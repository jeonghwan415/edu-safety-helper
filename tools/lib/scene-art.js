// 상황 장면 그림(SVG): 장소(setting) + 소품(props) + 등장인물(cast)을 조합해서 그려요. (2026-11-13 v2)
// 저·고학년: 밝은 색, 둥근 얼굴(표정) · 청소년: 어두운 바탕, 얼굴 없는 실루엣(유치하지 않게)
// 같은 그림이 반복되지 않게: 장면마다 씨앗값(seed)으로 벽·바닥 색, 가구, 옷·머리 모양, 자리, 좌우 방향이 달라져요.
// 규칙: 그림 안에 글자 넣지 않기(기호 ? ! … 만), 무섭거나 자극적인 장면 금지, 실존 캐릭터 금지
const { tint, ink, light } = require("./common");

const SETTINGS = ["home", "kitchen", "bathroom", "center", "office", "meeting", "library", "school", "cafeteria", "pool", "locker",
  "elevator", "stairs", "mart", "store", "street", "alley", "parking", "station", "bus", "subway", "van", "car", "park", "playground",
  "field", "festival", "outdoor", "valley", "mountain", "camp", "ski", "karaoke", "clinic", "online", "game", "bike"];
const ROLES = ["child", "friend", "friend2", "parent", "teacher", "stranger", "staff", "police", "elder", "teen", "doctor"];
const MOODS = ["happy", "worried", "think", "surprised", "neutral", "sad"];
const PROPS = ["smoke", "campfire", "dog", "lighter", "cake", "snack", "extinguisher", "kickboard", "wheelchair", "sign", "cones",
  "bicycle", "multitap", "device", "gift", "pills", "mask", "bottles", "umbrella", "ball"];
const INDOOR = ["home", "kitchen", "bathroom", "center", "office", "meeting", "library", "school", "cafeteria", "pool", "locker", "elevator", "stairs", "mart", "subway", "car", "karaoke", "clinic"];

function rng(seed) { let h = 2166136261; for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 10000) / 10000; }
const pick = (R, a) => a[Math.floor(R() * a.length) % a.length];
const night = c => c.time === "night";

/* ---------------- 저·고학년 그림 ---------------- */
const WALLS = ["#FFF4E6", "#EAF6FF", "#F1FBEF", "#FFF0F5", "#F4F0FF", "#FFFBE6", "#EEF7F7", "#FDF1E7", "#F2F4F8"];
const FLOORS = ["#E9D8C4", "#D7E3EE", "#D4E8CF", "#F2D7DE", "#DDD5EE", "#EDE3C2", "#CFE3E3", "#E8D2BF", "#D9DCE3"];
const FUN = ["#FF9F7A", "#7CC6FF", "#FFD35C", "#8EDB9B", "#C9A8FF", "#FF8FB3", "#6FD3C9", "#FFB86B"];

function skyKid(c, h = 600) {
  const sky = c.time === "night" ? "#22305A" : c.time === "evening" ? "#F7B98A" : { rain: "#C3CCD7", storm: "#AEB9C6", snow: "#E3ECF4", heat: "#FFE2B8", dust: "#E6DAC0" }[c.weather] || pick(c.R, ["#CFEAFF", "#D8F0FF", "#C7E6FA"]);
  let s = `<rect width="800" height="${h}" fill="${sky}"/>`;
  if (c.time === "night") { s += `<circle cx="${620 + c.R() * 120}" cy="${70 + c.R() * 40}" r="34" fill="#FFF3C4"/>`; for (let i = 0; i < 14; i++) s += `<circle cx="${(i * 131 + c.R() * 40) % 800}" cy="${(i * 37) % 200 + 20}" r="3" fill="#fff" opacity=".8"/>`; }
  else if (c.time === "evening") s += `<circle cx="${560 + c.R() * 150}" cy="190" r="60" fill="#FF8C5A" opacity=".85"/>`;
  else if (!c.weather || c.weather === "sun" || c.weather === "heat") s += `<circle cx="${560 + c.R() * 180}" cy="${70 + c.R() * 50}" r="${c.weather === "heat" ? 66 : 46}" fill="${c.weather === "heat" ? "#FF9D3B" : "#FFD35C"}"/>`;
  if (!c.time || c.time === "day") for (let i = 0; i < 2 + Math.floor(c.R() * 2); i++) { const x = 60 + c.R() * 600, y = 50 + c.R() * 90; s += `<ellipse cx="${x}" cy="${y}" rx="70" ry="24" fill="#fff" opacity=".85"/><ellipse cx="${x + 40}" cy="${y - 12}" rx="44" ry="22" fill="#fff" opacity=".85"/>`; }
  return s;
}
function weatherKid(c) {
  let s = "";
  if (c.weather === "rain" || c.weather === "storm") s += [...Array(38)].map((_, i) => `<path d="M${(i * 71 + c.R() * 30) % 800},${(i * 37) % 440} l-12,30" stroke="#5B8FCB" stroke-width="5" stroke-linecap="round" opacity=".7"/>`).join("") + `<ellipse cx="200" cy="60" rx="160" ry="50" fill="#8E99A6"/><ellipse cx="540" cy="50" rx="190" ry="55" fill="#9AA5B1"/>`;
  if (c.weather === "storm") s += `<path d="M120,140 q60,-30 120,0 t120,0" stroke="#7A8794" stroke-width="10" fill="none" opacity=".6"/>`;
  if (c.weather === "snow") s += [...Array(40)].map((_, i) => `<circle cx="${(i * 83 + c.R() * 20) % 800}" cy="${(i * 47) % 440}" r="7" fill="#fff"/>`).join("");
  if (c.weather === "dust") s += `<rect width="800" height="600" fill="#C8B48A" opacity=".33"/>` + [...Array(40)].map((_, i) => `<circle cx="${(i * 97) % 800}" cy="${(i * 53) % 470}" r="5" fill="#A89262" opacity=".5"/>`).join("");
  if (c.weather === "quake") s += `<path d="M260,600 L300,520 L270,480 L330,440" fill="none" stroke="#7A6248" stroke-width="8" stroke-linejoin="round"/><path d="M60,200 q10,-10 20,0 M720,240 q10,-10 20,0" stroke="#7A6248" stroke-width="6" fill="none"/>`;
  return s;
}
const winK = (x, y, w, h, nt) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${nt ? "#2B3A66" : "#DFF1FF"}" stroke="#fff" stroke-width="10"/><path d="M${x + w / 2},${y}V${y + h}M${x},${y + h / 2}H${x + w}" stroke="#fff" stroke-width="8"/>` + (nt ? `<circle cx="${x + w * .7}" cy="${y + h * .3}" r="12" fill="#FFF3C4"/>` : "");
const plant = (x, y) => `<rect x="${x - 22}" y="${y - 50}" width="44" height="50" rx="8" fill="#C47E5A"/><ellipse cx="${x - 14}" cy="${y - 74}" rx="18" ry="30" fill="#5DBB6B"/><ellipse cx="${x + 14}" cy="${y - 80}" rx="18" ry="32" fill="#4FA85D"/>`;
const clock = (x, y) => `<circle cx="${x}" cy="${y}" r="30" fill="#fff" stroke="#7A818C" stroke-width="6"/><path d="M${x},${y} v-18 M${x},${y} h14" stroke="#3D4148" stroke-width="5" stroke-linecap="round"/>`;
const poster = (x, y, c) => `<rect x="${x}" y="${y}" width="90" height="110" rx="8" fill="${c}" opacity=".75"/><circle cx="${x + 45}" cy="${y + 42}" r="22" fill="#fff" opacity=".7"/><rect x="${x + 18}" y="${y + 78}" width="54" height="10" rx="5" fill="#fff" opacity=".7"/>`;
const tree = (x, y, s = 1, snow) => `<rect x="${x - 10 * s}" y="${y - 120 * s}" width="${20 * s}" height="${120 * s}" fill="#8A6440"/><circle cx="${x}" cy="${y - 140 * s}" r="${62 * s}" fill="${snow ? "#EAF2F7" : ["#5DBB6B", "#6CC779", "#4FA85D"][Math.round(x) % 3]}"/>`;
const carK = (x, y, col, flip) => `<g transform="translate(${x} ${y})${flip ? " translate(190 0) scale(-1 1)" : ""}"><rect x="0" y="20" width="190" height="60" rx="22" fill="${col}"/><path d="M35,22 L60,-12 H140 L165,22Z" fill="${col}"/><path d="M62,18 L76,-4 H128 L142,18Z" fill="#DDF0FF"/><circle cx="45" cy="84" r="20" fill="#2B2F36"/><circle cx="150" cy="84" r="20" fill="#2B2F36"/></g>`;

function bgKid(st, c) {
  const { R, P } = c, nt = night(c);
  const wall = col => `<rect width="800" height="470" fill="${col || P.wall}"/>`, floor = col => `<rect x="0" y="470" width="800" height="130" fill="${col || P.floor}"/>`;
  const deco = () => pick(R, [plant(pick(R, [90, 720]), 470), clock(pick(R, [700, 110]), 90), poster(pick(R, [60, 650]), 110, pick(R, FUN)), ""]);
  switch (st) {
    case "home": {
      const v = Math.floor(R() * 3);
      return wall() + winK(pick(R, [500, 80]), 90, 200, 150, nt) + floor() + deco() +
        (v === 0 ? `<rect x="300" y="370" width="230" height="100" rx="30" fill="${P.accent}" opacity=".55"/><rect x="290" y="340" width="40" height="130" rx="18" fill="${P.accent}" opacity=".7"/><rect x="500" y="340" width="40" height="130" rx="18" fill="${P.accent}" opacity=".7"/>`
         : v === 1 ? `<rect x="470" y="360" width="280" height="110" rx="14" fill="#fff"/><rect x="470" y="330" width="80" height="60" rx="12" fill="${pick(R, FUN)}"/><rect x="560" y="380" width="190" height="90" rx="10" fill="${pick(R, FUN)}" opacity=".8"/>`
         : `<rect x="280" y="380" width="260" height="16" rx="6" fill="#C99A6B"/><rect x="300" y="396" width="14" height="74" fill="#B08560"/><rect x="506" y="396" width="14" height="74" fill="#B08560"/><circle cx="380" cy="372" r="10" fill="${pick(R, FUN)}"/>`) +
        `<rect x="${pick(R, [40, 660])}" y="150" width="110" height="320" rx="8" fill="#C99A6B"/>`;
    }
    case "kitchen": return wall(pick(R, ["#FFF4E3", "#F0F7FF", "#F3FFF1"])) + winK(80, 80, 180, 140, nt) +
      `<rect x="430" y="300" width="300" height="170" rx="10" fill="#E9E2D6"/><rect x="430" y="280" width="300" height="26" rx="6" fill="#CFC6B8"/><circle cx="510" cy="293" r="26" fill="#3D4148"/><circle cx="640" cy="293" r="26" fill="#3D4148"/>` +
      `<rect x="470" y="250" width="80" height="34" rx="8" fill="#9AA1AD"/><rect x="545" y="262" width="50" height="8" rx="4" fill="#9AA1AD"/>` + (R() < .5 ? `<rect x="290" y="150" width="110" height="320" rx="12" fill="#E6EDF4"/><rect x="380" y="220" width="8" height="50" rx="4" fill="#9AA1AD"/>` : "") + floor();
    case "bathroom": {
      let s = wall("#EAF6F8"); for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) s += `<rect x="${i * 100 + 4}" y="${j * 94 + 4}" width="92" height="86" rx="6" fill="none" stroke="#D3E7EC" stroke-width="4"/>`;
      return s + `<rect x="80" y="110" width="150" height="120" rx="20" fill="#DFF1FF" stroke="#B9D6E0" stroke-width="8"/><rect x="90" y="300" width="140" height="70" rx="16" fill="#fff"/><rect x="150" y="370" width="22" height="100" fill="#D6DDE4"/>` +
        `<rect x="420" y="330" width="320" height="140" rx="40" fill="#fff" stroke="#D6DDE4" stroke-width="6"/><rect x="300" y="200" width="160" height="14" rx="6" fill="#B9C3CC"/>` + [0, 1, 2].map(i => `<rect x="${312 + i * 50}" y="150" width="30" height="50" rx="8" fill="${pick(R, FUN)}"/>`).join("") + floor("#D6E6EA");
    }
    case "center": case "meeting": {
      const sx = st === "meeting" ? 600 : 60;
      const shelf = `<rect x="${sx}" y="120" width="190" height="350" rx="8" fill="#E8D5C0"/>` + [0, 1, 2].map(r => `<rect x="${sx}" y="${200 + r * 90}" width="190" height="10" fill="#CDB59A"/>` + [0, 1, 2, 3, 4].map(i => `<rect x="${sx + 10 + i * 34}" y="${140 + r * 90}" width="24" height="60" rx="3" fill="${pick(R, FUN)}"/>`).join("")).join("");
      if (st === "meeting") return wall() + `<rect x="120" y="80" width="400" height="220" rx="12" fill="#fff" stroke="#C99A6B" stroke-width="10"/>` + [0, 1, 2].map(i => `<rect x="160" y="${120 + i * 50}" width="${200 + R() * 120}" height="18" rx="9" fill="${pick(R, FUN)}" opacity=".7"/>`).join("") + shelf + floor() + `<ellipse cx="400" cy="500" rx="300" ry="34" fill="${P.accent}" opacity=".25"/>`;
      return wall() + winK(pick(R, [560, 300]), 80, 170, 130, nt) + shelf + deco() + `<rect x="330" y="400" width="300" height="18" rx="8" fill="#C99A6B"/><rect x="350" y="418" width="14" height="52" fill="#B08560"/><rect x="596" y="418" width="14" height="52" fill="#B08560"/>` + floor();
    }
    case "office": return wall("#F7F1EA") + `<rect x="520" y="90" width="200" height="140" rx="10" fill="#fff" stroke="#E0D2C2" stroke-width="8"/><path d="M540,210 l50,-60 l40,40 l30,-30 l40,50z" fill="#8EDB9B"/>` + plant(110, 470) +
      `<rect x="200" y="360" width="300" height="110" rx="40" fill="${pick(R, ["#9CB8E8", "#E8B89C", "#B8E0C0"])}"/><rect x="190" y="330" width="50" height="140" rx="22" fill="${pick(R, ["#86A6DB", "#DBA286", "#9FD0AB"])}"/><circle cx="620" cy="300" r="40" fill="#FFE7A8"/><rect x="612" y="300" width="16" height="170" fill="#C9C2B4"/>` + floor("#E8DCCB");
    case "library": { let s = wall("#F5EFE6"); for (let k = 0; k < 3; k++) { s += `<rect x="${40 + k * 260}" y="90" width="220" height="250" rx="6" fill="#D8C2A6"/>`; for (let r = 0; r < 3; r++) s += [...Array(7)].map((_, i) => `<rect x="${50 + k * 260 + i * 29}" y="${100 + r * 80}" width="22" height="66" rx="3" fill="${pick(R, FUN)}"/>`).join(""); }
      return s + `<rect x="120" y="400" width="560" height="18" rx="8" fill="#B08560"/><circle cx="220" cy="385" r="16" fill="#FFE08A"/><circle cx="560" cy="385" r="16" fill="#FFE08A"/>` + floor("#DCCBB4"); }
    case "school": {
      let s = wall(pick(R, ["#EEF6EA", "#F3F0FF", "#FFF7EA"])) + `<rect x="150" y="70" width="500" height="230" rx="12" fill="#2F5D4B" stroke="#C99A6B" stroke-width="14"/><path d="M200,140 h140 M200,190 h220 M200,240 h100" stroke="#E9F2EC" stroke-width="8" stroke-linecap="round" opacity=".5"/>` +
        `<rect x="80" y="400" width="200" height="16" rx="6" fill="#C99A6B"/><rect x="520" y="400" width="200" height="16" rx="6" fill="#C99A6B"/>` + floor();
      if (c.weather === "quake") s += `<path d="M120,60 l-20,10 M680,60 l20,10 M40,300 q-14,10 0,20 M760,300 q14,10 0,20" stroke="#7A6248" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      return s;
    }
    case "cafeteria": return wall("#FFF7EA") + `<rect x="60" y="150" width="680" height="120" rx="12" fill="#E3E8EE"/>` + [0, 1, 2, 3].map(i => `<rect x="${90 + i * 165}" y="170" width="130" height="60" rx="10" fill="${pick(R, FUN)}" opacity=".6"/>`).join("") +
      `<rect x="100" y="410" width="600" height="20" rx="8" fill="#C99A6B"/>` + [0, 1, 2].map(i => `<rect x="${170 + i * 180}" y="390" width="90" height="20" rx="6" fill="#B9C3CC"/>`).join("") + floor();
    case "pool": return `<rect width="800" height="600" fill="#DFF4FB"/>` + [...Array(8)].map((_, i) => `<rect x="${i * 100}" y="0" width="96" height="300" fill="none" stroke="#C6E6F0" stroke-width="4"/>`).join("") +
      `<rect x="0" y="300" width="800" height="150" fill="#5BC0E8"/><path d="M0,330 q40,-14 80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0" stroke="#fff" stroke-width="6" fill="none" opacity=".7"/>` +
      [1, 2, 3].map(i => `<path d="M0,${300 + i * 38} H800" stroke="${["#FF6B6B", "#fff", "#FFD35C"][i - 1]}" stroke-width="6" stroke-dasharray="18 12"/>`).join("") + `<rect x="0" y="450" width="800" height="150" fill="#EAF4F7"/>`;
    case "locker": { let s = wall("#EEF2F7"); for (let i = 0; i < 6; i++) s += `<rect x="${40 + i * 120}" y="80" width="110" height="360" rx="8" fill="${pick(R, ["#7CB7E8", "#8EC9D6", "#A3B8E8"])}"/><rect x="${70 + i * 120}" y="120" width="50" height="8" rx="4" fill="#fff" opacity=".7"/><rect x="${130 + i * 120}" y="250" width="8" height="30" rx="4" fill="#3D4148"/>`;
      return s + `<rect x="160" y="420" width="480" height="24" rx="10" fill="#C99A6B"/>` + floor("#D9E3EA"); }
    case "elevator": return `<rect width="800" height="600" fill="#C9D1D9"/><rect x="40" y="30" width="720" height="460" rx="10" fill="#DDE3E9"/>` + [...Array(6)].map((_, i) => `<path d="M${40 + i * 120},30 V490" stroke="#C6CED6" stroke-width="4"/>`).join("") +
      `<rect x="640" y="150" width="70" height="200" rx="12" fill="#B9C3CC"/>` + [0, 1, 2, 3, 4].map(i => `<circle cx="675" cy="${180 + i * 34}" r="11" fill="${i === 2 ? "#FFD35C" : "#fff"}"/>`).join("") + `<rect x="0" y="490" width="800" height="110" fill="#8E99A6"/>`;
    case "stairs": return wall("#F3F0EA") + [...Array(6)].map((_, i) => `<rect x="${380 + i * 60}" y="${470 - (i + 1) * 50}" width="${420 - i * 60}" height="50" fill="${i % 2 ? "#D9D2C6" : "#E4DED3"}"/>`).join("") +
      `<rect x="80" y="120" width="140" height="70" rx="10" fill="#3DBE5B"/><path d="M110,170 l20,-30 l20,30 M175,140 h25 l-10,-10 M200,140 l-10,10" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>` + floor();
    case "mart": {
      let s = wall("#FFF8EC");
      for (let k = 0; k < 2; k++) { const x = 60 + k * 440; s += `<rect x="${x}" y="90" width="290" height="380" rx="8" fill="#E6DCCB"/>`; for (let r = 0; r < 4; r++) { s += `<rect x="${x}" y="${150 + r * 85}" width="290" height="10" fill="#C8BBA5"/>`; for (let i = 0; i < 6; i++) s += `<rect x="${x + 10 + i * 46}" y="${100 + r * 85}" width="36" height="50" rx="6" fill="${pick(R, FUN)}"/>`; } }
      return s + floor() + `<g transform="translate(${pick(R, [360, 380])} 400)"><rect x="0" y="0" width="90" height="60" rx="6" fill="none" stroke="#7A818C" stroke-width="7"/><circle cx="15" cy="78" r="10" fill="#7A818C"/><circle cx="78" cy="78" r="10" fill="#7A818C"/></g>`;
    }
    case "store": return skyKid(c, 300) + `<rect x="0" y="120" width="800" height="300" fill="#F4F6F8"/><rect x="0" y="120" width="800" height="50" fill="${pick(R, ["#3DA35D", "#2E7CD1", "#E8573A"])}"/>` +
      `<rect x="60" y="190" width="440" height="230" fill="#DFF1FF" stroke="#C9D1D9" stroke-width="8"/>` + [0, 1, 2].map(r => `<rect x="80" y="${215 + r * 65}" width="400" height="8" fill="#C9D1D9"/>` + [...Array(8)].map((_, i) => `<rect x="${90 + i * 48}" y="${177 + r * 65}" width="34" height="36" rx="5" fill="${pick(R, FUN)}"/>`).join("")).join("") +
      `<rect x="540" y="190" width="160" height="230" fill="#BFE3F5" stroke="#C9D1D9" stroke-width="8"/><circle cx="740" cy="250" r="34" fill="#FFD35C" stroke="#fff" stroke-width="6"/><path d="M725,250 l10,12 l20,-24" stroke="#fff" stroke-width="7" fill="none"/>` +
      `<rect x="0" y="420" width="800" height="180" fill="#EAE4D8"/>` + (nt ? `<rect width="800" height="600" fill="#1B2A4A" opacity=".25"/>` : "");
    case "street": case "alley": case "parking": case "station": {
      let s = skyKid(c, 420);
      if (st === "alley") s += `<rect x="0" y="0" width="230" height="600" fill="${pick(R, ["#E8CDB5", "#D8D0E8", "#CFE0D4"])}"/><rect x="570" y="0" width="230" height="600" fill="${pick(R, ["#E2C7AE", "#CBC4E0", "#C3D8CA"])}"/>` + [...Array(6)].map((_, i) => `<rect x="${(i % 2) * 600 + 70}" y="${60 + Math.floor(i / 2) * 120}" width="70" height="60" fill="${nt ? "#FFE7A0" : "#fff"}" opacity=".85"/>`).join("") +
        `<rect x="230" y="420" width="340" height="180" fill="#B9B2A6"/><rect x="0" y="420" width="230" height="180" fill="#A9A296"/><rect x="570" y="420" width="230" height="180" fill="#A9A296"/><rect x="520" y="160" width="10" height="260" fill="#3D4148"/><circle cx="525" cy="160" r="20" fill="${nt ? "#FFF1B0" : "#D6DDE4"}"/>`;
      else if (st === "parking") s += `<rect x="0" y="160" width="800" height="440" fill="#9AA1AD"/><rect x="0" y="160" width="800" height="30" fill="#7A818C"/>` + [0, 1, 2, 3].map(i => `<path d="M${40 + i * 240},440 v160" stroke="#fff" stroke-width="8"/>`).join("") + carK(30, 330, pick(R, FUN)) + carK(580, 330, pick(R, FUN)) + `<rect x="380" y="190" width="40" height="250" fill="#C9C2B4"/>`;
      else if (st === "station") s += `<rect x="80" y="110" width="640" height="310" fill="${pick(R, ["#D9CFC2", "#CFD8E3"])}"/><path d="M80,110 L400,40 L720,110Z" fill="#B08560"/>` + [0, 1, 2].map(i => `<rect x="${150 + i * 200}" y="230" width="120" height="190" rx="60" fill="${nt ? "#FFE7A0" : "#DFF1FF"}"/>`).join("") + `<circle cx="400" cy="160" r="36" fill="#fff" stroke="#7A818C" stroke-width="6"/><path d="M400,160 v-20 M400,160 h16" stroke="#3D4148" stroke-width="5"/><rect x="0" y="420" width="800" height="180" fill="#D9D2C6"/>`;
      else {
        s += `<rect x="0" y="210" width="800" height="210" fill="#EAE4D8"/>` + [[40, 110, 160, 220], [230, 70, 140, 260], [620, 120, 150, 210]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${pick(R, ["#F2C7A5", "#C9D8F2", "#D9C9F2", "#C8E6C9", "#FFE0A8"])}"/>` + [0, 1, 2, 3].map(i => `<rect x="${x + 18 + (i % 2) * (w / 2)}" y="${y + 24 + Math.floor(i / 2) * 70}" width="30" height="40" fill="${nt ? "#FFE7A0" : "#fff"}" opacity=".85"/>`).join("")).join("");
        s += `<rect x="0" y="420" width="800" height="180" fill="#5A606B"/>`;
        if (c.zone) s += `<rect x="0" y="420" width="800" height="180" fill="#C44" opacity=".35"/>`;
        for (let i = 0; i < 7; i++) s += `<rect x="${250 + i * 46}" y="430" width="28" height="160" fill="#fff" opacity=".92"/>`;
        s += `<rect x="700" y="230" width="14" height="200" fill="#3D4148"/><rect x="680" y="200" width="54" height="110" rx="10" fill="#2B2F36"/><circle cx="707" cy="228" r="14" fill="${c.light === "green" ? "#555" : "#FF5A5A"}"/><circle cx="707" cy="280" r="14" fill="${c.light === "green" ? "#3DDC84" : "#555"}"/>`;
        if (c.car !== false) s += carK(R() < .5 ? 20 : 590, 470, pick(R, ["#FF7A6B", "#5FB7F5", "#FFD35C", "#8EDB9B", "#B9C3CC"]), R() < .5);
      }
      return s;
    }
    case "bus": return skyKid(c, 430) + `<rect x="0" y="430" width="800" height="170" fill="#5A606B"/><rect x="0" y="420" width="800" height="24" fill="#B9BEC6"/>` +
      `<g transform="translate(330 150)"><rect x="0" y="0" width="440" height="260" rx="30" fill="${pick(R, ["#3DA35D", "#2E7CD1", "#E85B5B"])}"/>` + [0, 1, 2, 3].map(i => `<rect x="${24 + i * 100}" y="30" width="80" height="90" rx="10" fill="#DFF1FF"/>`).join("") +
      `<rect x="24" y="140" width="70" height="120" rx="8" fill="#2B2F36" opacity=".35"/><circle cx="90" cy="275" r="32" fill="#2B2F36"/><circle cx="360" cy="275" r="32" fill="#2B2F36"/></g><rect x="40" y="180" width="160" height="12" fill="#3D4148"/><rect x="40" y="190" width="10" height="230" fill="#3D4148"/><rect x="190" y="190" width="10" height="230" fill="#3D4148"/><rect x="60" y="300" width="120" height="16" rx="6" fill="#C99A6B"/>`;
    case "van": return skyKid(c, 430) + `<rect x="0" y="430" width="800" height="170" fill="#EAE4D8"/><g transform="translate(300 170)"><rect x="0" y="40" width="470" height="220" rx="40" fill="#FFD35C"/><path d="M0,120 L60,40 H200 V120Z" fill="#DFF1FF"/>` + [0, 1, 2].map(i => `<rect x="${220 + i * 80}" y="60" width="66" height="70" rx="10" fill="#DFF1FF"/>`).join("") + `<rect x="220" y="140" width="110" height="120" rx="8" fill="#E8B830"/><circle cx="90" cy="265" r="34" fill="#2B2F36"/><circle cx="380" cy="265" r="34" fill="#2B2F36"/></g>`;
    case "subway": return `<rect width="800" height="600" fill="#E3E8EE"/>` + [0, 1, 2].map(i => `<rect x="${60 + i * 250}" y="80" width="190" height="150" rx="20" fill="#2B3A55"/>`).join("") +
      `<rect x="0" y="330" width="800" height="70" rx="10" fill="${pick(R, ["#5FB7F5", "#8EDB9B", "#FF9F7A"])}"/>` + [0, 1, 2, 3].map(i => `<rect x="${130 + i * 180}" y="40" width="10" height="440" fill="#B9C3CC"/>`).join("") + `<rect x="0" y="480" width="800" height="120" fill="#9AA1AD"/><path d="M0,40 H800" stroke="#B9C3CC" stroke-width="10"/>`;
    case "car": return `<rect width="800" height="600" fill="#BFD8EE"/><rect x="0" y="0" width="800" height="250" fill="#DFF1FF"/><path d="M0,250 Q400,150 800,250 V600 H0Z" fill="#4A5160"/>` +
      `<rect x="120" y="280" width="220" height="280" rx="50" fill="#6B7280"/><rect x="460" y="280" width="220" height="280" rx="50" fill="#6B7280"/><rect x="170" y="240" width="120" height="70" rx="26" fill="#7A818C"/><rect x="510" y="240" width="120" height="70" rx="26" fill="#7A818C"/>`;
    case "karaoke": return `<rect width="800" height="600" fill="#2A2250"/><rect x="220" y="60" width="360" height="210" rx="12" fill="#151231" stroke="#5A4E9E" stroke-width="8"/><path d="M260,220 h120 M260,180 h200" stroke="#7CC6FF" stroke-width="10" stroke-linecap="round" opacity=".6"/>` +
      [...Array(10)].map((_, i) => `<circle cx="${60 + i * 80}" cy="${30 + (i % 2) * 20}" r="8" fill="${pick(R, FUN)}"/>`).join("") + `<rect x="60" y="380" width="680" height="90" rx="30" fill="#7B3FA0"/><rect x="0" y="470" width="800" height="130" fill="#3A2E6E"/>`;
    case "clinic": return wall("#EEF7F7") + `<rect x="520" y="100" width="210" height="300" rx="10" fill="#fff" stroke="#CFE3E3" stroke-width="8"/>` +
      [0, 1, 2].map(r => `<rect x="520" y="${180 + r * 80}" width="210" height="8" fill="#CFE3E3"/>` + [0, 1, 2, 3].map(i => `<rect x="${535 + i * 48}" y="${125 + r * 80}" width="30" height="52" rx="6" fill="${pick(R, ["#FFB4A8", "#A8D8FF", "#FFE08A", "#B8E6C1"])}"/>`).join("")).join("") +
      `<rect x="110" y="90" width="110" height="110" rx="20" fill="#fff"/><path d="M165,110 V180 M130,145 H200" stroke="#3DBE8B" stroke-width="22" stroke-linecap="round"/>` + (R() < .5 ? `<rect x="250" y="360" width="200" height="70" rx="14" fill="#fff" stroke="#CFE3E3" stroke-width="6"/>` : "") + floor();
    case "online": case "game": {
      const g = st === "game";
      let bub = "";
      for (let i = 0; i < (g ? 2 : 5); i++) { const mine = R() < .45, w = 90 + R() * 90; bub += `<rect x="${mine ? 264 - w : 36}" y="${g ? 270 + i * 50 : 70 + i * 62}" width="${w}" height="38" rx="18" fill="${mine ? (g ? "#6A5CC2" : "#BFE3C8") : (g ? "#4B4170" : "#E3E8F0")}"/>`; }
      return `<rect width="800" height="600" fill="${g ? pick(R, ["#E9E4FF", "#E4E9FF"]) : pick(R, ["#EAF3FF", "#FFF1F4", "#EFFAF1", "#FFF8E8"])}"/><rect x="0" y="470" width="800" height="130" fill="${pick(R, ["#D9D2E9", "#D6E2EE", "#E6DCCF"])}"/>` +
        `<g transform="translate(420 60)"><rect x="0" y="0" width="300" height="440" rx="40" fill="#2B2F36"/><rect x="18" y="40" width="264" height="360" rx="16" fill="${g ? "#1D1A33" : "#fff"}"/>` +
        (g ? `<rect x="40" y="80" width="220" height="160" rx="12" fill="${pick(R, ["#3B2F7A", "#1F4E7A", "#5A2F6A"])}"/><circle cx="${90 + R() * 60}" cy="160" r="28" fill="#7CC6FF"/><path d="M180,140 l30,20 l-30,20z" fill="#FFD35C"/>` : "") + bub + `</g>` +
        `<circle cx="660" cy="70" r="40" fill="#fff" stroke="${P.accent}" stroke-width="8"/><text x="660" y="84" text-anchor="middle" font-size="44" font-weight="900" font-family="Arial Black, Arial" fill="${P.dark}">${pick(R, ["?", "!", "…"])}</text>` + (R() < .5 ? plant(80, 470) : "");
    }
    default: { // 바깥: park playground field festival outdoor valley mountain camp ski bike
      const snow = c.weather === "snow" || st === "ski";
      let s = skyKid(c);
      if (["mountain", "valley", "camp", "ski"].includes(st)) s += `<path d="M0,380 L180,170 L330,330 L470,140 L650,320 L800,220 V600 H0Z" fill="${snow ? "#F2F6FA" : pick(R, ["#7FBF7A", "#6FAE6A", "#8CC487"])}"/>` + (snow ? "" : `<path d="M180,170 l-40,48 h80z M470,140 l-44,52 h88z" fill="#fff" opacity=".7"/>`);
      s += `<rect x="0" y="440" width="800" height="160" fill="${snow ? "#FFFFFF" : st === "field" ? "#D9B98C" : st === "festival" ? "#C9C2B4" : "#9BD98E"}"/>`;
      if (st === "field") s += `<ellipse cx="400" cy="530" rx="380" ry="60" fill="none" stroke="#fff" stroke-width="8"/><rect x="40" y="120" width="300" height="200" fill="#F2E3CF"/>` + [0, 1, 2, 3].map(i => `<rect x="${60 + i * 70}" y="150" width="46" height="46" fill="#DFF1FF"/>`).join("") + `<path d="M620,440 V330 H760 V440" fill="none" stroke="#fff" stroke-width="10"/>`;
      else if (st === "playground") s += `<path d="M520,450 L520,290 L600,290 L700,450" fill="none" stroke="${pick(R, ["#FF9F7A", "#7CC6FF", "#FFD35C"])}" stroke-width="16" stroke-linejoin="round"/><path d="M120,450 V260 H320 V450" fill="none" stroke="#8A6440" stroke-width="12"/><path d="M180,260 V380 M260,260 V380" stroke="#7A818C" stroke-width="5"/><rect x="165" y="380" width="30" height="10" fill="#FF8FB3"/><rect x="245" y="380" width="30" height="10" fill="#7CC6FF"/><ellipse cx="420" cy="520" rx="120" ry="30" fill="#F2DDB0"/>`;
      else if (st === "festival") {
        for (let i = 0; i < 8; i++) s += `<path d="M${i * 100},70 Q${i * 100 + 50},110 ${i * 100 + 100},70" stroke="#3D4148" stroke-width="3" fill="none"/><circle cx="${i * 100 + 50}" cy="102" r="14" fill="${pick(R, FUN)}"/>`;
        for (let i = 0; i < 16; i++) s += `<circle cx="${20 + i * 52}" cy="${400 + (i % 3) * 8}" r="22" fill="#8A91A0" opacity=".8"/><rect x="${2 + i * 52}" y="${418 + (i % 3) * 8}" width="36" height="40" rx="14" fill="#8A91A0" opacity=".8"/>`;
        if (nt) s += [[160, 170], [420, 130], [640, 190]].map(([x, y]) => [...Array(10)].map((_, k) => `<path d="M${x},${y} l${(Math.cos(k * .63) * 50).toFixed(1)},${(Math.sin(k * .63) * 50).toFixed(1)}" stroke="${pick(R, ["#FFD35C", "#FF8FB3", "#7CC6FF"])}" stroke-width="5" stroke-linecap="round"/>`).join("")).join("");
      }
      else if (st === "valley") s += `<path d="M0,470 Q200,440 400,480 T800,470 V560 Q600,540 400,570 T0,560Z" fill="#5BA7D9"/><path d="M60,500 q30,-10 60,0 M300,520 q30,-10 60,0 M560,505 q30,-10 60,0" stroke="#fff" stroke-width="6" fill="none"/><ellipse cx="660" cy="450" rx="70" ry="30" fill="#A39C90"/><ellipse cx="140" cy="455" rx="60" ry="26" fill="#A39C90"/>`;
      else if (st === "camp") s += `<path d="M480,450 L600,280 L720,450Z" fill="${pick(R, ["#FF9F7A", "#5FB7F5", "#FFD35C"])}"/><path d="M600,280 L600,450 L560,450Z" fill="#fff" opacity=".35"/>` + tree(90, 450, .8);
      else if (st === "ski") s += `<path d="M0,300 L800,520" stroke="#C9D1D9" stroke-width="6"/>` + [0, 1, 2].map(i => `<rect x="${120 + i * 250}" y="${180 + i * 70}" width="10" height="140" fill="#7A818C"/>`).join("") + tree(700, 450, .7, true);
      else if (st === "bike") s += `<path d="M0,470 Q400,430 800,480 L800,560 Q400,510 0,550Z" fill="#C9C2B4"/>` + tree(700, 440, .7, snow);
      else if (st !== "mountain") s += tree(pick(R, [100, 140]), 450, .9 + R() * .2, snow) + tree(pick(R, [680, 720]), 450, .7 + R() * .2, snow) + (st === "park" ? `<rect x="${pick(R, [260, 400])}" y="410" width="150" height="14" rx="6" fill="#C99A6B"/>` : "") + (st === "park" && R() < .5 ? `<rect x="560" y="300" width="10" height="150" fill="#3D4148"/><circle cx="565" cy="295" r="16" fill="${nt ? "#FFF1B0" : "#D6DDE4"}"/>` : "");
      return s;
    }
  }
}

/* 소품 (저·고학년) — 바닥 기준 y */
function propKid(p, c, x) {
  const y = c.base;
  switch (p) {
    case "smoke": return [0, 1, 2, 3].map(i => `<circle cx="${560 + i * 50}" cy="${120 + (i % 2) * 30}" r="${50 - i * 6}" fill="#9AA1AD" opacity=".55"/>`).join("");
    case "campfire": return `<g transform="translate(${x} ${y - 10})"><path d="M-50,0 l100,-14 M-50,-14 l100,14" stroke="#8A6440" stroke-width="12" stroke-linecap="round"/><path d="M-26,-14 q-8,-40 26,-70 q34,30 26,70z" fill="#FF8A3D"/><path d="M-12,-14 q-4,-24 12,-40 q16,16 12,40z" fill="#FFD35C"/></g>`;
    case "dog": return `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="-34" rx="44" ry="26" fill="#E0B27A"/><circle cx="44" cy="-56" r="22" fill="#E0B27A"/><ellipse cx="58" cy="-70" rx="9" ry="14" fill="#B07D4A"/><circle cx="50" cy="-58" r="3" fill="#2B2F36"/><rect x="-34" y="-14" width="10" height="14" fill="#C9965E"/><rect x="20" y="-14" width="10" height="14" fill="#C9965E"/><path d="M-44,-40 q-20,-10 -18,-30" stroke="#E0B27A" stroke-width="8" fill="none" stroke-linecap="round"/></g>`;
    case "lighter": return `<g transform="translate(${x} ${y - 70})"><rect x="0" y="0" width="70" height="12" rx="6" fill="#C99A6B"/><rect x="24" y="-34" width="16" height="34" rx="4" fill="#FF6B6B"/><rect x="26" y="-42" width="12" height="8" fill="#9AA1AD"/></g>`;
    case "cake": return `<g transform="translate(${x} ${y - 60})"><rect x="-50" y="0" width="100" height="16" rx="6" fill="#C99A6B"/><rect x="-40" y="-50" width="80" height="50" rx="8" fill="#FFB4C8"/><rect x="-40" y="-30" width="80" height="8" fill="#fff"/><rect x="-3" y="-72" width="6" height="22" fill="#7CC6FF"/><path d="M0,-84 q-6,8 0,12 q6,-4 0,-12z" fill="#FFB020"/></g>`;
    case "snack": return `<g transform="translate(${x} ${y - 60})"><rect x="-60" y="0" width="120" height="14" rx="6" fill="#C99A6B"/><ellipse cx="0" cy="-4" rx="50" ry="12" fill="#fff"/>` + [-24, 0, 24].map(d => `<circle cx="${d}" cy="-14" r="12" fill="#D9A066"/>`).join("") + `</g>`;
    case "extinguisher": return `<g transform="translate(${x} ${y})"><rect x="-20" y="-110" width="40" height="110" rx="14" fill="#E5484D"/><rect x="-10" y="-130" width="20" height="22" fill="#3D4148"/><path d="M10,-124 q40,0 40,40" stroke="#3D4148" stroke-width="8" fill="none"/></g>`;
    case "kickboard": return `<g transform="translate(${x} ${y})"><rect x="-60" y="-24" width="120" height="12" rx="6" fill="#3D4148"/><path d="M50,-24 L60,-130 H80" stroke="#3D4148" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="-50" cy="-10" r="12" fill="#2B2F36"/><circle cx="54" cy="-10" r="12" fill="#2B2F36"/><rect x="-20" y="-40" width="40" height="16" rx="4" fill="#3DDC84"/></g>`;
    case "wheelchair": return `<g transform="translate(${x} ${y})"><circle cx="0" cy="-46" r="44" fill="none" stroke="#3D4148" stroke-width="10"/><path d="M-30,-120 V-70 H40 V-20" stroke="#5B6170" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="50" cy="-12" r="12" fill="#3D4148"/></g>`;
    case "sign": return `<g transform="translate(${x} ${y})"><rect x="-6" y="-200" width="12" height="200" fill="#7A818C"/><path d="M0,-290 L56,-196 H-56Z" fill="#fff" stroke="#E5484D" stroke-width="14" stroke-linejoin="round"/><circle cx="0" cy="-226" r="12" fill="#2B2F36"/></g>`;
    case "cones": return [0, 1, 2].map(i => `<path d="M${x - 120 + i * 120},${y} l24,-80 l24,80z" fill="#FF8A3D"/><rect x="${x - 124 + i * 120}" y="${y - 50}" width="56" height="10" fill="#fff"/>`).join("");
    case "bicycle": return `<g transform="translate(${x} ${y - 46})"><circle cx="-50" cy="0" r="40" fill="none" stroke="#3D4148" stroke-width="8"/><circle cx="60" cy="0" r="40" fill="none" stroke="#3D4148" stroke-width="8"/><path d="M-50,0 L0,-50 L60,0 M0,-50 L-10,-70 M30,-60 h30" stroke="${c.P.accent}" stroke-width="8" fill="none" stroke-linecap="round"/></g>`;
    case "multitap": return `<g transform="translate(${x} ${y - 14})"><rect x="-70" y="0" width="140" height="28" rx="8" fill="#fff" stroke="#9AA1AD" stroke-width="5"/>` + [-45, -15, 15, 45].map(d => `<circle cx="${d}" cy="14" r="7" fill="#3D4148"/>`).join("") + `<path d="M-45,7 q-30,-60 -90,-50 M-15,7 q0,-80 40,-90 M15,7 q40,-40 90,-40" stroke="#3D4148" stroke-width="5" fill="none"/></g>`;
    case "device": return `<g transform="translate(${x} ${y - 20})"><rect x="-34" y="-12" width="68" height="24" rx="10" fill="#FF8FB3"/><rect x="-46" y="-6" width="14" height="12" fill="#B9C3CC"/></g>`;
    case "gift": return `<g transform="translate(${x} ${y})"><rect x="-40" y="-70" width="80" height="70" rx="6" fill="#FF6B6B"/><rect x="-6" y="-70" width="12" height="70" fill="#FFD35C"/><path d="M0,-70 q-30,-30 -30,0 M0,-70 q30,-30 30,0" stroke="#FFD35C" stroke-width="8" fill="none"/></g>`;
    case "pills": return `<g transform="translate(${x} ${y - 60})"><rect x="-70" y="0" width="140" height="14" rx="6" fill="#C99A6B"/><rect x="-50" y="-44" width="34" height="44" rx="8" fill="#fff" stroke="#A8D8FF" stroke-width="5"/>` + [[10, -10, "#FF8FB3"], [30, -8, "#FFD35C"], [50, -12, "#7CC6FF"]].map(([a, b, col]) => `<ellipse cx="${a}" cy="${b}" rx="10" ry="6" fill="${col}"/>`).join("") + `</g>`;
    case "bottles": return `<g transform="translate(${x} ${y})">` + [0, 1].map(i => `<rect x="${i * 50 - 40}" y="-90" width="40" height="90" rx="10" fill="${["#7CC6FF", "#FFD35C"][i]}"/><rect x="${i * 50 - 30}" y="-110" width="20" height="22" fill="#E5484D"/>`).join("") + `</g>`;
    case "umbrella": return `<g transform="translate(${x} ${y - 230})"><path d="M-70,0 Q0,-80 70,0Z" fill="#3D4148"/><path d="M0,0 V90" stroke="#3D4148" stroke-width="6"/></g>`;
    case "ball": return `<circle cx="${x}" cy="${y - 26}" r="26" fill="#fff" stroke="#2B2F36" stroke-width="5"/><path d="M${x - 14},${y - 40} l14,10 l14,-10 M${x},${y - 30} v18" stroke="#2B2F36" stroke-width="4" fill="none"/>`;
  }
  return "";
}

/* 사람 (저·고학년): 옷·바지·머리 모양·피부색이 장면마다 달라요 */
const SKIN = ["#F6D2B5", "#EBC09A", "#D9A47C", "#F3D7C2", "#C98E66"];
const SHIRTS = ["#FF8A65", "#5FB7F5", "#9C7CF2", "#5DAE8B", "#E8A93A", "#E86A8E", "#4FB3BF", "#F2C94C", "#7D8CF0", "#EF7D57"];
const PANTS = ["#4A5160", "#3B5B8C", "#6B4F3A", "#2F6B5A", "#5B4A7A"];
const ROLE_SHIRT = { stranger: "#7D8590", staff: "#E86A8E", police: "#2E5FA8", doctor: "#FFFFFF", elder: "#A98B6D" };
const ADULTS = ["parent", "teacher", "stranger", "staff", "police", "elder", "doctor"];

function face(cx, cy, r, mood) {
  const e = r * 0.32, ey = cy - r * 0.08, eye = x => `<circle cx="${x}" cy="${ey}" r="${r * 0.09}" fill="#2B2F36"/>`, my = cy + r * 0.35;
  let m;
  if (mood === "happy") m = `<path d="M${cx - r * 0.28},${my - 4} Q${cx},${my + r * 0.28} ${cx + r * 0.28},${my - 4}" stroke="#2B2F36" stroke-width="${r * 0.08}" fill="none" stroke-linecap="round"/>`;
  else if (mood === "sad" || mood === "worried") m = `<path d="M${cx - r * 0.22},${my + 6} Q${cx},${my - r * 0.14} ${cx + r * 0.22},${my + 6}" stroke="#2B2F36" stroke-width="${r * 0.08}" fill="none" stroke-linecap="round"/>`;
  else if (mood === "surprised") m = `<ellipse cx="${cx}" cy="${my}" rx="${r * 0.12}" ry="${r * 0.16}" fill="#2B2F36"/>`;
  else m = `<path d="M${cx - r * 0.2},${my} H${cx + r * 0.2}" stroke="#2B2F36" stroke-width="${r * 0.08}" stroke-linecap="round"/>`;
  const brow = (mood === "worried" || mood === "sad") ? `<path d="M${cx - e - r * 0.12},${ey - r * 0.2} l${r * 0.24},${r * 0.08} M${cx + e + r * 0.12},${ey - r * 0.2} l${-r * 0.24},${r * 0.08}" stroke="#2B2F36" stroke-width="${r * 0.07}" stroke-linecap="round"/>` : mood === "think" ? `<path d="M${cx - e - r * 0.12},${ey - r * 0.22} h${r * 0.24}" stroke="#2B2F36" stroke-width="${r * 0.07}" stroke-linecap="round"/>` : "";
  const cheek = mood === "happy" ? `<circle cx="${cx - r * 0.52}" cy="${cy + r * 0.18}" r="${r * 0.12}" fill="#FF9F9F" opacity=".55"/><circle cx="${cx + r * 0.52}" cy="${cy + r * 0.18}" r="${r * 0.12}" fill="#FF9F9F" opacity=".55"/>` : "";
  return eye(cx - e) + eye(cx + e) + m + brow + cheek;
}
function hair(cx, cy, r, style, col) {
  switch (style) {
    case 1: return `<path d="M${cx - r * 1.05},${cy + r * .6} Q${cx - r * 1.15},${cy - r * 1.2} ${cx},${cy - r * 1.08} Q${cx + r * 1.15},${cy - r * 1.2} ${cx + r * 1.05},${cy + r * .6} L${cx + r * .78},${cy + r * .6} Q${cx + r * .7},${cy - r * .4} ${cx},${cy - r * .55} Q${cx - r * .7},${cy - r * .4} ${cx - r * .78},${cy + r * .6}Z" fill="${col}"/>`;
    case 2: return `<path d="M${cx - r},${cy} Q${cx - r},${cy - r * 1.15} ${cx},${cy - r * 1.05} Q${cx + r},${cy - r * 1.15} ${cx + r},${cy} Q${cx + r * .4},${cy - r * .55} ${cx - r},${cy}Z" fill="${col}"/><circle cx="${cx + r * 1.02}" cy="${cy - r * .5}" r="${r * .34}" fill="${col}"/>`;
    case 3: return [...Array(7)].map((_, i) => `<circle cx="${cx - r * .9 + i * r * .3}" cy="${cy - r * .75 - Math.sin(i / 6 * Math.PI) * r * .25}" r="${r * .3}" fill="${col}"/>`).join("");
    case 4: return `<path d="M${cx - r * 1.05},${cy - r * .35} Q${cx},${cy - r * 1.5} ${cx + r * 1.05},${cy - r * .35}Z" fill="${col}"/><rect x="${cx - r * .1}" y="${cy - r * .45}" width="${r * 1.3}" height="${r * .18}" rx="4" fill="${col}"/>`;
    default: return `<path d="M${cx - r},${cy} Q${cx - r},${cy - r * 1.15} ${cx},${cy - r * 1.05} Q${cx + r},${cy - r * 1.15} ${cx + r},${cy} Q${cx + r * 0.4},${cy - r * 0.55} ${cx - r},${cy}Z" fill="${col}"/>`;
  }
}
function personKid(x, base, role, mood, R, opt = {}) {
  const adult = ADULTS.includes(role), s = (adult ? 1.3 : 1) * (0.94 + R() * 0.12), r = 46 * s, bodyH = 95 * s, legH = 70 * s;
  const cy = base - legH - bodyH - r + 10;
  const skin = pick(R, SKIN), shirt = ROLE_SHIRT[role] || pick(R, SHIRTS), pants = pick(R, PANTS);
  const hairCol = role === "elder" ? "#CFCFCF" : pick(R, ["#3A2A20", "#2B2230", "#5A3A22", "#1F1A18"]);
  const style = role === "police" || role === "stranger" ? 0 : Math.floor(R() * (adult ? 3 : 5));
  let g = `<rect x="${x - 26 * s}" y="${base - legH}" width="${20 * s}" height="${legH}" rx="${9 * s}" fill="${pants}"/><rect x="${x + 6 * s}" y="${base - legH}" width="${20 * s}" height="${legH}" rx="${9 * s}" fill="${pants}"/>`;
  if (!adult && R() < .35 && !opt.indoor) g += `<rect x="${x - 58 * s}" y="${base - legH - bodyH + 16 * s}" width="${30 * s}" height="${60 * s}" rx="${10 * s}" fill="${pick(R, FUN)}"/>`;
  g += `<rect x="${x - 44 * s}" y="${base - legH - bodyH}" width="${88 * s}" height="${bodyH + 8}" rx="${30 * s}" fill="${shirt}" ${role === "doctor" ? `stroke="#CFE3E3" stroke-width="5"` : ""}/>`;
  if (R() < .3 && !ROLE_SHIRT[role]) g += `<rect x="${x - 44 * s}" y="${base - legH - bodyH * .55}" width="${88 * s}" height="${12 * s}" fill="#fff" opacity=".45"/>`;
  const armY = base - legH - bodyH + 24 * s;
  g += `<path d="M${x - 42 * s},${armY} l${-16 * s},${54 * s}" stroke="${skin}" stroke-width="${18 * s}" stroke-linecap="round"/>` + (opt.wave ? `<path d="M${x + 40 * s},${armY} l${40 * s},${-46 * s}" stroke="${skin}" stroke-width="${18 * s}" stroke-linecap="round"/>` : `<path d="M${x + 42 * s},${armY} l${16 * s},${54 * s}" stroke="${skin}" stroke-width="${18 * s}" stroke-linecap="round"/>`);
  if (role === "staff") g += `<rect x="${x - 30 * s}" y="${armY - 4}" width="${60 * s}" height="${bodyH - 14 * s}" rx="${10 * s}" fill="#fff" opacity=".85"/>`;
  if (role === "police") g += `<circle cx="${x - 18 * s}" cy="${armY + 10 * s}" r="${8 * s}" fill="#FFD35C"/>`;
  if (opt.phone) g += `<rect x="${x + 44 * s}" y="${armY + 36 * s}" width="${26 * s}" height="${42 * s}" rx="${5 * s}" fill="#2B2F36"/>`;
  g += `<circle cx="${x}" cy="${cy}" r="${r}" fill="${skin}"/>` + hair(x, cy, r, style, hairCol);
  if (role === "stranger" || role === "police") g += `<path d="M${x - r * 1.05},${cy - r * 0.55} Q${x},${cy - r * 1.5} ${x + r * 1.05},${cy - r * 0.55}Z" fill="${role === "police" ? "#1F3F78" : pick(R, ["#3D4148", "#5B4A3A", "#2F4858"])}"/><rect x="${x - r * 0.2}" y="${cy - r * 0.62}" width="${r * 1.45}" height="${r * 0.16}" rx="4" fill="${role === "police" ? "#1F3F78" : "#3D4148"}"/>`;
  if (role === "teacher" || role === "doctor" || (role === "parent" && R() < .3)) g += `<circle cx="${x - r * 0.32}" cy="${cy - r * 0.08}" r="${r * 0.22}" fill="none" stroke="#2B2F36" stroke-width="4"/><circle cx="${x + r * 0.32}" cy="${cy - r * 0.08}" r="${r * 0.22}" fill="none" stroke="#2B2F36" stroke-width="4"/>`;
  g += face(x, cy, r, mood);
  if (opt.mask) g += `<rect x="${x - r * .5}" y="${cy + r * .1}" width="${r}" height="${r * .55}" rx="${r * .2}" fill="#fff" stroke="#D6DDE4" stroke-width="3"/>`;
  return { svg: g, headTop: cy - r, cx: x };
}
function bubble(x, y, sym, kid, C) {
  const fill = kid ? "#fff" : "#1D2128", stroke = kid ? "#2B2F36" : C.acc, tc = kid ? "#2B2F36" : C.acc, w = 110, h = 80;
  return `<g><path d="M${x - w / 2},${y - h} h${w} a20,20 0 0 1 20,20 v${h - 40} a20,20 0 0 1 -20,20 h-${w / 2 - 14} l-18,22 l-2,-22 h-${w / 2 - 16} a20,20 0 0 1 -20,-20 v-${h - 40} a20,20 0 0 1 20,-20z" fill="${fill}" stroke="${stroke}" stroke-width="6"/>` +
    `<text x="${x + 10}" y="${y - h / 2 + 12}" text-anchor="middle" font-size="50" font-weight="900" font-family="Arial Black, Arial, sans-serif" fill="${tc}">${sym}</text></g>`;
}

/* ---------------- 청소년 그림 (선) ---------------- */
function bgTeen(st, C, c) {
  const L = `stroke="${C.line}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"`, A = `stroke="${C.acc}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"`, R = c.R;
  let s = `<rect width="800" height="800" fill="${night(c) ? "#101218" : "#16181E"}"/>`;
  const gs = pick(R, [80, 100, 120]);
  for (let i = 1; i * gs < 800; i++) s += `<path d="M${i * gs},0V800M0,${i * gs}H800" stroke="#1E2128" stroke-width="2"/>`;
  if (night(c)) s += `<circle cx="${600 + R() * 120}" cy="110" r="34" ${A}/>`;
  s += `<path d="M40,640 H760" ${L}/>`;
  const win = (x, y) => `<rect x="${x}" y="${y}" width="190" height="150" rx="8" ${L}/><path d="M${x + 95},${y} V${y + 150} M${x},${y + 75} H${x + 190}" ${L}/>`;
  const rainSnow = () => (c.weather === "rain" || c.weather === "storm" ? [...Array(24)].map((_, i) => `<path d="M${(i * 71) % 760 + 20},${(i * 43) % 360 + 60} l-10,26" ${A}/>`).join("") : "") + (c.weather === "snow" || st === "ski" ? [...Array(24)].map((_, i) => `<circle cx="${(i * 83) % 760 + 20}" cy="${(i * 47) % 380 + 60}" r="6" fill="${C.acc}"/>`).join("") : "");
  switch (st) {
    case "home": s += win(pick(R, [520, 90]), 170) + `<rect x="${pick(R, [80, 560])}" y="300" width="130" height="340" ${L}/>` + pick(R, [`<path d="M300,560 h240 v80 M300,560 v80" ${L}/>`, `<rect x="300" y="520" width="260" height="120" rx="20" ${L}/>`, `<path d="M320,560 h200 M340,560 v80 M500,560 v80" ${L}/>`]); break;
    case "kitchen": s += win(90, 170) + `<rect x="440" y="470" width="280" height="170" ${L}/><circle cx="520" cy="470" r="24" ${A}/><circle cx="640" cy="470" r="24" ${L}/>`; break;
    case "bathroom": for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) s += `<rect x="${60 + i * 115}" y="${80 + j * 110}" width="100" height="96" rx="6" stroke="#262A33" stroke-width="3" fill="none"/>`; s += `<rect x="90" y="420" width="160" height="80" rx="18" ${L}/><path d="M170,500 V640" ${L}/><rect x="440" y="500" width="300" height="140" rx="40" ${L}/>`; break;
    case "library": s += [0, 1, 2].map(k => `<rect x="${60 + k * 240}" y="140" width="200" height="300" ${L}/><path d="M${60 + k * 240},240 h200 M${60 + k * 240},340 h200" ${L}/>`).join("") + `<path d="M140,560 h520" ${A}/>`; break;
    case "center": case "office": case "meeting": s += win(pick(R, [520, 300]), 150) + `<rect x="70" y="200" width="160" height="440" ${L}/><path d="M70,330 h160 M70,460 h160" ${L}/>` + (st === "meeting" ? `<rect x="280" y="160" width="300" height="180" rx="10" ${A}/>` : st === "office" ? `<rect x="300" y="520" width="260" height="120" rx="40" ${L}/>` : `<path d="M320,560 h220" ${L}/>`); break;
    case "school": s += `<rect x="170" y="140" width="460" height="230" rx="10" ${L}/><path d="M220,210 h160 M220,270 h240" ${A}/>` + (c.weather === "quake" ? `<path d="M120,120 l-20,10 M680,120 l20,10 M100,400 q-14,10 0,20" ${A}/>` : ""); break;
    case "cafeteria": s += `<rect x="80" y="200" width="640" height="120" rx="10" ${L}/><path d="M120,560 h560" ${L}/>`; break;
    case "pool": s += `<rect x="40" y="420" width="720" height="140" rx="10" ${L}/><path d="M60,470 q40,-14 80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0" ${A}/>` + [0, 1, 2, 3].map(i => `<rect x="${80 + i * 170}" y="120" width="140" height="240" rx="6" ${L}/>`).join(""); break;
    case "locker": s += [...Array(6)].map((_, i) => `<rect x="${50 + i * 118}" y="120" width="104" height="420" rx="6" ${L}/><path d="M${140 + i * 118},300 v40" ${A}/>`).join("") + `<path d="M180,600 h440" ${L}/>`; break;
    case "elevator": s += `<rect x="120" y="120" width="560" height="520" rx="8" ${L}/><path d="M400,120 V640" ${L}/><rect x="620" y="300" width="40" height="120" rx="8" ${A}/>`; break;
    case "stairs": s += [...Array(5)].map((_, i) => `<path d="M${400 + i * 70},${640 - i * 60} h70 v-60" ${L}/>`).join("") + `<rect x="90" y="180" width="160" height="80" rx="10" ${A}/>`; break;
    case "mart": case "clinic": case "store": for (let k = 0; k < 2; k++) { s += `<rect x="${70 + k * 440}" y="160" width="260" height="480" ${L}/>`; for (let r = 1; r < 4; r++) s += `<path d="M${70 + k * 440},${160 + r * 120} h260" ${L}/>`; } if (st === "clinic") s += `<path d="M400,120 v80 M360,160 h80" ${A}/>`; if (st === "store") s += `<path d="M40,130 H760" ${A}/>`; break;
    case "alley": s += `<path d="M220,0 V640 M580,0 V640" ${L}/><path d="M540,640 V300" ${L}/><circle cx="540" cy="290" r="18" ${A}/>` + rainSnow(); break;
    case "parking": s += [0, 1, 2, 3].map(i => `<path d="M${60 + i * 220},640 v-140" ${L}/>`).join("") + `<rect x="90" y="520" width="180" height="80" rx="26" ${L}/><rect x="530" y="520" width="180" height="80" rx="26" ${L}/><path d="M40,140 H760" ${L}/>`; break;
    case "station": s += `<path d="M100,640 V260 L400,160 L700,260 V640" ${L}/><circle cx="400" cy="300" r="40" ${A}/>` + rainSnow(); break;
    case "subway": s += `<rect x="60" y="140" width="680" height="380" rx="20" ${L}/>` + [0, 1, 2].map(i => `<rect x="${100 + i * 220}" y="180" width="170" height="130" rx="14" ${L}/>`).join("") + `<path d="M60,440 h680" ${A}/>`; break;
    case "car": s += `<path d="M60,340 Q400,200 740,340" ${L}/><rect x="140" y="400" width="200" height="240" rx="50" ${L}/><rect x="460" y="400" width="200" height="240" rx="50" ${L}/>`; break;
    case "street": case "bus": case "van":
      s += `<path d="M40,560 H760" ${L}/>`;
      if (st === "street") s += [...Array(6)].map((_, i) => `<path d="M${260 + i * 50},590 v40" stroke="${C.line}" stroke-width="18"/>`).join("") + `<rect x="640" y="220" width="70" height="140" rx="12" ${L}/><circle cx="675" cy="260" r="16" ${c.light === "green" ? L : A}/><circle cx="675" cy="320" r="16" ${c.light === "green" ? A : L}/><path d="M675,360 V560" ${L}/>`;
      s += st === "bus" ? `<rect x="80" y="300" width="380" height="220" rx="30" ${L}/><path d="M110,340 h320 v80 h-320z" ${L}/>` : st === "van" ? `<rect x="200" y="360" width="420" height="190" rx="40" ${A}/>` : (c.car !== false ? `<rect x="${pick(R, [70, 520])}" y="470" width="200" height="80" rx="26" ${L}/>` : "");
      s += rainSnow(); break;
    case "karaoke": s += `<rect x="200" y="120" width="400" height="240" rx="12" ${A}/><rect x="80" y="500" width="640" height="100" rx="30" ${L}/>` + [...Array(8)].map((_, i) => `<circle cx="${80 + i * 90}" cy="70" r="6" fill="${C.acc}"/>`).join(""); break;
    case "online": case "game": s += `<rect x="420" y="120" width="300" height="480" rx="40" ${L}/>` + [...Array(4)].map((_, i) => { const mine = R() < .5, w = 120 + R() * 80; return `<rect x="${mine ? 690 - w : 450}" y="${200 + i * 70}" width="${w}" height="44" rx="20" ${mine ? A : L}/>`; }).join("") + (st === "game" ? `<path d="M470,500 h200 v70 h-200z" ${L}/>` : "") + `<circle cx="700" cy="120" r="40" ${A}/><text x="700" y="136" text-anchor="middle" font-size="44" font-weight="900" font-family="Arial Black, Arial" fill="${C.acc}">${pick(R, ["?", "!", "…"])}</text>`; break;
    default: {
      const w = c.weather;
      if (["mountain", "valley", "camp", "ski"].includes(st)) s += `<path d="M40,520 L220,300 L380,460 L540,260 L760,500" ${L}/>`;
      if (st === "field") s += `<ellipse cx="400" cy="600" rx="340" ry="60" ${L}/><path d="M620,640 V520 H740 V640" ${L}/>`;
      else if (st === "festival") s += [...Array(8)].map((_, i) => `<circle cx="${70 + i * 95}" cy="${120 + (i % 2) * 20}" r="10" ${A}/>`).join("") + `<path d="M40,110 Q400,180 760,110" ${L}/>` + [...Array(9)].map((_, i) => `<circle cx="${60 + i * 85}" cy="560" r="20" ${L}/>`).join("");
      else if (st === "valley") s += `<path d="M40,600 Q240,570 400,610 T760,600" ${A}/>`;
      else if (st === "camp") s += `<path d="M480,640 L600,460 L720,640" ${L}/>`;
      else if (st === "playground") s += `<path d="M520,640 L520,470 L600,470 L700,640" ${L}/><path d="M120,640 V430 H320 V640" ${L}/>`;
      else if (st === "ski") s += `<path d="M40,420 L760,620" ${A}/>`;
      else if (st !== "mountain") s += `<path d="M120,640 V470" ${L}/><circle cx="120" cy="420" r="70" ${L}/><path d="M680,640 V500" ${L}/><circle cx="680" cy="455" r="55" ${L}/>`;
      if (w === "sun" || w === "heat") s += `<circle cx="640" cy="150" r="${w === "heat" ? 64 : 46}" ${A}/>`;
      s += rainSnow();
      if (w === "dust") s += `<rect width="800" height="800" fill="${C.acc}" opacity=".08"/>`;
      if (w === "quake") s += `<path d="M300,800 L340,700 L310,660 L360,640" ${A}/>`;
    }
  }
  return s;
}
function propTeen(p, C, x) {
  const A = `stroke="${C.acc}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"`, L = `stroke="${C.line}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (p) {
    case "smoke": return [0, 1, 2].map(i => `<circle cx="${560 + i * 60}" cy="${180 + (i % 2) * 30}" r="${44 - i * 6}" ${L}/>`).join("");
    case "campfire": return `<path d="M${x - 40},640 l80,-14 M${x - 40},626 l80,14" ${L}/><path d="M${x - 22},626 q-8,-40 22,-70 q30,30 22,70z" ${A}/>`;
    case "dog": return `<ellipse cx="${x}" cy="606" rx="44" ry="26" ${L}/><circle cx="${x + 46}" cy="580" r="20" ${L}/>`;
    case "extinguisher": return `<rect x="${x - 20}" y="520" width="40" height="120" rx="14" ${A}/>`;
    case "kickboard": return `<path d="M${x - 60},620 h120 M${x + 50},620 L${x + 60},500 H${x + 80}" ${A}/><circle cx="${x - 50}" cy="630" r="10" ${L}/><circle cx="${x + 54}" cy="630" r="10" ${L}/>`;
    case "wheelchair": return `<circle cx="${x}" cy="596" r="44" ${A}/>`;
    case "cones": return [0, 1, 2].map(i => `<path d="M${x - 110 + i * 110},640 l22,-70 l22,70z" ${A}/>`).join("");
    case "bicycle": return `<circle cx="${x - 50}" cy="600" r="40" ${L}/><circle cx="${x + 60}" cy="600" r="40" ${L}/><path d="M${x - 50},600 L${x},550 L${x + 60},600" ${A}/>`;
    case "cake": case "snack": case "pills": case "lighter": case "device": case "multitap": case "gift": case "bottles": return `<rect x="${x - 50}" y="600" width="100" height="40" rx="8" ${A}/>`;
    case "sign": return `<path d="M${x},640 V440 M${x},340 L${x + 56},430 H${x - 56}Z" ${A}/>`;
    case "umbrella": return `<path d="M${x - 70},420 Q${x},340 ${x + 70},420Z M${x},420 V500" ${A}/>`;
    case "ball": return `<circle cx="${x}" cy="614" r="26" ${A}/>`;
  }
  return "";
}
function personTeen(x, base, role, C, R, opt = {}) {
  const adult = ADULTS.includes(role), s = (adult ? 1.18 : 1.05) * (0.95 + R() * 0.1), r = 44 * s, bodyH = 150 * s, cy = base - bodyH - r - 6;
  const col = opt.main ? C.acc : role === "stranger" ? "#5B6170" : pick(R, ["#8A91A0", "#7C8596", "#969CAB", "#6F7787"]);
  let g = `<path d="M${x - 62 * s},${base} Q${x - 62 * s},${base - bodyH} ${x},${base - bodyH} Q${x + 62 * s},${base - bodyH} ${x + 62 * s},${base}Z" fill="${col}" opacity="${opt.main ? 1 : .9}"/>`;
  g += `<circle cx="${x}" cy="${cy}" r="${r}" fill="${col}"/>`;
  const st = adult ? 0 : Math.floor(R() * 4);
  if (st === 1) g += `<path d="M${x - r * 1.15},${cy + r * .9} Q${x - r * 1.3},${cy - r * 1.3} ${x},${cy - r * 1.2} Q${x + r * 1.3},${cy - r * 1.3} ${x + r * 1.15},${cy + r * .9}" fill="none" stroke="${col}" stroke-width="${r * .35}" opacity=".8"/>`;
  if (st === 2) g += `<rect x="${x + 40 * s}" y="${base - bodyH * .85}" width="${34 * s}" height="${70 * s}" rx="10" fill="#3A3F4A"/>`;
  if (st === 3) g += `<path d="M${x - r},${cy + r * .2} Q${x - r * 1.2},${cy + r * 1.6} ${x - r * .6},${cy + r * 1.7} M${x + r},${cy + r * .2} Q${x + r * 1.2},${cy + r * 1.6} ${x + r * .6},${cy + r * 1.7}" stroke="${col}" stroke-width="${r * .3}" fill="none"/>`;
  if (role === "stranger") g += `<path d="M${x - r * 1.05},${cy - r * 0.45} Q${x},${cy - r * 1.4} ${x + r * 1.05},${cy - r * 0.45}Z" fill="#3A3F4A"/>`;
  if (role === "police") g += `<rect x="${x - r}" y="${cy - r * 1.05}" width="${r * 2}" height="${r * 0.4}" rx="6" fill="#3A5A9A"/>`;
  if (role === "doctor" || role === "staff") g += `<rect x="${x - 18 * s}" y="${base - bodyH * .8}" width="${36 * s}" height="${bodyH * .7}" rx="8" fill="#E6E8EC" opacity=".5"/>`;
  if (opt.phone) g += `<rect x="${x + 34 * s}" y="${base - bodyH * 0.62}" width="${30 * s}" height="${50 * s}" rx="6" fill="#16181E" stroke="${C.acc}" stroke-width="4"/>`;
  return { svg: g, headTop: cy - r, cx: x };
}

/* ---------------- 조합 ---------------- */
// spec: { setting, cast:[{role, mood, bubble?, phone?, wave?, mask?}], props?:[], weather?, time?(day|evening|night), light?, car?, zone? }
const ONLINE = ["online", "game"];
function sceneSvg(spec, color, level, seed) {
  const teen = level === "teen", R = rng(seed + "|" + (spec.title || ""));
  const setting = SETTINGS.includes(spec.setting) ? spec.setting : "center";
  const cast = (spec.cast || [{ role: "child", mood: "think" }]).slice(0, 4);
  const props = (spec.props || []).filter(p => PROPS.includes(p));
  const c = { R, weather: spec.weather, time: spec.time, light: spec.light, car: spec.car, zone: spec.zone };
  const online = ONLINE.includes(setting), fixed = ["bus", "van", "street"].includes(setting), flip = !online && !fixed && R() < .5;
  if (!teen) {
    c.P = { wall: R() < .4 ? tint(color, 0.95) : pick(R, WALLS), floor: pick(R, FLOORS), accent: color, dark: ink(color) };
    const base = { street: 425, store: 560, station: 560, bus: 520, van: 560, pool: 560, elevator: 560, subway: 560, car: 590, karaoke: 560, alley: 560, parking: 560 }[setting] || 545;
    c.base = base;
    const span = online ? [110, 360] : setting === "street" ? [300, 600] : setting === "bus" ? [80, 250] : setting === "van" ? [70, 250] : setting === "car" ? [230, 570] : setting === "alley" ? [290, 510] : [140, 660];
    let xs = cast.length === 1 ? [online ? 230 : setting === "alley" ? 400 : 300 + R() * 200] : cast.map((_, i) => span[0] + (span[1] - span[0]) * i / (cast.length - 1) + (R() - .5) * 40);
    if (flip) xs = xs.map(x => 800 - x);
    const free = Math.min(...xs) > 260 ? 140 : Math.max(...xs) < 540 ? 660 : 400;
    let people = "", bubbles = "";
    cast.forEach((p, i) => { const q = personKid(xs[i], base, p.role || "child", p.mood || "neutral", R, { ...p, indoor: INDOOR.includes(setting) }); people += q.svg; if (p.bubble) bubbles += bubble(q.cx + 40, q.headTop - 10, p.bubble, true); });
    const back = props.filter(p => p === "smoke").map(p => propKid(p, c, free)).join("");
    const front = props.filter(p => p !== "smoke").map((p, i) => propKid(p, c, i % 2 ? 800 - free : free)).join("");
    const dark = night(c) && !online ? `<rect width="800" height="600" fill="#0E1733" opacity="${INDOOR.includes(setting) ? .18 : .28}"/>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">${bgKid(setting, c)}${weatherKid(c)}${back}${dark}${front}${people}${bubbles}</svg>`;
  }
  const C = { acc: light(color), line: pick(R, ["#3A3F4A", "#363B47", "#3F4450"]) };
  const base = 640, span = online ? [110, 340] : [150, 650];
  let xs = cast.length === 1 ? [online ? 220 : 280 + R() * 240] : cast.map((_, i) => span[0] + (span[1] - span[0]) * i / (cast.length - 1) + (R() - .5) * 40);
  if (flip) xs = xs.map(x => 800 - x);
  const free = Math.min(...xs) > 260 ? 140 : Math.max(...xs) < 540 ? 660 : 400;
  let people = "", bubbles = "";
  cast.forEach((p, i) => { const q = personTeen(xs[i], base, p.role || "teen", C, R, { ...p, main: i === 0 }); people += q.svg; if (p.bubble) bubbles += bubble(q.cx + 40, q.headTop - 12, p.bubble, false, C); });
  const pr = props.map((p, i) => propTeen(p, C, i % 2 ? 800 - free : free)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">${bgTeen(setting, C, c)}${pr}${people}${bubbles}</svg>`;
}

module.exports = { sceneSvg, SETTINGS, ROLES, MOODS, PROPS };
