// 상황 장면(scene) 슬라이드의 그림을 만들어요: img/<수업id>/<학년>_scene<번호>.svg
// 장소(setting)·등장인물(cast)은 areas.json의 scene 슬라이드에 적어 둬요. 그림 모양은 tools/lib/scene-art.js
// 실행: npm run scenes              (없는 그림만)
//       npm run scenes -- --force   (모두 다시)
//       npm run scenes -- --only=missing-e-01-low
const { fs, path, ROOT, loadData, eachLesson, onlyFilter } = require("./lib/common");
const { sceneSvg } = require("./lib/scene-art");

const force = process.argv.includes("--force");
const data = loadData();
let made = 0, skipped = 0, changed = false;
for (const { area, topic, level, L } of eachLesson(data, onlyFilter(process.argv))) {
  for (const s of L.slides) {
    if (s.type !== "scene") continue;
    const rel = `img/${topic.id}/${level}_scene${s.no}.svg`;
    if (s.image !== rel) { s.image = rel; changed = true; }
    const file = path.join(ROOT, rel);
    if (fs.existsSync(file) && !force) { skipped++; continue; }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, sceneSvg(s, area.color, level, `${topic.id}${level}${s.no}`), "utf8");
    made++;
  }
}
if (changed) fs.writeFileSync(path.join(ROOT, "data", "areas.json"), JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`✔ 상황 장면 그림 ${made}개 만듦, ${skipped}개는 이미 있어서 건너뜀${changed ? " (areas.json에 그림 경로 넣음 → npm run data)" : ""}`);
