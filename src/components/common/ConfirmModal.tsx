import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../hooks/useRedux';
import './ConfirmModal.css';

interface ConfirmModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 제목 */
  title: string;
  /** 메시지 */
  message: string;
  /** 확인 버튼 텍스트 (기본: "확인") */
  confirmText?: string;
  /** 취소 버튼 텍스트 (기본: "취소") */
  cancelText?: string;
  /** 확인 버튼 타입 (기본: "primary") */
  confirmType?: 'primary' | 'danger' | 'success';
  /** 확인 콜백 */
  onConfirm: () => void;
  /** 취소 콜백 */
  onCancel: () => void;
}

/**
 * 커스텀 확인(Confirm) 모달
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  confirmType = 'primary',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const isDarkMode = useAppSelector((state) => state.theme.mode === 'dark');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`confirm-modal-overlay ${isDarkMode ? 'dark' : ''}`}
          onClick={onCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`confirm-modal-content ${isDarkMode ? 'dark' : ''}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, type: 'spring', damping: 25 }}
          >
            <div className="confirm-modal-header">
              <h3 className="confirm-modal-title">{title}</h3>
            </div>

            <div className="confirm-modal-body">
              <p className="confirm-modal-message">{message}</p>
            </div>

            <div className="confirm-modal-footer">
              <motion.button
                className="confirm-modal-btn cancel-btn"
                onClick={onCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {cancelText}
              </motion.button>
              <motion.button
                className={`confirm-modal-btn confirm-btn ${confirmType}`}
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
