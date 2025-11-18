import {
  Dashboard,
  Settings,
  BarChart,
  Assessment,
  AccountCircle,
  Security,
  Notifications,
  SportsEsports,
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
  // {
  //   id: "sales",
  //   title: "영업 관리",
  //   icon: ShoppingCart,
  //   children: [
  //     {
  //       id: "sales-orders",
  //       title: "주문 관리",
  //       icon: Description,
  //       path: "/sales/orders",
  //       badge: 5, // 신규 주문 알림
  //     },
  //     {
  //       id: "sales-customers",
  //       title: "고객 관리",
  //       icon: People,
  //       path: "/sales/customers",
  //     },
  //   ],
  // },
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
    id: "analytics",
    title: "분석",
    icon: BarChart,
    children: [
      {
        id: "analytics-sales",
        title: "매출 분석",
        icon: Assessment,
        path: "/analytics/sales",
      },
      {
        id: "analytics-reports",
        title: "리포트",
        path: "/analytics/reports",
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
