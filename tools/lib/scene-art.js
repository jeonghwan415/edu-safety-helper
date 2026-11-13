// 상황 장면 그림(SVG): 장소(setting) + 등장인물(cast)을 조합해서 그려요.
// 저·고학년: 밝은 색, 둥근 얼굴(표정 있음) · 청소년: 어두운 바탕, 얼굴 없는 실루엣(유치하지 않게)
// 규칙: 그림 안에 글자 넣지 않기(기호 ? ! … 만), 무섭거나 자극적인 장면 금지, 실존 캐릭터 금지
const { tint, ink, light } = require("./common");

const SETTINGS = ["home", "mart", "street", "school", "center", "park", "online", "bus", "kitchen", "outdoor", "clinic", "game", "bike", "stairs"];
const ROLES = ["child", "friend", "friend2", "parent", "teacher", "stranger", "staff", "police", "elder", "teen", "doctor"];
const MOODS = ["happy", "worried", "think", "surprised", "neutral", "sad"];

function rng(seed) { let h = 2166136261; for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 10000) / 10000; }

/* ---------------- 장소 (800×600 기준, 바닥선 y=520) ---------------- */
function bgKid(setting, P, opt) {
  const floor = `<rect x="0" y="470" width="800" height="130" fill="${P.floor}"/>`;
  const wall = c => `<rect width="800" height="470" fill="${c}"/>`;
  const win = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#DFF1FF" stroke="#fff" stroke-width="10"/><path d="M${x + w / 2},${y}V${y + h}M${x},${y + h / 2}H${x + w}" stroke="#fff" stroke-width="8"/>`;
  switch (setting) {
    case "home": return wall(P.wall) + win(520, 90, 200, 150) +
      `<rect x="80" y="150" width="120" height="320" rx="8" fill="#C99A6B"/><circle cx="182" cy="320" r="8" fill="#8A6440"/>` +
      `<rect x="300" y="370" width="230" height="100" rx="30" fill="${P.accent}" opacity=".55"/><rect x="290" y="340" width="40" height="130" rx="18" fill="${P.accent}" opacity=".7"/><rect x="500" y="340" width="40" height="130" rx="18" fill="${P.accent}" opacity=".7"/>` + floor;
    case "kitchen": return wall("#FFF4E3") + win(80, 80, 180, 140) +
      `<rect x="430" y="300" width="300" height="170" rx="10" fill="#E9E2D6"/><rect x="430" y="280" width="300" height="26" rx="6" fill="#CFC6B8"/>` +
      `<circle cx="510" cy="293" r="26" fill="#3D4148"/><circle cx="640" cy="293" r="26" fill="#3D4148"/><rect x="470" y="250" width="80" height="34" rx="8" fill="#9AA1AD"/><rect x="545" y="262" width="50" height="8" rx="4" fill="#9AA1AD"/>` +
      (opt.alert ? `<path d="M505,240 q-14,-22 4,-40 q2,18 14,12 q8,-16 -2,-34 q30,18 18,52 q-6,14 -34,10z" fill="#FF8A3D"/><path d="M520,180 q-20,-30 0,-60 M560,190 q-20,-30 0,-60" stroke="#B9BEC6" stroke-width="10" fill="none" stroke-linecap="round" opacity=".8"/>` : "") + floor;
    case "mart": {
      let s = wall("#FFF8EC");
      for (let k = 0; k < 2; k++) {
        const x = 60 + k * 440;
        s += `<rect x="${x}" y="90" width="290" height="380" rx="8" fill="#E6DCCB"/>`;
        for (let r = 0; r < 4; r++) {
          s += `<rect x="${x}" y="${150 + r * 85}" width="290" height="10" fill="#C8BBA5"/>`;
          for (let i = 0; i < 6; i++) s += `<rect x="${x + 10 + i * 46}" y="${100 + r * 85}" width="36" height="50" rx="6" fill="${["#FF9F7A", "#7CC6FF", "#FFD35C", "#8EDB9B", "#C9A8FF", "#FF8FB3"][(i + r + k) % 6]}"/>`;
        }
      }
      return s + floor + `<g transform="translate(360 400)"><rect x="0" y="0" width="90" height="60" rx="6" fill="none" stroke="#7A818C" stroke-width="7"/><circle cx="15" cy="78" r="10" fill="#7A818C"/><circle cx="78" cy="78" r="10" fill="#7A818C"/></g>`;
    }
    case "street": {
      let s = `<rect width="800" height="420" fill="#DDF0FF"/><rect x="0" y="210" width="800" height="210" fill="#EAE4D8"/>` +
        `<rect x="40" y="110" width="160" height="220" fill="#F2C7A5"/><rect x="230" y="70" width="140" height="260" fill="#C9D8F2"/><rect x="620" y="120" width="150" height="210" fill="#D9C9F2"/>`;
      for (let i = 0; i < 6; i++) s += `<rect x="${60 + (i % 3) * 45}" y="${140 + Math.floor(i / 3) * 70}" width="30" height="40" fill="#fff" opacity=".8"/>`;
      s += `<rect x="0" y="420" width="800" height="180" fill="#5A606B"/>`;
      for (let i = 0; i < 7; i++) s += `<rect x="${250 + i * 46}" y="430" width="28" height="160" fill="#fff" opacity=".92"/>`;
      s += `<rect x="700" y="230" width="14" height="200" fill="#3D4148"/><rect x="680" y="200" width="54" height="110" rx="10" fill="#2B2F36"/><circle cx="707" cy="228" r="14" fill="${opt.light === "green" ? "#555" : "#FF5A5A"}"/><circle cx="707" cy="280" r="14" fill="${opt.light === "green" ? "#3DDC84" : "#555"}"/>`;
      if (opt.car !== false) s += `<g transform="translate(20 470)"><rect x="0" y="20" width="190" height="60" rx="22" fill="#FF7A6B"/><path d="M35,22 L60,-12 H140 L165,22Z" fill="#FF7A6B"/><path d="M62,18 L76,-4 H128 L142,18Z" fill="#DDF0FF"/><circle cx="45" cy="84" r="20" fill="#2B2F36"/><circle cx="150" cy="84" r="20" fill="#2B2F36"/></g>`;
      return s;
    }
    case "school": return wall("#EEF6EA") + `<rect x="150" y="70" width="500" height="230" rx="12" fill="#2F5D4B" stroke="#C99A6B" stroke-width="14"/>` +
      `<path d="M200,140 h140 M200,190 h220 M200,240 h100" stroke="#E9F2EC" stroke-width="8" stroke-linecap="round" opacity=".5"/>` +
      `<rect x="80" y="400" width="200" height="16" rx="6" fill="#C99A6B"/><rect x="520" y="400" width="200" height="16" rx="6" fill="#C99A6B"/>` + floor;
    case "center": return wall("#FFF3F6") + win(560, 80, 170, 130) +
      `<rect x="60" y="120" width="190" height="350" rx="8" fill="#E8D5C0"/>` + [0, 1, 2].map(r => `<rect x="60" y="${200 + r * 90}" width="190" height="10" fill="#CDB59A"/>` + [0, 1, 2, 3, 4].map(i => `<rect x="${70 + i * 34}" y="${140 + r * 90}" width="24" height="60" rx="3" fill="${["#7CC6FF", "#FF9F7A", "#8EDB9B", "#FFD35C", "#C9A8FF"][(i + r) % 5]}"/>`).join("")).join("") +
      `<rect x="330" y="400" width="300" height="18" rx="8" fill="#C99A6B"/><rect x="350" y="418" width="14" height="52" fill="#B08560"/><rect x="596" y="418" width="14" height="52" fill="#B08560"/>` + floor;
    case "park": case "outdoor": {
      const w = opt.weather || "sun";
      const sky = { sun: "#CFEAFF", rain: "#C9D2DC", snow: "#E6EEF5", heat: "#FFE2B8", dust: "#E8DEC8", storm: "#B8C3CF", quake: "#DDEBF5" }[w] || "#CFEAFF";
      let s = `<rect width="800" height="600" fill="${sky}"/>`;
      if (w === "sun" || w === "heat") s += `<circle cx="680" cy="100" r="${w === "heat" ? 70 : 52}" fill="${w === "heat" ? "#FF9D3B" : "#FFD35C"}"/>`;
      if (w === "dust") s += `<rect width="800" height="600" fill="#C8B48A" opacity=".35"/>` + [...Array(40)].map((_, i) => `<circle cx="${(i * 97) % 800}" cy="${(i * 53) % 470}" r="5" fill="#A89262" opacity=".5"/>`).join("");
      s += `<rect x="0" y="440" width="800" height="160" fill="${w === "snow" ? "#FFFFFF" : "#9BD98E"}"/>`;
      s += `<rect x="90" y="300" width="22" height="150" fill="#8A6440"/><circle cx="101" cy="280" r="70" fill="${w === "snow" ? "#EAF2F7" : "#5DBB6B"}"/><rect x="690" y="320" width="20" height="130" fill="#8A6440"/><circle cx="700" cy="300" r="58" fill="${w === "snow" ? "#EAF2F7" : "#6CC779"}"/>`;
      if (setting === "park") s += `<path d="M560,450 L560,300 L640,300 L700,450" fill="none" stroke="#FF9F7A" stroke-width="14" stroke-linejoin="round"/><rect x="250" y="410" width="150" height="14" rx="6" fill="#C99A6B"/>`;
      if (w === "rain" || w === "storm") s += [...Array(36)].map((_, i) => `<path d="M${(i * 71) % 800},${(i * 37) % 420} l-12,30" stroke="#5B8FCB" stroke-width="5" stroke-linecap="round" opacity=".7"/>`).join("") + `<ellipse cx="200" cy="70" rx="150" ry="50" fill="#8E99A6"/><ellipse cx="520" cy="60" rx="180" ry="55" fill="#9AA5B1"/>`;
      if (w === "snow") s += [...Array(40)].map((_, i) => `<circle cx="${(i * 83) % 800}" cy="${(i * 47) % 430}" r="7" fill="#fff"/>`).join("");
      if (w === "quake") s += `<path d="M300,600 L340,520 L310,480 L360,440" fill="none" stroke="#7A6248" stroke-width="8" stroke-linejoin="round"/>`;
      return s;
    }
    case "bus": return `<rect width="800" height="600" fill="#DDF0FF"/><rect x="0" y="430" width="800" height="170" fill="#5A606B"/><rect x="0" y="420" width="800" height="24" fill="#B9BEC6"/>` +
      `<g transform="translate(330 150)"><rect x="0" y="0" width="440" height="260" rx="30" fill="#3DA35D"/>` + [0, 1, 2, 3].map(i => `<rect x="${24 + i * 100}" y="30" width="80" height="90" rx="10" fill="#DFF1FF"/>`).join("") +
      `<rect x="24" y="140" width="70" height="120" rx="8" fill="#2B7A45"/><circle cx="90" cy="275" r="32" fill="#2B2F36"/><circle cx="360" cy="275" r="32" fill="#2B2F36"/></g>` +
      `<rect x="70" y="180" width="12" height="240" fill="#3D4148"/><rect x="40" y="150" width="72" height="60" rx="8" fill="#2E6FD1"/>`;
    case "clinic": return wall("#EEF7F7") + `<rect x="520" y="100" width="210" height="300" rx="10" fill="#fff" stroke="#CFE3E3" stroke-width="8"/>` +
      [0, 1, 2].map(r => `<rect x="520" y="${180 + r * 80}" width="210" height="8" fill="#CFE3E3"/>` + [0, 1, 2, 3].map(i => `<rect x="${535 + i * 48}" y="${125 + r * 80}" width="30" height="52" rx="6" fill="${["#FFB4A8", "#A8D8FF", "#FFE08A", "#B8E6C1"][(i + r) % 4]}"/>`).join("")).join("") +
      `<rect x="110" y="90" width="110" height="110" rx="20" fill="#fff"/><path d="M165,110 V180 M130,145 H200" stroke="#3DBE8B" stroke-width="22" stroke-linecap="round"/>` + floor;
    case "stairs": return wall("#F3F0EA") + [...Array(6)].map((_, i) => `<rect x="${380 + i * 60}" y="${470 - (i + 1) * 50}" width="${420 - i * 60}" height="50" fill="${i % 2 ? "#D9D2C6" : "#E4DED3"}"/>`).join("") +
      `<rect x="80" y="120" width="140" height="70" rx="10" fill="#3DBE5B"/><path d="M110,170 l20,-30 l20,30 M175,140 h25 l-10,-10 M200,140 l-10,10" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>` + floor;
    case "bike": return `<rect width="800" height="600" fill="#D8EEFF"/><rect x="0" y="400" width="800" height="200" fill="#9BD98E"/><path d="M0,470 Q400,430 800,480 L800,560 Q400,510 0,550Z" fill="#C9C2B4"/>` +
      `<circle cx="680" cy="110" r="46" fill="#FFD35C"/><rect x="80" y="300" width="18" height="110" fill="#8A6440"/><circle cx="89" cy="280" r="54" fill="#5DBB6B"/>`;
    case "online": case "game": {
      const g = setting === "game";
      return `<rect width="800" height="600" fill="${g ? "#E9E4FF" : "#EAF3FF"}"/>` + floor.replace(P.floor, "#D9D2E9") +
        `<g transform="translate(420 60)"><rect x="0" y="0" width="300" height="440" rx="40" fill="#2B2F36"/><rect x="18" y="40" width="264" height="360" rx="16" fill="${g ? "#1D1A33" : "#fff"}"/>` +
        (g ? `<rect x="40" y="80" width="220" height="160" rx="12" fill="#3B2F7A"/><circle cx="110" cy="160" r="28" fill="#7CC6FF"/><path d="M180,140 l30,20 l-30,20z" fill="#FFD35C"/>` : "") +
        `<rect x="${g ? 36 : 36}" y="${g ? 262 : 70}" width="150" height="38" rx="18" fill="${g ? "#4B4170" : "#E3E8F0"}"/><rect x="${g ? 36 : 36}" y="${g ? 310 : 125}" width="110" height="38" rx="18" fill="${g ? "#4B4170" : "#E3E8F0"}"/>` +
        (g ? "" : `<rect x="110" y="185" width="150" height="38" rx="18" fill="#BFE3C8"/><rect x="36" y="240" width="170" height="38" rx="18" fill="#E3E8F0"/>`) +
        `<circle cx="150" cy="${g ? 380 : 340}" r="0"/></g>` +
        `<circle cx="660" cy="70" r="40" fill="#fff" stroke="${P.accent}" stroke-width="8"/><text x="660" y="84" text-anchor="middle" font-size="44" font-weight="900" font-family="Arial Black, Arial" fill="${P.dark}">?</text>`;
    }
    default: return wall(P.wall) + floor;
  }
}

