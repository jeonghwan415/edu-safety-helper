// data/areas.json(원본) → data/areas.js(프로그램이 읽는 파일)로 옮기고, 데이터가 맞는지 검사해요.
// 실행: npm run data
const { fs, DATA_JSON, DATA_JS, loadData, allAreas, eachLesson } = require("./lib/common");

const data = loadData();
const problems = [];
const warn = msg => problems.push(msg);

// 1) 별표 6 기준 검사
const total = data.areas.reduce((s, a) => s + a.requiredHours, 0);
if (total !== data.meta.totalHours) warn(`영역별 시간 합계 ${total}시간이 meta.totalHours(${data.meta.totalHours})와 달라요.`);
if (total !== 44) warn(`영역별 시간 합계가 44시간이 아니에요 (${total}시간). 별표 6을 다시 확인해 주세요.`);

// 1-1) 추가 교육 영역(extraAreas)은 별표 6 밖이라 44시간에 넣지 않아요. id가 6대 영역과 겹치면 안 돼요.
for (const a of data.extraAreas || []) {
  if (data.areas.some(x => x.id === a.id)) warn(`추가 교육 영역 id "${a.id}"가 6대 영역과 겹쳐요.`);
  if (!a.optional) warn(`추가 교육 영역 "${a.id}"에 optional: true가 없어요.`);
}

// 2) 수업 내용 검사
const TYPES = ["cover", "question", "promise", "video", "quiz", "activity", "wrap", "scene", "law", "help"];
// 신고·상담 번호는 확인된 것만 (CLAUDE.md 규칙 4). 도움받는 곳(help) 장에 다른 번호가 들어가면 알려 줘요.
const OK_NUMBERS = ["112", "119", "129", "182", "117", "1342", "1388", "1336", "1366", "1339", "1544-9030", "02-735-8994", "안전Dream"];
let lessons = 0, reviewed = 0;
// 추가 수업(extras) id는 주제 안에서 겹치면 안 돼요
for (const a of allAreas(data)) for (const t of a.topics.elementary) {
  const ids = (t.extras || []).map(x => x.id);
  if (new Set(ids).size !== ids.length) warn(`${t.id}: 추가 수업(extras) id가 겹쳐요.`);
  (t.extras || []).forEach(x => { if (!/^[a-z0-9]+$/.test(x.id)) warn(`${t.id}: 추가 수업 id "${x.id}"는 영어 소문자·숫자만 써요(하이픈 금지).`); });
}
{
  for (const { topic: t, level: lv, L } of eachLesson(data)) {
    {
      lessons++;
      if (L.status === "검토 완료") reviewed++;
      const where = `${t.id}-${lv}`;
      if (!Array.isArray(L.slides) || !L.slides.length) { warn(`${where}: slides가 비어 있어요.`); continue; }
      L.slides.forEach((s, i) => {
        if (!TYPES.includes(s.type)) warn(`${where} 슬라이드 ${i + 1}: 모르는 type "${s.type}"`);
        if (s.type === "video" && !/^[\w-]{11}$/.test(s.youtubeId || "")) warn(`${where} 슬라이드 ${i + 1}: 영상 youtubeId가 이상해요.`);
        if (s.type === "quiz") (s.items || []).forEach((q, k) => { if (!["O", "X"].includes(q.a)) warn(`${where} 퀴즈 ${k + 1}: 정답(a)은 "O" 또는 "X"여야 해요.`); if (!q.explain) warn(`${where} 퀴즈 ${k + 1}: 해설(explain)이 없어요.`); });
        if (s.type === "scene" && (!s.title || !s.story || !s.ask)) warn(`${where} 슬라이드 ${i + 1}: 상황 장면에 title·story·ask가 다 있어야 해요.`);
        if (s.type === "scene" && !s.image) warn(`${where} 슬라이드 ${i + 1}: 상황 장면 그림이 없어요 (npm run scenes)`);
        if (s.type === "law" && !(s.points || []).length) warn(`${where} 슬라이드 ${i + 1}: 법 장에 points가 없어요.`);
        if (s.type === "help") (s.items || []).forEach(h => { if (!OK_NUMBERS.includes(String(h.no))) warn(`${where} 슬라이드 ${i + 1}: 확인되지 않은 번호 "${h.no}" — 공식 출처를 확인하고 OK_NUMBERS와 CLAUDE.md에 넣어요.`); });
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
