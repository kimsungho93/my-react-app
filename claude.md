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

