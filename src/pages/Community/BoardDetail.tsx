import { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  IconButton,
  TextField,
  CircularProgress,
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
import { boardApi } from "../../services/api/board.api";
import type { Post, Comment } from "../../services/api/board.api";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { UserAvatar } from "../../components/common/UserAvatar";

/**
 * 게시글 상세 조회 페이지
 */
const BoardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // StrictMode에서 중복 호출 방지
  const hasFetched = useRef(false);

  /**
   * 게시글 및 댓글 데이터 조회
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // 이미 조회했으면 스킵 (StrictMode 중복 방지)
      if (hasFetched.current) return;
      hasFetched.current = true;

      setLoading(true);
      setError(null);
      try {
        const [postResponse, commentsResponse] = await Promise.all([
          boardApi.getPostDetail(Number(id)),
          boardApi.getComments(Number(id))
        ]);

        setPost(postResponse.data);
        setComments(commentsResponse.data);
      } catch (err) {
        console.error("Failed to fetch board detail:", err);
        setError("게시글을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // cleanup 함수에서 ref 초기화 (다른 게시글로 이동 시)
    return () => {
      hasFetched.current = false;
    };
  }, [id]);

  // 삭제되지 않은 댓글만 필터링 (계층 구조 유지)
  const filterDeletedComments = (commentList: Comment[]): Comment[] => {
    return commentList
      .filter((c) => !c.deleted)
      .map((c) => ({
        ...c,
        children: filterDeletedComments(c.children || []),
      }));
  };

  // 최상위 댓글만 (parentId가 null)
  const mainComments = filterDeletedComments(comments);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {error || "게시글을 찾을 수 없습니다."}
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
  const getCategoryLabel = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "NOTICE":
        return "공지";
      case "FREE":
        return "자유";
      case "HUMOR":
        return "유머";
      case "KNOWLEDGE":
        return "지식";
      default:
        return "기타";
    }
  };

  /**
   * 카테고리 색상 가져오기
   */
  const getCategoryColor = (cat: string): "error" | "info" | "success" | "primary" | "default" => {
    switch (cat.toUpperCase()) {
      case "NOTICE":
        return "error";
      case "FREE":
        return "info";
      case "HUMOR":
        return "success";
      case "KNOWLEDGE":
        return "primary";
      default:
        return "default";
    }
  };

  /**
   * 좋아요 토글
   */
  const handleLikeToggle = async () => {
    if (!post) return;
    try {
      const response = await boardApi.likePost(post.id);
      setPost({
        ...post,
        isLiked: response.data.liked,
        likeCount: response.data.totalLikes
      });
    } catch (err) {
      console.error("Failed to toggle like:", err);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  /**
   * 댓글 작성
   */
  const handleAddComment = async () => {
    if (!newComment.trim() || !post) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await boardApi.createComment(post.id, {
        content: newComment,
        parentId: null
      });
      
      setComments([...comments, response.data]);
      setNewComment("");

      // 댓글 수 업데이트
      setPost({
        ...post,
        commentCount: (post.commentCount ?? 0) + 1
      });
    } catch (err) {
      console.error("Failed to create comment:", err);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  /**
   * 대댓글 작성
   */
  const handleAddReply = async (parentId: number) => {
    if (!replyContent.trim() || !post) {
      alert("답글 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await boardApi.createComment(post.id, {
        content: replyContent,
        parentId: parentId
      });
      
      setComments([...comments, response.data]);
      setReplyContent("");
      setReplyingTo(null);

      // 댓글 수 업데이트
      setPost({
        ...post,
        commentCount: (post.commentCount ?? 0) + 1
      });
    } catch (err) {
      console.error("Failed to create reply:", err);
      alert("답글 작성에 실패했습니다.");
    }
  };

  /**
   * 댓글 삭제
   */
  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      try {
        await boardApi.deleteComment(commentId);
        setComments(comments.filter((c) => c.id !== commentId && c.parentId !== commentId));
        
        // 댓글 수 업데이트 (대댓글도 같이 삭제되는지 여부에 따라 로직이 다를 수 있음, 여기선 단순 -1)
        if (post) {
           setPost({
            ...post,
            commentCount: Math.max(0, (post.commentCount ?? 0) - 1)
          });
        }
      } catch (err) {
        console.error("Failed to delete comment:", err);
        alert("댓글 삭제에 실패했습니다.");
      }
    }
  };

  /**
   * 게시글 삭제
   */
  const handleDeletePost = async () => {
    if (window.confirm("게시글을 삭제하시겠습니까?")) {
      try {
        await boardApi.deletePost(post.id);
        navigate("/community/board/list");
      } catch (err) {
        console.error("Failed to delete post:", err);
        alert("게시글 삭제에 실패했습니다.");
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper elevation={2} sx={{ overflow: "hidden" }}>
        {/* 헤더 */}
        <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: 1, borderColor: "divider" }}>
          <Stack spacing={2}>
            {/* 뒤로가기 버튼 및 삭제 버튼 */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/community/board/list")}
                sx={{ minWidth: "auto" }}
              >
                목록으로
              </Button>
              
              {/* 작성자 본인 또는 관리자일 경우 삭제 버튼 표시 */}
              {(Number(currentUser?.id) === post.author?.id || currentUser?.role === "ADMIN") && (
                <Button
                  startIcon={<DeleteIcon />}
                  color="error"
                  onClick={handleDeletePost}
                >
                  삭제
                </Button>
              )}
            </Box>

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
                <UserAvatar
                  userId={post.author?.id}
                  profileImageUrl={post.author?.profileImageUrl || post.author?.avatarUrl}
                  name={post.author?.nickname}
                  size={40}
                />
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {post.author?.nickname ?? "익명"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(post.createdAt), {
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
                    {post.viewCount ?? 0}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ThumbUpOutlinedIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {post.likeCount ?? 0}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ChatBubbleOutlineIcon
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {mainComments.length}
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
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
        </Box>

        {/* 액션 버튼 영역 */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            {/* 좋아요 버튼 */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant={post.isLiked ? "contained" : "outlined"}
                color="primary"
                startIcon={
                  post.isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />
                }
                onClick={handleLikeToggle}
                size="large"
                sx={{ minWidth: 150 }}
              >
                좋아요 {post.likeCount ?? 0}
              </Button>
            </Box>

            <Divider />

            {/* 댓글 영역 */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                댓글 {mainComments.length}
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
                            <UserAvatar
                              userId={comment.author?.id}
                              profileImageUrl={comment.author?.profileImageUrl || comment.author?.avatarUrl}
                              name={comment.author?.nickname}
                              size={32}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {comment.author?.nickname ?? "익명"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDistanceToNow(new Date(comment.createdAt), {
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
                            {/* 작성자 본인 또는 관리자만 삭제 가능 */}
                            {(Number(currentUser?.id) === comment.author?.id || currentUser?.role === "ADMIN") && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
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

                      {/* 대댓글 목록 (children) */}
                      {comment.children?.map((reply) => (
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
                                <UserAvatar
                                  userId={reply.author?.id}
                                  profileImageUrl={reply.author?.profileImageUrl || reply.author?.avatarUrl}
                                  name={reply.author?.nickname}
                                  size={28}
                                />
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {reply.author?.nickname ?? "익명"}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDistanceToNow(new Date(reply.createdAt), {
                                      addSuffix: true,
                                      locale: ko,
                                    })}
                                  </Typography>
                                </Box>
                              </Box>
                              {/* 작성자 본인 또는 관리자만 삭제 가능 */}
                              {(Number(currentUser?.id) === reply.author?.id || currentUser?.role === "ADMIN") && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteComment(reply.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
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