function bgTeen(setting, C, opt) {
  // 청소년: 어두운 바탕 + 선으로 된 장소 (단순한 기하학)
  const st = `stroke="${C.line}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  const acc = `stroke="${C.acc}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  let s = `<rect width="800" height="800" fill="#16181E"/>`;
  for (let i = 1; i < 8; i++) s += `<path d="M${i * 100},0V800M0,${i * 100}H800" stroke="#1E2128" stroke-width="2"/>`;
  s += `<path d="M40,640 H760" ${st}/>`;
  switch (setting) {
    case "home": case "kitchen": s += `<rect x="520" y="180" width="200" height="160" rx="8" ${st}/><path d="M620,180 V340 M520,260 H720" ${st}/><rect x="80" y="260" width="130" height="380" ${st}/>` + (setting === "kitchen" ? `<rect x="440" y="470" width="280" height="170" ${st}/><circle cx="520" cy="470" r="24" ${acc}/>${opt.alert ? `<path d="M600,440 q-16,-30 6,-56 q4,22 16,14" ${acc}/>` : ""}` : `<path d="M300,560 h240 v80 M300,560 v80" ${st}/>`); break;
    case "mart": case "clinic": for (let k = 0; k < 2; k++) { s += `<rect x="${70 + k * 440}" y="160" width="260" height="480" ${st}/>`; for (let r = 1; r < 4; r++) s += `<path d="M${70 + k * 440},${160 + r * 120} h260" ${st}/>`; } if (setting === "clinic") s += `<path d="M400,120 v80 M360,160 h80" ${acc}/>`; break;
    case "street": case "bus": s += `<path d="M40,560 H760" ${st}/>` + [...Array(6)].map((_, i) => `<path d="M${260 + i * 50},590 v40" stroke="${C.line}" stroke-width="18"/>`).join("") + `<rect x="640" y="220" width="70" height="140" rx="12" ${st}/><circle cx="675" cy="260" r="16" ${opt.light === "green" ? st : acc}/><circle cx="675" cy="320" r="16" ${opt.light === "green" ? acc : st}/><path d="M675,360 V560" ${st}/>` + (setting === "bus" ? `<rect x="80" y="300" width="380" height="220" rx="30" ${st}/><path d="M110,340 h320 v80 h-320z" ${st}/>` : `<rect x="70" y="470" width="200" height="80" rx="26" ${st}/>`); break;
    case "school": case "center": s += `<rect x="170" y="140" width="460" height="230" rx="10" ${st}/><path d="M220,210 h160 M220,270 h240" ${acc}/>`; break;
    case "park": case "outdoor": case "bike": {
      const w = opt.weather || "sun";
      s += `<path d="M120,640 V470" ${st}/><circle cx="120" cy="420" r="70" ${st}/><path d="M680,640 V500" ${st}/><circle cx="680" cy="455" r="55" ${st}/>`;
      if (w === "sun" || w === "heat") s += `<circle cx="640" cy="150" r="${w === "heat" ? 64 : 46}" ${acc}/>`;
      if (w === "rain" || w === "storm") s += [...Array(24)].map((_, i) => `<path d="M${(i * 71) % 760 + 20},${(i * 43) % 360 + 60} l-10,26" ${acc}/>`).join("");
      if (w === "snow") s += [...Array(24)].map((_, i) => `<circle cx="${(i * 83) % 760 + 20}" cy="${(i * 47) % 380 + 60}" r="6" fill="${C.acc}"/>`).join("");
      if (w === "dust") s += `<rect width="800" height="800" fill="${C.acc}" opacity=".08"/>`;
      if (w === "quake") s += `<path d="M300,800 L340,700 L310,660 L360,640" ${acc}/>`;
      break;
    }
    case "online": case "game": s += `<rect x="420" y="120" width="300" height="480" rx="40" ${st}/><rect x="450" y="200" width="170" height="44" rx="20" ${st}/><rect x="500" y="270" width="190" height="44" rx="20" ${acc}/><rect x="450" y="340" width="140" height="44" rx="20" ${st}/>` + (setting === "game" ? `<path d="M470,440 h200 v100 h-200z" ${st}/>` : "") + `<circle cx="700" cy="120" r="40" ${acc}/><text x="700" y="136" text-anchor="middle" font-size="44" font-weight="900" font-family="Arial Black, Arial" fill="${C.acc}">?</text>`; break;
    case "stairs": s += [...Array(5)].map((_, i) => `<path d="M${400 + i * 70},${640 - i * 60} h70 v-60" ${st}/>`).join("") + `<rect x="90" y="180" width="160" height="80" rx="10" ${acc}/>`; break;
  }
  return s;
}

