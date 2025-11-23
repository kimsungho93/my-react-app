import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../hooks/useRedux';
import './AlertModal.css';

interface AlertModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 제목 */
  title: string;
  /** 메시지 */
  message: string;
  /** 알림 타입 */
  type?: 'success' | 'error' | 'warning' | 'info';
  /** 확인 버튼 텍스트 (기본: "확인") */
  confirmText?: string;
  /** 확인 콜백 */
  onConfirm: () => void;
}

/**
 * 커스텀 알림(Alert) 모달
 */
export default function AlertModal({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText = '확인',
  onConfirm,
}: AlertModalProps) {
  const isDarkMode = useAppSelector((state) => state.theme.mode === 'dark');

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`alert-modal-overlay ${isDarkMode ? 'dark' : ''}`}
          onClick={onConfirm}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`alert-modal-content ${isDarkMode ? 'dark' : ''}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, type: 'spring', damping: 25 }}
          >
            <div className={`alert-modal-icon ${type}`}>
              <span className="icon-text">{getIcon()}</span>
            </div>

            <div className="alert-modal-header">
              <h3 className="alert-modal-title">{title}</h3>
            </div>

            <div className="alert-modal-body">
              <p className="alert-modal-message">{message}</p>
            </div>

            <div className="alert-modal-footer">
              <motion.button
                className={`alert-modal-btn ${type}`}
                onClick={onConfirm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
