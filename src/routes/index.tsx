import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { PrivateRoute } from "./PrivateRoute";
import Dashboard from "../pages/Dashboard";
import { Login } from "../pages/Login/Login";
import Ladder from "../pages/Game/Ladder";
import Roulette from "../pages/Game/Roulette";

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
