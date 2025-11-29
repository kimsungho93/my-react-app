import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Checkbox,
  Radio,
  FormControlLabel,
  RadioGroup,
  FormGroup,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import ReactECharts from "echarts-for-react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { ko } from "date-fns/locale";
import { voteApi } from "../../services/api/vote.api";
import type { Vote, VoteOption } from "../../types/vote.types";
import type { RootState } from "../../store";
import { UserAvatar } from "../../components/common/UserAvatar";

/**
 * 투표 상세 페이지
 */
const VoteDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [vote, setVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedOptions, setExpandedOptions] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [newOptionText, setNewOptionText] = useState("");
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [showAddOptionForm, setShowAddOptionForm] = useState(false);

  /**
   * 투표 데이터 조회
   */
  useEffect(() => {
    const fetchVote = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const response = await voteApi.getVoteDetail(Number(id));
        setVote(response.data);
        setSelectedOptions(response.data.myVotedOptionIds ?? []);
      } catch (err) {
        console.error("Failed to fetch vote:", err);
        setError("투표를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchVote();
  }, [id]);

  /**
   * 투표 종료 여부
   */
  const isVoteClosed = useMemo(() => {
    if (!vote) return true;
    return vote.status === "CLOSED" || isPast(new Date(vote.endDate));
  }, [vote]);

  /**
   * 수정/삭제 권한 체크
   */
  const canEditOrDelete = useMemo(() => {
    if (!vote || !currentUser) return false;
    return Number(currentUser.id) === vote.author.id || currentUser.role === "ADMIN";
  }, [vote, currentUser]);

  /**
   * ECharts 옵션 - 파이 차트
   */
  const pieChartOption = useMemo(() => {
    if (!vote) return {};

    // 모바일 여부 체크 (window 객체 사용)
    const isMobile = typeof window !== "undefined" && window.innerWidth < 600;

    return {
      tooltip: {
        trigger: "item",
        formatter: (params: { name: string; value: number; percent: number }) => {
          return `${params.name}<br/>투표 수: ${params.value}표 (${params.percent.toFixed(1)}%)`;
        },
      },
      grid: {
        top: 0,
        bottom: 0,
      },
      legend: {
        type: "scroll",
        orient: "horizontal",
        left: "center",
        bottom: 0,
        textStyle: {
          fontSize: 11,
        },
        itemWidth: 14,
        itemHeight: 10,
        itemGap: isMobile ? 8 : 12,
      },
      series: [
        {
          name: "투표 결과",
          type: "pie",
          radius: isMobile ? ["22%", "55%"] : ["30%", "65%"],
          center: isMobile ? ["50%", "42%"] : ["50%", "45%"],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: !isMobile,
            formatter: (params: { name: string; percent: number }) => {
              return `${params.percent.toFixed(1)}%`;
            },
            fontSize: 11,
          },
          labelLine: {
            show: !isMobile,
            length: 8,
            length2: 8,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.3)",
            },
          },
          data: vote.options.map((opt, index) => ({
            value: opt.voteCount,
            name: opt.text,
            itemStyle: {
              color: getChartColor(index),
            },
          })),
        },
      ],
    };
  }, [vote]);

  /**
   * ECharts 옵션 - 바 차트
   */
  const barChartOption = useMemo(() => {
    if (!vote) return {};

    const totalVotes = vote.options.reduce((sum, opt) => sum + opt.voteCount, 0);

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: (params: Array<{ name: string; value: number }>) => {
          const param = params[0];
          const percent = totalVotes > 0 ? ((param.value / totalVotes) * 100).toFixed(1) : 0;
          return `${param.name}<br/>투표 수: ${param.value}표 (${percent}%)`;
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number) => `${value}표`,
        },
      },
      yAxis: {
        type: "category",
        data: vote.options.map((opt) => opt.text).reverse(),
        axisLabel: {
          fontSize: 12,
          width: 100,
          overflow: "truncate",
        },
      },
      series: [
        {
          name: "투표 수",
          type: "bar",
          data: vote.options.map((opt, index) => ({
            value: opt.voteCount,
            itemStyle: {
              color: getChartColor(index),
              borderRadius: [0, 4, 4, 0],
            },
          })).reverse(),
          barWidth: "60%",
          label: {
            show: true,
            position: "insideRight",
            formatter: (params: { value: number }) => `${params.value}표`,
            fontSize: 12,
            color: "#fff",
            textShadowColor: "rgba(0, 0, 0, 0.5)",
            textShadowBlur: 2,
          },
        },
      ],
    };
  }, [vote]);

  /**
   * 차트 색상 배열
   */
  function getChartColor(index: number): string {
    const colors = [
      "#5470c6",
      "#91cc75",
      "#fac858",
      "#ee6666",
      "#73c0de",
      "#3ba272",
      "#fc8452",
      "#9a60b4",
      "#ea7ccc",
    ];
    return colors[index % colors.length];
  }

  /**
   * 옵션 선택 핸들러 (단일 선택)
   */
  const handleSingleOptionChange = (optionId: number) => {
    setSelectedOptions([optionId]);
  };

  /**
   * 옵션 선택 핸들러 (복수 선택)
   */
  const handleMultipleOptionChange = (optionId: number, checked: boolean) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, optionId]);
    } else {
      setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
    }
  };

  /**
   * 투표 참여 핸들러
   */
  const handleVote = async () => {
    if (!vote || selectedOptions.length === 0) {
      alert("선택지를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await voteApi.castVote(vote.id, { optionIds: selectedOptions });
      setVote(response.data);
      alert("투표가 완료되었습니다!");
    } catch (err) {
      console.error("Failed to cast vote:", err);
      alert("투표에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 투표 삭제 핸들러
   */
  const handleDelete = async () => {
    if (!vote) return;

    try {
      await voteApi.deleteVote(vote.id);
      navigate("/community/vote/list");
    } catch (err) {
      console.error("Failed to delete vote:", err);
      alert("투표 삭제에 실패했습니다.");
    }
    setDeleteDialogOpen(false);
  };

  /**
   * 투표 수동 종료 핸들러
   */
  const handleCloseVote = async () => {
    if (!vote) return;

    setIsClosing(true);
    try {
      const response = await voteApi.closeVote(vote.id);
      setVote(response.data);
      alert("투표가 종료되었습니다.");
    } catch (err) {
      console.error("Failed to close vote:", err);
      alert("투표 종료에 실패했습니다.");
    } finally {
      setIsClosing(false);
      setCloseDialogOpen(false);
    }
  };

  /**
   * 참여자 목록 토글
   */
  const toggleVotersList = (optionId: number) => {
    if (expandedOptions.includes(optionId)) {
      setExpandedOptions(expandedOptions.filter((id) => id !== optionId));
    } else {
      setExpandedOptions([...expandedOptions, optionId]);
    }
  };

  /**
   * 선택지 추가 핸들러
   */
  const handleAddOption = async () => {
    if (!vote || !newOptionText.trim()) return;

    // 중복 체크
    const isDuplicate = vote.options.some(
      (opt) => opt.text.trim().toLowerCase() === newOptionText.trim().toLowerCase()
    );
    if (isDuplicate) {
      alert("이미 존재하는 선택지입니다.");
      return;
    }

    // 최대 개수 체크
    if (vote.options.length >= 20) {
      alert("선택지는 최대 20개까지 추가할 수 있습니다.");
      return;
    }

    setIsAddingOption(true);
    try {
      await voteApi.addVoteOption(vote.id, { text: newOptionText.trim() });

      // 투표 데이터 다시 불러오기
      const response = await voteApi.getVoteDetail(vote.id);
      setVote(response.data);
      setNewOptionText("");
      setShowAddOptionForm(false);
      alert("선택지가 추가되었습니다.");
    } catch (err) {
      console.error("Failed to add option:", err);
      alert("선택지 추가에 실패했습니다.");
    } finally {
      setIsAddingOption(false);
    }
  };

  /**
   * 투표율 계산
   */
  const getVotePercentage = (option: VoteOption): number => {
    if (!vote || vote.totalParticipants === 0) return 0;
    const total = vote.options.reduce((sum, opt) => sum + opt.voteCount, 0);
    if (total === 0) return 0;
    return (option.voteCount / total) * 100;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !vote) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {error || "투표를 찾을 수 없습니다."}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/community/vote/list")}
            sx={{ mt: 2 }}
          >
            목록으로 돌아가기
          </Button>
        </Paper>
      </Container>
    );
  }

  const hasVoted = (vote.myVotedOptionIds?.length ?? 0) > 0;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper elevation={2} sx={{ overflow: "hidden" }}>
        {/* 헤더 */}
        <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: 1, borderColor: "divider" }}>
          <Stack spacing={2}>
            {/* 상단 네비게이션 */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Button
                startIcon={<ArrowBackIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                onClick={() => navigate("/community/vote/list")}
                sx={{
                  minWidth: "auto",
                  px: { xs: 1, sm: 1.5 },
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                }}
                size="small"
              >
                목록
              </Button>

              {canEditOrDelete && (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {!isVoteClosed && (
                    <Button
                      startIcon={<EditIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                      onClick={() => navigate(`/community/vote/edit/${vote.id}`)}
                      size="small"
                      sx={{
                        px: { xs: 1, sm: 1.5 },
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        minWidth: "auto",
                      }}
                    >
                      수정
                    </Button>
                  )}
                  <Button
                    startIcon={<DeleteIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                    size="small"
                    sx={{
                      px: { xs: 1, sm: 1.5 },
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      minWidth: "auto",
                    }}
                  >
                    삭제
                  </Button>
                </Box>
              )}
            </Box>

            {/* 상태 및 속성 칩 */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label={isVoteClosed ? "종료됨" : "진행중"}
                color={isVoteClosed ? "default" : "success"}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              {(vote.isAnonymous || vote.anonymous) && (
                <Chip
                  icon={<VisibilityOffIcon sx={{ fontSize: 14 }} />}
                  label="익명 투표"
                  size="small"
                  variant="outlined"
                />
              )}
              {(vote.isMultipleChoice || vote.multipleChoice) && (
                <Chip label="복수 선택 가능" size="small" variant="outlined" color="info" />
              )}
              {hasVoted && (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                  label="참여 완료"
                  size="small"
                  color="primary"
                  variant="outlined"
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
              {vote.title}
            </Typography>

            {/* 설명 */}
            {vote.description && (
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {vote.description}
              </Typography>
            )}

            {/* 메타 정보 */}
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
                  userId={vote.author.id}
                  profileImageUrl={vote.author.profileImageUrl || vote.author.profileImage}
                  name={vote.author.name}
                  size={40}
                />
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {vote.author.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(vote.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </Typography>
                </Box>
              </Box>

              {/* 참여자 수 & 마감일 */}
              <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                  <PersonIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: "text.secondary" }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" }, whiteSpace: "nowrap" }}
                  >
                    {vote.totalParticipants}/{vote.totalActiveMembers}명 참여
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                  <AccessTimeIcon
                    sx={{
                      fontSize: { xs: 16, sm: 18 },
                      color: isVoteClosed ? "text.disabled" : "warning.main",
                    }}
                  />
                  <Typography
                    variant="caption"
                    color={isVoteClosed ? "text.disabled" : "warning.main"}
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" }, whiteSpace: "nowrap" }}
                  >
                    {format(new Date(vote.endDate), "MM.dd HH:mm", { locale: ko })}
                    {!isVoteClosed && ` (${formatDistanceToNow(new Date(vote.endDate), { locale: ko })} 남음)`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* 차트 섹션 */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            <HowToVoteIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            투표 결과
          </Typography>

          {/* 파이 차트 */}
          <Paper elevation={0} sx={{ p: 1, pb: 0, mb: 2, bgcolor: "background.default", borderRadius: 2 }}>
            <ReactECharts
              option={pieChartOption}
              style={{ height: window.innerWidth < 600 ? 240 : 280 }}
              opts={{ renderer: "svg" }}
            />
          </Paper>

          {/* 바 차트 */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: "background.default", borderRadius: 2 }}>
            <ReactECharts
              option={barChartOption}
              style={{ height: Math.max(200, vote.options.length * 50) }}
              opts={{ renderer: "svg" }}
            />
          </Paper>
        </Box>

        <Divider />

        {/* 투표 옵션 섹션 */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            선택지 {!isVoteClosed && !hasVoted && "(투표하기)"}
          </Typography>

          {/* 투표 폼 또는 결과 */}
          {(vote.isMultipleChoice === true || vote.multipleChoice === true) ? (
            <FormGroup>
              {vote.options.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: 1,
                      borderColor: selectedOptions.includes(option.id)
                        ? "primary.main"
                        : "divider",
                      borderRadius: 2,
                      bgcolor: selectedOptions.includes(option.id)
                        ? "primary.50"
                        : "background.paper",
                      transition: "all 0.2s",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedOptions.includes(option.id)}
                            onChange={(e) =>
                              handleMultipleOptionChange(option.id, e.target.checked)
                            }
                            disabled={isVoteClosed}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {option.text}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.voteCount}표 ({getVotePercentage(option).toFixed(1)}%)
                            </Typography>
                          </Box>
                        }
                        sx={{ flex: 1, mr: 0 }}
                      />

                      {/* 참여자 보기 버튼 (익명이 아닌 경우) */}
                      {!(vote.isAnonymous || vote.anonymous) && option.voters.length > 0 && (
                        <IconButton
                          size="small"
                          onClick={() => toggleVotersList(option.id)}
                        >
                          {expandedOptions.includes(option.id) ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      )}
                    </Box>

                    {/* 투표율 바 */}
                    <Box sx={{ mt: 1.5, ml: 4 }}>
                      <Box
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "action.hover",
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getVotePercentage(option)}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          style={{
                            height: "100%",
                            backgroundColor: getChartColor(index),
                            borderRadius: 4,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* 참여자 목록 */}
                    {!(vote.isAnonymous || vote.anonymous) && (
                      <Collapse in={expandedOptions.includes(option.id)}>
                        <List dense sx={{ mt: 1, ml: 4 }}>
                          {option.voters.map((voter) => (
                            <ListItem key={voter.id} sx={{ py: 0.5 }}>
                              <ListItemAvatar sx={{ minWidth: 36 }}>
                                <UserAvatar
                                  userId={voter.id}
                                  profileImageUrl={voter.profileImageUrl || voter.profileImage}
                                  name={voter.name}
                                  size={24}
                                />
                              </ListItemAvatar>
                              <ListItemText
                                primary={voter.name}
                                secondary={format(new Date(voter.votedAt), "MM/dd HH:mm", {
                                  locale: ko,
                                })}
                                primaryTypographyProps={{ variant: "body2" }}
                                secondaryTypographyProps={{ variant: "caption" }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    )}
                  </Paper>
                </motion.div>
              ))}
            </FormGroup>
          ) : (
            <RadioGroup
              value={selectedOptions[0] ?? ""}
              onChange={(e) => handleSingleOptionChange(Number(e.target.value))}
            >
              {vote.options.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: 1,
                      borderColor: selectedOptions.includes(option.id)
                        ? "primary.main"
                        : "divider",
                      borderRadius: 2,
                      bgcolor: selectedOptions.includes(option.id)
                        ? "primary.50"
                        : "background.paper",
                      transition: "all 0.2s",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <FormControlLabel
                        value={option.id}
                        control={<Radio disabled={isVoteClosed} />}
                        label={
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {option.text}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.voteCount}표 ({getVotePercentage(option).toFixed(1)}%)
                            </Typography>
                          </Box>
                        }
                        sx={{ flex: 1, mr: 0 }}
                      />

                      {/* 참여자 보기 버튼 (익명이 아닌 경우) */}
                      {!(vote.isAnonymous || vote.anonymous) && option.voters.length > 0 && (
                        <IconButton
                          size="small"
                          onClick={() => toggleVotersList(option.id)}
                        >
                          {expandedOptions.includes(option.id) ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      )}
                    </Box>

                    {/* 투표율 바 */}
                    <Box sx={{ mt: 1.5, ml: 4 }}>
                      <Box
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "action.hover",
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getVotePercentage(option)}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          style={{
                            height: "100%",
                            backgroundColor: getChartColor(index),
                            borderRadius: 4,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* 참여자 목록 */}
                    {!(vote.isAnonymous || vote.anonymous) && (
                      <Collapse in={expandedOptions.includes(option.id)}>
                        <List dense sx={{ mt: 1, ml: 4 }}>
                          {option.voters.map((voter) => (
                            <ListItem key={voter.id} sx={{ py: 0.5 }}>
                              <ListItemAvatar sx={{ minWidth: 36 }}>
                                <UserAvatar
                                  userId={voter.id}
                                  profileImageUrl={voter.profileImageUrl || voter.profileImage}
                                  name={voter.name}
                                  size={24}
                                />
                              </ListItemAvatar>
                              <ListItemText
                                primary={voter.name}
                                secondary={format(new Date(voter.votedAt), "MM/dd HH:mm", {
                                  locale: ko,
                                })}
                                primaryTypographyProps={{ variant: "body2" }}
                                secondaryTypographyProps={{ variant: "caption" }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    )}
                  </Paper>
                </motion.div>
              ))}
            </RadioGroup>
          )}

          {/* 선택지 추가 섹션 (allowAddOption이 true인 경우) */}
          {!isVoteClosed && vote.allowAddOption && (
            <Box sx={{ mt: 3, mb: 2 }}>
              {!showAddOptionForm ? (
                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => setShowAddOptionForm(true)}
                  fullWidth
                  sx={{ borderStyle: "dashed" }}
                >
                  새로운 선택지 추가하기
                </Button>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: 2,
                    borderColor: "primary.main",
                    borderStyle: "dashed",
                    borderRadius: 2,
                  }}
                >
                  <Stack spacing={2}>
                    <TextField
                      label="새로운 선택지"
                      value={newOptionText}
                      onChange={(e) => setNewOptionText(e.target.value)}
                      placeholder="선택지 내용을 입력하세요"
                      fullWidth
                      autoFocus
                      disabled={isAddingOption}
                      inputProps={{ maxLength: 100 }}
                      helperText={`${newOptionText.length} / 100`}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && newOptionText.trim()) {
                          handleAddOption();
                        }
                      }}
                    />
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setShowAddOptionForm(false);
                          setNewOptionText("");
                        }}
                        disabled={isAddingOption}
                      >
                        취소
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleAddOption}
                        disabled={!newOptionText.trim() || isAddingOption}
                        startIcon={
                          isAddingOption ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <AddCircleOutlineIcon />
                          )
                        }
                      >
                        {isAddingOption ? "추가 중..." : "추가"}
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              )}
            </Box>
          )}

          {/* 투표 버튼 */}
          {!isVoteClosed && (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleVote}
                disabled={selectedOptions.length === 0 || isSubmitting}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <HowToVoteIcon />
                  )
                }
                sx={{ minWidth: { xs: 140, sm: 160 } }}
              >
                {isSubmitting ? "처리 중..." : hasVoted ? "투표 변경" : "투표하기"}
              </Button>
              {canEditOrDelete && (
                <Button
                  variant="outlined"
                  size="large"
                  color="warning"
                  onClick={() => setCloseDialogOpen(true)}
                  startIcon={<StopCircleIcon />}
                >
                  투표 종료
                </Button>
              )}
            </Box>
          )}

          {/* 익명 투표 안내 */}
          {(vote.isAnonymous || vote.anonymous) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                이 투표는 익명으로 진행됩니다. 누가 어떤 선택지에 투표했는지 공개되지 않습니다.
              </Typography>
            </Alert>
          )}
        </Box>
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>투표 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 이 투표를 삭제하시겠습니까? 삭제된 투표는 복구할 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 투표 종료 확인 다이얼로그 */}
      <Dialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)}>
        <DialogTitle>투표 종료</DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 이 투표를 종료하시겠습니까? 종료된 투표는 더 이상 참여할 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialogOpen(false)} disabled={isClosing}>
            취소
          </Button>
          <Button
            onClick={handleCloseVote}
            color="warning"
            variant="contained"
            disabled={isClosing}
          >
            {isClosing ? "처리 중..." : "종료"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VoteDetail;
