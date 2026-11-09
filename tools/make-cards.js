// 슬라이드의 emoji로 그림 카드(SVG)를 만들어요. 이미 있는 그림은 건너뛰어요.
// 실행: npm run cards              (없는 그림만 만들기)
//       npm run cards -- --force   (모두 다시 만들기)
//       npm run cards -- --only=abuse-e-03-high
const { fs, path, ROOT, loadData, eachLesson, onlyFilter, tint } = require("./lib/common");

function seeded(seed) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 10000) / 10000; }

function cardSvg(emoji, color, seed) {
  const bg = tint(color, 0.93), mid = tint(color, 0.82), dot = tint(color, 0.70);
  const rnd = seeded(seed), R = (a, b) => Math.round(a + rnd() * (b - a));
  let dots = "";
  for (let i = 0; i < 9; i++) dots += `<circle cx="${R(40, 760)}" cy="${R(40, 560)}" r="${R(8, 22)}" fill="${dot}" opacity=".45"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
<style>.float{animation:fl 3s ease-in-out infinite}@keyframes fl{50%{transform:translateY(-12px)}}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>
<rect width="800" height="600" fill="${bg}"/>${dots}
<circle cx="400" cy="300" r="210" fill="${mid}"/>
<g class="float"><text x="400" y="300" text-anchor="middle" dominant-baseline="central" font-size="250" font-family="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif">${emoji}</text></g>
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
    fs.writeFileSync(file, cardSvg(s.emoji, area.color, `${topic.id}${level}${n}`), "utf8");
    made++;
  }
}
if (changed) fs.writeFileSync(path.join(ROOT, "data", "areas.json"), JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`✔ 그림 카드 ${made}개 만듦, ${skipped}개는 이미 있어서 건너뜀${changed ? " (areas.json에 그림 경로 추가함 → npm run data)" : ""}`);
