// 선생님용 PPT를 데이터로 만들어요: slides/<주제id>-<학년>.pptx
// 실행: npm run slides                          (모두)
//       npm run slides -- --only=abuse-e-03-high
// 그림(SVG)은 브라우저로 찍어서 .cache/slide-img 에 JPG로 저장한 뒤 PPT에 넣어요.
const { fs, path, ROOT, loadData, eachLesson, onlyFilter, launchBrowser, ink } = require("./lib/common");
const pptxgen = require("pptxgenjs");

const CACHE = path.join(ROOT, ".cache", "slide-img");
const STRIPE = path.join(ROOT, "tools", "assets", "stripe.png");
const C = { text: "22262B", white: "FFFFFF", quizBg: "F2F8FF", gray: "D7DEE6", ok: "2DB86E", no: "E5484D" };
const jpgFor = rel => path.join(CACHE, rel.replace(/[\\/]/g, "__").replace(/\.svg$/, ".jpg"));

async function renderImages(list) {
  const need = new Set();
  // 캐시 그림이 없거나, 원본 그림(SVG)이 캐시보다 새로우면(그림을 고쳤으면) 다시 그려요
  const stale = rel => { const j = jpgFor(rel); return !fs.existsSync(j) || fs.statSync(path.join(ROOT, rel)).mtimeMs > fs.statSync(j).mtimeMs; };
  list.forEach(({ L }) => L.slides.forEach(s => { if (s.image && stale(s.image)) need.add(s.image); }));
  if (!need.size) return;
  fs.mkdirSync(CACHE, { recursive: true });
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1000, height: 750 } });
  for (const rel of need) {
    const svg = fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/class="(float|walker|step|bob|pop|pulse|al|ar)"/g, ""); // 움직임 없는 첫 장면
    await page.setContent(`<html><body style="margin:0">${svg.replace("<svg ", '<svg width="1000" height="750" ')}</body></html>`);
    await page.screenshot({ path: jpgFor(rel), type: "jpeg", quality: 85 });
  }
  await browser.close();
}

