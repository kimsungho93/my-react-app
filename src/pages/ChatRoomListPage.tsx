import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChatRoom, CreateChatRoomRequest } from '../types/chat.types';
import { getChatRooms, createChatRoom, joinChatRoom } from '../services/api/chatApi';
import CreateChatRoomModal from '../components/chat/CreateChatRoomModal';
import ChatRoomItem from '../components/chat/ChatRoomItem';
import './ChatRoomListPage.css';

/**
 * 채팅방 목록 페이지
 */
export default function ChatRoomListPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      const newRoom = await createChatRoom(request);
      setRooms((prev) => [newRoom, ...prev]);
      alert('채팅방이 생성되었습니다!');
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      alert('채팅방 생성에 실패했습니다.');
    }
  };

  /**
   * 채팅방 입장 핸들러 (더블 클릭)
   */
  const handleJoinRoom = async (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    let password: string | undefined;

    // 비밀번호가 있는 방인 경우
    if (room.hasPassword) {
      password = window.prompt('비밀번호를 입력하세요:') || undefined;
      if (!password) {
        return; // 비밀번호 입력 취소
      }
    }

    try {
      const result = await joinChatRoom({ roomId, password });

      if (!result.success) {
        alert(result.message || '채팅방 입장에 실패했습니다.');
        return;
      }

      // TODO: 실제 채팅방 페이지로 이동
      navigate(`/chat/${roomId}`);
    } catch (error) {
      console.error('채팅방 입장 실패:', error);
      alert('채팅방 입장에 실패했습니다.');
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
    </div>
  );
}