/* ---------------- 사람 ---------------- */
const SKIN = ["#F6D2B5", "#EBC09A", "#D9A47C", "#F3D7C2"];
const SHIRT = { child: "#FF8A65", friend: "#5FB7F5", friend2: "#9C7CF2", parent: "#5DAE8B", teacher: "#E8A93A", stranger: "#7D8590", staff: "#E86A8E", police: "#2E5FA8", elder: "#A98B6D", teen: "#4F7DD8", doctor: "#FFFFFF" };
const HAIR = { child: "#3A2A20", friend: "#5A3A22", friend2: "#2B2230", parent: "#3A2A20", teacher: "#4A3426", stranger: "#2B2F36", staff: "#3A2A20", police: "#2B2F36", elder: "#C9C9C9", teen: "#2B2230", doctor: "#4A3426" };

function face(cx, cy, r, mood) {
  const e = r * 0.32, ey = cy - r * 0.08, eye = (x) => `<circle cx="${x}" cy="${ey}" r="${r * 0.09}" fill="#2B2F36"/>`;
  let m = "";
  const my = cy + r * 0.35;
  if (mood === "happy") m = `<path d="M${cx - r * 0.28},${my - 4} Q${cx},${my + r * 0.28} ${cx + r * 0.28},${my - 4}" stroke="#2B2F36" stroke-width="${r * 0.08}" fill="none" stroke-linecap="round"/>`;
  else if (mood === "sad" || mood === "worried") m = `<path d="M${cx - r * 0.22},${my + 6} Q${cx},${my - r * 0.14} ${cx + r * 0.22},${my + 6}" stroke="#2B2F36" stroke-width="${r * 0.08}" fill="none" stroke-linecap="round"/>`;
  else if (mood === "surprised") m = `<ellipse cx="${cx}" cy="${my}" rx="${r * 0.12}" ry="${r * 0.16}" fill="#2B2F36"/>`;
  else m = `<path d="M${cx - r * 0.2},${my} H${cx + r * 0.2}" stroke="#2B2F36" stroke-width="${r * 0.08}" stroke-linecap="round"/>`;
  const brow = (mood === "worried" || mood === "sad") ? `<path d="M${cx - e - r * 0.12},${ey - r * 0.2} l${r * 0.24},${r * 0.08} M${cx + e + r * 0.12},${ey - r * 0.2} l${-r * 0.24},${r * 0.08}" stroke="#2B2F36" stroke-width="${r * 0.07}" stroke-linecap="round"/>` : mood === "think" ? `<path d="M${cx - e - r * 0.12},${ey - r * 0.22} h${r * 0.24}" stroke="#2B2F36" stroke-width="${r * 0.07}" stroke-linecap="round"/>` : "";
  const cheek = mood === "happy" ? `<circle cx="${cx - r * 0.52}" cy="${cy + r * 0.18}" r="${r * 0.12}" fill="#FF9F9F" opacity=".55"/><circle cx="${cx + r * 0.52}" cy="${cy + r * 0.18}" r="${r * 0.12}" fill="#FF9F9F" opacity=".55"/>` : "";
  return eye(cx - e) + eye(cx + e) + m + brow + cheek;
}

