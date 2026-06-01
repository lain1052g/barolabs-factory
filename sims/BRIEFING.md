# SIM 프로젝트 브리핑

## 프로젝트 개요

**sim.bareumlabs.kr** — 교육용 인터랙티브 시뮬레이션 리소스 창고

K-12 과학 교육용 인터랙티브 컴포넌트를 iframe으로 임베드 가능한 형태로 호스팅하는 서비스.
PhET(물리 시뮬레이션)처럼, 누구든 URL 하나로 가져다 쓸 수 있는 구조.
우리 과학 백과사전 앱에서도 쓰고, 외부 학교/출판사/플랫폼도 임베드 가능.

---

## 비즈니스 모델

- **무료**: 누구든 임베드 가능 → 하단에 "by bareumlabs" 로고 표시 (무료 광고 효과)
- **유료**: API 키 발급 → 로고 제거(화이트라벨), 커스텀 색상, 사용량 대시보드
- **B2B**: 교과서 출판사(천재교육 등), EBS, 클래스팅 등 연간 라이선스 계약

---

## 기술 구조

### 호스팅
- Next.js 15 App Router (Turborepo 모노레포 내 apps/sim/)
- Vercel 배포 → sim.bareumlabs.kr
- DB 없음 — 순수 프론트엔드 (URL 파라미터로 config 전달)

### URL 구조
```
sim.bareumlabs.kr/[type]?config=...

예:
sim.bareumlabs.kr/classify?items=강아지,붕어,참새,개구리&categories=육지,물속,하늘&grade=3
sim.bareumlabs.kr/label?config=base64EncodedJSON
sim.bareumlabs.kr/sequence?items=씨앗,새싹,꽃,열매&title=식물의한살이
```

### 임베드 방식
```html
<iframe 
  src="https://sim.bareumlabs.kr/classify?items=강아지,붕어&categories=육지,물속"
  width="600" height="400" frameborder="0">
</iframe>
```

---

## 구현할 시뮬레이션 유형 (우선순위 순)

| 우선순위 | 유형 | 설명 | 난이도 |
|---------|------|------|--------|
| 1 | classify | 분류 드래그앤드롭 | ⭐⭐ |
| 2 | label | 그림에 라벨 붙이기 | ⭐⭐ |
| 3 | sequence | 순서 배열 | ⭐⭐ |
| 4 | match | 매칭 (선 연결) | ⭐⭐⭐ |
| 5 | slider | 슬라이더 변화 관찰 | ⭐⭐⭐ |
| 6 | circuit | 전기 회로 조립 | ⭐⭐⭐⭐ |

---

## Config 스키마 (각 유형별)

### classify (분류 드래그앤드롭)
```json
{
  "title": "동물의 생활",
  "grade": "3",
  "items": [
    {"id": "dog", "label": "강아지", "image": "🐕", "answer": "육지"},
    {"id": "fish", "label": "붕어", "image": "🐟", "answer": "물속"}
  ],
  "categories": ["육지", "물속", "하늘"]
}
```

### label (라벨 붙이기)
```json
{
  "title": "식물의 구조",
  "grade": "4",
  "image": "plant.svg",
  "labels": [
    {"id": "root", "text": "뿌리", "x": 50, "y": 80},
    {"id": "stem", "text": "줄기", "x": 50, "y": 50}
  ]
}
```

### sequence (순서 배열)
```json
{
  "title": "식물의 한살이",
  "grade": "3",
  "items": [
    {"id": "seed", "label": "씨앗", "image": "🌱", "order": 1},
    {"id": "sprout", "label": "새싹", "image": "🌿", "order": 2},
    {"id": "flower", "label": "꽃", "image": "🌸", "order": 3},
    {"id": "fruit", "label": "열매", "image": "🍎", "order": 4}
  ]
}
```

---

## 공통 UX 요소 (모든 sim 공통)

- 모바일/터치 완전 지원 (학생들이 태블릿으로 씀)
- 완료 시 정답 확인 + 피드백 애니메이션
- 하단 "by bareumlabs" 로고 (무료 버전)
- API 키 파라미터 있으면 로고 숨김 (`?key=xxx`)
- 한국어 기본, 영어 전환 가능 (`?lang=en`)

---

## 모노레포 위치

```
C:/Users/lain1/OneDrive/Desktop/barolabs-factory/
└── apps/
    └── sim/         ← 여기 새로 생성
        ├── app/
        │   ├── classify/page.tsx
        │   ├── label/page.tsx
        │   └── sequence/page.tsx
        └── package.json
```

기술 스택: Next.js 15 App Router + Tailwind v4 + shadcn/ui
(바름랩스 표준 스택 그대로 — 별도 설정 불필요)

---

## 첫 번째 할 일

classify (분류 드래그앤드롭) 1개 완성 목표.

1. apps/sim 초기화 (Next.js 15)
2. /classify 페이지 구현
   - URL 파라미터 파싱
   - 드래그앤드롭 (모바일 터치 포함)
   - 정답 확인 + 피드백
   - by bareumlabs 로고
3. Vercel 배포 → sim.bareumlabs.kr
4. 테스트: iframe 임베드 확인
