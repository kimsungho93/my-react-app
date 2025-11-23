import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../hooks/useRedux';
import './InputModal.css';

interface InputModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 제목 */
  title: string;
  /** 설명 메시지 */
  message?: string;
  /** 입력 타입 */
  inputType?: 'text' | 'password';
  /** 플레이스홀더 */
  placeholder?: string;
  /** 확인 버튼 텍스트 (기본: "확인") */
  confirmText?: string;
  /** 취소 버튼 텍스트 (기본: "취소") */
  cancelText?: string;
  /** 확인 콜백 */
  onConfirm: (value: string) => void;
  /** 취소 콜백 */
  onCancel: () => void;
}

/**
 * 커스텀 입력(Input) 모달
 */
export default function InputModal({
  isOpen,
  title,
  message,
  inputType = 'text',
  placeholder = '',
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
}: InputModalProps) {
  const isDarkMode = useAppSelector((state) => state.theme.mode === 'dark');
  const [value, setValue] = useState('');

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value);
      setValue('');
    }
  };

  const handleCancel = () => {
    setValue('');
    onCancel();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`input-modal-overlay ${isDarkMode ? 'dark' : ''}`}
          onClick={handleCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`input-modal-content ${isDarkMode ? 'dark' : ''}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, type: 'spring', damping: 25 }}
          >
            <div className="input-modal-header">
              <h3 className="input-modal-title">{title}</h3>
            </div>

            <div className="input-modal-body">
              {message && <p className="input-modal-message">{message}</p>}
              <motion.input
                type={inputType}
                className="input-modal-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              />
            </div>

            <div className="input-modal-footer">
              <motion.button
                className="input-modal-btn cancel-btn"
                onClick={handleCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {cancelText}
              </motion.button>
              <motion.button
                className="input-modal-btn confirm-btn"
                onClick={handleConfirm}
                disabled={!value.trim()}
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
