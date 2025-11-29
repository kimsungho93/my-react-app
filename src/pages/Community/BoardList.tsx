import { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Container,
  Fab,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { boardApi } from "../../services/api/board.api";
import type { Post, BoardCategory } from "../../services/api/board.api";
import { UserAvatar } from "../../components/common/UserAvatar";

/**
 * 게시글 조회 페이지
 * 공지사항, 유머글, 지식공유 필터 기능 포함
 */
const BoardList = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<BoardCategory | "all">("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 게시글 목록 조회
   */
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // 백엔드 ENUM에 맞게 대문자로 변환
        const params = category === "all" ? {} : { category: category.toUpperCase() };
        const response = await boardApi.getPosts(params);
        setPosts(response.data.data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("게시글을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category]);

  /**
   * 탭 변경 핸들러
   */
  const handleCategoryChange = (_: React.SyntheticEvent, newValue: BoardCategory | "all") => {
    setCategory(newValue);
  };

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
   * 글쓰기 페이지로 이동
   */
  const handleCreatePost = () => {
    navigate("/community/board/create");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3, position: "relative" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          게시판
        </Typography>

        {/* 카테고리 탭 */}
        <Tabs
          value={category}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              minHeight: 44, // 모바일 터치 타겟 크기
              fontSize: "0.875rem",
            },
          }}
        >
          <Tab label="전체" value="all" />
          <Tab label="공지사항" value="notice" />
          <Tab label="자유게시판" value="free" />
          <Tab label="유머글" value="humor" />
          <Tab label="지식공유" value="knowledge" />
        </Tabs>
      </Box>

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 로딩 상태 */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* 게시글 목록 영역 */
        <Stack spacing={2}>
          {posts.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "50vh",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                게시글이 없습니다.
              </Typography>
            </Box>
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                elevation={1}
                sx={{
                  transition: "all 0.2s",
                  "&:hover": {
                    elevation: 3,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => {
                    navigate(`/community/board/${post.id}`);
                  }}
                >
                  <CardContent>
                    <Stack spacing={1.5}>
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
                        variant="h6"
                        sx={{
                          fontSize: { xs: "1rem", sm: "1.125rem" },
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {post.title}
                      </Typography>

                      {/* 내용 미리보기 - HTML 태그 제거 필요할 수 있음 */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {post.content ? post.content.replace(/<[^>]*>?/gm, "") : ""}
                      </Typography>

                      {/* 작성자 및 통계 정보 */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pt: 1,
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        {/* 작성자 정보 */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <UserAvatar
                            userId={post.author?.id}
                            profileImageUrl={post.author?.profileImageUrl || post.author?.avatarUrl}
                            name={post.author?.nickname}
                            size={24}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {post.author?.nickname ?? "익명"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: { xs: "none", sm: "block" } }}
                          >
                            •
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(post.createdAt), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          </Typography>
                        </Box>

                        {/* 통계 정보 */}
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                          >
                            <ThumbUpOutlinedIcon
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {post.likeCount ?? 0}
                            </Typography>
                          </Box>
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                          >
                            <ChatBubbleOutlineIcon
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {post.commentCount ?? 0}
                            </Typography>
                          </Box>
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                          >
                            <VisibilityOutlinedIcon
                              sx={{ fontSize: 16, color: "text.secondary" }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {post.viewCount ?? 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))
          )}
        </Stack>
      )}

      {/* 플로팅 글쓰기 버튼 */}
      <Fab
        color="primary"
        aria-label="write"
        onClick={handleCreatePost}
        sx={{
          position: "fixed",
          bottom: { xs: 80, sm: 24 }, // 모바일은 하단 네비게이션 위
          right: { xs: 16, sm: 24 },
          zIndex: 1000,
        }}
      >
        <EditIcon />
      </Fab>
    </Container>
  );
};

export default BoardList;
