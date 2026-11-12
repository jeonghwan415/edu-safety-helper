# CLAUDE.md — 6대 의무교육 도우미

이 파일은 VS Code에서 AI(Claude Code, Copilot 등)가 이 프로젝트를 이해하고 이어서 작업하도록 쓴 안내서예요.
기획은 `PRD.md`, 사용법은 `README.md`에 있어요. 작업 전에 이 파일과 PRD를 먼저 읽어 주세요.

## 프로젝트 한 줄 요약

지역아동센터 선생님(주로 40~50대, 컴퓨터가 익숙하지 않음)이 **영역 → 대상 → 주제**만 고르면,
아이들에게 TV로 띄울 슬라이드·40분 수업안·활동지·선생님용 PPT를 바로 쓰고,
교육 후 **한글(.hwpx) 프로그램일지**까지 만들 수 있는 웹 프로그램.
근거: 「아동복지법」 제31조, 시행령 제28조 **별표 6** (6개 영역, 연 44시간) → `docs/교육지침.png`

## 작업자(사용자) 정보

- 개발 비전공자. 지역아동센터 생활복지사 8년 9개월 경력. VS Code + GitHub로 개인과제 진행 중.
- 설명은 **쉬운 한국어**로, 바꾼 내용은 "무엇을 왜 바꿨는지" 짧게 알려 주세요.
- 큰 변경(파일 구조, 데이터 형식) 전에는 먼저 계획을 말하고 확인받아 주세요.

## 폴더 구조

```
index.html              프로그램 전체 (HTML+CSS+JS 한 파일, 빌드 없음, 외부 라이브러리 없음)
data/areas.json         ★ 원본 데이터 (별표 6 기준 + 60개 수업 내용). 여기만 고쳐요.
data/areas.js           areas.json으로 자동 생성 (npm run data). 직접 고치지 않아요.
data/hwpx-template.js   한글 프로그램일지 빈 양식(base64). 기록 → .hwpx 만들 때 씀
img/<주제id>/           슬라이드 그림(SVG). <학년>_<슬라이드번호>.svg
img/traffic-e-02/       보행법(저학년) 직접 그린 그림 (움직임 포함) — 자동 생성 대상 아님
worksheets/             활동지 <주제id>-<학년>.html / .pdf / .png(미리보기)
slides/                 선생님용 PPT <주제id>-<학년>.pptx
tools/                  자동 생성 도구 (Node.js) — 아래 "명령어" 참고
docs/                   별표 6 이미지, 프로그램일지 빈 양식·예시
.vscode/                Live Server 설정, 작업(Tasks) 메뉴
```

## 명령어 (VS Code 터미널)

처음 한 번: `npm install` (Edge/Chrome을 그대로 쓰므로 브라우저를 따로 받지 않아요)
주의: 이 컴퓨터는 PowerShell 실행 정책 때문에 `npm`(npm.ps1)이 막혀요. VS Code 터미널은 cmd로 설정해 뒀고, PowerShell에서는 `npm.cmd`를 쓰세요.

| 명령 | 하는 일 | 언제 |
|---|---|---|
| `npm run browser` | Edge·Chrome이 없는 컴퓨터(리눅스 서버 등)에 전용 크롬·부품·이모지 글꼴을 사용자 폴더에 받기 (관리자 권한 필요 없음) | **처음 한 번** (worksheets·slides가 "Edge나 Chrome을 찾지 못했어요"라고 할 때) |
| `npm run data` | areas.json → areas.js, 데이터 검사(44시간, 슬라이드 번호, 그림 파일, OX 정답) | **areas.json을 고친 뒤 항상** |
| `npm run cards` | slide.emoji로 없는 그림 카드 SVG 생성 (`-- --force`면 모두 다시) | 새 슬라이드·새 수업 추가 후 |
| `npm run worksheets` | 활동지 HTML/PDF/PNG 생성 | 퀴즈·약속 내용을 바꾼 뒤 |
| `npm run slides` | 선생님용 PPT 생성 | 슬라이드 내용을 바꾼 뒤 |
| `npm run build` | 위 4개를 순서대로 | 크게 바꾼 뒤 |

