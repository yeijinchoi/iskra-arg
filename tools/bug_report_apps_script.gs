/**
 * 이스크라 오류 제보 → 구글 시트 기록용 Apps Script
 *
 * 설치 방법
 * 1. 기록할 구글 시트의 ID를 아래 SHEET_ID에 넣는다(이미 넣어 둠).
 * 2. https://script.google.com 에서 [새 프로젝트]를 만든다.
 *    (또는 시트 메뉴 [확장 프로그램] → [Apps Script]에서 열어도 된다.)
 * 3. 기본 코드를 모두 지우고 이 파일 내용을 붙여 넣은 뒤 저장한다.
 * 4. 오른쪽 위 [배포] → [새 배포] → 유형 선택(톱니) → [웹 앱]
 *    - 실행 사용자: 나
 *    - 액세스 권한이 있는 사용자: 모든 사용자
 *    → [배포] → 권한 허용 → 나오는 "웹 앱 URL"(https://script.google.com/macros/s/…/exec)을 복사한다.
 * 5. 그 주소를 게임 index.html의 BUG_ENDPOINT에 넣는다.
 */
const SHEET_ID = '1-AtoJRsSk8ThjEX1zixUZ6VCOvLhmIhgvAOcnvsDPRs';   /* 기록할 구글 시트(주소의 /d/ 와 /edit 사이) */
const SHEET_NAME = '제보';
const HEADERS = ['받은 시각', '종류', '내용', '화면', '진행 단계', '플레이어 이름', '브라우저', '화면 크기', '최근 오류', '게임 버전'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);   /* 시트 안에서 열지 않고 script.google.com에서 따로 만들어도 동작 */
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); }
    let d = {};
    try { d = JSON.parse(e.postData.contents); } catch (err) { d = {}; }
    // 수식으로 해석되지 않게(=, +, -, @ 로 시작하면 앞에 ' 를 붙임), 길이 제한
    const clean = (v, n) => { let s = String(v == null ? '' : v).slice(0, n); return /^[=+\-@]/.test(s) ? "'" + s : s; };
    sh.appendRow([
      new Date(),
      clean(d.type, 20), clean(d.text, 2000),
      clean(d.screen, 200), clean(d.stage, 30), clean(d.name, 20),
      clean(d.ua, 300), clean(d.size, 30), clean(d.errors, 1000), clean(d.ver, 40)
    ]);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

/* 주소를 브라우저로 열었을 때 확인용 */
function doGet() {
  return ContentService.createTextOutput('이스크라 오류 제보 수신 중');
}
