# 🤖 Claude Code 프로젝트 - LLM 코딩 지침서

## 1\. 프로젝트 개요 (Project Overview)

| 분류           | 스택                                         |
| :------------- | :------------------------------------------- |
| **언어**       | 한국어                                       |
| **프론트엔드** | React + **TypeScript** + Vite                |
| **상태 관리**  | **Redux Toolkit** (`createAsyncThunk` 포함)  |
| **HTTP 통신**  | **Axios** (API 분리 및 인터셉터 에러 핸들링) |
| **백엔드**     | Spring Boot REST API                         |
| **핵심 목표**  | **모바일 환경 최우선** (Mobile First)        |

---

## 2\. 프론트엔드 코드 표준 (Frontend Code Standards)

### 2.1. 디렉토리 구조 📂

LLM은 아래 구조를 **절대적으로 준수**해야 합니다.

```
src/
├── assets/         # 이미지, 폰트, 아이콘
├── components/
│   ├── common/     # 공통 컴포넌트 (Button, Input, Modal)
│   └── layout/     # 레이아웃 (Header, Footer, Sidebar)
├── features/       # 기능별 모듈 (components, hooks, api, types)
├── pages/          # 페이지 (라우트 1:1)
├── hooks/          # 커스텀 훅
├── services/
│   ├── api/        # axios 인스턴스, API 호출
│   └── storage/    # localStorage, sessionStorage
├── store/slices/   # Redux Toolkit
├── types/          # 공통 타입
├── utils/          # 유틸리티, 상수
├── styles/         # 전역 스타일, 테마
└── routes/         # 라우팅, PrivateRoute
```

### 2.2. 핵심 원칙 및 안티패턴 💡

| 분류       | 원칙 (✅)                                                                                            | 안티패턴 (❌)                            |
| :--------- | :--------------------------------------------------------------------------------------------------- | :--------------------------------------- |
| **언어**   | **TypeScript**, ES6+ (Optional Chaining, Nullish Coalescing), **JSDoc 한글 주석**                    | 직접 state 변경                          |
| **설계**   | **DRY**, **단일 책임** 원칙, **Custom Hooks**, **Compound Components**, Early return                 | Prop Drilling, 거대 컴포넌트(500줄 이상) |
| **상태**   | 전역(**Redux Toolkit**), 로컬(**useState**), **상태 로컬화** 최우선                                  | -                                        |
| **API**    | `services/api/` 분리, 타입 명시, 인터셉터 에러 핸들링                                                | -                                        |
| **최적화** | **React.memo**, **useMemo**, **useCallback**, **Error Boundaries**, **Code Splitting**, 안정적인 key | Inline 함수, index as key                |

### 2.3. 명명 규칙 (Naming Conventions)

- **컴포넌트**: `PascalCase.tsx`
- **훅**: `useCamelCase.ts`
- **타입**: `PascalCase.types.ts`
- **상수**: `UPPER_SNAKE_CASE`
- **폴더**: `camelCase` 또는 `kebab-case`

---

## 3\. 모바일 환경 최우선 가이드 (Mobile-First Guide)

### 3.1. 반응형 설계 및 UX 📱

1.  **Mobile First 접근**:
    - 기본 스타일은 모바일(**320px\~768px**) 기준.
    - 데스크톱은 미디어 쿼리(`@media (min-width: 769px)`)로 확장.
    - **Breakpoints**: Mobile(\~768px), Tablet(769px\~1024px), Desktop(1025px+).
2.  **터치/UI**:
    - 최소 터치 영역 **44x44px** 확보. 충분한 여백 사용.
    - Hover 대신 **Active 상태** 활용. 스와이프/드래그 제스처 고려.
    - **Safe Area** 고려 (iOS 노치, Android 내비게이션 바).
3.  **레이아웃**:
    - **Flexbox/Grid** 사용. 고정 너비 지양, **상대 단위(%, vw, rem)** 사용.
    - 가로 스크롤 지양, 세로 스크롤 중심.
4.  **성능**:
    - 이미지 **Lazy Loading**, **WebP** 포맷 우선.
    - **로딩 스켈레톤 UI** 적극 활용. 3G/4G 환경 최적화.
5.  **네비게이션**:
    - 햄버거 메뉴/하단 탭바 등 **모바일 패턴 우선**.
    - 중요 액션은 **엄지 영역(화면 하단 중앙)** 배치.

### 3.2. 테스트 필수 체크리스트 🧪

- ✅ Chrome DevTools 모바일 시뮬레이터 (다양한 크기 확인)
- ✅ 실제 디바이스 (iOS/Android) 확인
- ✅ 가로/세로 모드 전환
- ✅ 느린 네트워크(3G) 환경 시뮬레이션

---

## 4\. LLM 작업 지침 (Instruction for Agent)

에이전트는 제공된 모든 지침을 **엄격하게 준수**해야 합니다.

1.  모든 코드는 **TypeScript**로 작성합니다.
2.  주석은 **한글 JSDoc 스타일**로 작성합니다.
3.  **디렉토리 구조 (2.1)** 와 **명명 규칙 (2.3)** 은 예외 없이 지켜져야 합니다.
