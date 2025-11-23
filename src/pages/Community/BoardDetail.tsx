import { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Avatar,
  Divider,
  IconButton,
  TextField,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

type BoardCategory = "notice" | "free" | "humor" | "knowledge";

/**
 * 게시글 타입
 */
interface Post {
  id: number;
  category: BoardCategory;
  title: string;
  content: string;
  author: string;
  authorAvatar?: string;
  createdAt: Date;
  likes: number;
  comments: number;
  views: number;
  isNew?: boolean;
}

/**
 * 댓글 타입
 */
interface Comment {
  id: number;
  postId: number;
  author: string;
  content: string;
  createdAt: Date;
  parentId: number | null; // null이면 댓글, 숫자면 대댓글
}

/**
 * Mock 데이터 (BoardList와 동일)
 */
const MOCK_POSTS: Post[] = [
  {
    id: 1,
    category: "notice",
    title: "2025년 1월 정기 업데이트 안내",
    content: "다음 주 월요일 새벽 2시부터 4시까지 서버 점검이 예정되어 있습니다.",
    author: "관리자",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    likes: 45,
    comments: 12,
    views: 324,
    isNew: true,
  },
  {
    id: 11,
    category: "free",
    title: "오늘 점심 뭐 먹을까요?",
    content: "회사 근처 맛집 추천해주세요! 한식, 중식, 일식 다 좋아요",
    author: "점심고민러",
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    likes: 23,
    comments: 56,
    views: 234,
    isNew: true,
  },
  {
    id: 2,
    category: "humor",
    title: "오늘 회사에서 있었던 웃긴 일 ㅋㅋㅋ",
    content: "점심시간에 사장님이 엘리베이터에서...",
    author: "김철수",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    likes: 128,
    comments: 34,
    views: 892,
  },
  {
    id: 3,
    category: "knowledge",
    title: "React 19 새로운 기능 정리",
    content: "React 19에서 추가된 주요 기능들을 정리해봤습니다.",
    author: "개발자A",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    likes: 89,
    comments: 23,
    views: 567,
  },
];

/**
 * Mock 댓글 데이터
 */
const INITIAL_MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    postId: 2,
    author: "댓글러1",
    content: "ㅋㅋㅋㅋ 재밌네요!",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    parentId: null,
  },
  {
    id: 2,
    postId: 2,
    author: "댓글러2",
    content: "사장님 반응이 궁금하네요 ㅎㅎ",
    createdAt: new Date(Date.now() - 1000 * 60 * 25),
    parentId: null,
  },
  {
    id: 3,
    postId: 2,
    author: "김철수",
    content: "다행히 못 들으신 것 같아요 ㅋㅋ",
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
    parentId: 2,
  },
  {
    id: 4,
    postId: 2,
    author: "구경꾼",
    content: "저도 비슷한 경험 있어요!",
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    parentId: null,
  },
  {
    id: 5,
    postId: 3,
    author: "React개발자",
    content: "정리 감사합니다!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    parentId: null,
  },
];

/**
 * 게시글 상세 조회 페이지
 */
const BoardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>(INITIAL_MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Mock 데이터에서 게시글 찾기
  const post = MOCK_POSTS.find((p) => p.id === Number(id));

  // 현재 게시글의 댓글만 필터링
  const postComments = comments.filter((c) => c.postId === Number(id));

  // 댓글 (parentId가 null인 것)
  const mainComments = postComments.filter((c) => c.parentId === null);

  // 대댓글 가져오기
  const getReplies = (commentId: number) => {
    return postComments.filter((c) => c.parentId === commentId);
  };

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            게시글을 찾을 수 없습니다.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/community/board/list")}
            sx={{ mt: 2 }}
          >
            목록으로 돌아가기
          </Button>
        </Paper>
      </Container>
    );
  }

  /**
   * 카테고리 라벨 가져오기
   */
  const getCategoryLabel = (cat: BoardCategory) => {
    switch (cat) {
      case "notice":
        return "공지";
      case "free":
        return "자유";
      case "humor":
        return "유머";
      case "knowledge":
        return "지식";
    }
  };

  /**
   * 카테고리 색상 가져오기
   */
  const getCategoryColor = (cat: BoardCategory) => {
    switch (cat) {
      case "notice":
        return "error";
      case "free":
        return "info";
      case "humor":
        return "success";
      case "knowledge":
        return "primary";
      default:
        return "default";
    }
  };

  /**
   * 좋아요 토글
   */
  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    // TODO: API 연동
  };

  /**
   * 댓글 작성
   */
  const handleAddComment = () => {
    if (!newComment.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    const comment: Comment = {
      id: comments.length + 1,
      postId: Number(id),
      author: "현재사용자", // TODO: 실제 로그인 사용자 이름
      content: newComment,
      createdAt: new Date(),
      parentId: null,
    };

    setComments([...comments, comment]);
    setNewComment("");
    // TODO: API 연동
  };

  /**
   * 대댓글 작성
   */
  const handleAddReply = (parentId: number) => {
    if (!replyContent.trim()) {
      alert("답글 내용을 입력해주세요.");
      return;
    }

    const reply: Comment = {
      id: comments.length + 1,
      postId: Number(id),
      author: "현재사용자", // TODO: 실제 로그인 사용자 이름
      content: replyContent,
      createdAt: new Date(),
      parentId: parentId,
    };

    setComments([...comments, reply]);
    setReplyContent("");
    setReplyingTo(null);
    // TODO: API 연동
  };

  /**
   * 댓글 삭제
   */
  const handleDeleteComment = (commentId: number) => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      setComments(comments.filter((c) => c.id !== commentId && c.parentId !== commentId));
      // TODO: API 연동
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper elevation={2} sx={{ overflow: "hidden" }}>
        {/* 헤더 */}
        <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: 1, borderColor: "divider" }}>
          <Stack spacing={2}>
            {/* 뒤로가기 버튼 */}
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/community/board/list")}
              sx={{ alignSelf: "flex-start", minWidth: "auto" }}
            >
              목록으로
            </Button>

            {/* 카테고리 및 NEW 배지 */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Chip
                label={getCategoryLabel(post.category)}
                color={getCategoryColor(post.category)}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              {post.isNew && (
                <Chip
                  label="NEW"
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>

            {/* 제목 */}
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem" },
                fontWeight: 700,
                wordBreak: "break-word",
              }}
            >
              {post.title}
            </Typography>

            {/* 작성자 정보 및 통계 */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              {/* 작성자 정보 */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  {post.author[0]}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {post.author}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(post.createdAt, {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </Typography>
                </Box>
              </Box>

              {/* 통계 정보 */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <VisibilityOutlinedIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {post.views}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ThumbUpOutlinedIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {post.likes + (isLiked ? 1 : 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ChatBubbleOutlineIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {postComments.length}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* 본문 */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            minHeight: 300,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Box>

        {/* 액션 버튼 영역 */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            {/* 좋아요 버튼 */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant={isLiked ? "contained" : "outlined"}
                color="primary"
                startIcon={
                  isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />
                }
                onClick={handleLikeToggle}
                size="large"
                sx={{ minWidth: 150 }}
              >
                좋아요 {post.likes + (isLiked ? 1 : 0)}
              </Button>
            </Box>

            <Divider />

            {/* 댓글 영역 */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                댓글 {postComments.length}
              </Typography>

              {/* 댓글 입력 */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="댓글을 입력하세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    댓글 작성
                  </Button>
                </Box>
              </Box>

              {/* 댓글 목록 */}
              <Stack spacing={2}>
                {mainComments.length === 0 ? (
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: "background.default",
                      borderRadius: 1,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      첫 댓글을 작성해보세요!
                    </Typography>
                  </Box>
                ) : (
                  mainComments.map((comment) => (
                    <Box key={comment.id}>
                      {/* 댓글 */}
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "background.default",
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 1,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {comment.author[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {comment.author}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDistanceToNow(comment.createdAt, {
                                  addSuffix: true,
                                  locale: ko,
                                })}
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => setReplyingTo(comment.id)}
                            >
                              <ReplyIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ pl: 5 }}>
                          {comment.content}
                        </Typography>
                      </Box>

                      {/* 대댓글 입력 폼 */}
                      {replyingTo === comment.id && (
                        <Box sx={{ pl: 5, mt: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="답글을 입력하세요..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            <Button
                              size="small"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent("");
                              }}
                            >
                              취소
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleAddReply(comment.id)}
                              disabled={!replyContent.trim()}
                            >
                              답글 작성
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {/* 대댓글 목록 */}
                      {getReplies(comment.id).map((reply) => (
                        <Box
                          key={reply.id}
                          sx={{
                            pl: 5,
                            mt: 1,
                          }}
                        >
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: "action.hover",
                              borderRadius: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 1,
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Avatar sx={{ width: 28, height: 28 }}>
                                  {reply.author[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {reply.author}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDistanceToNow(reply.createdAt, {
                                      addSuffix: true,
                                      locale: ko,
                                    })}
                                  </Typography>
                                </Box>
                              </Box>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteComment(reply.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Typography variant="body2" sx={{ pl: 4.5 }}>
                              {reply.content}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ))
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default BoardDetail;
