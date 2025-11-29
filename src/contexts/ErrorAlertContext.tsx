import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import AlertModal from '../components/common/AlertModal';
import { errorHandler } from '../utils/errorHandler';

interface AlertContextType {
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

/**
 * 전역 알림 Provider
 */
export const ErrorAlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = useCallback((
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    title?: string
  ) => {
    const defaultTitles = {
      success: '성공',
      error: '오류',
      warning: '경고',
      info: '알림',
    };

    setAlertState({
      isOpen: true,
      title: title || defaultTitles[type],
      message,
      type,
    });
  }, []);

  const showError = useCallback((message: string, title?: string) => {
    showAlert(message, 'error', title);
  }, [showAlert]);

  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert(message, 'success', title);
  }, [showAlert]);

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert(message, 'warning', title);
  }, [showAlert]);

  const showInfo = useCallback((message: string, title?: string) => {
    showAlert(message, 'info', title);
  }, [showAlert]);

  const handleClose = useCallback(() => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // errorHandler로부터 에러 이벤트 수신
  useEffect(() => {
    const unsubscribe = errorHandler.subscribe(({ message, title }) => {
      showError(message, title);
    });

    return unsubscribe;
  }, [showError]);

  return (
    <AlertContext.Provider value={{ showError, showSuccess, showWarning, showInfo }}>
      {children}
      <AlertModal
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={handleClose}
      />
    </AlertContext.Provider>
  );
};

/**
 * 전역 알림 Hook
 */
export const useErrorAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useErrorAlert must be used within ErrorAlertProvider');
  }
  return context;
};

/**
 * 전역 알림 Hook (별칭)
 */
export const useAlert = useErrorAlert;
