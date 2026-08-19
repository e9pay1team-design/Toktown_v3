# Toktown_v3 작업 지침

## NFC 키링 리다이렉트 유지보수
- vercel.json의 /k/:id redirect destination은 항상 최신 데모 배포 URL을 가리켜야 한다
- 데모 URL이 바뀌는 배포/이전 작업 시 destination 갱신을 같은 커밋에 포함할 것
- permanent: false (302) 절대 변경 금지
