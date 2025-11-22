import { motion } from 'framer-motion';
import { useAppSelector } from '../../hooks/useRedux';
import type { ChatRoom } from '../../types/chat.types';
import { getRelativeTime } from '../../utils/timeFormat';
import './ChatRoomItem.css';

interface ChatRoomItemProps {
  /** 채팅방 정보 */
  room: ChatRoom;
  /** 더블 클릭 핸들러 */
  onDoubleClick: (roomId: string) => void;
  /** 목록에서의 인덱스 (애니메이션용) */
  index?: number;
}

/**
 * 채팅방 목록 아이템 컴포넌트
 */
export default function ChatRoomItem({
  room,
  onDoubleClick,
  index = 0,
}: ChatRoomItemProps) {
  const isDarkMode = useAppSelector((state) => state.theme.mode === 'dark');

  /**
   * 더블 클릭 핸들러
   */
  const handleDoubleClick = () => {
    const confirmed = window.confirm(
      `"${room.name}" 채팅방에 입장하시겠습니까?`
    );
    if (confirmed) {
      onDoubleClick(room.id);
    }
  };

  /**
   * 참여 인원 상태에 따른 클래스명
   */
  const getParticipantsClass = () => {
    const ratio = room.currentParticipants / room.maxParticipants;
    if (ratio >= 1) return 'full';
    if (ratio >= 0.8) return 'almost-full';
    return 'available';
  };

  return (
    <motion.div
      className={`chat-room-item ${isDarkMode ? 'dark' : ''}`}
      onDoubleClick={handleDoubleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="room-header">
        <div className="room-title-wrapper">
          <h3 className="room-name">{room.name}</h3>
          {room.hasPassword && (
            <motion.span
              className="lock-icon"
              title="비밀번호 보호"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05, type: 'spring' }}
            >
              🔒
            </motion.span>
          )}
        </div>
        <motion.div
          className={`participants-badge ${getParticipantsClass()}`}
          title="현재 인원 / 최대 인원"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15 + index * 0.05, type: 'spring' }}
        >
          {room.currentParticipants}/{room.maxParticipants}
        </motion.div>
      </div>

      <div className="room-info">
        <span className="creator-info">생성자: {room.creatorName}</span>
        <span className="time-separator">•</span>
        <span className="created-time">{getRelativeTime(room.createdAt)}</span>
      </div>

      {/* 호버 효과용 배경 그라디언트 */}
      <motion.div
        className="room-gradient"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
