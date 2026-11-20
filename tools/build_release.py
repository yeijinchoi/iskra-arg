#!/usr/bin/env python3
"""배포용 빌드: 원래 저장소의 실행 파일에서 베타테스트 기능을 빼고 배포 폴더에 복사한다.

사용법: python3 tools/build_release.py <배포 저장소 폴더>
- index.html: <!--DEV-->…<!--/DEV--> 와 /*DEV*/…/*/DEV*/ 사이를 지우고, <!--REL 글자 --> 는 글자로 바꾼다.
- img/, ending/, bgm/ 는 그대로 복사(배포 폴더의 같은 이름 폴더를 통째로 맞춤).
"""
import re, shutil, sys, pathlib
SRC = pathlib.Path(__file__).resolve().parent.parent
if len(sys.argv) != 2: sys.exit(__doc__)
DST = pathlib.Path(sys.argv[1]).resolve()
html = (SRC / 'index.html').read_text(encoding='utf-8')
html = re.sub(r'<!--DEV-->.*?<!--/DEV-->', '', html, flags=re.S)
html = re.sub(r'/\*DEV\*/.*?/\*/DEV\*/', '', html, flags=re.S)
html = re.sub(r'<!--REL (.*?) -->', r'\1', html)
for bad in ['<!--DEV', '/*DEV*/', 'jumpToStage', 'jumpToEnding', 'jumpToBad', 'applyJump', '베타테스트용)', '바로가기 (베타']:
    if bad in html: sys.exit(f'배포용에 베타테스트 흔적이 남음: {bad}')
(DST / 'index.html').write_text(html, encoding='utf-8')
for d in ['img', 'ending', 'bgm']:
    if (DST / d).exists(): shutil.rmtree(DST / d)
    shutil.copytree(SRC / d, DST / d)
print('배포용 빌드 완료:', DST)
