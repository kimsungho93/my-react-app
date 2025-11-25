import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import { format, addDays, addHours, setMinutes } from "date-fns";
import { voteApi } from "../../services/api/vote.api";
import type { CreateVoteRequest, UpdateVoteRequest } from "../../types/vote.types";
import AlertModal from "../../components/common/AlertModal";

/**
 * 투표 작성/수정 페이지
 */
const VoteCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // 폼 상태
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  // AlertModal 상태
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "error",
  });

  /**
   * 기본 마감 시간 설정 (내일 18:00)
   */
  useEffect(() => {
    if (!isEditMode) {
      const tomorrow = addDays(new Date(), 1);
      const defaultEndDate = setMinutes(addHours(tomorrow, 0), 0);
      defaultEndDate.setHours(18, 0, 0, 0);
      setEndDate(format(defaultEndDate, "yyyy-MM-dd"));
      setEndTime("18:00");
    }
  }, [isEditMode]);

  /**
   * 수정 모드일 경우 기존 데이터 로드
   */
  useEffect(() => {
    const fetchVote = async () => {
      if (!id) return;

      setInitialLoading(true);
      try {
        const response = await voteApi.getVoteDetail(Number(id));
        const vote = response.data;
        setTitle(vote.title);
        setDescription(vote.description ?? "");
        setIsAnonymous(vote.isAnonymous);
        setIsMultipleChoice(vote.isMultipleChoice);

        const endDateTime = new Date(vote.endDate);
        setEndDate(format(endDateTime, "yyyy-MM-dd"));
        setEndTime(format(endDateTime, "HH:mm"));
      } catch (err) {
        console.error("Failed to fetch vote:", err);
        setError("투표 정보를 불러오는데 실패했습니다.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (isEditMode) {
      fetchVote();
    }
  }, [id, isEditMode]);

  /**
   * 옵션 추가
   */
  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  /**
   * 옵션 삭제
   */
  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  /**
   * 옵션 변경
   */
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  /**
   * 에러 모달 표시 헬퍼
   */
  const showErrorModal = (message: string) => {
    setAlertModal({
      isOpen: true,
      title: "입력 오류",
      message,
      type: "error",
    });
  };

  /**
   * 폼 유효성 검사
   */
  const validateForm = (): boolean => {
    if (!title.trim()) {
      showErrorModal("제목을 입력해주세요.");
      return false;
    }
    if (title.trim().length < 2) {
      showErrorModal("제목은 최소 2글자 이상 입력해주세요.");
      return false;
    }

    if (!isEditMode) {
      const validOptions = options.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        showErrorModal("최소 2개의 선택지를 입력해주세요.");
        return false;
      }

      // 중복 선택지 검사
      const trimmedOptions = validOptions.map((opt) => opt.trim().toLowerCase());
      const uniqueOptions = new Set(trimmedOptions);
      if (uniqueOptions.size !== trimmedOptions.length) {
        showErrorModal("중복된 선택지가 있습니다. 서로 다른 선택지를 입력해주세요.");
        return false;
      }
    }

    if (!endDate || !endTime) {
      showErrorModal("마감 일시를 설정해주세요.");
      return false;
    }

    const endDateTime = new Date(`${endDate}T${endTime}`);
    if (endDateTime <= new Date()) {
      showErrorModal("마감 일시는 현재 시간 이후여야 합니다.");
      return false;
    }

    return true;
  };

  /**
   * 투표 생성/수정 제출
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const endDateTime = new Date(`${endDate}T${endTime}`);

      if (isEditMode && id) {
        const updateRequest: UpdateVoteRequest = {
          title: title.trim(),
          description: description.trim() || undefined,
          endDate: endDateTime.toISOString(),
        };
        await voteApi.updateVote(Number(id), updateRequest);
        navigate(`/community/vote/${id}`);
      } else {
        const validOptions = options.filter((opt) => opt.trim());
        const createRequest: CreateVoteRequest = {
          title: title.trim(),
          description: description.trim() || undefined,
          options: validOptions,
          isAnonymous,
          isMultipleChoice,
          endDate: endDateTime.toISOString(),
        };
        const response = await voteApi.createVote(createRequest);
        // 생성된 투표 ID가 있으면 상세 페이지로, 없으면 목록으로 이동
        if (response.data?.id) {
          navigate(`/community/vote/${response.data.id}`);
        } else {
          navigate("/community/vote/list");
        }
      }
    } catch (err) {
      console.error("Failed to save vote:", err);
      showErrorModal(isEditMode ? "투표 수정에 실패했습니다." : "투표 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 취소 핸들러
   */
  const handleCancel = () => {
    navigate(-1);
  };

  /**
   * 10분 단위 시간 옵션 생성
   */
  const generateTimeOptions = (): string[] => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        times.push(
          `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
        );
      }
    }
    return times;
  };

  if (initialLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          {/* 헤더 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleCancel}
              sx={{ minWidth: "auto", px: 1 }}
            >
              뒤로
            </Button>
            <HowToVoteIcon color="primary" />
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              {isEditMode ? "투표 수정" : "투표 만들기"}
            </Typography>
          </Box>

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* 제목 */}
          <TextField
            label="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="투표 제목을 입력하세요 (최소 2글자)"
            fullWidth
            required
            disabled={loading}
            inputProps={{ maxLength: 100 }}
            helperText={`${title.length} / 100`}
            error={title.length > 0 && title.trim().length < 2}
          />

          {/* 설명 (선택) */}
          <TextField
            label="설명 (선택)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="투표에 대한 추가 설명을 입력하세요"
            fullWidth
            multiline
            rows={3}
            disabled={loading}
            inputProps={{ maxLength: 500 }}
            helperText={`${description.length} / 500`}
          />

          <Divider />

          {/* 선택지 (생성 시에만) */}
          {!isEditMode && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                선택지 (최소 2개, 최대 10개)
              </Typography>

              <AnimatePresence>
                {options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <DragIndicatorIcon
                        sx={{ color: "text.disabled", cursor: "grab" }}
                      />
                      <TextField
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`선택지 ${index + 1}`}
                        fullWidth
                        size="small"
                        disabled={loading}
                        inputProps={{ maxLength: 100 }}
                      />
                      <IconButton
                        onClick={() => handleRemoveOption(index)}
                        disabled={options.length <= 2 || loading}
                        color="error"
                        size="small"
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>

              {options.length < 10 && (
                <Button
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleAddOption}
                  disabled={loading}
                  sx={{ mt: 1 }}
                >
                  선택지 추가
                </Button>
              )}
            </Box>
          )}

          {isEditMode && (
            <Alert severity="info">
              수정 모드에서는 선택지를 변경할 수 없습니다. 제목, 설명, 마감 일시만 수정 가능합니다.
            </Alert>
          )}

          <Divider />

          {/* 투표 옵션 (생성 시에만) */}
          {!isEditMode && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                투표 옵션
              </Typography>

              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">익명 투표</Typography>
                      <Typography variant="caption" color="text.secondary">
                        참여자의 투표 내용이 공개되지 않습니다
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={isMultipleChoice}
                      onChange={(e) => setIsMultipleChoice(e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">복수 선택 허용</Typography>
                      <Typography variant="caption" color="text.secondary">
                        여러 개의 선택지를 동시에 선택할 수 있습니다
                      </Typography>
                    </Box>
                  }
                />
              </Stack>
            </Box>
          )}

          <Divider />

          {/* 마감 일시 */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              마감 일시
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                type="date"
                label="마감 날짜"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: format(new Date(), "yyyy-MM-dd"),
                }}
              />

              <TextField
                select
                label="마감 시간 (10분 단위)"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                fullWidth
                disabled={loading}
                SelectProps={{
                  native: true,
                }}
                InputLabelProps={{ shrink: true }}
              >
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </TextField>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              마감 시간은 10분 단위로 설정됩니다.
            </Typography>
          </Box>

          <Divider />

          {/* 버튼 영역 */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              size="large"
              disabled={loading}
            >
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              size="large"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : <HowToVoteIcon />
              }
            >
              {loading
                ? "처리 중..."
                : isEditMode
                ? "수정 완료"
                : "투표 만들기"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* 에러 알림 모달 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onConfirm={() => setAlertModal({ ...alertModal, isOpen: false })}
      />
    </Container>
  );
};

export default VoteCreate;