function personKid(x, base, role, mood, k, opt = {}) {
  const adult = ["parent", "teacher", "stranger", "staff", "police", "elder", "doctor"].includes(role);
  const s = adult ? 1.3 : 1, r = 46 * s, bodyH = 95 * s, legH = 70 * s;
  const top = base - legH - bodyH - r * 2 + 10, cx = x, cy = top + r;
  const skin = SKIN[k % SKIN.length], shirt = SHIRT[role] || SHIRT.child, hair = HAIR[role] || "#3A2A20";
  let g = "";
  g += `<rect x="${cx - 26 * s}" y="${base - legH}" width="${20 * s}" height="${legH}" rx="${9 * s}" fill="#4A5160"/><rect x="${cx + 6 * s}" y="${base - legH}" width="${20 * s}" height="${legH}" rx="${9 * s}" fill="#4A5160"/>`;
  g += `<rect x="${cx - 44 * s}" y="${base - legH - bodyH}" width="${88 * s}" height="${bodyH + 8}" rx="${30 * s}" fill="${shirt}" ${role === "doctor" ? `stroke="#CFE3E3" stroke-width="5"` : ""}/>`;
  const arm = opt.wave ? `<path d="M${cx + 40 * s},${base - legH - bodyH + 24 * s} l${40 * s},${-46 * s}" stroke="${skin}" stroke-width="${18 * s}" stroke-linecap="round"/>` : `<path d="M${cx + 42 * s},${base - legH - bodyH + 24 * s} l${16 * s},${54 * s}" stroke="${skin}" stroke-width="${18 * s}" stroke-linecap="round"/>`;
  g += `<path d="M${cx - 42 * s},${base - legH - bodyH + 24 * s} l${-16 * s},${54 * s}" stroke="${skin}" stroke-width="${18 * s}" stroke-linecap="round"/>` + arm;
  if (role === "staff") g += `<rect x="${cx - 30 * s}" y="${base - legH - bodyH + 20 * s}" width="${60 * s}" height="${bodyH - 14 * s}" rx="${10 * s}" fill="#fff" opacity=".85"/>`;
  if (role === "police") g += `<circle cx="${cx - 18 * s}" cy="${base - legH - bodyH + 34 * s}" r="${8 * s}" fill="#FFD35C"/>`;
  if (opt.phone) g += `<rect x="${cx + 44 * s}" y="${base - legH - bodyH + 60 * s}" width="${26 * s}" height="${42 * s}" rx="${5 * s}" fill="#2B2F36"/>`;
  g += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${skin}"/>`;
  g += role === "elder" ? `<path d="M${cx - r},${cy - 6} Q${cx},${cy - r * 1.5} ${cx + r},${cy - 6}" fill="none" stroke="${hair}" stroke-width="${r * 0.3}"/>`
                        : `<path d="M${cx - r},${cy} Q${cx - r},${cy - r * 1.15} ${cx},${cy - r * 1.05} Q${cx + r},${cy - r * 1.15} ${cx + r},${cy} Q${cx + r * 0.4},${cy - r * 0.55} ${cx - r},${cy}Z" fill="${hair}"/>`;
  if (role === "stranger" || role === "police") g += `<path d="M${cx - r * 1.05},${cy - r * 0.55} Q${cx},${cy - r * 1.5} ${cx + r * 1.05},${cy - r * 0.55}Z" fill="${role === "police" ? "#1F3F78" : "#3D4148"}"/><rect x="${cx - r * 0.2}" y="${cy - r * 0.62}" width="${r * 1.45}" height="${r * 0.16}" rx="4" fill="${role === "police" ? "#1F3F78" : "#3D4148"}"/>`;
  if (role === "teacher" || role === "doctor") g += `<circle cx="${cx - r * 0.32}" cy="${cy - r * 0.08}" r="${r * 0.22}" fill="none" stroke="#2B2F36" stroke-width="4"/><circle cx="${cx + r * 0.32}" cy="${cy - r * 0.08}" r="${r * 0.22}" fill="none" stroke="#2B2F36" stroke-width="4"/>`;
  g += face(cx, cy, r, mood);
  return { svg: g, headTop: cy - r, cx };
}

