import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useChatWebSocket } from "../hooks/useChatWebSocket";
import { chatApi } from "../services/api/chatApi";
import { useAppSelector } from "../hooks/useRedux";
import { ConnectionStatus } from "../services/websocket/chatWebSocket";
import { MessageType, type ChatMessage } from "../types/chat.types";
import { formatChatTime } from "../utils/timeFormat";
import ConfirmModal from "../components/common/ConfirmModal";
import AlertModal from "../components/common/AlertModal";
import "./ChatRoomPage.css";

/**
 * 채팅방 페이지 컴포넌트
 */
export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const isDarkMode = useAppSelector((state) => state.theme.mode === "dark");
  const currentUser = useAppSelector((state) => state.auth.user);

  const [roomName, setRoomName] = useState<string>("");
  const [inputMessage, setInputMessage] = useState("");
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const processedMessageIdsRef = useRef<Set<string>>(new Set()); // 처리된 메시지 ID 추적

  // Confirm 모달 상태
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

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

  /**
   * WebSocket 훅 사용 (메시지 수신 콜백 전달)
   */
  const handleNewMessage = useCallback((message: ChatMessage) => {
    // 백엔드에서 id나 createdAt을 제공하지 않는 경우 생성
    const messageWithDefaults: ChatMessage = {
      ...message,
      id: message.id || `temp-${Date.now()}-${Math.random()}`,
      createdAt: message.createdAt || new Date().toISOString(),
    };

    // 중복 방지: 이미 처리한 메시지인지 확인
    if (messageWithDefaults.id && processedMessageIdsRef.current.has(messageWithDefaults.id)) {
      return;
    }

    // 메시지 ID를 처리 완료 목록에 추가
    if (messageWithDefaults.id) {
      processedMessageIdsRef.current.add(messageWithDefaults.id);
    }

    // 전체 메시지 목록에 추가
    setAllMessages((prev) => {
      // 중복 체크 (id가 있는 경우에만)
      if (messageWithDefaults.id) {
        const exists = prev.some((msg) => msg.id === messageWithDefaults.id);
        if (exists) {
          return prev;
        }
      }

      // [FIX] 입장 후 바로 퇴장 메시지가 오는 경우 (새로고침 시 Race Condition) 무시
      if (messageWithDefaults.type === MessageType.LEAVE) {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg &&
            lastMsg.senderName === messageWithDefaults.senderName &&
            lastMsg.type === MessageType.ENTER) {

          // 시간 차이 계산 (2초 이내면 무시)
          const lastTime = lastMsg.createdAt ? new Date(lastMsg.createdAt).getTime() : Date.now();
          const currTime = messageWithDefaults.createdAt ? new Date(messageWithDefaults.createdAt).getTime() : Date.now();

          if (Math.abs(currTime - lastTime) < 2000) {
             return prev;
          }
        }
      }

      return [...prev, messageWithDefaults];
    });
  }, []);

  const { status, sendMessage, isConnected } = useChatWebSocket(
    roomId || null,
    handleNewMessage, // 메시지 수신 콜백 전달
    true
  );

  /**
   * 채팅방 정보 및 이전 메시지 로드
   */
  useEffect(() => {
    if (!roomId) {
      navigate("/community/chat");
      return;
    }

    // 채팅방이 변경될 때 처리된 메시지 ID 초기화
    processedMessageIdsRef.current.clear();

    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);

        // 채팅방 목록에서 현재 방 찾기
        const rooms = await chatApi.getChatRooms();
        const room = rooms.find((r) => r.id === roomId);

        if (room) {
          setRoomName(room.name);
        } else {
          console.error("채팅방을 찾을 수 없음:", roomId);
          setAlertModal({
            isOpen: true,
            title: '오류',
            message: '채팅방을 찾을 수 없습니다.',
            type: 'error',
          });
          navigate("/chat");
          return;
        }

        // 이전 메시지 로드 (백엔드 API가 없을 수 있으므로 실패해도 계속 진행)
        try {
          const historyResponse = await chatApi.getChatMessages(roomId, 0, 50);
          const messages = historyResponse?.messages || [];
          setAllMessages(messages);

          // 로드된 메시지들의 ID를 처리 완료 목록에 추가
          messages.forEach(msg => {
            if (msg.id) {
              processedMessageIdsRef.current.add(msg.id);
            }
          });
        } catch (msgError) {
          console.warn("메시지 기록 로드 실패 (계속 진행):", msgError);
          setAllMessages([]); // 빈 배열로 초기화
        }
      } catch (error) {
        console.error("채팅방 로드 실패:", error);
        setAlertModal({
          isOpen: true,
          title: '오류',
          message: '채팅방을 불러오는데 실패했습니다.',
          type: 'error',
        });
        navigate("/chat");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [roomId, navigate]);


  /**
   * 자동 스크롤 (새 메시지 수신 시)
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  /**
   * 메시지 전송 핸들러
   */
  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedMessage = inputMessage.trim();
      if (!trimmedMessage || !isConnected) return;

      sendMessage(trimmedMessage, MessageType.TEXT);
      setInputMessage("");
      inputRef.current?.focus();
    },
    [inputMessage, isConnected, sendMessage]
  );

  /**
   * 채팅방 나가기 확인
   */
  const handleLeaveRoom = () => {
    setShowLeaveConfirm(true);
  };

  /**
   * 채팅방 나가기 실행
   */
  const confirmLeaveRoom = async () => {
    if (!roomId) return;

    try {
      await chatApi.leaveChatRoom(roomId);
      navigate("/community/chat");
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: '오류',
        message: '채팅방 나가기에 실패했습니다.',
        type: 'error',
      });
    }
  };

  /**
   * 메시지 렌더링
   */
  const renderMessage = (message: ChatMessage) => {
    // senderId 비교 (숫자 또는 문자열 모두 처리)
    const isMyMessage =
      message.senderId != null &&
      currentUser?.id != null &&
      (message.senderId.toString() === currentUser.id.toString());

    const isSystemMessage =
      message.type === MessageType.ENTER || message.type === MessageType.LEAVE;

    if (isSystemMessage) {
      return (
        <motion.div
          key={message.id}
          className="system-message"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className="system-message-text">{message.content}</span>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={message.id}
        className={`message-wrapper ${isMyMessage ? "my-message" : "other-message"}`}
        initial={{ opacity: 0, x: isMyMessage ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, type: "spring", damping: 25 }}
      >
        {!isMyMessage && (
          <div className="message-sender">{message.senderName}</div>
        )}
        <div className="message-content">
          <div className="message-bubble">
            <p className="message-text">{message.content}</p>
          </div>
          {message.createdAt && (
            <span className="message-time">
              {formatChatTime(message.createdAt)}
            </span>
          )}
        </div>
      </motion.div>
    );
  };

  /**
   * 연결 상태 배지
   */
  const renderConnectionStatus = () => {
    let statusText = "";
    let statusClass = "";

    switch (status) {
      case ConnectionStatus.CONNECTED:
        statusText = "연결됨";
        statusClass = "status-connected";
        break;
      case ConnectionStatus.CONNECTING:
        statusText = "연결 중...";
        statusClass = "status-connecting";
        break;
      case ConnectionStatus.DISCONNECTED:
        statusText = "연결 끊김";
        statusClass = "status-disconnected";
        break;
      case ConnectionStatus.ERROR:
        statusText = "오류";
        statusClass = "status-error";
        break;
    }

    return (
      <div className={`connection-status ${statusClass}`}>
        <span className="status-dot"></span>
        <span className="status-text">{statusText}</span>
      </div>
    );
  };

  return (
    <div className={`chat-room-page ${isDarkMode ? "dark" : ""}`}>
      {/* 헤더 */}
      <div className="chat-header">
        <div className="header-left">
          <motion.button
            className="back-btn"
            onClick={handleLeaveRoom}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← 나가기
          </motion.button>
          <h1 className="room-title">{roomName || "채팅방"}</h1>
        </div>
        <div className="header-right">{renderConnectionStatus()}</div>
      </div>

      {/* 메시지 영역 */}
      <div className="messages-container">
        {isLoadingHistory ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>메시지를 불러오는 중...</p>
          </div>
        ) : (
          <AnimatePresence>
            {allMessages?.map((message) => renderMessage(message))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <form className="message-input-container" onSubmit={handleSendMessage}>
        <motion.input
          ref={inputRef}
          type="text"
          className="message-input"
          placeholder={
            isConnected
              ? "메시지를 입력하세요..."
              : "연결 중입니다. 잠시만 기다려주세요..."
          }
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={!isConnected}
          maxLength={500}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        />
        <motion.button
          type="submit"
          className="send-btn"
          disabled={!inputMessage.trim() || !isConnected}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          전송
        </motion.button>
      </form>

      {/* 나가기 확인 모달 */}
      <ConfirmModal
        isOpen={showLeaveConfirm}
        title="채팅방 나가기"
        message="정말 채팅방을 나가시겠습니까?"
        confirmText="나가기"
        cancelText="취소"
        confirmType="danger"
        onConfirm={confirmLeaveRoom}
        onCancel={() => setShowLeaveConfirm(false)}
      />

      {/* Alert 모달 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onConfirm={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
