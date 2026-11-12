// 슬라이드의 emoji로 그림 카드(SVG)를 만들어요. 이미 있는 그림은 건너뛰어요.
// 실행: npm run cards              (없는 그림만 만들기)
//       npm run cards -- --force   (모두 다시 만들기)
//       npm run cards -- --only=abuse-e-03-high
const { fs, path, ROOT, loadData, eachLesson, onlyFilter, tint, ink, light } = require("./lib/common");

function seeded(seed) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 10000) / 10000; }

const EMOJI_FONT = "Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif";
const emo = (e, x, y, size, cls = "") => `<text${cls ? ` class="${cls}"` : ""} x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${size}" font-family="${EMOJI_FONT}">${e}</text>`;

// 둥글둥글한 덩어리 모양 (씨앗값으로 카드마다 조금씩 달라요)
function blob(cx, cy, r, rnd, fill) {
  const n = 8, pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, rr = r * (0.86 + rnd() * 0.24); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  let d = "";
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    d += (i ? "" : `M${((pts[n - 1][0] + p[0]) / 2).toFixed(1)},${((pts[n - 1][1] + p[1]) / 2).toFixed(1)} `) + `Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)} `;
  }
  return `<path d="${d}Z" fill="${fill}"/>`;
}

// 슬라이드 종류마다 다른 모양의 그림 카드 (글자는 넣지 않아요: 활동지 짝짓기 문제의 답이 보이지 않게)
//   cover 햇살+영역 배지 · question 말풍선+물음표 · promise 번호 배지 테두리 원 · activity 종이와 연필
function cardSvg(emoji, color, seed, opt = {}) {
  const { type = "", no = 0, areaIcon = "" } = opt;
  const bg = tint(color, 0.95), soft = tint(color, 0.88), mid = tint(color, 0.80), dot = tint(color, 0.70), dark = ink(color);
  const rnd = seeded(seed), R = (a, b) => Math.round(a + rnd() * (b - a));
  let deco = "";
  for (let i = 0; i < 7; i++) deco += `<circle cx="${R(30, 770)}" cy="${R(30, 570)}" r="${R(6, 16)}" fill="${dot}" opacity=".35"/>`;
  let body;
  if (type === "cover") {
    let rays = "";
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, a2 = a + Math.PI / 16; rays += `<path d="M400,310 L${(400 + Math.cos(a) * 520).toFixed(0)},${(310 + Math.sin(a) * 520).toFixed(0)} L${(400 + Math.cos(a2) * 520).toFixed(0)},${(310 + Math.sin(a2) * 520).toFixed(0)}Z" fill="${soft}"/>`; }
    body = rays + blob(400, 310, 215, rnd, mid) + `<circle cx="400" cy="310" r="170" fill="#fff" opacity=".55"/>` +
      `<g class="float">${emo(emoji, 400, 315, 230)}</g>` +
      (areaIcon ? `<circle cx="112" cy="104" r="66" fill="#fff" stroke="${dark}" stroke-width="8"/>${emo(areaIcon, 112, 108, 74)}` : "");
  } else if (type === "question") {
    body = `<path d="M150,90 H650 a60,60 0 0 1 60,60 V400 a60,60 0 0 1 -60,60 H380 L290,545 L305,460 H150 a60,60 0 0 1 -60,-60 V150 a60,60 0 0 1 60,-60Z" fill="#fff" stroke="${mid}" stroke-width="14"/>` +
      `<g class="float">${emo(emoji, 400, 275, 210)}</g>` +
      [[735, 150, 96, -14], [745, 330, 64, 12], [70, 480, 70, -8]].map(([x, y, sz, rot]) => `<text x="${x}" y="${y}" font-size="${sz}" font-weight="900" font-family="Arial Black, Arial, sans-serif" fill="${dark}" text-anchor="middle" transform="rotate(${rot} ${x} ${y})">?</text>`).join("");
  } else if (type === "promise") {
    let spark = "";
    for (let i = 0; i < 4; i++) spark += `<path transform="translate(${R(80, 720)} ${[R(60, 150), R(450, 540)][i % 2]}) scale(${(0.6 + rnd() * 0.6).toFixed(2)})" d="M0,-22 L6,-6 L22,0 L6,6 L0,22 L-6,6 L-22,0 L-6,-6Z" fill="${dot}"/>`;
    body = spark + `<circle cx="400" cy="305" r="225" fill="${mid}"/><circle cx="400" cy="305" r="188" fill="#fff" stroke="${dark}" stroke-width="10" stroke-dasharray="2 22" stroke-linecap="round"/>` +
      `<g class="float">${emo(emoji, 400, 310, 220)}</g>` +
      (no ? `<circle cx="590" cy="130" r="62" fill="${dark}" stroke="#fff" stroke-width="10"/><text x="590" y="132" text-anchor="middle" dominant-baseline="central" font-size="74" font-weight="900" font-family="Arial Black, Arial, sans-serif" fill="#fff">${no}</text>` : "");
  } else if (type === "activity") {
    let lines = "";
    for (let i = 0; i < 4; i++) lines += `<rect x="250" y="${400 + i * 34}" width="${300 - (i % 2) * 70}" height="10" rx="5" fill="${soft}"/>`;
    body = blob(400, 320, 250, rnd, soft) + `<g transform="rotate(-4 400 300)"><rect x="200" y="70" width="400" height="470" rx="26" fill="#fff" stroke="${mid}" stroke-width="10"/>${lines}</g>` +
      `<g class="float">${emo(emoji, 400, 235, 190)}</g>` + emo("✏️", 640, 470, 120);
  } else {
    body = blob(400, 300, 215, rnd, mid) + `<g class="float">${emo(emoji, 400, 300, 250)}</g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
<style>.float{animation:fl 3s ease-in-out infinite}@keyframes fl{50%{transform:translateY(-12px)}}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>
<rect width="800" height="600" fill="${bg}"/>${deco}
${body}
</svg>`;
}

