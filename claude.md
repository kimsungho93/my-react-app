# 🤖 Claude Code 프로젝트 - LLM 코딩 지침서

## 1\. 프로젝트 개요 (Project Overview)

| 분류           | 스택                                         |
| :------------- | :------------------------------------------- |
| **언어**       | 한국어                                       |
| **프론트엔드** | React 19 + **TypeScript** + Vite             |
| **상태 관리**  | **Redux Toolkit** (`createAsyncThunk` 포함)  |
| **라우팅**     | **React Router DOM** (v7)                    |
| **HTTP 통신**  | **Axios** (API 분리 및 인터셉터 에러 핸들링) |
| **WebSocket**  | **STOMP.js** + **SockJS** (실시간 통신)      |
| **날짜/시간**  | **date-fns** (날짜 포맷, 비교, 계산)         |
| **애니메이션** | **Framer Motion** (컴포넌트 애니메이션)      |
| **UI 라이브러리** | **Material-UI (MUI)** + **Emotion** (스타일링) |
| **차트**       | **ECharts** (`echarts-for-react`)            |
| **캘린더**     | **React Big Calendar**                       |
| **3D 렌더링**  | **Three.js** + **React Three Fiber**         |
| **오디오**     | **Howler.js** (사운드 재생)                  |
| **드래그**     | **React Draggable**                          |
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

| 분류             | 원칙 (✅)                                                                                            | 안티패턴 (❌)                                     |
| :--------------- | :--------------------------------------------------------------------------------------------------- | :------------------------------------------------ |
| **언어**         | **TypeScript**, ES6+ (Optional Chaining, Nullish Coalescing), **JSDoc 한글 주석**                    | 직접 state 변경                                   |
| **설계**         | **DRY**, **단일 책임** 원칙, **Custom Hooks**, **Compound Components**, Early return                 | Prop Drilling, 거대 컴포넌트(500줄 이상)          |
| **상태 관리**    | 전역(**Redux Toolkit**), 로컬(**useState**), **상태 로컬화** 최우선                                  | -                                                 |
| **라우팅**       | **React Router DOM** (`useNavigate`, `useParams`, `<Link>`)                                          | `<a>` 태그 직접 사용, `window.location` 직접 조작 |
| **HTTP 통신**    | **Axios** (`services/api/` 분리, 타입 명시, 인터셉터 에러 핸들링)                                    | `fetch` 직접 사용                                 |
| **WebSocket**    | **STOMP.js + SockJS** (STOMP over WebSocket, 구독/발행 패턴)                                         | 네이티브 WebSocket 직접 사용                      |
| **날짜/시간**    | **date-fns** (`format`, `isToday`, `isYesterday`, `formatDistanceToNow`)                            | `new Date()` 직접 조작, 수동 시간 계산            |
| **애니메이션**   | **Framer Motion** (`motion` 컴포넌트, `variants`, `AnimatePresence`)                                  | CSS 트랜지션만 사용, 복잡한 애니메이션 수동 구현  |
| **UI 컴포넌트**  | **MUI** (`Button`, `TextField`, `Dialog` 등), **Emotion** (`styled`, `css`)                          | 인라인 스타일, 일반 HTML 요소만 사용              |
| **차트**         | **ECharts** (`echarts-for-react` 래퍼 사용)                                                          | 차트 라이브러리 없이 직접 Canvas/SVG 그리기       |
| **캘린더**       | **React Big Calendar** (일정 표시, 이벤트 관리)                                                      | 캘린더 UI 직접 구현                               |
| **3D/그래픽**    | **Three.js + React Three Fiber** (선언적 3D 렌더링)                                                  | Three.js 명령형 방식 직접 사용                    |
| **오디오**       | **Howler.js** (사운드 재생, 볼륨 제어, 페이드 효과)                                                  | `<audio>` 태그 직접 조작                          |
| **드래그 앤 드롭** | **@dnd-kit/core + @dnd-kit/sortable** (정렬/재배치), **React Draggable** (단순 이동)                 | 드래그 이벤트 직접 핸들링                         |
| **최적화**       | **React.memo**, **useMemo**, **useCallback**, **Error Boundaries**, **Code Splitting**, 안정적인 key | Inline 함수, index as key                         |

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

### 4.1. 기본 규칙

1.  모든 코드는 **TypeScript**로 작성합니다.
2.  주석은 **한글 JSDoc 스타일**로 작성합니다.
3.  **디렉토리 구조 (2.1)** 와 **명명 규칙 (2.3)** 은 예외 없이 지켜져야 합니다.

### 4.2. 라이브러리 우선 사용 규칙

새로운 기능을 구현할 때 **반드시** 아래 라이브러리를 우선적으로 고려하세요:

| 기능 요구사항 | 사용할 라이브러리 | 예시 |
| :------------ | :---------------- | :--- |
| **페이지 이동/라우팅** | React Router DOM | `useNavigate()`, `<Link to="/path">` |
| **API 호출** | Axios | `chatApi.getChatRooms()` (services/api/ 분리) |
| **실시간 통신 (WebSocket)** | STOMP.js + SockJS | `client.subscribe('/topic/chat')` |
| **날짜 포맷/계산** | date-fns | `format(date, 'yyyy.MM.dd')`, `isToday(date)` |
| **애니메이션 효과** | Framer Motion | `<motion.div animate={{ opacity: 1 }}>` |
| **버튼/입력/모달 등 UI** | Material-UI (MUI) | `<Button variant="contained">`, `<Dialog>` |
| **스타일링 (CSS-in-JS)** | Emotion | `styled.div`, `css` prop |
| **차트 그리기** | ECharts (echarts-for-react) | `<ReactECharts option={...} />` |
| **캘린더/일정** | React Big Calendar | `<Calendar events={...} />` |
| **3D 렌더링** | React Three Fiber | `<Canvas><mesh /></Canvas>` |
| **사운드 재생** | Howler.js | `new Howl({ src: ['sound.mp3'] })` |
| **정렬/재배치 드래그** | @dnd-kit/core + @dnd-kit/sortable | `<DndContext><SortableContext items={...}>` |
| **단순 드래그 이동** | React Draggable | `<Draggable><div>...</div></Draggable>` |

**중요**: 위 기능을 구현할 때 네이티브 API(fetch, WebSocket, Date 등)나 직접 구현 대신 **반드시 해당 라이브러리**를 사용하세요.

**드래그 앤 드롭 선택 가이드**:
- 리스트/그리드 아이템 정렬, 순서 변경 → **@dnd-kit** 사용
- 단순 요소 위치 이동 (예: 드래그 가능한 모달) → **React Draggable** 사용