function personTeen(x, base, role, mood, k, C, opt = {}) {
  // 얼굴 없는 실루엣. 주인공(첫 사람)만 강조색, 어른은 키가 커요.
  const adult = ["parent", "teacher", "stranger", "staff", "police", "elder", "doctor"].includes(role);
  const s = adult ? 1.18 : 1.05, r = 44 * s, bodyH = 150 * s;
  const cy = base - bodyH - r - 6;
  const col = opt.main ? C.acc : role === "stranger" ? "#5B6170" : "#8A91A0";
  let g = `<path d="M${x - 62 * s},${base} Q${x - 62 * s},${base - bodyH} ${x},${base - bodyH} Q${x + 62 * s},${base - bodyH} ${x + 62 * s},${base}Z" fill="${col}" opacity="${opt.main ? 1 : .9}"/>`;
  g += `<circle cx="${x}" cy="${cy}" r="${r}" fill="${col}"/>`;
  if (role === "stranger") g += `<path d="M${x - r * 1.05},${cy - r * 0.45} Q${x},${cy - r * 1.4} ${x + r * 1.05},${cy - r * 0.45}Z" fill="#3A3F4A"/>`;
  if (role === "police") g += `<rect x="${x - r}" y="${cy - r * 1.05}" width="${r * 2}" height="${r * 0.4}" rx="6" fill="#3A5A9A"/>`;
  if (opt.phone) g += `<rect x="${x + 34 * s}" y="${base - bodyH * 0.62}" width="${30 * s}" height="${50 * s}" rx="6" fill="#16181E" stroke="${C.acc}" stroke-width="4"/>`;
  return { svg: g, headTop: cy - r, cx: x };
}

