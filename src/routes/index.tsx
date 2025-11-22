import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { PrivateRoute } from "./PrivateRoute";
import Dashboard from "../pages/Dashboard";
import { Login } from "../pages/Login/Login";
import Ladder from "../pages/Game/Ladder";
import Roulette from "../pages/Game/Roulette";
import ChatList from "../pages/Community/ChatList";
import ChatCreate from "../pages/Community/ChatCreate";
import BoardList from "../pages/Community/BoardList";
import FeedList from "../pages/Community/FeedList";
import CreateSuggestion from "../pages/CustomerService/CreateSuggestion";
import SuggestionList from "../pages/CustomerService/SuggestionList";
import SuggestionDetail from "../pages/CustomerService/SuggestionDetail";

/**
 * 애플리케이션 라우팅 설정
 */
export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        path: "",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "",
        element: <MainLayout />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "game/ladder",
            element: <Ladder />,
          },
          {
            path: "game/roulette",
            element: <Roulette />,
          },
          {
            path: "community/chat/list",
            element: <ChatList />,
          },
          {
            path: "community/chat/create",
            element: <ChatCreate />,
          },
          {
            path: "community/board/list",
            element: <BoardList />,
          },
          {
            path: "community/feed/list",
            element: <FeedList />,
          },
          {
            path: "customer-service/suggestions",
            element: <SuggestionList />,
          },
          {
            path: "customer-service/suggestions/create",
            element: <CreateSuggestion />,
          },
          {
            path: "customer-service/suggestions/:id",
            element: <SuggestionDetail />,
          },
          //   {
          //     path: 'sales/orders',
          //     element: <SalesOrders />,
          //   },
          //   {
          //     path: 'sales/customers',
          //     element: <SalesCustomers />,
          //   },
          // 나머지 라우트...
        ],
      },
    ],
  },
]);
