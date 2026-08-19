# Toktown_v3 작업 지침

## NFC 키링 리다이렉트 유지보수
- vercel.json의 /k/:id redirect destination은 "/" 고정 — 같은 배포의 데모 메인으로
  이동하므로 데모가 재배포되어도 URL 갱신이 필요 없다
- 데모를 다른 도메인/서비스로 이전할 때만 destination을 절대 URL로 교체하고,
  그 교체는 이전 작업과 같은 커밋에 포함할 것
- permanent: false (302) 절대 변경 금지
