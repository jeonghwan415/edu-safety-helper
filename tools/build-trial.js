// 체험판 만들기: npm run trial  →  dist-trial/ 폴더 (공개용 저장소 edu-safety-helper-demo에 그대로 올려요)
// 원본(index.html, data …)은 바꾸지 않고, 복사본에 체험판 표시·사용 기한·인쇄 표시를 넣어요.
// 기한과 이름은 아래 TRIAL 한 곳에서만 고쳐요.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "dist-trial");
const TRIAL = { who: "박정환", end: "2026-12-31", endText: "2026.12.31", demo: "edu-safety-helper-demo" };
TRIAL.line = `체험판 · 만든 사람 ${TRIAL.who} · 무단 배포 금지 · ${TRIAL.endText}까지 사용 가능`;

let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8").replace(/\r\n/g, "\n");
function patch(a, b, all) {
  if (!html.includes(a)) throw new Error("체험판 패치 자리를 못 찾았어요: " + a.slice(0, 50));
  html = all ? html.split(a).join(b) : html.replace(a, () => b);
}
// 1) 주소: 원본 저장소가 비공개가 되어도 링크가 살아 있도록 체험판 저장소로
patch("jeonghwan415.github.io/edu-safety-helper/", `jeonghwan415.github.io/${TRIAL.demo}/`, true);
patch("github.com/jeonghwan415/edu-safety-helper/", `github.com/jeonghwan415/${TRIAL.demo}/`, true);
// 2) 이용 조건: 체험판은 보기·수업에 쓰기만 (나눠 주기·고쳐 쓰기 안 됨)
patch("자료 CC BY-NC-SA 4.0 (출처 표시·비영리)", `체험판 · 무단 배포 금지 · ${TRIAL.endText}까지`);
patch("<td><b>CC BY-NC-SA 4.0</b> — 저작자 표시 · 비영리 · 같은 조건으로 나누기</td>", "<td><b>체험판</b> — 보기와 우리 센터 수업에 쓰기만 돼요. 허락 없이 복사·배포·수정하지 마세요.</td>");
patch("<td><b>MIT 라이선스</b> — 자유롭게 쓰고 고칠 수 있어요 (저작권 표시 유지)</td>", "<td><b>체험판</b> — 허락 없이 복사·배포·수정하지 마세요.</td>");
// 3) 제목·검색 제외·인쇄 표시
patch("<title>", '<meta name="robots" content="noindex">\n<title>');
patch("</title>", " (체험판)</title>");
patch("</style>", `  @media print { body::after { content: "${TRIAL.line}"; position: fixed; left: 0; right: 0; bottom: 0; text-align: center; font: 9pt sans-serif; color: #444; }
    body::before { content: "체험판"; position: fixed; top: 40%; left: 0; right: 0; text-align: center; font: 700 90pt sans-serif; color: rgba(0,0,0,.07); transform: rotate(-20deg); z-index: 9999; pointer-events: none; } }
</style>`);
// 4) 맨 위 띠 + 기한이 지나면 안내만 보여 주고 프로그램은 켜지 않아요
const guard = `<script>(function(){var T=window.TRIAL=${JSON.stringify(TRIAL)};var d=new Date(),t=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");if(t>T.end){window.TRIAL_ENDED=true;document.write('<style>body>*:not(#trialEnd){display:none!important}</style><div id="trialEnd" style="max-width:520px;margin:18vh auto;padding:32px 24px;text-align:center;font:500 17px/1.7 sans-serif;color:#1F2A36;border:2px solid #1F6F5C;border-radius:16px;background:#F1FAF6"><div style="font-size:44px">📚</div><b style="font-size:22px">체험 기간이 끝났어요</b><br>이 체험판은 '+T.endText+'까지 쓸 수 있었어요.<br>계속 쓰고 싶으시면 만든 사람('+T.who+')에게 문의해 주세요.<br><small style="color:#667">적어 두신 교육 기록은 이 기기 안에 그대로 남아 있어요.</small></div>');}})();</script>
<div id="trialBar" class="no-print" style="background:#1F6F5C;color:#fff;text-align:center;padding:9px 16px;font:600 15px/1.5 sans-serif">체험판 · 만든 사람 ${TRIAL.who} · 무단 배포 금지 · <b>${TRIAL.endText}까지</b> 사용할 수 있어요<br><span style="font-weight:500;font-size:13.5px">수업 내용은 AI가 초안을 만들었어요. 수업마다 붙은 '검토 완료 / 사람 검토 전' 표시를 확인하고 써 주세요.</span></div>`;
html = html.replace(/<body([^>]*)>\n?/, (m) => m.replace(/\n?$/, "\n") + guard + "\n");
if (!html.includes('id="trialBar"')) throw new Error("<body>를 찾지 못했어요");
patch("  render();\n</script>", "  if (window.TRIAL_ENDED) document.title = '체험 기간이 끝났어요'; else render();\n</script>");

// 5) 폴더 만들기: 화면에 필요한 것만 (docs·tools·개발 파일은 빼요)
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "index.html"), html, "utf8");
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
for (const dir of ["data", "img", "worksheets", "slides"]) fs.cpSync(path.join(ROOT, dir), path.join(OUT, dir), { recursive: true });
fs.writeFileSync(path.join(OUT, "README.md"), `# 6대 의무교육 도우미 — 체험판

지역아동센터 6대 안전교육(연 44시간) 수업 자료와 기록을 돕는 프로그램의 **체험판**입니다.

- 열기: https://jeonghwan415.github.io/${TRIAL.demo}/
- **${TRIAL.endText.replace(/\./g, "년 ").replace(/년 (\d+)$/, "월 $1일")}까지** 쓸 수 있어요. 그 뒤에는 "체험 기간이 끝났어요" 안내만 보입니다.
- 교육 기록은 여는 사람의 기기(브라우저)에만 저장됩니다.
- 수업 내용은 AI가 초안을 만들었어요. 수업마다 '검토 완료' 또는 'AI 1차 점검 · 사람 검토 전' 표시가 있으니 확인하고 써 주세요.

만든 사람: ${TRIAL.who} · 무단 배포 금지 (허락 없이 복사하거나 다른 곳에 올리거나 고쳐 쓰지 마세요)
`, "utf8");
fs.writeFileSync(path.join(OUT, "LICENSE.md"), `# 이용 안내 (체험판)

이 저장소의 프로그램과 수업 자료는 체험용으로만 공개합니다. © ${new Date().getFullYear()} ${TRIAL.who}

- 됩니다: 화면을 열어 보기, 우리 센터 수업에 써 보기, 의견 보내기
- 안 됩니다: 허락 없이 복사·배포·수정, 다른 곳에 다시 올리기, 판매
- 사용 기한: ${TRIAL.endText}

법령은 저작권 보호 대상이 아니며(「저작권법」 제7조), 공식 기관 영상·누리집은 링크로만 연결합니다.
`, "utf8");
const size = (function du(p) { const s = fs.statSync(p); return s.isDirectory() ? fs.readdirSync(p).reduce((n, f) => n + du(path.join(p, f)), 0) : s.size; })(OUT);
console.log(`✔ dist-trial/ 를 만들었어요 (${(size / 1048576).toFixed(0)}MB) · ${TRIAL.line}`);
