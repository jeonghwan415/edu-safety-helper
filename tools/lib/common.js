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

// 6대 의무교육 영역 + 추가 교육 영역(extraAreas, 예: 아동인권)
function allAreas(data) {
  return [...data.areas, ...(data.extraAreas || [])];
}

// 모든 수업을 [area, topic, level, lesson] 목록으로 (추가 교육 영역도 포함)
function eachLesson(data, filter) {
  const out = [];
  for (const area of allAreas(data)) {
    for (const topic of area.topics.elementary.flatMap(lessonTopics)) {
      for (const level of ["low", "high", "teen"]) {   // teen = 청소년(중·고등), 없으면 건너뜀
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

// 브라우저(playwright-core): 센터·집 컴퓨터의 Edge 또는 Chrome을 그대로 씀.
// Edge·Chrome이 없는 컴퓨터(예: 리눅스 서버)는 `npm run browser`로 받은 Playwright 전용 크롬을 마지막에 써요.
// npm run browser가 빠진 리눅스 부품을 풀어 두는 곳 (관리자 권한 없이)
const LINUX_LIBS = path.join(require("os").homedir(), ".local", "share", "seh-chrome-libs");
async function launchBrowser() {
  const { chromium } = require("playwright-core");
  const libDir = path.join(LINUX_LIBS, "root", "usr", "lib", "x86_64-linux-gnu");
  const env = fs.existsSync(libDir) ? { ...process.env, LD_LIBRARY_PATH: [libDir, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") } : undefined;
  const tries = [{ channel: "msedge" }, { channel: "chrome" }, env ? { env } : {} /* npm run browser 로 받은 것 */];
  if (process.env.BROWSER_PATH) tries.unshift({ executablePath: process.env.BROWSER_PATH });
  let last;
  for (const opt of tries) {
    try { return await chromium.launch(opt); } catch (e) { last = e; /* 다음 브라우저 시도 */ }
  }
  throw new Error("Edge나 Chrome을 찾지 못했어요. 다음 중 하나를 해 주세요.\n" +
    " ① 터미널에서 npm run browser (전용 크롬을 한 번 받아요)\n" +
    " ② BROWSER_PATH 환경변수에 브라우저 실행 파일 경로를 넣기\n" +
    "(마지막 오류: " + String(last && last.message).split("\n")[0] + ")");
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

// 글씨·버튼용 진한 색: 영역 색에서 밝기만 낮춰 흰 바탕과 대비 4.8:1 이상 (index.html의 ink와 같은 규칙)
function lum(hex) {
  return [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16) / 255)
    .map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    .reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
}
function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
function ink(hex) {
  let c = hex, k = 0;
  while (contrast(c, "#FFFFFF") < 4.8 && k++ < 40) c = "#" + [1, 3, 5].map(i => Math.round(parseInt(c.substr(i, 2), 16) * .95).toString(16).padStart(2, "0")).join("");
  return c.toUpperCase();
}

// 어두운 배경(#121419)용 밝은 강조색: 흰색 쪽으로 섞어 대비 4.5:1 이상 (index.html의 light와 같은 규칙)
function light(hex) {
  let c = hex, k = 0;
  while (contrast(c, "#121419") < 4.5 && k++ < 40) c = "#" + [1, 3, 5].map(i => { const v = parseInt(c.substr(i, 2), 16); return Math.round(v + (255 - v) * .08).toString(16).padStart(2, "0"); }).join("");
  return c.toUpperCase();
}

module.exports = { ink, light, contrast, fs, path, ROOT, LINUX_LIBS, DATA_JSON, DATA_JS, loadData, lessonTopics, allAreas, eachLesson, onlyFilter, launchBrowser, tint };
