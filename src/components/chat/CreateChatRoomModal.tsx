import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../hooks/useRedux';
import type { CreateChatRoomRequest } from '../../types/chat.types';
import './CreateChatRoomModal.css';

interface CreateChatRoomModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 채팅방 생성 핸들러 */
  onCreate: (request: CreateChatRoomRequest) => void;
}

/**
 * 채팅방 생성 모달 컴포넌트
 */
export default function CreateChatRoomModal({
  isOpen,
  onClose,
  onCreate,
}: CreateChatRoomModalProps) {
  const isDarkMode = useAppSelector((state) => state.theme.mode === 'dark');
  const [name, setName] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number | ''>(5);
  const [errors, setErrors] = useState<{
    name?: string;
    password?: string;
    maxParticipants?: string;
  }>({});

  /**
   * 폼 유효성 검증
   */
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = '채팅방 이름을 입력해주세요.';
    }

    if (hasPassword && password && (password.length < 4 || password.length > 10)) {
      newErrors.password = '비밀번호는 4~10자리여야 합니다.';
    }

    if (hasPassword && !password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    }

    if (maxParticipants === '' || maxParticipants < 2 || maxParticipants > 15) {
      newErrors.maxParticipants = '인원 수는 2~15명 사이여야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 생성 버튼 클릭 핸들러
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const request: CreateChatRoomRequest = {
      name: name.trim(),
      password: hasPassword ? password : undefined,
      maxParticipants: typeof maxParticipants === 'number' ? maxParticipants : 5,
    };

    onCreate(request);
    handleClose();
  };

  /**
   * 모달 닫기 및 상태 초기화
   */
  const handleClose = () => {
    setName('');
    setHasPassword(false);
    setPassword('');
    setMaxParticipants(5);
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`modal-overlay ${isDarkMode ? 'dark' : ''}`}
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`modal-content ${isDarkMode ? 'dark' : ''}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, type: 'spring', damping: 25 }}
          >
            <div className="modal-header">
              <h2>채팅방 개설</h2>
              <motion.button
                className="modal-close-btn"
                onClick={handleClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                ✕
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="chat-room-form">
              <div className="form-group">
                <label htmlFor="roomName">
                  채팅방 이름 <span className="required">*</span>
                </label>
                <motion.input
                  type="text"
                  id="roomName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                />
                <div className="char-counter">{name.length}/30</div>
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      className="error-message"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="form-group">
                <div className="checkbox-wrapper">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={hasPassword}
                      onChange={(e) => {
                        setHasPassword(e.target.checked);
                        if (!e.target.checked) {
                          setPassword('');
                          setErrors((prev) => ({ ...prev, password: undefined }));
                        }
                      }}
                    />
                    <span className="checkbox-text">비밀번호 설정</span>
                  </label>
                </div>

                <AnimatePresence>
                  {hasPassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.input
                        type="password"
                        id="roomPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="4~10자리"
                        maxLength={10}
                        className="password-input"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      />
                      <AnimatePresence>
                        {errors.password && (
                          <motion.p
                            className="error-message"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            {errors.password}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="form-group">
                <label htmlFor="maxParticipants">
                  최대 인원 수 <span className="required">*</span>
                </label>
                <div className="participants-input">
                  <motion.input
                    type="number"
                    id="maxParticipants"
                    value={maxParticipants}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setMaxParticipants('');
                      } else {
                        const numValue = Number(value);
                        setMaxParticipants(numValue);
                      }
                    }}
                    min={2}
                    max={15}
                    whileFocus={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                  <span className="participants-label">명 (2~15명)</span>
                </div>
                <AnimatePresence>
                  {errors.maxParticipants && (
                    <motion.p
                      className="error-message"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {errors.maxParticipants}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="modal-actions">
                <motion.button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  취소
                </motion.button>
                <motion.button
                  type="submit"
                  className="btn btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  개설하기
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
