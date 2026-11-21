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
 *
 * 코드를 고친 뒤에는 [배포] → [배포 관리] → 연필(수정) → 버전: [새 버전] → [배포]를 해야 반영된다(주소는 그대로).
 * 화면 캡처 저장을 위해 처음 한 번 드라이브 권한을 허용해야 한다.
 */
const SHEET_ID = '1-AtoJRsSk8ThjEX1zixUZ6VCOvLhmIhgvAOcnvsDPRs';   /* 기록할 구글 시트(주소의 /d/ 와 /edit 사이) */
const SHEET_NAME = '제보';
const SHOT_FOLDER = '이스크라 오류 제보 캡처';   /* 화면 캡처를 저장할 내 드라이브 폴더 이름 */
const HEADERS = ['받은 시각', '종류', '내용', '화면 캡처', '화면', '진행 단계', '플레이어 이름', '브라우저', '화면 크기', '최근 오류', '게임 버전'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);   /* 시트 안에서 열지 않고 script.google.com에서 따로 만들어도 동작 */
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) { sh.appendRow(HEADERS); sh.setFrozenRows(1); }
    else if (sh.getRange(1, 4).getValue() !== HEADERS[3]) sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);   /* 예전 머리줄이면 새 칸 구성으로 바꿈 */
    let d = {};
    try { d = JSON.parse(e.postData.contents); } catch (err) { d = {}; }
    // 수식으로 해석되지 않게(=, +, -, @ 로 시작하면 앞에 ' 를 붙임), 길이 제한
    // 화면 캡처(JPEG)는 드라이브 폴더에 저장하고 시트에는 링크만
    let shotUrl = '';
    if (d.shot && String(d.shot).length < 4000000) {
      try {
        const it = DriveApp.getFoldersByName(SHOT_FOLDER);
        const folder = it.hasNext() ? it.next() : DriveApp.createFolder(SHOT_FOLDER);
        const name = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd-HHmmss') + '.jpg';
        shotUrl = folder.createFile(Utilities.newBlob(Utilities.base64Decode(String(d.shot)), 'image/jpeg', name)).getUrl();
      } catch (err) { shotUrl = '(캡처 저장 실패)'; }
    }
    const clean = (v, n) => { let s = String(v == null ? '' : v).slice(0, n); return /^[=+\-@]/.test(s) ? "'" + s : s; };
    sh.appendRow([
      new Date(),
      clean(d.type, 20), clean(d.text, 2000), shotUrl,
      clean(d.screen, 200), clean(d.stage, 30), clean(d.name, 20),
      clean(d.ua, 300), clean(d.size, 30), clean(d.errors, 1000), clean(d.ver, 40)
    ]);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

/* 권한 허용용: 편집기 위쪽 함수 목록에서 setup 을 고르고 [실행]을 누르면 시트·드라이브 권한 창이 뜬다 */
function setup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const it = DriveApp.getFoldersByName(SHOT_FOLDER);
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder(SHOT_FOLDER);
  Logger.log('준비 완료: 시트 "' + ss.getName() + '", 캡처 폴더 "' + folder.getName() + '"');
}

/* 주소를 브라우저로 열었을 때 확인용 */
function doGet() {
  return ContentService.createTextOutput('이스크라 오류 제보 수신 중');
}
