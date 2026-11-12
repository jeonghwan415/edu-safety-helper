// Edge·Chrome이 없는 컴퓨터(리눅스 서버, VS Code 원격 등)에서 활동지 PDF·선생님용 PPT를 만들 수 있게
// Playwright 전용 크롬과 필요한 부품을 사용자 폴더에 받아요. 관리자 권한(sudo)이 없어도 돼요.
// 실행: npm run browser   (한 번만 하면 돼요)
const { execSync } = require("child_process");
const fs = require("fs"), path = require("path"), os = require("os");
const { ROOT, LINUX_LIBS } = require("./lib/common");

const run = (cmd, opt = {}) => execSync(cmd, { stdio: "inherit", ...opt });

console.log("① 전용 크롬 받기 (약 100MB, 처음 한 번만)");
run(`node "${path.join(ROOT, "node_modules", "playwright-core", "cli.js")}" install chromium-headless-shell`);

if (process.platform === "linux") {
  // 리눅스 서버에 자주 빠져 있는 부품 + 그림 카드용 컬러 이모지 글꼴
  const pkgs = ["libatk1.0-0t64", "libatk-bridge2.0-0t64", "libxdamage1", "libasound2t64", "libatspi2.0-0t64", "fonts-noto-color-emoji"];
  const deb = path.join(LINUX_LIBS, "deb");
  fs.mkdirSync(deb, { recursive: true });
  console.log("② 빠진 부품 받기 (관리자 권한 없이 사용자 폴더에)");
  try { run(`apt-get download ${pkgs.join(" ")}`, { cwd: deb }); }
  catch (e) { console.log("  ⚠ apt-get download가 안 돼요. Ubuntu가 아니면 관리자에게 위 부품 설치를 부탁해 주세요."); }
  for (const f of fs.readdirSync(deb).filter(f => f.endsWith(".deb"))) run(`dpkg-deb -x "${path.join(deb, f)}" "${path.join(LINUX_LIBS, "root")}"`);
  const emoji = path.join(LINUX_LIBS, "root", "usr", "share", "fonts", "truetype", "noto", "NotoColorEmoji.ttf");
  if (fs.existsSync(emoji)) {
    const dst = path.join(os.homedir(), ".local", "share", "fonts");
    fs.mkdirSync(dst, { recursive: true });
    fs.copyFileSync(emoji, path.join(dst, "NotoColorEmoji.ttf"));
    try { run(`fc-cache -f "${dst}"`, { stdio: "ignore" }); } catch (e) {}
    console.log("③ 컬러 이모지 글꼴 설치");
  }
}

console.log("④ 켜지는지 확인");
require("./lib/common").launchBrowser()
  .then(b => { console.log(`✔ 준비 끝 (크롬 ${b.version()}). 이제 npm run worksheets, npm run slides를 쓸 수 있어요.`); return b.close(); })
  .catch(e => { console.log("✖ " + e.message); process.exitCode = 1; });