function bubble(x, y, sym, kid, C) {
  const fill = kid ? "#fff" : "#1D2128", stroke = kid ? "#2B2F36" : C.acc, tc = kid ? "#2B2F36" : C.acc;
  const w = 110, h = 80;
  return `<g><path d="M${x - w / 2},${y - h} h${w} a20,20 0 0 1 20,20 v${h - 40} a20,20 0 0 1 -20,20 h-${w / 2 - 14} l-18,22 l-2,-22 h-${w / 2 - 16} a20,20 0 0 1 -20,-20 v-${h - 40} a20,20 0 0 1 20,-20z" fill="${fill}" stroke="${stroke}" stroke-width="6"/>` +
    `<text x="${x + 10}" y="${y - h / 2 + 12}" text-anchor="middle" font-size="${sym === "…" ? 52 : 50}" font-weight="900" font-family="Arial Black, Arial, sans-serif" fill="${tc}">${sym}</text></g>`;
}

// spec: { setting, cast:[{role, mood, bubble?, phone?, wave?}], weather?, light?, alert?, car? }
function sceneSvg(spec, color, level, seed) {
  const teen = level === "teen";
  const setting = SETTINGS.includes(spec.setting) ? spec.setting : "center";
  const cast = (spec.cast || [{ role: "child", mood: "think" }]).slice(0, 4);
  const opt = { weather: spec.weather, light: spec.light, alert: spec.alert, car: spec.car };
  const online = setting === "online" || setting === "game";
  if (!teen) {
    const P = { wall: tint(color, 0.95), floor: tint(color, 0.86), accent: color, dark: ink(color) };
    const base = setting === "street" ? 425 : setting === "bus" ? 520 : 545;   // 길: 사람은 인도 위에
    const span = online ? [110, 360] : setting === "street" ? [300, 600] : setting === "bus" ? [80, 250] : [140, 660];
    const xs = cast.length === 1 ? [online ? 230 : 400] : cast.map((_, i) => span[0] + (span[1] - span[0]) * i / (cast.length - 1));
    let people = "", bubbles = "";
    cast.forEach((c, i) => {
      const p = personKid(xs[i], base, c.role || "child", c.mood || "neutral", i + (seed || "").length, c);
      people += p.svg;
      if (c.bubble) bubbles += bubble(p.cx + 40, p.headTop - 10, c.bubble, true);
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">${bgKid(setting, P, opt)}${people}${bubbles}</svg>`;
  }
  const C = { acc: light(color), line: "#3A3F4A" };
  const base = 640;
  const span = online ? [110, 340] : [150, 650];
  const xs = cast.length === 1 ? [online ? 220 : 400] : cast.map((_, i) => span[0] + (span[1] - span[0]) * i / (cast.length - 1));
  let people = "", bubbles = "";
  cast.forEach((c, i) => {
    const p = personTeen(xs[i], base, c.role || "teen", c.mood, i, C, { ...c, main: i === 0 });
    people += p.svg;
    if (c.bubble) bubbles += bubble(p.cx + 40, p.headTop - 12, c.bubble, false, C);
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">${bgTeen(setting, C, opt)}${people}${bubbles}</svg>`;
}

module.exports = { sceneSvg, SETTINGS, ROLES, MOODS };
