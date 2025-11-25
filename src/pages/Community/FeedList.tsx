import React, { useState, useRef } from "react";
import {
  Box,
  Container,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Stack,
  InputBase,
  Divider,
  Menu,
  MenuItem,
  MobileStepper,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

// --- Types ---
interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: Date;
}

interface FeedPost {
  id: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
    location?: string;
  };
  imageUrls: string[];
  content: string;
  likeCount: number;
  isLiked: boolean;
  comments: Comment[];
  createdAt: Date;
}

// --- Mock Data ---
const MOCK_POSTS: FeedPost[] = [
  {
    id: "1",
    user: {
      id: "u1",
      username: "travel_lover",
      avatarUrl: "https://i.pravatar.cc/150?u=u1",
      location: "Seoul, Korea",
    },
    imageUrls: [
      "https://picsum.photos/id/1015/600/600",
      "https://picsum.photos/id/1016/600/600",
      "https://picsum.photos/id/1018/600/600",
    ],
    content: "주말에 다녀온 한강 공원! 날씨가 너무 좋아서 힐링 제대로 했네요 🌿 사진 옆으로 넘겨보세요! 👉 #한강 #주말 #힐링 #풍경",
    likeCount: 124,
    isLiked: false,
    comments: [
      {
        id: "c1",
        userId: "u2",
        username: "daily_life",
        content: "와 사진 너무 잘 찍으셨네요!",
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      },
      {
        id: "c2",
        userId: "u3",
        username: "photo_grapher",
        content: "색감이 정말 예뻐요 👍",
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      },
      {
        id: "c3",
        userId: "u7",
        username: "seoul_lover",
        content: "한강 라면도 드셨나요? ㅎㅎ",
        createdAt: new Date(Date.now() - 1000 * 60 * 120),
      },
      {
        id: "c4",
        userId: "u8",
        username: "weekend_vibe",
        content: "사람 많았나요? 저도 가고싶네요",
        createdAt: new Date(Date.now() - 1000 * 60 * 150),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "2",
    user: {
      id: "u4",
      username: "foodie_kim",
      avatarUrl: "https://i.pravatar.cc/150?u=u4",
      location: "Gangnam, Seoul",
    },
    imageUrls: ["https://picsum.photos/id/1080/600/600"],
    content: "오늘 점심은 딸기! 🍓 상큼하고 달달하니 맛있어요. 다들 맛점하세요!",
    likeCount: 89,
    isLiked: true,
    comments: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    id: "3",
    user: {
      id: "u5",
      username: "tech_guru",
      avatarUrl: "https://i.pravatar.cc/150?u=u5",
    },
    imageUrls: [
      "https://picsum.photos/id/1/600/600",
      "https://picsum.photos/id/2/600/600",
      "https://picsum.photos/id/3/600/600",
      "https://picsum.photos/id/4/600/600",
      "https://picsum.photos/id/5/600/600",
    ],
    content: "새로 산 노트북 세팅 중... 개발 환경 잡는 건 언제나 귀찮지만 설레는 일 💻 여러 장 찍어봤습니다. #개발자 #노트북 #코딩 #데스크셋업",
    likeCount: 256,
    isLiked: false,
    comments: [
      {
        id: "c5",
        userId: "u6",
        username: "dev_lee",
        content: "어떤 모델 사셨나요? 부럽습니다!",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
      {
        id: "c6",
        userId: "u9",
        username: "coding_master",
        content: "세팅 공유 좀 부탁드려요~",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25),
      },
      {
        id: "c7",
        userId: "u10",
        username: "newbie_dev",
        content: "저도 맥북 사고 싶네요 ㅠㅠ",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25), // 1 day 1 hour ago
  },
];

/**
 * 피드 아이템 컴포넌트
 */
const FeedItem = ({ post }: { post: FeedPost }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const maxSteps = post.imageUrls.length;
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLikeClick = () => {
    if (isLiked) {
      setLikeCount((prev) => prev - 1);
    } else {
      setLikeCount((prev) => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNext = () => {
    if (activeStep < maxSteps - 1) {
      scrollToImage(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      scrollToImage(activeStep - 1);
    }
  };

  const scrollToImage = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.offsetWidth,
        behavior: "smooth",
      });
      setActiveStep(index);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(
        scrollRef.current.scrollLeft / scrollRef.current.offsetWidth
      );
      setActiveStep(index);
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 470,
        width: "100%",
        mb: 3,
        boxShadow: "none",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: { xs: 0, sm: 2 },
      }}
    >
      {/* 헤더: 사용자 정보 */}
      <CardHeader
        avatar={
          <Avatar
            src={post.user.avatarUrl}
            alt={post.user.username}
            sx={{ width: 32, height: 32, cursor: "pointer" }}
          />
        }
        action={
          <IconButton aria-label="settings" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        }
        title={
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, cursor: "pointer" }}
          >
            {post.user.username}
          </Typography>
        }
        subheader={
          post.user.location && (
            <Typography variant="caption" display="block">
              {post.user.location}
            </Typography>
          )
        }
        sx={{ py: 1.5 }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
          신고
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>팔로우 취소</MenuItem>
        <MenuItem onClick={handleMenuClose}>게시물로 이동</MenuItem>
        <MenuItem onClick={handleMenuClose}>공유 대상...</MenuItem>
        <MenuItem onClick={handleMenuClose}>링크 복사</MenuItem>
      </Menu>

      {/* 이미지 슬라이더 (CSS Scroll Snap) */}
      <Box sx={{ position: "relative" }}>
        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          sx={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
            width: "100%",
            aspectRatio: "1/1",
          }}
        >
          {post.imageUrls.map((url, index) => (
            <Box
              key={index}
              sx={{
                minWidth: "100%",
                scrollSnapAlign: "start",
                position: "relative",
              }}
            >
              <CardMedia
                component="img"
                image={url}
                alt={`Post image ${index + 1}`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          ))}
        </Box>

        {/* 이전 버튼 */}
        {maxSteps > 1 && activeStep > 0 && (
          <IconButton
            size="small"
            onClick={handleBack}
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255, 255, 255, 0.8)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
              zIndex: 1,
            }}
          >
            <KeyboardArrowLeft />
          </IconButton>
        )}

        {/* 다음 버튼 */}
        {maxSteps > 1 && activeStep < maxSteps - 1 && (
          <IconButton
            size="small"
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255, 255, 255, 0.8)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
              zIndex: 1,
            }}
          >
            <KeyboardArrowRight />
          </IconButton>
        )}
      </Box>

      {/* 액션 버튼 */}
      <CardActions disableSpacing sx={{ pt: 1, pb: 0 }}>
        <IconButton onClick={handleLikeClick} sx={{ p: 1 }}>
          {isLiked ? (
            <FavoriteIcon sx={{ color: "error.main" }} />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>
        <IconButton sx={{ p: 1 }}>
          <ChatBubbleOutlineIcon />
        </IconButton>
        <IconButton sx={{ p: 1 }}>
          <SendIcon sx={{ transform: "rotate(-45deg)", mb: 0.5 }} />
        </IconButton>

        {/* 페이지네이션 점 */}
        {maxSteps > 1 && (
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <MobileStepper
              steps={maxSteps}
              position="static"
              activeStep={activeStep}
              sx={{
                maxWidth: 400,
                flexGrow: 1,
                bgcolor: "transparent",
                "& .MuiMobileStepper-dot": {
                  width: 6,
                  height: 6,
                  mx: 0.5,
                },
                "& .MuiMobileStepper-dotActive": {
                  bgcolor: "primary.main",
                },
              }}
              nextButton={null}
              backButton={null}
            />
          </Box>
        )}
        {maxSteps <= 1 && <Box sx={{ flexGrow: 1 }} />}

        <IconButton sx={{ p: 1 }}>
          <BookmarkBorderIcon />
        </IconButton>
      </CardActions>

      {/* 좋아요 수, 내용, 댓글 */}
      <CardContent sx={{ pt: 1, pb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          좋아요 {likeCount}개
        </Typography>

        <Box sx={{ mb: 1 }}>
          <Typography
            variant="body2"
            component="span"
            sx={{ fontWeight: 600, mr: 1 }}
          >
            {post.user.username}
          </Typography>
          <Typography variant="body2" component="span">
            {post.content}
          </Typography>
        </Box>

        {/* 댓글 모두 보기 버튼 */}
        {post.comments.length > 0 && (
          <Box sx={{ mb: 1 }}>
            {!commentsExpanded && post.comments.length > 2 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: "pointer", mb: 0.5 }}
                onClick={() => setCommentsExpanded(true)}
              >
                댓글 {post.comments.length}개 모두 보기
              </Typography>
            )}
            {commentsExpanded && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: "pointer", mb: 0.5 }}
                onClick={() => setCommentsExpanded(false)}
              >
                댓글 접기
              </Typography>
            )}
          </Box>
        )}

        {/* 댓글 목록 */}
        {post.comments
          .slice(0, commentsExpanded ? undefined : 2)
          .map((comment) => (
            <Box key={comment.id} sx={{ mb: 0.5 }}>
              <Typography
                variant="body2"
                component="span"
                sx={{ fontWeight: 600, mr: 1 }}
              >
                {comment.username}
              </Typography>
              <Typography variant="body2" component="span">
                {comment.content}
              </Typography>
            </Box>
          ))}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1, fontSize: "0.7rem" }}
        >
          {formatDistanceToNow(post.createdAt, {
            addSuffix: true,
            locale: ko,
          }).toUpperCase()}
        </Typography>
      </CardContent>

      <Divider />

      {/* 댓글 입력창 */}
      <Box sx={{ p: 1.5, display: "flex", alignItems: "center" }}>
        <IconButton size="small" sx={{ mr: 1 }}>
          <SentimentSatisfiedAltIcon />
        </IconButton>
        <InputBase
          placeholder="댓글 달기..."
          sx={{ flexGrow: 1, fontSize: "0.875rem" }}
        />
        <Typography
          variant="button"
          color="primary"
          sx={{ cursor: "pointer", fontWeight: 600, opacity: 0.5 }}
        >
          게시
        </Typography>
      </Box>
    </Card>
  );
};

/**
 * 피드 조회 페이지
 */
const FeedList = () => {
  return (
    <Container
      maxWidth="sm"
      disableGutters
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: { xs: 0, sm: 4 },
      }}
    >
      <Stack spacing={2} sx={{ width: "100%", alignItems: "center" }}>
        {MOCK_POSTS.map((post) => (
          <FeedItem key={post.id} post={post} />
        ))}
      </Stack>
    </Container>
  );
};

export default FeedList;
