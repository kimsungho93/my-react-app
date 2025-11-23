import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  // server: {
  //   proxy: {
  //     // 로컬 개발 환경용 프록시 설정
  //     // 프로덕션 배포 시에는 이 설정이 사용되지 않음

  //     // WebSocket 프록시 (로컬)
  //     "/ws": {
  //       target: "http://localhost:8080",
  //       ws: true, // WebSocket 프록시 활성화
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //     // API 프록시 (로컬)
  //     "/api": {
  //       target: "http://localhost:8080",
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
});
