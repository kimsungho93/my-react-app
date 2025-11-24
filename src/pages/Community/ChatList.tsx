import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector } from '../../hooks/useRedux';
import type { ChatRoom, CreateChatRoomRequest } from '../../types/chat.types';
import { getChatRooms, createChatRoom, joinChatRoom } from '../../services/api/chatApi';
import CreateChatRoomModal from '../../components/chat/CreateChatRoomModal';
import ChatRoomItem from '../../components/chat/ChatRoomItem';
import AlertModal from '../../components/common/AlertModal';
import './ChatList.css';

/**
 * 채팅방 목록 페이지
 */
export default function ChatList() {
  const navigate = useNavigate();
  const isDarkMode = useAppSelector((state) => state.theme.mode === 'dark');
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Alert 모달 상태
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onConfirmAction?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  /**
   * 채팅방 목록 로드
   */
  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const data = await getChatRooms();
      setRooms(data);
    } catch (error) {
      console.error('채팅방 목록 로드 실패:', error);
      alert('채팅방 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 채팅방 생성 핸들러
   */
  const handleCreateRoom = async (request: CreateChatRoomRequest) => {
    try {
      // 1. 채팅방 생성
      const newRoom = await createChatRoom(request);

      // 2. 생성한 채팅방에 입장 (참가 인원 카운트 증가)
      await joinChatRoom({ roomId: newRoom.id, password: request.password });

      // 3. 참가 인원이 증가된 채팅방 정보로 목록 업데이트
      const updatedRoom: ChatRoom = {
        ...newRoom,
        currentParticipants: 1, // 생성자가 입장했으므로 1
      };
      setRooms((prev) => [updatedRoom, ...prev]);

      // 4. 생성 성공 후 바로 채팅방으로 이동
      navigate(`/chat/${newRoom.id}`);
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      setAlertModal({
        isOpen: true,
        title: '오류',
        message: '채팅방 생성에 실패했습니다.',
        type: 'error',
      });
    }
  };

  /**
   * 채팅방 입장 핸들러
   */
  const handleJoinRoom = async (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    // 인원 초과 체크
    if (room.currentParticipants >= room.maxParticipants) {
      setAlertModal({
        isOpen: true,
        title: '입장 불가',
        message: '채팅방이 가득 찼습니다.',
        type: 'warning',
      });
      return;
    }

    let password: string | undefined;

    // 비밀번호가 있는 방인 경우
    if (room.hasPassword) {
      password = window.prompt('비밀번호를 입력하세요:') || undefined;
      if (!password) {
        return; // 비밀번호 입력 취소
      }
    }

    try {
      await joinChatRoom({ roomId, password });

      // 채팅방 페이지로 이동
      navigate(`/chat/${roomId}`);
    } catch (error) {
      console.error('채팅방 입장 실패:', error);
      setAlertModal({
        isOpen: true,
        title: '입장 실패',
        message: '채팅방 입장에 실패했습니다. 비밀번호를 확인해주세요.',
        type: 'error',
      });
    }
  };

  useEffect(() => {
    loadChatRooms();

    // 채팅방 목록 주기적 갱신 (30초마다)
    const intervalId = setInterval(() => {
      loadChatRooms();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // 페이지에 포커스가 돌아올 때 목록 새로고침 (채팅방에서 나왔을 때)
  useEffect(() => {
    const handleFocus = () => {
      loadChatRooms();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div className={`chat-list-page ${isDarkMode ? 'dark' : ''}`}>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          채팅
        </motion.h1>
        <motion.button
          className="create-room-btn"
          onClick={() => setIsModalOpen(true)}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + 채팅하기
        </motion.button>
      </motion.div>

      {loading ? (
        <motion.div
          className="loading-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            채팅방 목록을 불러오는 중...
          </motion.p>
        </motion.div>
      ) : rooms.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="empty-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            💬
          </motion.div>
          <p>개설된 채팅방이 없습니다.</p>
          <p className="empty-sub">위의 "채팅하기" 버튼으로 채팅방을 만들어보세요!</p>
        </motion.div>
      ) : (
        <div className="chat-room-grid">
          {rooms.map((room, index) => (
            <ChatRoomItem
              key={room.id}
              room={room}
              onClick={handleJoinRoom}
              index={index}
            />
          ))}
        </div>
      )}

      <CreateChatRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateRoom}
      />

      {/* Alert 모달 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onConfirm={() => {
          // 확인 버튼 클릭 시 추가 액션 실행 (채팅방 이동 등)
          alertModal.onConfirmAction?.();
          // 모달 닫기
          setAlertModal((prev) => ({ ...prev, isOpen: false, onConfirmAction: undefined }));
        }}
      />
    </div>
  );
}
