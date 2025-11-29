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
  Fab,
  Snackbar,
  Alert,
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
import AddIcon from "@mui/icons-material/Add";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import FeedCreateDialog from "./FeedCreateDialog";
import ReportDialog from "./ReportDialog";
import type { ReportTargetType } from "./types";

// --- Types ---
/** 사용자 간단 정보 */
interface UserSimple {
  id: number;
  username: string;
  avatarUrl?: string;
}

/** 댓글 (대댓글 구조 포함) */
interface Comment {
  id: number;
  user: UserSimple;
  content: string;
  parentId: number | null;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date | null;
}

/** 피드 게시물 */
interface FeedPost {
  id: number;
  user: UserSimple;
  imageUrls: string[];
  content: string;
  location?: string;
  taggedUsers: UserSimple[];
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
  comments: Comment[];
  createdAt: Date;
}

// --- Mock Data ---
const INITIAL_MOCK_POSTS: FeedPost[] = [
  {
    id: 1,
    user: {
      id: 1,
      username: "travel_lover",
      avatarUrl: "https://i.pravatar.cc/150?u=u1",
    },
    imageUrls: [
      "https://picsum.photos/id/1015/600/600",
      "https://picsum.photos/id/1016/600/600",
      "https://picsum.photos/id/1018/600/600",
    ],
    content: "주말에 다녀온 한강 공원! 날씨가 너무 좋아서 힐링 제대로 했네요 🌿 사진 옆으로 넘겨보세요! 👉 #한강 #주말 #힐링 #풍경",
    location: "Seoul, Korea",
    taggedUsers: [
      { id: 2, username: "daily_life", avatarUrl: "https://i.pravatar.cc/150?u=u2" },
      { id: 3, username: "photo_grapher", avatarUrl: "https://i.pravatar.cc/150?u=u3" },
    ],
    likeCount: 124,
    isLiked: false,
    commentCount: 4,
    comments: [
      {
        id: 1,
        user: { id: 2, username: "daily_life", avatarUrl: "https://i.pravatar.cc/150?u=u2" },
        content: "와 사진 너무 잘 찍으셨네요!",
        parentId: null,
        replyCount: 2,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
        updatedAt: null,
      },
      {
        id: 2,
        user: { id: 3, username: "photo_grapher", avatarUrl: "https://i.pravatar.cc/150?u=u3" },
        content: "색감이 정말 예뻐요 👍",
        parentId: null,
        replyCount: 0,
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
        updatedAt: null,
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 2,
    user: {
      id: 4,
      username: "foodie_kim",
      avatarUrl: "https://i.pravatar.cc/150?u=u4",
    },
    imageUrls: ["https://picsum.photos/id/1080/600/600"],
    content: "오늘 점심은 딸기! 🍓 상큼하고 달달하니 맛있어요. 다들 맛점하세요!",
    location: "Gangnam, Seoul",
    taggedUsers: [],
    likeCount: 89,
    isLiked: true,
    commentCount: 0,
    comments: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: 3,
    user: {
      id: 5,
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
    taggedUsers: [
      { id: 6, username: "dev_lee", avatarUrl: "https://i.pravatar.cc/150?u=u6" },
    ],
    likeCount: 256,
    isLiked: false,
    commentCount: 5,
    comments: [
      {
        id: 3,
        user: { id: 6, username: "dev_lee", avatarUrl: "https://i.pravatar.cc/150?u=u6" },
        content: "어떤 모델 사셨나요? 부럽습니다!",
        parentId: null,
        replyCount: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        updatedAt: null,
      },
      {
        id: 4,
        user: { id: 9, username: "coding_master", avatarUrl: "https://i.pravatar.cc/150?u=u9" },
        content: "세팅 공유 좀 부탁드려요~",
        parentId: null,
        replyCount: 0,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25),
  },
  {
    id: 4,
    user: {
      id: 10,
      username: "daily_thoughts",
      avatarUrl: "https://i.pravatar.cc/150?u=u10",
    },
    imageUrls: [],
    content: "오늘 하루도 고생 많으셨습니다! 🌙 퇴근길에 문득 든 생각인데, 매일 조금씩이라도 성장하고 있다는 걸 느끼면 참 좋겠어요. 다들 오늘 하루 어떠셨나요?",
    location: "Seoul, Korea",
    taggedUsers: [],
    likeCount: 45,
    isLiked: false,
    commentCount: 3,
    comments: [
      {
        id: 5,
        user: { id: 11, username: "night_owl", avatarUrl: "https://i.pravatar.cc/150?u=u11" },
        content: "공감이에요! 오늘도 수고하셨습니다 👏",
        parentId: null,
        replyCount: 0,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        updatedAt: null,
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
];

/**
 * 피드 아이템 컴포넌트
 */
const FeedItem = ({
  post,
  onReport
}: {
  post: FeedPost;
  onReport: (type: ReportTargetType, id: number) => void;
}) => {
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

  const handleReport = () => {
    onReport("FEED", post.id);
    handleMenuClose();
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
          post.location && (
            <Typography variant="caption" display="block">
              {post.location}
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
        <MenuItem onClick={handleMenuClose}>링크 복사</MenuItem>
        <MenuItem onClick={handleReport} sx={{ color: "error.main" }}>
          신고
        </MenuItem>
      </Menu>

      {/* 이미지 슬라이더 (이미지가 있을 때만 표시) */}
      {post.imageUrls.length > 0 && (
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
      )}

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
        {post.commentCount > 0 && (
          <Box sx={{ mb: 1 }}>
            {!commentsExpanded && post.commentCount > 2 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: "pointer", mb: 0.5 }}
                onClick={() => setCommentsExpanded(true)}
              >
                댓글 {post.commentCount}개 모두 보기
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

        {/* 댓글 목록 (최상위 댓글만, 미리보기 2개) */}
        {post.comments
          .slice(0, commentsExpanded ? undefined : 2)
          .map((comment) => (
            <Box key={comment.id} sx={{ mb: 0.5 }}>
              <Typography
                variant="body2"
                component="span"
                sx={{ fontWeight: 600, mr: 1 }}
              >
                {comment.user.username}
              </Typography>
              <Typography variant="body2" component="span">
                {comment.content}
              </Typography>
              {comment.replyCount > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", ml: 0, cursor: "pointer" }}
                >
                  답글 {comment.replyCount}개 보기
                </Typography>
              )}
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
  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_MOCK_POSTS);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  
  // Report Dialog State
  const [reportDialog, setReportDialog] = useState<{
    open: boolean;
    targetType: ReportTargetType;
    targetId: number;
  }>({
    open: false,
    targetType: "FEED",
    targetId: 0,
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: "",
  });

  const handleCreateSubmit = (data: any) => {
    // Mock Post Creation
    const newPost: FeedPost = {
      id: Date.now(),
      user: {
        id: 100,
        username: "my_username",
        avatarUrl: "https://i.pravatar.cc/150?u=me",
      },
      imageUrls: data.images,
      content: data.content,
      location: data.location,
      taggedUsers: [],
      likeCount: 0,
      isLiked: false,
      commentCount: 0,
      comments: [],
      createdAt: new Date(),
    };

    setPosts([newPost, ...posts]);
  };

  const handleReportOpen = (targetType: ReportTargetType, targetId: number) => {
    setReportDialog({
      open: true,
      targetType,
      targetId,
    });
  };

  const handleReportSubmit = (data: { reason: string; description: string }) => {
    console.log("Report submitted:", { ...reportDialog, ...data });
    setSnackbar({
      open: true,
      message: "신고가 접수되었습니다. 검토 후 조치하겠습니다.",
    });
  };

  return (
    <Container
      maxWidth="sm"
      disableGutters
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: { xs: 0, sm: 4 },
        position: "relative",
        minHeight: "100vh",
      }}
    >
      <Stack spacing={2} sx={{ width: "100%", alignItems: "center" }}>
        {posts.map((post) => (
          <FeedItem 
            key={post.id} 
            post={post} 
            onReport={handleReportOpen}
          />
        ))}
      </Stack>

      {/* Floating Action Button for Create */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: "fixed",
          bottom: { xs: 80, sm: 32 },
          right: { xs: 16, sm: 32 },
        }}
        onClick={() => setOpenCreateDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* Create Dialog */}
      <FeedCreateDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Report Dialog */}
      <ReportDialog
        open={reportDialog.open}
        onClose={() => setReportDialog((prev) => ({ ...prev, open: false }))}
        targetType={reportDialog.targetType}
        targetId={reportDialog.targetId}
        onSubmit={handleReportSubmit}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FeedList;
