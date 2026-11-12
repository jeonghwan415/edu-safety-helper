// 활동지(A4 1장)를 데이터로 만들어요: worksheets/<주제id>-<학년>.html → .pdf, 미리보기 .png
// 실행: npm run worksheets                         (모두)
//       npm run worksheets -- --only=abuse-e-03-high
// 직접 만든 활동지(수업 데이터에 "customFiles": true)는 건너뛰어요.
const { fs, path, ROOT, loadData, eachLesson, onlyFilter, launchBrowser, ink } = require("./lib/common");

const E = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function svgInline(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8").replace("<svg ", '<svg preserveAspectRatio="xMidYMid slice" ');
}
function shuffled(n, seed) {
  const idx = [...Array(n).keys()];
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  for (let i = n - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  if (idx.every((v, i) => v === i)) idx.push(idx.shift());
  return idx;
}

function worksheetHtml(area, topic, level, L) {
  const c = ink(area.color);   // 글씨용 진한 색 (인쇄해도 또렷하게)
  const pts = L.slides.filter(s => s.type === "promise");
  const quiz = (L.slides.find(s => s.type === "quiz") || { items: [] }).items.slice(0, 3);
  const words = pts.map(p => `${p.title} · ${p.text.replace(/\n/g, " ")}`);
  const order = shuffled(pts.length, topic.id + level);
  const rows = pts.map((p, i) => `<div class="l"><div class="pic">${p.image ? svgInline(p.image) : ""}</div><i class="dot"></i></div><div></div>` +
    `<div class="r"><i class="dot"></i><div class="word">${E(words[order[i]])}</div></div>`).join("");
  const ox = quiz.map(q => `<li>${E(q.q)}<span class="c">O X</span></li>`).join("");
  const draw = level === "low" ? "오늘 배운 약속을 그림이나 글로 나타내 보아요." : "오늘 배운 것 중 꼭 기억할 한 가지와 그 이유를 써 보아요.";
  const wrap = L.slides.find(s => s.type === "wrap");
  const wrapTxt = (wrap && wrap.words ? wrap.words.map(w => w[1]) : []).join(" · ");
  const title = L.slides.find(s => s.type === "cover").title;
  const lv = { low: "저학년", high: "고학년", teen: "청소년" }[level] || level;
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><style>
@page { size: A4; margin: 10mm 14mm; } * { box-sizing: border-box; }
body { margin:0; font-family:"Malgun Gothic","Noto Sans KR","Noto Sans CJK KR",sans-serif; color:#22262B; font-size:12.5pt; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.top { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:6px solid ${c}; padding-bottom:6px; }
h1 { margin:0; font-size:24pt; color:${c}; } .sub { font-size:10.5pt; color:#5B6168; }
.name { font-size:12.5pt; white-space:nowrap; } .name span { display:inline-block; width:42mm; border-bottom:1.5px solid #22262B; }
.stripe { height:5mm; background:repeating-linear-gradient(90deg,#fff 0 9mm,#2B2F36 9mm 15mm); border:1px solid #2B2F36; margin:3mm 0 3mm; }
h2 { font-size:13.5pt; margin:3mm 0 2mm; }
h2 b { display:inline-flex; width:7.5mm; height:7.5mm; border-radius:50%; background:${c}; color:#fff; align-items:center; justify-content:center; font-size:11pt; margin-right:2mm; }
.match { display:grid; grid-template-columns: auto 18mm 1fr; align-items:center; row-gap:2mm; }
.pic { width:38mm; height:24mm; border-radius:3mm; overflow:hidden; border:1px solid #ccc; } .pic svg { width:100%; height:100%; display:block; }
.dot { width:4mm; height:4mm; border-radius:50%; background:#22262B; display:inline-block; flex:none; }
.l { display:flex; align-items:center; gap:3mm; } .r { display:flex; align-items:center; gap:3mm; }
.word { border:2px solid #22262B; border-radius:3mm; padding:2mm 3.5mm; font-size:11.5pt; font-weight:700; }
.ox ul { list-style:none; padding:0; margin:0; }
.ox li { display:flex; justify-content:space-between; align-items:center; gap:6mm; padding:2mm 0; border-bottom:1px dashed #bbb; }
.ox .c { font-size:14pt; letter-spacing:4mm; color:#888; white-space:nowrap; }
.draw { border:2px solid #22262B; border-radius:3mm; height:42mm; }
table { width:100%; border-collapse:collapse; text-align:center; } td,th { border:1.5px solid #22262B; height:9mm; font-size:11.5pt; }
th { background:#F2F4F6; }
.foot { margin-top:3mm; font-size:10pt; color:#5B6168; display:flex; justify-content:space-between; }
</style></head><body>
<div class="top"><div><h1>${E(title)}</h1><div class="sub">${E(area.shortName)} · ${E(topic.title)} · ${lv}</div></div><div class="name">이름 <span></span></div></div>
<div class="stripe"></div>
<h2><b>1</b>그림과 알맞은 약속을 선으로 이어요.</h2><div class="match">${rows}</div>
<h2><b>2</b>맞으면 O, 틀리면 X에 동그라미 해요.</h2><div class="ox"><ul>${ox}</ul></div>
<h2><b>3</b>${draw}</h2><div class="draw"></div>
<h2><b>4</b>${level === "teen" ? "이번 주 나의 약속을 지켰다면 ○ 해요." : "가족과 함께 약속을 지켰다면 ○ 해요."}</h2>
<table><tr><th>약속</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th></tr><tr><td>${E(wrapTxt)}</td><td></td><td></td><td></td><td></td><td></td></tr></table>
<div class="foot"><span>보호자 확인 ____________</span><span>${area.optional ? "지역아동센터 추가 교육" : "지역아동센터 6대 의무교육"} · ${E(area.shortName)}</span></div>
</body></html>`;
}

(async () => {
  const data = loadData();
  const list = eachLesson(data, onlyFilter(process.argv)).filter(x => !x.L.customFiles);
  if (!list.length) { console.log("만들 활동지가 없어요."); return; }
  const browser = await launchBrowser();
  const page = await browser.newPage();
  const tooLong = [];
  fs.mkdirSync(path.join(ROOT, "worksheets"), { recursive: true });
  for (const { area, topic, level, L } of list) {
    const base = path.join(ROOT, "worksheets", `${topic.id}-${level}`);
    fs.writeFileSync(base + ".html", worksheetHtml(area, topic, level, L), "utf8");
    await page.goto("file:///" + (base + ".html").replace(/\\/g, "/"));
    await page.emulateMedia({ media: "print" });
    if (await page.evaluate(() => document.body.scrollHeight) > 1060) tooLong.push(`${topic.id}-${level}`);
    await page.pdf({ path: base + ".pdf", format: "A4", printBackground: true, margin: { top: "10mm", bottom: "10mm", left: "14mm", right: "14mm" } });
    await page.emulateMedia({ media: "screen" });
    await page.setViewportSize({ width: 794, height: 1123 });
    await page.screenshot({ path: base + ".png" });
    process.stdout.write(".");
  }
  await browser.close();
  console.log(`\n✔ 활동지 ${list.length}개 만듦 (worksheets 폴더)`);
  if (tooLong.length) console.log("⚠ A4 1장을 넘을 수 있는 활동지: " + tooLong.join(", "));
})().catch(e => { console.error("✘ " + e.message); process.exit(1); });
