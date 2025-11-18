import { configureStore } from "@reduxjs/toolkit";
import layoutReducer from "./slices/layoutSlice";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice";
import budgetReducer from "./slices/budgetSlice";

/**
 * Redux Store 설정
 */
export const store = configureStore({
  reducer: {
    layout: layoutReducer,
    theme: themeReducer,
    auth: authReducer,
    budget: budgetReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // MUI 아이콘 컴포넌트 직렬화 이슈 방지
    }),
});

/**
 * RootState 타입 추출
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * AppDispatch 타입 추출
 */
export type AppDispatch = typeof store.dispatch;
