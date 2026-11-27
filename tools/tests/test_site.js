// 6대 의무교육 도우미 브라우저 자동 테스트 (v1.4)
// 사용: node tools/tests/test_site.js [스크린샷폴더]
//   브라우저: playwright가 있으면 그 크롬, 없으면 CHROME_PATH(예: /usr/bin/google-chrome)
// 확인: 첫 화면·버전 표시 · 수업 화면 '검토 완료' · 기록 저장 → 일지 · [내 기록은 어디에?] 개인정보 안내·백업·모두 지우기 · 휴대폰 가로 넘침
let pw; try { pw = require('playwright'); } catch (e) { pw = require('playwright-core'); }
const path = require('path');
const out = process.argv[2];
const url = 'file://' + path.resolve(__dirname, '../../index.html');
(async () => {
  const b = await pw.chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const errs = [];
  const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) errs.push('실패: ' + m); };
  const open = async (vp, hash = '') => {
    const ctx = await b.newContext({ viewport: vp, acceptDownloads: true });
    await ctx.addInitScript(() => { Object.defineProperty(window, 'CENTER_CLOUD_CONFIG', { configurable: true, get() { return { url: '', anonKey: '' }; }, set() {} }); });   // '서버 연결 전' 화면 시험
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/youtube|fonts\.g|net::ERR/.test(m.text())) errs.push(m.text()); });
    p.on('dialog', d => { errs.push('브라우저 기본 창: ' + d.message()); d.dismiss(); });
    await p.goto(url + hash); await p.waitForTimeout(400); return p;
  };
  const p = await open({ width: 1280, height: 900 }, '#home');
  ok((await p.textContent('#appVer')).startsWith('v1.'), '화면 아래 버전 표시: ' + await p.textContent('#appVer'));
  ok(await p.isVisible('text=6대 의무교육'), '첫 화면 카테고리');
  // 데이터: 128개 수업 모두 검토 완료
  await p.evaluate(() => { location.hash = '#topic-traffic-traffic-e-02-low'; }); await p.waitForTimeout(500);
  ok((await p.textContent('body')).includes('검토 완료'), '수업 화면에 "검토 완료"');
  const broken = await p.$$eval('img', a => a.filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src')));
  ok(broken.length === 0, '수업 화면 그림 모두 열림 ' + broken.join(','));
  // 기록하기 → 저장 → 일지
  await p.evaluate(() => { location.hash = '#write-traffic-traffic-e-02-low'; }); await p.waitForTimeout(400);
  await p.fill('[name=children]', '12'); await p.fill('[name=leader]', '담당 교사');
  await p.click('#recForm button[type=submit]'); await p.waitForTimeout(500);
  ok(/#log-/.test(await p.evaluate(() => location.hash)), '저장하면 일지 화면으로');
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('seh-records-v1') || '[]').length) === 1, '교육 기록 1건 저장');
  // 내 기록은 어디에? (개인정보 안내 · 백업 · 모두 지우기)
  await p.click('#ccChip'); await p.waitForSelector('.cc-dlg[open]');
  const t = await p.textContent('.cc-dlg');
  ok(t.includes('개인정보 안내') && t.includes('선택 입력') && t.includes('1건의 교육 기록'), '개인정보 안내 + 기록 수(1건)');
  if (out) await p.screenshot({ path: out + '/se_local.png' });
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('.cc-dlg [data-a="backup"]')]);
  ok(/\.json$/.test(dl.suggestedFilename()), '[백업 파일 받기] → ' + dl.suggestedFilename());
  await p.click('.cc-dlg [data-a="wipe"]'); await p.click('.cc-dlg [data-v=""]');
  ok(await p.evaluate(() => !!localStorage.getItem('seh-records-v1')), '[취소]하면 그대로');
  await p.click('.cc-dlg [data-a="wipe"]');
  await Promise.all([p.waitForNavigation(), p.click('.cc-dlg [data-v="wipe"]')]); await p.waitForTimeout(600);
  ok(!(await p.evaluate(() => Object.keys(localStorage).some(k => k.startsWith('seh-')))), '[모두 지우기] → 교육 기록·담당자 설정 지움');
  ok((await p.textContent('#ccToast')).includes('모두 지웠어요'), '지운 뒤 알림');
  // 휴대폰: 가로로 넘치지 않음
  for (const h of ['#home', '#edu', '#topic-traffic-traffic-e-02-low', '#plan', '#report']) {
    const m = await open({ width: 390, height: 844 }, h);
    ok(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), '휴대폰 ' + h + ' 가로 넘침 없음');
    await m.context().close();
  }
  console.log('ERRORS:', errs.length ? errs.join('\n') : 'none'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
