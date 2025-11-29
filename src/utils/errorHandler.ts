/**
 * 에러 메시지 이벤트 타입
 */
export interface ErrorMessageEvent {
  message: string;
  title?: string;
}

type ErrorCallback = (event: ErrorMessageEvent) => void;

/**
 * 전역 에러 핸들러
 * axios 인터셉터와 React 컴포넌트 간 브릿지 역할
 */
class ErrorHandler {
  private listeners: ErrorCallback[] = [];

  /**
   * 에러 리스너 등록
   */
  subscribe(callback: ErrorCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * 에러 발생 알림
   */
  notify(message: string, title?: string) {
    this.listeners.forEach((callback) => {
      callback({ message, title });
    });
  }
}

export const errorHandler = new ErrorHandler();
