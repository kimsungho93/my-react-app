# Claude Code 프로젝트 메모

## 프로젝트 정보
- **언어**: 한국어
- **스택**: React + TypeScript + Vite / Spring Boot REST API
- **상태관리**: Redux Toolkit
- **HTTP**: Axios

---

## 프론트엔드 코드 작성 가이드

### 디렉토리 구조
```
src/
├── assets/         # 이미지, 폰트, 아이콘
├── components/
│   ├── common/     # 공통 컴포넌트 (Button, Input, Modal)
│   └── layout/     # 레이아웃 (Header, Footer, Sidebar)
├── features/       # 기능별 모듈 (components, hooks, api, types)
├── pages/          # 페이지 (라우트 1:1)
├── hooks/          # 커스텀 훅
├── services/
│   ├── api/        # axios 인스턴스, API 호출
│   └── storage/    # localStorage, sessionStorage
├── store/slices/   # Redux Toolkit
├── types/          # 공통 타입
├── utils/          # 유틸리티, 상수
├── styles/         # 전역 스타일, 테마
└── routes/         # 라우팅, PrivateRoute
```

### 핵심 원칙
1. **ES6+ & TypeScript** - 최신 문법, Optional Chaining, Nullish Coalescing
2. **간결성** - DRY, 명확한 네이밍, JSDoc 한글 주석
3. **API** - `services/api/` 분리, 타입 명시, 인터셉터 에러 핸들링
4. **상태** - 전역(Redux Toolkit + createAsyncThunk), 로컬(useState)
5. **렌더링 최적화** - React.memo, useMemo, useCallback, 상태 로컬화, 안정적인 key
6. **컴포넌트** - 단일 책임, Early return, Props drilling 방지
7. **모바일 우선** - 모든 UI/UX는 모바일 환경을 최우선으로 고려하여 설계

### 안티패턴 회피
- ❌ Prop Drilling, 거대 컴포넌트(500줄+), Inline 함수, index as key, 직접 state 변경
- ✅ Custom Hooks, Compound Components, Error Boundaries, Code Splitting

### 명명 규칙
- 컴포넌트: `PascalCase.tsx`
- 훅: `useCamelCase.ts`
- 타입: `PascalCase.types.ts`
- 상수: `UPPER_SNAKE_CASE`
- 폴더: camelCase 또는 kebab-case

---

## 모바일 환경 최우선 가이드

### 반응형 디자인
1. **Mobile First 접근**
   - 기본 스타일은 모바일(320px~768px)을 기준으로 작성
   - 데스크톱은 미디어 쿼리로 확장 (`@media (min-width: 769px)`)
   - Breakpoints: Mobile(~768px), Tablet(769px~1024px), Desktop(1025px+)

2. **터치 친화적 UI**
   - 버튼/링크 최소 터치 영역: 44x44px (Apple HIG 기준)
   - 충분한 여백으로 오탭 방지
   - 스와이프, 드래그 제스처 고려
   - Hover 효과 대신 Active 상태 활용

3. **성능 최적화**
   - 이미지 lazy loading, WebP 포맷 우선
   - 번들 사이즈 최소화 (Code Splitting, Tree Shaking)
   - 3G/4G 환경 고려한 API 호출 최적화
   - 로딩 스켈레톤 UI 적극 활용

4. **레이아웃**
   - Flexbox/Grid로 유연한 레이아웃
   - 고정 너비 대신 상대 단위(%, vw, rem) 사용
   - 가로 스크롤 지양, 세로 스크롤 중심
   - Safe Area 고려 (iOS Notch, Android Navigation Bar)

5. **타이포그래피**
   - 최소 본문 폰트: 16px (가독성 확보)
   - 줄 간격(line-height): 1.5~1.8
   - 한글은 충분한 자간(letter-spacing) 고려

6. **네비게이션**
   - 햄버거 메뉴, 하단 탭바 등 모바일 패턴 우선
   - 중요 액션은 엄지 영역(화면 하단 중앙) 배치
   - 뒤로가기, 스크롤 위치 복원 등 모바일 UX 고려

### 테스트 체크리스트
- ✅ Chrome DevTools 모바일 시뮬레이터 테스트
- ✅ 실제 디바이스(iOS/Android) 테스트
- ✅ 다양한 화면 크기(320px, 375px, 414px 등) 확인
- ✅ 가로/세로 모드 전환 테스트
- ✅ 느린 네트워크(3G) 환경 시뮬레이션

---