일부만: `npm run worksheets -- --only=abuse-e-03-high` (영역id, 주제id, 주제id-학년 모두 가능, 쉼표로 여러 개)
실행 확인: VS Code 오른쪽 아래 **Go Live** → `http://127.0.0.1:5500`

## 데이터 형식 (data/areas.json)

```
meta: { title, basis, checkedAt, totalHours: 44, levels, notes }
areas[]: { id, name, shortName, cycleMonths, requiredHours, color, icon, sourceOrgs[],
           topics: { elementary[], preschool[] } }
topic: { id: "<영역id>-e-<번호>", no, title(별표 6 원문), content: { low, high }, links[], extras?[] }
extras[] (추가 수업, 별표 6 주제는 그대로 두고 그 아래에 수업만 더함):
  { id(영어 소문자·숫자, 하이픈 금지), title, icon, links[], content: { low, high } }
  → 수업 id는 "<주제id>-<추가id>" (예: disaster-e-06-quake). 그림 img/<수업id>/, 활동지·PPT 파일 이름도 이 id를 써요.
  → 지금 있는 것: disaster-e-06(자연재난) 아래 quake·snow·storm·heat·dust, health-e-01(개인위생) 아래 epidemic,
    sexual-e-02(위험상황) 아래 grooming(사이버 그루밍)·game(게임 속 위험), sexual-e-03(예방법과 대처법) 아래 digital(디지털 성범죄),
    health-e-04(중독·오용·남용) 아래 drug(마약·유해약물)·vape(전자담배·니코틴), disaster-e-01(화재 원인) 아래 battery(배터리·충전 화재),
    missing-e-03(유인전략) 아래 sns(SNS·온라인 유인)  ← 2026-11-12 추가
extraAreas[] (★ 추가 교육 영역, 별표 6 밖): areas[]와 같은 모양 + { optional: true, badge, recommend, basis }, cycleMonths·requiredHours 없음
  → 지금은 rights(🌈 아동인권 교육) 1개: rights-e-01~06 (권리란·아동권리헌장·차별·참여권·디지털 권리·놀 권리), 12개 수업
  → 44회 계산·연간 계획표·이수 현황표 합계에는 넣지 않아요(isRequired). 찾기·기록·발표는 ALL_AREAS. 첫 화면에 "＋ 추가 교육" 점선 카드.
  → 주제 제목은 별표 6이 아니라서 사람이 정할 수 있어요(근거: 유엔아동권리협약·아동권리헌장 원문).
meta.lawNotes[] / meta.lawLinks[]: 법령 확인 기록 (첫 화면 아래 "📜 법령 확인 기록"에 나옴). 법을 다시 확인하면 checkedAt과 함께 고쳐요.
links[]: { org, title, url, checkedAt }
content.low / content.high (수업 1개):
  status: "검토 필요" | "검토 완료"
  goal, minutes(40), materials[], safetyNote, worksheet, slidesFile, customFiles?(true면 활동지 자동 생성 제외)
  lessonFlow[]: { step, minutes, slides:[슬라이드 번호, 1부터], do }   ← minutes 합 = content.minutes
  slides[]: 순서대로 발표 화면이 돼요
    cover    { title, text, image, emoji }
    question { title, text, image, emoji, teacher? }
    promise  { no, title, text, image, emoji, teacher? }   ← 보통 3개
    video    { title, text, youtubeId, source, teacher }    ← 공식 기관 채널 영상만
    quiz     { title, items:[{ q, a:"O"|"X", why, explain }] } ← 보통 4문항, 활동지에는 앞 3문항
             why = 정답 옆 짧은 이유(한 줄), explain = 해설 2문장(정답 화면·선생님 메모·수업 흐름 탭·PPT에 나옴)
    activity { title, text, image, emoji, teacher }
    wrap     { title, words:[[이모지, 짧은 말] ×3] }       ← 2~4글자 권장
```
- 영역 id: `sexual`(성폭력) `abuse`(아동학대) `missing`(실종·유괴) `health`(보건위생) `disaster`(재난) `traffic`(교통) + 추가 교육 `rights`(아동인권)
- 학년(level): `low`(저학년) `high`(고학년). 화면의 "함께"(`mix`)는 low 자료를 씀.
- 슬라이드 글의 `\n`은 화면에서 줄바꿈돼요. 한 줄은 짧게(약 15자).

