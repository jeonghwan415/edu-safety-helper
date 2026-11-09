// 도구들이 같이 쓰는 함수 모음
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DATA_JSON = path.join(ROOT, "data", "areas.json");
const DATA_JS = path.join(ROOT, "data", "areas.js");

function loadData() {
  return JSON.parse(fs.readFileSync(DATA_JSON, "utf8"));
}

// 주제 하나의 수업들: 기본 수업 + 추가 수업(extras, 예: 자연재난 → 지진·폭설…)
// 추가 수업은 id가 "<주제id>-<추가id>"인 주제처럼 다뤄요. (그림·활동지·PPT 파일 이름에 씀)
function lessonTopics(topic) {
  return [topic, ...(topic.extras || []).map(ex => ({
    ...topic, ...ex, id: `${topic.id}-${ex.id}`, baseId: topic.id, extraId: ex.id,
    title: `${topic.title} (${ex.title})`, links: [...(ex.links || []), ...(topic.links || [])]
  }))];
}

// 모든 수업을 [area, topic, level, lesson] 목록으로
function eachLesson(data, filter) {
  const out = [];
  for (const area of data.areas) {
    for (const topic of area.topics.elementary.flatMap(lessonTopics)) {
      for (const level of ["low", "high"]) {
        const L = topic.content[level];
        if (!L) continue;
        if (filter && !filter(area, topic, level)) continue;
        out.push({ area, topic, level, L });
      }
    }
  }
  return out;
}

// --only=traffic-e-02 또는 --only=traffic-e-02-low 처럼 일부만 만들 때
function onlyFilter(argv) {
  const arg = argv.find(a => a.startsWith("--only="));
  if (!arg) return null;
  const want = arg.slice(7).split(",");
  return (area, topic, level) => want.some(w => w === area.id || w === topic.id || w === topic.baseId || w === `${topic.id}-${level}`);
}

// 브라우저(playwright-core): 센터·집 컴퓨터의 Edge 또는 Chrome을 그대로 씀
async function launchBrowser() {
  const { chromium } = require("playwright-core");
  const tries = [{ channel: "msedge" }, { channel: "chrome" }];
  if (process.env.BROWSER_PATH) tries.unshift({ executablePath: process.env.BROWSER_PATH });
  for (const opt of tries) {
    try { return await chromium.launch(opt); } catch (e) { /* 다음 브라우저 시도 */ }
  }
  throw new Error("Edge나 Chrome을 찾지 못했어요. BROWSER_PATH 환경변수에 브라우저 실행 파일 경로를 넣어 주세요.");
}

function tint(hex, l) {
  // 영역 색을 밝게(l: 0~1) 만든 색
  let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const d = max - min, L0 = (max + min) / 2;
  if (d) {
    s = L0 > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  s = Math.min(s, 0.85);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  const to = v => Math.round(v * 255).toString(16).padStart(2, "0").toUpperCase();
  return "#" + to(f(h + 1 / 3)) + to(f(h)) + to(f(h - 1 / 3));
}

module.exports = { fs, path, ROOT, DATA_JSON, DATA_JS, loadData, lessonTopics, eachLesson, onlyFilter, launchBrowser, tint };
