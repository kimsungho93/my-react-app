import { useState, useMemo } from "react";
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
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

type BoardCategory = "all" | "notice" | "free" | "humor" | "knowledge";

/**
 * 게시글 타입
 */
interface Post {
  id: number;
  category: "notice" | "free" | "humor" | "knowledge";
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
 * Mock 데이터
 */
const MOCK_POSTS: Post[] = [
  {
    id: 1,
    category: "notice",
    title: "2025년 1월 정기 업데이트 안내",
    content: "다음 주 월요일 새벽 2시부터 4시까지 서버 점검이 예정되어 있습니다.",
    author: "관리자",
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
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
    createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45분 전
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5시간 전
    likes: 89,
    comments: 23,
    views: 567,
  },
  {
    id: 4,
    category: "humor",
    title: "고양이가 키보드 위에서 잠들었을 때 대처법",
    content: "1. 아무것도 하지 않는다 2. 사진을 찍는다 3. 반복",
    author: "집사123",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8시간 전
    likes: 234,
    comments: 67,
    views: 1453,
  },
  {
    id: 5,
    category: "knowledge",
    title: "TypeScript 타입 가드 완벽 정리",
    content: "타입 가드의 모든 것을 예제와 함께 설명합니다.",
    author: "TS마스터",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12시간 전
    likes: 156,
    comments: 45,
    views: 982,
  },
  {
    id: 6,
    category: "notice",
    title: "커뮤니티 이용 규칙 안내",
    content: "모두가 즐거운 커뮤니티를 위한 기본 규칙입니다.",
    author: "관리자",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1일 전
    likes: 67,
    comments: 8,
    views: 456,
  },
  {
    id: 7,
    category: "humor",
    title: "개발자의 하루 (4컷 만화)",
    content: "아침: 에러 / 점심: 에러 수정 / 저녁: 새로운 에러 발견 / 밤: 디버깅",
    author: "만화가",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2일 전
    likes: 389,
    comments: 92,
    views: 2341,
  },
  {
    id: 8,
    category: "knowledge",
    title: "CSS Grid vs Flexbox 언제 뭘 써야 할까?",
    content: "실전 예제로 알아보는 레이아웃 기법 비교",
    author: "프론트개발자",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3일 전
    likes: 145,
    comments: 38,
    views: 834,
  },
  {
    id: 9,
    category: "humor",
    title: "버그를 찾았을 때 vs 못 찾았을 때",
    content: "찾았을 때: 기분 좋음 / 못 찾았을 때: 퇴근",
    author: "디버거",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4일 전
    likes: 267,
    comments: 54,
    views: 1678,
  },
  {
    id: 10,
    category: "knowledge",
    title: "성능 최적화 체크리스트 10가지",
    content: "프론트엔드 성능을 개선하는 실용적인 방법들",
    author: "최적화전문가",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5일 전
    likes: 198,
    comments: 41,
    views: 1123,
  },
  {
    id: 12,
    category: "free",
    title: "주말에 뭐 하시나요?",
    content: "날씨도 좋은데 집에만 있기 아깝네요. 다들 주말 계획 있으신가요?",
    author: "주말러버",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3시간 전
    likes: 67,
    comments: 89,
    views: 456,
  },
  {
    id: 13,
    category: "free",
    title: "운동 시작하려는데 추천 좀",
    content: "헬스장 vs 홈트 뭐가 좋을까요? 초보자 입장에서요",
    author: "운동초보",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6시간 전
    likes: 45,
    comments: 34,
    views: 289,
  },
  {
    id: 14,
    category: "free",
    title: "요즘 넷플릭스 볼만한 거 있나요?",
    content: "주말에 정주행할 드라마나 영화 추천해주세요",
    author: "넷플러",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10), // 10시간 전
    likes: 112,
    comments: 78,
    views: 678,
  },
  {
    id: 15,
    category: "free",
    title: "강아지 키우시는 분들 계신가요?",
    content: "처음 강아지 입양하려고 하는데 조언 부탁드립니다",
    author: "예비집사",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 15), // 15시간 전
    likes: 89,
    comments: 45,
    views: 534,
  },
  {
    id: 16,
    category: "free",
    title: "카페 창업 관련 질문있습니다",
    content: "카페 창업 경험 있으신 분들 계실까요? 조언 구합니다",
    author: "카페꿈나무",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20), // 20시간 전
    likes: 56,
    comments: 67,
    views: 423,
  },
  {
    id: 17,
    category: "free",
    title: "이직 고민 중인데요...",
    content: "현직장 3년차인데 이직할까 말까 고민됩니다. 조언 부탁드려요",
    author: "이직고민",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5), // 1.5일 전
    likes: 134,
    comments: 98,
    views: 892,
  },
  {
    id: 18,
    category: "free",
    title: "여행 가고 싶은데 어디가 좋을까요?",
    content: "국내 여행지 추천해주세요! 2박3일 코스로요",
    author: "여행가자",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.5), // 2.5일 전
    likes: 78,
    comments: 56,
    views: 567,
  },
];

/**
 * 게시글 조회 페이지
 * 공지사항, 유머글, 지식공유 필터 기능 포함
 */
const BoardList = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<BoardCategory>("all");

  /**
   * 카테고리별 필터링된 게시글
   */
  const filteredPosts = useMemo(() => {
    if (category === "all") return MOCK_POSTS;
    return MOCK_POSTS.filter((post) => post.category === category);
  }, [category]);

  /**
   * 탭 변경 핸들러
   */
  const handleCategoryChange = (_: React.SyntheticEvent, newValue: BoardCategory) => {
    setCategory(newValue);
  };

  /**
   * 카테고리 라벨 가져오기
   */
  const getCategoryLabel = (cat: "notice" | "free" | "humor" | "knowledge") => {
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
  const getCategoryColor = (cat: "notice" | "free" | "humor" | "knowledge") => {
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

      {/* 게시글 목록 영역 */}
      <Stack spacing={2}>
        {filteredPosts.length === 0 ? (
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
          filteredPosts.map((post) => (
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

                    {/* 내용 미리보기 */}
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
                      {post.content}
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
                        <Avatar
                          sx={{ width: 24, height: 24, fontSize: "0.75rem" }}
                        >
                          {post.author[0]}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                          {post.author}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: { xs: "none", sm: "block" } }}
                        >
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(post.createdAt, {
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
                            {post.likes}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                        >
                          <ChatBubbleOutlineIcon
                            sx={{ fontSize: 16, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {post.comments}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                        >
                          <VisibilityOutlinedIcon
                            sx={{ fontSize: 16, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {post.views}
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