## 진행 계산 규칙 (사용자 결정, 2026-11-10)

- **기록 1건 = 수업 1회 = 1시간(1차시) 인정.** 교육 시간(분)은 계산에 쓰지 않아요(`SESSION_HOURS = 1`, `SESSION_NOTE`).
- 화면에는 별표 6의 'N시간 이상'을 'N회 이상'으로 보여 줘요. areas.json의 requiredHours(별표 6 원문)는 그대로 둬요.
- 기록하기 화면에 시간 입력칸은 없어요(수업의 기본 minutes를 숨은 값으로만 저장).

## index.html 구조 (주요 함수)

- 주소(#해시)로 화면 이동: `#home`, `#area-<영역>`, `#area-<영역>-<학년>`, `#pick-<영역>-<주제id>-<학년>`(추가 수업 고르기), `#topic-<영역>-<수업id>-<학년>`,
  `#write-<영역>-<주제id>-<학년>`(기록하기), `#log-<기록id>`(일지), `#edit-<기록id>`, `#records`(목록), `#plan`(연간 계획표), `#report`(이수 현황표)
  → `parseHash()`, `render()`. 해시는 하이픈만 써요(`#/` 형식 금지: 미리보기 사이트에서 안 됨).
- 수업 찾기: `lessonTopics(topic)`(기본+추가 수업), `findTopic(영역, 수업id)`, `baseTopicId`(추가 수업 → 별표 6 주제, 진행표·추천에 씀). tools/lib/common.js에도 같은 `lessonTopics`가 있어요.
- 화면: `viewHome` `viewLevel` `viewTopics` `viewPick` `viewLesson`(탭 5개: 시각자료·수업 흐름·활동지·자료 링크·AI에게 부탁하기) `viewWrite` `viewLog` `viewRecords`
- 발표 모드: `buildSteps`(퀴즈는 문제→정답 2단계) `slideHTML`(1600×900 기준) `fitSlide`(글 넘치면 축소) `startShow/move/endShow`
- 영상: `playVideo` — youtube-nocookie, rel=0, 자동재생 다음 영상 없음, 끝나면 `showEnd`로 화면 가림. file:// 이나 `window.NO_EMBED`면 유튜브 링크로.
- 기록: localStorage `seh-records-v1`(기록 목록, topicId에는 수업id가 들어가요), `seh-prefs-v1`(장소·진행자·담당자, lastBackupAt)
  주기 알림은 지난해 기록까지 봐요(`areaStats.last`). 기록 3건 이상 + 30일 넘게 내보내기 안 하면 백업 알림(`backupBox`).
  기록하기 화면의 "저장하고 한글 파일 받기" = `submitRecord(..., true)`
  `draftContent`(진행내용 초안) `draftOpinion` `submitRecord` `exportRecords/importRecords`(JSON)
- 한글 일지: `buildHwpx` — 빈 양식 section0.xml의 표 칸(colAddr,rowAddr)에 글을 넣고 `zipStore`(무압축 zip, mimetype 맨 앞)로 묶음.
  칸 위치: 프로그램명(1,2) 제목(1,3) 담당자(4,3) 장소(1,4) 작성일자(4,4) 진행자(1,5) 준비물(4,5) 참여자(1,6) 진행내용(1,7) 담당자의견(1,8)
- 연간 계획표·이수 현황표: `buildPlan`(영역별 횟수 = 연간 시간÷1회 시간, 12달에 고르게) `planTableHTML` `viewPlan` / `reportRows`(시간·횟수·주기 간격 점검) `viewReport`. 복사는 `copyHtml`(HTML 표로 복사 → 한글에 Ctrl+V), 인쇄는 `@media print`
- AI에게 부탁하기: `viewAiHelp` `aiPrompt` `lessonText` — 부탁 글만 만들고 복사. **API 키·서버 호출 없음**(실시간 AI는 넣지 않아요)
- `window.NO_FILES = true`: 파일 받기 버튼 숨김(claude.ai 미리보기 사이트용 복사본에서만 씀)

## 디자인 규칙 (2026-11-12)

- 영역 색(`color`)은 테두리·막대·점 같은 **장식**에만 써요. 글씨와 흰 글씨가 올라가는 바탕은 **진한 색 `--cd`** = `ink(color)`(흰색과 대비 4.8:1 이상, index.html과 tools/lib/common.js에 같은 함수)를 써요. 새 화면도 `style="${cv(area)}"`로 두 색을 함께 넣어요.
- 그림 카드(make-cards.js)는 슬라이드 종류마다 모양이 달라요: cover 햇살+영역 배지, question 말풍선+물음표, promise 번호 배지 원, activity 종이+연필. **그림 안에 글자 넣지 않기**(활동지 짝짓기 정답이 보여요).
- 첫 화면 맨 위 "오늘의 추천 교육"(`urgency` → `todayBox`): 주기 넘김/안 함 → 주기 끝 임박 → 밀린 횟수 순. 영역 카드 순서는 **바꾸지 않아요**(늘 같은 자리가 선생님에게 편해요).

## 꼭 지킬 규칙

1. **별표 6의 시간·주기·세부 항목(주제 제목)은 AI가 바꾸거나 만들지 않아요.** 지침이 바뀌면 사람이 `docs/`의 원문을 보고 고쳐요.
2. AI가 쓴 수업 내용은 `status: "검토 필요"`로 넣어요. "검토 완료"는 사람이 바꿔요.
3. **성폭력·아동학대 수업**: 자극적·구체적 묘사 금지, 피해 아동 탓하는 표현 금지. "말해줘서 고마워, 네 잘못이 아니야", 선생님은 신고의무자(112) 안내 유지.
4. 신고·상담 번호는 확인된 것만: 112(경찰·아동학대 신고), 129(보건복지상담), 182(실종아동), 117(학교·여성폭력), 1342(마약류 상담), 119. 새 번호는 공식 출처를 확인하고 넣어요.
5. 외부 자료는 **링크만**(내용 복사 금지, 저작권). 영상은 공식 기관 채널만. 링크를 넣거나 확인하면 `checkedAt` 날짜를 적어요.
6. 그림은 직접 만든 것(SVG)이나 이모지만. 무섭거나 자극적인 그림 금지. 실존 캐릭터 금지.
7. 화면은 큰 글씨(본문 18px 이상), 큰 버튼(56px 이상), 쉬운 말. 새 버튼도 이 기준을 따라요.
8. `index.html`은 외부 라이브러리 없이 한 파일로 유지해요(센터 컴퓨터에서 더블클릭으로도 열려야 함). 폰트(Jua)만 Google Fonts.
9. 아이들 이름 등 개인정보는 기록에만, 그것도 선택 입력. 기록은 브라우저에만 저장돼요(서버 없음).
10. `data/areas.js`는 생성 파일이에요. 데이터는 `areas.json`만 고치고 `npm run data`를 돌려요.

## 새 수업(또는 취학 전) 자료를 추가하는 순서

1. `areas.json`에서 해당 topic의 `content.low`/`content.high`에 위 형식으로 수업 추가 (`status: "검토 필요"`)
2. `npm run cards` → `npm run data` (경고가 0개가 될 때까지 고치기)
3. `npm run worksheets -- --only=<주제id>` → `npm run slides -- --only=<주제id>`
4. Go Live로 수업 화면·발표 모드를 직접 넘겨 보며 확인

## 다음 할 일 (PRD 6주차~)

- 현장 선생님 2~3명 사용 테스트 → 고칠 점 반영
- 98개 수업 사람 검토 (특히 성폭력·아동학대, 새로 넣은 사이버 그루밍·게임·디지털 성범죄 6개, 재난·감염병 12개, 2026-11-12 추가한 아동인권 12개·마약·전자담배·배터리·SNS 유인 8개)
- 활동지·PPT는 2026-11-12에 98개 모두 다시 만들었어요(새 그림 카드·진한 글씨 색 반영).
- 취학 전(preschool) 수업은 만들지 않기로 했어요 (사용자 결정, 2026-11-10). 데이터의 항목 목록만 남겨 둬요.
- 배포: GitHub Pages. main 브랜치에 올리면 `.github/workflows/pages.yml`이 자동으로 배포해요
