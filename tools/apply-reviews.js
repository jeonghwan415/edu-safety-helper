// 선생님이 [검토 결과 파일 저장]으로 보낸 파일을 areas.json에 넣어요.
// 실행: node tools/apply-reviews.js 수업검토결과_박정환_20261120.json [파일2 ...]
//   - [통과] 수업: status를 "검토 완료"로 바꾸고 review { by, date }를 붙여요.
//   - [고칠 곳 있음] 수업: 바꾸지 않고 메모를 보여 줘요. 고친 뒤 다시 검토 목록에 올라가요.
// 끝나면 npm run data 를 꼭 돌려요.
const { fs, DATA_JSON, loadData, eachLesson } = require("./lib/common");

const files = process.argv.slice(2);
if (!files.length) { console.log("사용법: node tools/apply-reviews.js <검토결과.json> [더 있으면 이어서]"); process.exit(1); }
const data = loadData();
const lessons = new Map(eachLesson(data).map(x => [`${x.area.id}|${x.topic.id}|${x.level}`, x]));
const items = {};
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  if (j.kind !== "review" || !j.items) { console.log(`⚠ ${f}: 검토 결과 파일이 아니에요. 건너뛰어요.`); continue; }
  for (const [k, v] of Object.entries(j.items)) if (!items[k] || String(v.date) >= String(items[k].date)) items[k] = v;   // 같은 수업은 나중 것
}
let pass = 0, unknown = 0; const fixes = [];
for (const [k, v] of Object.entries(items)) {
  const x = lessons.get(k);
  if (!x) { unknown++; console.log(`⚠ 없는 수업: ${k}`); continue; }
  if (v.result === "pass") {
    if (!(v.checks || []).every(Boolean) || (v.checks || []).length < 5) { console.log(`⚠ ${k}: 확인 질문 5개가 다 체크되지 않아 건너뛰어요.`); continue; }
    x.L.status = "검토 완료"; x.L.review = { by: v.by || "", date: v.date || "" }; pass++;
  } else if (v.result === "fix") fixes.push({ k, x, v });
}
fs.writeFileSync(DATA_JSON, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`✔ 검토 완료로 바꾼 수업 ${pass}개${unknown ? ` · 찾지 못한 수업 ${unknown}개` : ""}`);
if (fixes.length) {
  console.log(`\n✏️ 고칠 곳 있음 ${fixes.length}개 (고친 뒤 다시 검토해 주세요)`);
  fixes.forEach(({ k, x, v }) => console.log(` - ${x.topic.title} · ${x.level} (${v.by || "?"}, ${v.date || "?"})\n     ${String(v.memo || "").replace(/\n/g, "\n     ")}`));
}
console.log("\n다음: npm run data");
