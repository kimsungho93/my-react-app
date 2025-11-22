import {
  Dashboard,
  Settings,
  AccountCircle,
  Security,
  Notifications,
  SportsEsports,
  ContactSupport,
  Feedback,
  QuestionAnswer,
  List,
  Forum,
  Chat,
  Article,
  DynamicFeed,
  ViewList,
} from "@mui/icons-material";
import type { MenuItem } from "../types/menu.types";

/**
 * 애플리케이션 메뉴 구조 정의
 * 계층적 구조를 지원하며 아이콘, 경로, 배지 등을 포함
 */
export const MENU_DATA: MenuItem[] = [
  {
    id: "dashboard",
    title: "대시보드",
    icon: Dashboard,
    path: "/dashboard",
  },
  {
    id: "game",
    title: "게임",
    icon: SportsEsports,
    children: [
      {
        id: "game-ladder",
        title: "사다리 타기",
        path: "/game/ladder",
      },
      {
        id: "game-roulette",
        title: "룰렛 돌리기",
        path: "/game/roulette",
      },
    ],
  },
  {
    id: "community",
    title: "커뮤니티",
    icon: Forum,
    children: [
      {
        id: "community-chat-list",
        title: "채팅",
        icon: Chat,
        path: "/community/chat/list",
      },
      {
        id: "community-board",
        title: "게시판",
        icon: Article,
        children: [
          {
            id: "community-board-list",
            title: "게시글 조회",
            icon: List,
            path: "/community/board/list",
          },
        ],
      },
      {
        id: "community-feed",
        title: "피드",
        icon: DynamicFeed,
        children: [
          {
            id: "community-feed-list",
            title: "피드 조회",
            icon: ViewList,
            path: "/community/feed/list",
          },
        ],
      },
    ],
  },
  {
    id: "customer-service",
    title: "고객센터",
    icon: ContactSupport,
    children: [
      {
        id: "customer-service-suggestions",
        title: "건의/문의",
        icon: QuestionAnswer,
        children: [
          {
            id: "customer-service-suggestion-list",
            title: "건의사항 조회",
            icon: List,
            path: "/customer-service/suggestions",
          },
          {
            id: "customer-service-create-suggestion",
            title: "건의하기",
            icon: Feedback,
            path: "/customer-service/suggestions/create",
          },
        ],
      },
    ],
  },
  {
    id: "settings",
    title: "설정",
    icon: Settings,
    children: [
      {
        id: "settings-profile",
        title: "프로필",
        icon: AccountCircle,
        path: "/settings/profile",
      },
      {
        id: "settings-security",
        title: "보안",
        icon: Security,
        path: "/settings/security",
      },
      {
        id: "settings-notifications",
        title: "알림 설정",
        icon: Notifications,
        path: "/settings/notifications",
      },
    ],
  },
];
