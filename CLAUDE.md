# Toktown_v3 작업 지침

## NFC 키링 리다이렉트 유지보수
- vercel.json의 /k/:id redirect destination은 "/" 고정 — 같은 배포의 데모 메인으로
  이동하므로 데모가 재배포되어도 URL 갱신이 필요 없다
- 데모를 다른 도메인/서비스로 이전할 때만 destination을 절대 URL로 교체하고,
  그 교체는 이전 작업과 같은 커밋에 포함할 것
- permanent: false (302) 절대 변경 금지

## 배포 정보
- 프로덕션: https://toktown-v3.vercel.app (Vercel, main 브랜치 자동 배포)
- NFC 키링 20개에 기록될 URL: https://toktown-v3.vercel.app/k/01 ~ /k/20
- 이 프로젝트 삭제/이름 변경 금지 — 키링이 물리적으로 이 도메인을 가리킴
- main에 push하면 자동 재배포됨. 데모 수정은 main 머지만 하면 키링에 즉시 반영
