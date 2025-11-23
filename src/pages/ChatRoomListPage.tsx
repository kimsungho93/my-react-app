import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChatRoom, CreateChatRoomRequest } from '../types/chat.types';
import { getChatRooms, createChatRoom, joinChatRoom } from '../services/api/chatApi';
import CreateChatRoomModal from '../components/chat/CreateChatRoomModal';
import ChatRoomItem from '../components/chat/ChatRoomItem';
import AlertModal from '../components/common/AlertModal';
import ConfirmModal from '../components/common/ConfirmModal';
import InputModal from '../components/common/InputModal';
import './ChatRoomListPage.css';

/**
 * 채팅방 목록 페이지
 */
export default function ChatRoomListPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Alert 모달 상태
  const [alertModal, setAlertModal] = useState<{
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

  // Confirm 모달 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Input 모달 상태 (비밀번호 입력용)
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    roomId: string | null;
  }>({
    isOpen: false,
    roomId: null,
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
      setAlertModal({
        isOpen: true,
        title: '오류',
        message: '채팅방 목록을 불러오는데 실패했습니다.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 채팅방 생성 핸들러
   */
  const handleCreateRoom = async (request: CreateChatRoomRequest) => {
    try {
      const newRoom = await createChatRoom(request);
      setRooms((prev) => [newRoom, ...prev]);

      // 생성 성공 알림
      setAlertModal({
        isOpen: true,
        title: '🎉 채팅방 생성 완료',
        message: `"${newRoom.name}" 채팅방이 성공적으로 생성되었습니다!`,
        type: 'success',
      });

      // 자동으로 채팅방 입장
      setTimeout(() => {
        navigate(`/chat/${newRoom.id}`);
      }, 1500);
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      setAlertModal({
        isOpen: true,
        title: '오류',
        message: '채팅방 생성에 실패했습니다.\n잠시 후 다시 시도해주세요.',
        type: 'error',
      });
    }
  };

  /**
   * 채팅방 입장 핸들러 (더블 클릭)
   */
  const handleJoinRoom = async (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) {
      return;
    }

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

    // 비밀번호가 있는 방인 경우 - InputModal 표시
    if (room.hasPassword) {
      setPasswordModal({
        isOpen: true,
        roomId,
      });
      return;
    }

    // 비밀번호 없는 방은 바로 입장
    await joinRoomWithPassword(roomId, undefined);
  };

  /**
   * 비밀번호 입력 후 입장 처리
   */
  const joinRoomWithPassword = async (roomId: string, password?: string) => {
    try {
      await joinChatRoom({ roomId, password });
      navigate(`/chat/${roomId}`);
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: '입장 실패',
        message: '채팅방 입장에 실패했습니다. 비밀번호를 확인해주세요.',
        type: 'error',
      });
    }
  };

  /**
   * 비밀번호 입력 확인
   */
  const handlePasswordConfirm = (password: string) => {
    const roomId = passwordModal.roomId;
    setPasswordModal({ isOpen: false, roomId: null });

    if (roomId) {
      joinRoomWithPassword(roomId, password);
    }
  };

  useEffect(() => {
    loadChatRooms();
  }, []);

  return (
    <div className="chat-room-list-page">
      <div className="page-header">
        <h1>채팅</h1>
        <button
          className="create-room-btn"
          onClick={() => setIsModalOpen(true)}
        >
          + 채팅하기
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>채팅방 목록을 불러오는 중...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="empty-state">
          <p>개설된 채팅방이 없습니다.</p>
          <p className="empty-sub">위의 "채팅하기" 버튼으로 채팅방을 만들어보세요!</p>
        </div>
      ) : (
        <div className="chat-room-grid">
          {rooms.map((room) => (
            <ChatRoomItem
              key={room.id}
              room={room}
              onDoubleClick={handleJoinRoom}
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
        onConfirm={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Confirm 모달 */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => {
          confirmModal.onConfirm();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* 비밀번호 입력 모달 */}
      <InputModal
        isOpen={passwordModal.isOpen}
        title="비밀번호 입력"
        message="채팅방 비밀번호를 입력해주세요."
        inputType="password"
        placeholder="비밀번호 (4~10자)"
        confirmText="입장"
        cancelText="취소"
        onConfirm={handlePasswordConfirm}
        onCancel={() => setPasswordModal({ isOpen: false, roomId: null })}
      />
    </div>
  );
}