// 청소년(teen)용 그림 카드: 정사각형, 어두운 바탕 + 각진 타일 안에 단색 선 아이콘 (이모지 대신)
// 아이콘: Tabler Icons(MIT, tools/assets/TABLER-LICENSE.txt). 짝이 없는 이모지는 이모지로 그려요.
const TEEN_ICONS = JSON.parse(fs.readFileSync(path.join(ROOT, "tools", "assets", "teen-icons.json"), "utf8"));
const attr = o => Object.entries(o).filter(([k]) => k !== "key").map(([k, v]) => `${k}="${v}"`).join(" ");
function iconSvg(emoji, x, y, size, color) {
  const name = TEEN_ICONS.map[emoji], nodes = name && TEEN_ICONS.icons[name];
  if (!nodes) return `<text x="${x + size / 2}" y="${y + size / 2 + 8}" text-anchor="middle" dominant-baseline="central" font-size="${size}" font-family="${EMOJI_FONT}">${emoji}</text>`;
  return `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${nodes.map(([tag, a]) => `<${tag} ${attr(a)}/>`).join("")}</g>`;
}
function teenCardSvg(emoji, color, seed, opt = {}) {
  const { type = "" } = opt;
  const dark = "#16181E", line = "#23272F", tile = "#1D2128", accent = light(color);
  let grid = "";
  for (let i = 1; i < 8; i++) grid += `<path d="M${i * 100},0V800M0,${i * 100}H800" stroke="${line}" stroke-width="2"/>`;
  let deco = "";
  if (type === "cover") deco = `<rect x="-120" y="590" width="1100" height="70" fill="${color}" opacity=".85" transform="rotate(-12 400 600)"/>`;
  else if (type === "question") deco = `<circle cx="640" cy="160" r="70" fill="none" stroke="${color}" stroke-width="8"/><circle cx="640" cy="160" r="18" fill="${color}"/>`;
  else if (type === "promise") deco = `<rect x="90" y="90" width="620" height="620" rx="56" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="36 22" opacity=".9"/>`;
  else if (type === "activity") deco = `<rect x="480" y="480" width="200" height="200" rx="36" fill="${color}" opacity=".8" transform="rotate(8 580 580)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
<rect width="800" height="800" fill="${dark}"/>${grid}${deco}
<rect x="210" y="210" width="380" height="380" rx="84" fill="${tile}" stroke="${color}" stroke-width="8"/>
${iconSvg(emoji, 280, 280, 240, accent)}
</svg>`;
}

const force = process.argv.includes("--force");
const data = loadData();
let made = 0, skipped = 0, changed = false;
for (const { area, topic, level, L } of eachLesson(data, onlyFilter(process.argv))) {
  let n = 0;
  for (const s of L.slides) {
    n++;
    if (!s.emoji) continue;                       // 직접 그린 그림(emoji 없음)은 건드리지 않아요
    const rel = s.image || `img/${topic.id}/${level}_${n}.svg`;
    if (!s.image) { s.image = rel; changed = true; }
    const file = path.join(ROOT, rel);
    if (fs.existsSync(file) && !force) { skipped++; continue; }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, (level === "teen" ? teenCardSvg : cardSvg)(s.emoji, area.color, `${topic.id}${level}${n}`, { type: s.type, no: s.no, areaIcon: area.icon }), "utf8");
    made++;
  }
}
if (changed) fs.writeFileSync(path.join(ROOT, "data", "areas.json"), JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`✔ 그림 카드 ${made}개 만듦, ${skipped}개는 이미 있어서 건너뜀${changed ? " (areas.json에 그림 경로 추가함 → npm run data)" : ""}`);
