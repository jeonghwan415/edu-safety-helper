// data/areas.json(원본) → data/areas.js(프로그램이 읽는 파일)로 옮기고, 데이터가 맞는지 검사해요.
// 실행: npm run data
const { fs, DATA_JSON, DATA_JS, loadData } = require("./lib/common");

const data = loadData();
const problems = [];
const warn = msg => problems.push(msg);

// 1) 별표 6 기준 검사
const total = data.areas.reduce((s, a) => s + a.requiredHours, 0);
if (total !== data.meta.totalHours) warn(`영역별 시간 합계 ${total}시간이 meta.totalHours(${data.meta.totalHours})와 달라요.`);
if (total !== 44) warn(`영역별 시간 합계가 44시간이 아니에요 (${total}시간). 별표 6을 다시 확인해 주세요.`);

// 2) 수업 내용 검사
const TYPES = ["cover", "question", "promise", "video", "quiz", "activity", "wrap"];
let lessons = 0, reviewed = 0;
for (const a of data.areas) {
  for (const t of a.topics.elementary) {
    for (const lv of ["low", "high"]) {
      const L = t.content[lv];
      if (!L) continue;
      lessons++;
      if (L.status === "검토 완료") reviewed++;
      const where = `${t.id}-${lv}`;
      if (!Array.isArray(L.slides) || !L.slides.length) { warn(`${where}: slides가 비어 있어요.`); continue; }
      L.slides.forEach((s, i) => {
        if (!TYPES.includes(s.type)) warn(`${where} 슬라이드 ${i + 1}: 모르는 type "${s.type}"`);
        if (s.type === "quiz") (s.items || []).forEach((q, k) => { if (!["O", "X"].includes(q.a)) warn(`${where} 퀴즈 ${k + 1}: 정답(a)은 "O" 또는 "X"여야 해요.`); });
        if (s.image && !fs.existsSync(require("path").join(__dirname, "..", s.image))) warn(`${where} 슬라이드 ${i + 1}: 그림 파일이 없어요 → ${s.image} (npm run cards)`);
      });
      (L.lessonFlow || []).forEach(f => f.slides.forEach(n => { if (n < 1 || n > L.slides.length) warn(`${where}: 수업 흐름 "${f.step}"의 슬라이드 번호 ${n}이 없어요.`); }));
      const sum = (L.lessonFlow || []).reduce((s, f) => s + f.minutes, 0);
      if (sum !== L.minutes) warn(`${where}: 수업 흐름 시간 합계(${sum}분)가 minutes(${L.minutes}분)와 달라요.`);
    }
  }
}

// 3) areas.js 쓰기
const json = JSON.stringify(data, null, 2);
fs.writeFileSync(DATA_JS, "// 이 파일은 tools/sync-data.js가 data/areas.json으로 만들어요. 직접 고치지 말고 areas.json을 고친 뒤 npm run data 하세요.\nwindow.SAFETY_DATA = " + json + ";\n", "utf8");

console.log(`✔ data/areas.js 를 만들었어요. 수업 ${lessons}개 (검토 완료 ${reviewed}개)`);
if (problems.length) {
  console.log(`\n⚠ 확인할 것 ${problems.length}개:`);
  problems.forEach(p => console.log(" - " + p));
  process.exitCode = 1;
} else {
  console.log("✔ 데이터 검사 통과");
}