function buildDeck(area, topic, level, L) {
  const AC = ink(area.color).replace("#", "");   // 글씨용 진한 색 (흰 바탕·흰 글씨와 대비 4.8:1 이상)
  const lvName = { low: "저학년", high: "고학년", teen: "청소년" }[level] || level;
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625 inch
  pres.title = `${L.slides[0].title} – ${area.shortName} 교육`;
  pres.author = "6대 의무교육 도우미";
  pres.theme = { headFontFace: "Malgun Gothic", bodyFontFace: "Malgun Gothic" };
  const stripe = { image: { x: 0, y: 5.285, w: 10, h: 0.34, path: STRIPE } };
  pres.defineSlideMaster({ title: "PICTURE_TEXT", background: { color: C.white }, objects: [stripe] });
  pres.defineSlideMaster({ title: "QUIZ", background: { color: C.quizBg }, objects: [stripe] });
  pres.defineSlideMaster({ title: "COLOR", background: { color: AC }, objects: [stripe] });

  const flowFor = no => L.lessonFlow.find(f => f.slides.includes(no));
  const notes = (sl, no) => {
    const f = flowFor(no);
    return [f ? `[${f.step} · ${f.minutes}분] ${f.do}` : "", sl.script ? `🗣 대본: ${sl.script}` : "", sl.teacher ? `진행 팁: ${sl.teacher}` : ""].filter(Boolean).join("\n");
  };
  const titleSize = (t, promise) => promise ? (t.length <= 2 ? 66 : t.length === 3 ? 56 : t.length === 4 ? 46 : t.length <= 6 ? 38 : 30) : (t.length > 9 ? 30 : 38);

  let section = null;
  const SECTION = { cover: "도입", question: "도입", promise: "핵심 약속", video: "핵심 약속", quiz: "OX 퀴즈", activity: "활동", wrap: "정리" };
  const slide = (master, sl) => {
    const sec = SECTION[sl.type];
    if (sec !== section) { pres.addSection({ title: sec }); section = sec; }
    return pres.addSlide({ masterName: master, sectionTitle: sec });
  };

  L.slides.forEach((sl, idx) => {
    const no = idx + 1;
    if (["cover", "question", "promise", "activity"].includes(sl.type)) {
      const s = slide("PICTURE_TEXT", sl);
      if (sl.image) s.addImage({ path: jpgFor(sl.image), x: 0.45, y: 0.45, w: 5.2, h: 3.9, altText: sl.title });
      let y = 1.0;
      if (sl.type === "cover") { s.addText(`${area.shortName} 교육 · ${lvName}`, { x: 6.0, y: 0.7, w: 3.6, h: 0.45, fontSize: 18, color: AC, margin: 0, isTextBox: true }); y = 1.3; }
      if (sl.no) {
        s.addShape(pres.shapes.OVAL, { x: 6.0, y: 0.75, w: 0.8, h: 0.8, fill: { color: AC }, line: { color: AC } });
        s.addText(String(sl.no), { x: 6.0, y: 0.75, w: 0.8, h: 0.8, fontSize: 30, bold: true, color: C.white, align: "center", valign: "middle", margin: 0, isTextBox: true });
        y = 1.65;
      }
      s.addText(sl.title, { x: 6.0, y, w: 3.6, h: sl.no ? 1.3 : 1.5, fontSize: titleSize(sl.title, !!sl.no), bold: true, color: sl.no ? AC : C.text, margin: 0, valign: "top", isTextBox: true });
      s.addText((sl.text || "").replace(/\n/g, " "), { x: 6.0, y: y + (sl.no ? 1.4 : 1.55), w: 3.6, h: 1.5, fontSize: 20, color: C.text, margin: 0, valign: "top", isTextBox: true });
      s.addNotes(notes(sl, no));
    } else if (sl.type === "quiz") {
      sl.items.forEach((it, k) => [false, true].forEach(reveal => {
        const s = slide("QUIZ", sl);
        s.addText(`O X 퀴즈 ${k + 1} / ${sl.items.length}`, { x: 0.5, y: 0.4, w: 9, h: 0.45, fontSize: 18, color: AC, align: "center", margin: 0, isTextBox: true });
        s.addText(it.q, { x: 0.8, y: 0.9, w: 8.4, h: 1.3, fontSize: it.q.length > 30 ? 26 : 32, bold: true, color: C.text, align: "center", valign: "middle", margin: 0, isTextBox: true });
        // 정답 장면에 해설이 있으면 O X를 작게 올리고 아래에 해설을 넣어요
        const small = reveal && it.explain, d = small ? 1.15 : 1.7, oy = small ? 2.25 : 2.35;
        ["O", "X"].forEach((m, j) => {
          const right = reveal && it.a === m, dim = reveal && it.a !== m;
          const col = right ? (m === "O" ? C.ok : C.no) : C.gray;
          const ox = 2.65 + j * 3.0 + (1.7 - d) / 2;
          s.addShape(pres.shapes.OVAL, { x: ox, y: oy, w: d, h: d, fill: { color: C.white, transparency: dim ? 50 : 0 }, line: { color: col, width: right ? 8 : 5 } });
          s.addText(m, { x: ox, y: oy, w: d, h: d, fontSize: small ? 54 : 80, bold: true, color: right ? col : C.gray, align: "center", valign: "middle", margin: 0, isTextBox: true });
        });
        if (reveal) s.addText(`${it.a} · ${it.why}`, { x: 0.8, y: small ? 3.5 : 4.3, w: 8.4, h: 0.55, fontSize: 22, bold: !!small, color: small ? (it.a === "O" ? C.ok : C.no) : C.text, align: "center", margin: 0, isTextBox: true });
        if (small) s.addText(it.explain, { x: 1.0, y: 4.1, w: 8.0, h: 1.15, fontSize: 16, color: C.text, align: "center", valign: "middle", margin: 8, fill: { color: C.white }, rectRadius: 0.15, isTextBox: true });
        s.addNotes((reveal ? `정답: ${it.a} — ${it.why}${it.explain ? "\n해설: " + it.explain : ""}` : `정답은 ${it.a}예요. 아이들이 팔로 O 또는 X를 만들어 답하게 해요. 다음 장에 정답과 해설이 나와요.`) + (k === 0 && !reveal ? "\n" + notes(sl, no) : ""));
      }));
    } else if (sl.type === "video") {
      const s = slide("COLOR", sl), url = `https://www.youtube.com/watch?v=${sl.youtubeId}`;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1.6, y: 0.45, w: 6.8, h: 3.6, fill: { color: "2B2F36" }, line: { color: "2B2F36" }, rectRadius: 0.2 });
      s.addShape(pres.shapes.OVAL, { x: 4.3, y: 1.4, w: 1.4, h: 1.4, fill: { color: C.white }, line: { color: C.white }, hyperlink: { url } });
      s.addText("▶", { x: 4.3, y: 1.4, w: 1.4, h: 1.4, fontSize: 48, color: AC, align: "center", valign: "middle", margin: 0, isTextBox: true, hyperlink: { url } });
      s.addText([{ text: "누르면 유튜브에서 열려요", options: { hyperlink: { url } } }], { x: 1.6, y: 3.0, w: 6.8, h: 0.5, fontSize: 18, color: C.white, align: "center", margin: 0, isTextBox: true });
      s.addText(sl.title, { x: 1.6, y: 4.2, w: 3.4, h: 0.6, fontSize: 28, bold: true, color: C.white, margin: 0, isTextBox: true });
      s.addText(sl.source || "", { x: 5.0, y: 4.25, w: 3.4, h: 0.5, fontSize: 14, color: C.white, align: "right", margin: 0, isTextBox: true });
      s.addNotes(notes(sl, no) + "\n영상이 끝나면 다음 추천 영상이 나오기 전에 유튜브 창을 닫아 주세요.");
    } else if (sl.type === "wrap") {
      const s = slide("COLOR", sl);
      (sl.words || []).forEach(([ic, w], j) => {
        s.addShape(pres.shapes.OVAL, { x: 0.95 + j * 2.9, y: 0.75, w: 2.3, h: 2.3, fill: { color: C.white }, line: { color: C.white } });
        s.addText([{ text: ic, options: { fontSize: 40, breakLine: true } }, { text: w, options: { fontSize: w.length <= 2 ? 46 : w.length === 3 ? 38 : 30, bold: true, color: AC } }],
          { x: 0.95 + j * 2.9, y: 0.75, w: 2.3, h: 2.3, align: "center", valign: "middle", margin: 0, isTextBox: true });
      });
      s.addText(`${sl.title} · 다 같이 외쳐요!`, { x: 0.5, y: 3.5, w: 9, h: 0.8, fontSize: 32, bold: true, color: C.white, align: "center", margin: 0, isTextBox: true });
      s.addNotes(notes(sl, no));
    }
  });

  // 상황 장면(토의·역할극용) — 아이들에게 보여 줘도 되는 장
  if ((L.scenes || []).length) {
    pres.addSection({ title: "상황 장면" });
    L.scenes.forEach((sc, k) => {
      const s = pres.addSlide({ masterName: "PICTURE_TEXT", sectionTitle: "상황 장면" });
      s.addText(`🎬 상황 ${k + 1} · ${sc.title}`, { x: 0.6, y: 0.45, w: 8.8, h: 0.6, fontSize: 26, bold: true, color: AC, margin: 0, isTextBox: true });
      s.addText(sc.story, { x: 0.6, y: 1.25, w: 8.8, h: 2.0, fontSize: 22, color: C.text, margin: 0, valign: "top", isTextBox: true });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 3.45, w: 8.8, h: 1.3, fill: { color: "F2F8FF" }, line: { color: "D7DEE6" }, rectRadius: 0.12 });
      s.addText("함께 생각해요  " + sc.ask, { x: 0.8, y: 3.45, w: 8.4, h: 1.3, fontSize: 19, bold: true, color: C.text, valign: "middle", margin: 0, isTextBox: true });
      s.addNotes("활동 시간에 띄워 놓고 모둠 토의나 역할극에 써요. 정답을 정하기보다 이유를 말하게 해 주세요.");
    });
  }
  // 선생님용 배경지식 (주제마다 같음)
  const G = topic.guide;
  if (G && (G.background || []).length) {
    pres.addSection({ title: "선생님용" });
    const s = pres.addSlide({ masterName: "PICTURE_TEXT", sectionTitle: "선생님용" });
    s.addText("📚 알아 두면 좋아요 (선생님용)", { x: 0.5, y: 0.35, w: 9, h: 0.6, fontSize: 26, bold: true, color: C.text, margin: 0, isTextBox: true });
    s.addText(G.background.map((b, i) => ({ text: b, options: { bullet: true, paraSpaceAfter: 6, breakLine: i < G.background.length - 1 } })), { x: 0.5, y: 1.05, w: 9, h: 2.3, fontSize: 14, color: C.text, margin: 0, valign: "top", isTextBox: true });
    const fq = G.faq || [];
    if (fq.length) s.addText(fq.flatMap((q, i) => [{ text: "Q. " + q.q, options: { bold: true, color: AC, breakLine: true } }, { text: "A. " + q.a, options: { breakLine: i < fq.length - 1, paraSpaceAfter: 6 } }]), { x: 0.5, y: 3.4, w: 9, h: 1.8, fontSize: 13, color: C.text, margin: 0, valign: "top", isTextBox: true });
    s.addNotes("이 장은 선생님용이에요. 아이들에게 보여 줄 필요는 없어요.");
  }

  // 마지막 장: 선생님용 준비 메모
  if (!(G && (G.background || []).length)) pres.addSection({ title: "선생님용" });
  const s = pres.addSlide({ masterName: "PICTURE_TEXT", sectionTitle: "선생님용" });
  s.addText("선생님용 준비 메모", { x: 0.5, y: 0.35, w: 9, h: 0.6, fontSize: 30, bold: true, color: C.text, margin: 0, isTextBox: true });
  s.addText("준비물", { x: 0.5, y: 1.1, w: 4.2, h: 0.4, fontSize: 18, bold: true, color: AC, margin: 0, isTextBox: true });
  s.addText(L.materials.map((m, i) => ({ text: m, options: { bullet: true, breakLine: i < L.materials.length - 1 } })), { x: 0.5, y: 1.55, w: 4.2, h: 2.2, fontSize: 15, color: C.text, paraSpaceAfter: 4, margin: 0, valign: "top", isTextBox: true });
  s.addText("공식 자료", { x: 5.1, y: 1.1, w: 4.4, h: 0.4, fontSize: 18, bold: true, color: AC, margin: 0, isTextBox: true });
  const links = topic.links || [];
  if (links.length) s.addText(links.map((l, i) => ({ text: `${l.org} – ${l.title}`, options: { bullet: true, paraSpaceAfter: 10, hyperlink: { url: l.url }, breakLine: i < links.length - 1 } })), { x: 5.1, y: 1.55, w: 4.4, h: 2.3, fontSize: 14, color: C.text, margin: 0, valign: "top", isTextBox: true });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 3.95, w: 9, h: 0.9, fill: { color: "FFF7E0" }, line: { color: "F2D48A" }, rectRadius: 0.1 });
  s.addText("안전 주의  " + (L.safetyNote || ""), { x: 0.7, y: 3.95, w: 8.6, h: 0.9, fontSize: 13, color: C.text, valign: "middle", margin: 0, isTextBox: true });
  s.addNotes("이 장은 선생님용이에요. 아이들에게 보여 줄 필요는 없어요.");
  return pres;
}

(async () => {
  const data = loadData();
  const list = eachLesson(data, onlyFilter(process.argv));
  await renderImages(list);
  fs.mkdirSync(path.join(ROOT, "slides"), { recursive: true });
  for (const { area, topic, level, L } of list) {
    await buildDeck(area, topic, level, L).writeFile({ fileName: path.join(ROOT, "slides", `${topic.id}-${level}.pptx`) });
    process.stdout.write(".");
  }
  console.log(`\n✔ PPT ${list.length}개 만듦 (slides 폴더)`);
})().catch(e => { console.error("✘ " + e.message); process.exit(1); });
