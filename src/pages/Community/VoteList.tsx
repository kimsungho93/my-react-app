import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Fab,
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { formatDistanceToNow, isPast, format } from "date-fns";
import { ko } from "date-fns/locale";
import { voteApi } from "../../services/api/vote.api";
import { userApi } from "../../services/api/user.api";
import type { VoteListItem, VoteStatus } from "../../types/vote.types";
import { UserAvatar } from "../../components/common/UserAvatar";

/**
 * 투표 목록 페이지
 */
const VoteList = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<VoteStatus | "all">("all");
  const [votes, setVotes] = useState<VoteListItem[]>([]);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 활성 회원 수 조회
   */
  useEffect(() => {
    const fetchActiveCount = async () => {
      try {
        const count = await userApi.getActiveCount();
        setActiveCount(count);
      } catch (err) {
        console.error("Failed to fetch active count:", err);
      }
    };

    fetchActiveCount();
  }, []);

  /**
   * 투표 목록 조회
   */
  useEffect(() => {
    const fetchVotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = status === "all" ? {} : { status };
        const response = await voteApi.getVotes(params);
        setVotes(response.data.content);
      } catch (err) {
        console.error("Failed to fetch votes:", err);
        setError("투표 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [status]);

  /**
   * 탭 변경 핸들러
   */
  const handleStatusChange = (_: React.SyntheticEvent, newValue: VoteStatus | "all") => {
    setStatus(newValue);
  };

  /**
   * 투표 생성 페이지로 이동
   */
  const handleCreateVote = () => {
    navigate("/community/vote/create");
  };

  /**
   * 남은 시간 표시
   */
  const getRemainingTime = (endDate: string) => {
    const end = new Date(endDate);
    if (isPast(end)) {
      return "종료됨";
    }
    return formatDistanceToNow(end, { addSuffix: true, locale: ko });
  };

  /**
   * 상태 칩 색상
   */
  const getStatusColor = (voteStatus: VoteStatus): "success" | "default" => {
    return voteStatus === "ACTIVE" ? "success" : "default";
  };

  /**
   * 카드 애니메이션 variants
   */
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut" as const,
      },
    }),
    exit: { opacity: 0, y: -10 },
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3, position: "relative" }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <HowToVoteIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            투표
          </Typography>
        </Box>

        {/* 상태 필터 탭 */}
        <Tabs
          value={status}
          onChange={handleStatusChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              minHeight: 44,
              fontSize: "0.875rem",
            },
          }}
        >
          <Tab label="전체" value="all" />
          <Tab label="진행중" value="ACTIVE" />
          <Tab label="종료됨" value="CLOSED" />
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
        <AnimatePresence mode="wait">
          <Stack spacing={2}>
            {votes.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "50vh",
                  gap: 2,
                }}
              >
                <HowToVoteIcon sx={{ fontSize: 64, color: "text.disabled" }} />
                <Typography variant="h6" color="text.secondary">
                  {status === "all" ? "등록된 투표가 없습니다." :
                   status === "ACTIVE" ? "진행중인 투표가 없습니다." : "종료된 투표가 없습니다."}
                </Typography>
              </Box>
            ) : (
              votes.map((vote, index) => (
                <motion.div
                  key={vote.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Card
                    elevation={1}
                    sx={{
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => navigate(`/community/vote/${vote.id}`)}
                    >
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Stack spacing={2}>
                          {/* 상단: 상태, 익명 여부, 복수 선택 */}
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                            <Chip
                              label={vote.status === "ACTIVE" ? "진행중" : "종료됨"}
                              color={getStatusColor(vote.status)}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                            {vote.anonymous && (
                              <Chip
                                icon={<VisibilityOffIcon sx={{ fontSize: 14 }} />}
                                label="익명"
                                size="small"
                                variant="outlined"
                              />
                            )}
                            {vote.multipleChoice && (
                              <Chip
                                label="복수선택"
                                size="small"
                                variant="outlined"
                                color="info"
                              />
                            )}
                            {vote.hasVoted && (
                              <Chip
                                icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                label="참여완료"
                                size="small"
                                color="primary"
                                variant="outlined"
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
                            {vote.title}
                          </Typography>

                          {/* 참여 현황 프로그레스 바 */}
                          {(() => {
                            const totalMembers = vote.totalActiveMembers ?? activeCount;
                            const participationRate = totalMembers > 0
                              ? (vote.totalParticipants / totalMembers) * 100
                              : 0;
                            return (
                              <Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    참여 현황
                                  </Typography>
                                  <Typography variant="caption" color="primary" fontWeight={600}>
                                    전체 {totalMembers}명 중 {vote.totalParticipants}명 참여
                                    {totalMembers > 0 && ` (${participationRate.toFixed(0)}%)`}
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(participationRate, 100)}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: "action.hover",
                                    "& .MuiLinearProgress-bar": {
                                      borderRadius: 3,
                                    },
                                  }}
                                />
                              </Box>
                            );
                          })()}

                          {/* 하단 정보 */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 1,
                              pt: 1,
                            }}
                          >
                            {/* 작성자 정보 */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <UserAvatar
                                userId={vote.author.id}
                                profileImageUrl={vote.author.profileImageUrl || vote.author.profileImage}
                                name={vote.author.name}
                                size={24}
                              />
                              <Typography variant="body2" color="text.secondary">
                                {vote.author.name}
                              </Typography>
                            </Box>

                            {/* 마감 시간 & 선택지 수 */}
                            <Box sx={{ display: "flex", gap: 2 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <HowToVoteIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                <Typography variant="caption" color="text.secondary">
                                  {vote.optionCount}개 선택지
                                </Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                <Typography variant="caption" color="text.secondary">
                                  {vote.totalParticipants}명
                                </Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <AccessTimeIcon
                                  sx={{
                                    fontSize: 16,
                                    color: vote.status === "CLOSED" ? "text.disabled" :
                                           isPast(new Date(vote.endDate)) ? "error.main" : "text.secondary"
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color={
                                    vote.status === "CLOSED" ? "text.disabled" :
                                    isPast(new Date(vote.endDate)) ? "error.main" : "text.secondary"
                                  }
                                >
                                  {vote.status === "CLOSED"
                                    ? format(new Date(vote.endDate), "MM/dd HH:mm", { locale: ko }) + " 종료"
                                    : getRemainingTime(vote.endDate)
                                  }
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              ))
            )}
          </Stack>
        </AnimatePresence>
      )}

      {/* 플로팅 투표 생성 버튼 */}
      <Fab
        color="primary"
        aria-label="create vote"
        onClick={handleCreateVote}
        sx={{
          position: "fixed",
          bottom: { xs: 80, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 1000,
        }}
      >
        <EditIcon />
      </Fab>
    </Container>
  );
};

export default VoteList;
