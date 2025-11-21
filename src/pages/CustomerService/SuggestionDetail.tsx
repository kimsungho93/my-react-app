import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
  CircularProgress,
  Container,
  Divider,
  Alert,
  Paper,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  ArrowBack,
  AccessTime,
  Person,
  Category as CategoryIcon,
  AttachFile,
  AdminPanelSettings,
  Download,
  Save,
} from "@mui/icons-material";
import { suggestionApi } from "../../services/api/suggestion.api";
import { SUGGESTION_CATEGORY_LABELS } from "../../types/suggestion.types";
import type { Suggestion, SuggestionStatus } from "../../types/suggestion.types";
import type { RootState } from "../../store";
import { Toast, useToast } from "../../components/common/Toast";

/**
 * 건의사항 상태 라벨 매핑
 */
const SUGGESTION_STATUS_LABELS: Record<string, string> = {
  PENDING: "대기중",
  IN_PROGRESS: "처리중",
  COMPLETED: "완료",
  REJECTED: "반려",
};

/**
 * 건의사항 상태 색상 매핑
 */
const SUGGESTION_STATUS_COLORS: Record<
  string,
  "default" | "primary" | "success" | "error"
> = {
  PENDING: "default",
  IN_PROGRESS: "primary",
  COMPLETED: "success",
  REJECTED: "error",
};

/**
 * 건의사항 상세 페이지
 *
 * @description
 * - 건의사항 상세 정보 조회
 * - 제목, 내용, 카테고리, 작성자, 첨부파일
 * - 관리자 답변 표시
 * - 모바일 최적화 UI
 */
const SuggestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  // Redux에서 사용자 정보 가져오기
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 관리자 상태 편집 모드
  const [selectedStatus, setSelectedStatus] = useState<SuggestionStatus>("PENDING");
  const [adminComment, setAdminComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  /**
   * 건의사항 상세 조회
   */
  useEffect(() => {
    const fetchSuggestion = async () => {
      if (!id) {
        showToast("잘못된 접근입니다.", "error");
        navigate("/customer-service/suggestions");
        return;
      }

      setIsLoading(true);
      try {
        const data = await suggestionApi.getSuggestionById(Number(id));
        setSuggestion(data);
        // 관리자 필드 초기화
        setSelectedStatus(data.status);
        setAdminComment(data.adminComment || "");
      } catch (error) {
        console.error("건의사항 조회 실패:", error);
        showToast("건의사항을 불러오는데 실패했습니다.", "error");
        navigate("/customer-service/suggestions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestion();
  }, [id, navigate, showToast]);

  /**
   * 목록으로 돌아가기
   */
  const handleBack = () => {
    navigate("/customer-service/suggestions");
  };

  /**
   * 파일 다운로드
   */
  const handleFileDownload = async (storedFileName: string, originalFileName: string) => {
    try {
      // axios를 사용하여 인증 토큰과 함께 파일 다운로드
      const response = await suggestionApi.downloadFile(storedFileName);

      // Blob으로 변환
      const blob = new Blob([response], { type: response.type });

      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = originalFileName; // 원본 파일명으로 다운로드
      document.body.appendChild(link);
      link.click();

      // 정리
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("파일 다운로드 실패:", error);
      showToast("파일 다운로드에 실패했습니다.", "error");
    }
  };

  /**
   * 관리자 상태 업데이트 저장
   */
  const handleSaveAdminUpdate = async () => {
    if (!id || !suggestion) return;

    setIsSaving(true);
    try {
      const updatedSuggestion = await suggestionApi.updateSuggestionStatus(Number(id), {
        status: selectedStatus,
        adminComment: adminComment.trim() || undefined,
      });

      setSuggestion(updatedSuggestion);
      showToast("건의사항 상태가 업데이트되었습니다.", "success");
    } catch (error) {
      console.error("상태 업데이트 실패:", error);
      showToast("상태 업데이트에 실패했습니다.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 날짜 포맷팅
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * 로딩 중
   */
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  /**
   * 데이터 없음
   */
  if (!suggestion) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pb: { xs: 3, sm: 4 },
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 },
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: 2,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              variant="text"
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              목록
            </Button>
            <Typography variant="h5" fontWeight="bold">
              건의사항 상세
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* 콘텐츠 */}
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3 } }}>
        <Card elevation={2}>
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            {/* 상태 & 카테고리 */}
            <Box mb={2}>
              <Stack
                direction="row"
                spacing={1}
                mb={isAdmin ? 2 : 0}
                flexWrap="wrap"
                gap={1}
                alignItems="center"
              >
                <Chip
                  label={SUGGESTION_STATUS_LABELS[suggestion.status]}
                  color={SUGGESTION_STATUS_COLORS[suggestion.status]}
                  sx={{ fontWeight: "bold" }}
                />
                <Chip
                  icon={<CategoryIcon />}
                  label={SUGGESTION_CATEGORY_LABELS[suggestion.category]}
                  variant="outlined"
                />
              </Stack>

              {/* 관리자 전용: 상태 변경 */}
              {isAdmin && (
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 150 } }}>
                    <InputLabel>상태 변경</InputLabel>
                    <Select
                      value={selectedStatus}
                      label="상태 변경"
                      onChange={(e) => setSelectedStatus(e.target.value as SuggestionStatus)}
                      sx={{
                        "& .MuiSelect-select": {
                          display: "flex",
                          alignItems: "center",
                        },
                      }}
                    >
                      <MenuItem value="PENDING">
                        <Chip
                          label="대기중"
                          color="default"
                          size="small"
                          sx={{ fontWeight: "bold", minWidth: 70 }}
                        />
                      </MenuItem>
                      <MenuItem value="IN_PROGRESS">
                        <Chip
                          label="처리중"
                          color="primary"
                          size="small"
                          sx={{ fontWeight: "bold", minWidth: 70 }}
                        />
                      </MenuItem>
                      <MenuItem value="COMPLETED">
                        <Chip
                          label="완료"
                          color="success"
                          size="small"
                          sx={{ fontWeight: "bold", minWidth: 70 }}
                        />
                      </MenuItem>
                      <MenuItem value="REJECTED">
                        <Chip
                          label="반려"
                          color="error"
                          size="small"
                          sx={{ fontWeight: "bold", minWidth: 70 }}
                        />
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Box>

            {/* 제목 */}
            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem" },
                wordBreak: "break-word",
              }}
            >
              {suggestion.title}
            </Typography>

            {/* 메타 정보 */}
            <Box
              mb={3}
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: { xs: "4px", sm: "24px" },
                flexWrap: "nowrap"
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Person sx={{ fontSize: { xs: 16, sm: 18 }, color: "text.secondary" }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: "nowrap", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  {suggestion.name}
                </Typography>
              </Box>

              <Divider
                orientation="vertical"
                sx={{ height: { xs: "12px", sm: "16px" } }}
              />

              <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <AccessTime sx={{ fontSize: { xs: 14, sm: 18 }, color: "text.secondary" }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: "nowrap", fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                >
                  {formatDate(suggestion.createdAt)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* 내용 */}
            <Box mb={4}>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: 1.8,
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                }}
              >
                {suggestion.content}
              </Typography>
            </Box>

            {/* 첨부파일 */}
            {suggestion.attachments.length > 0 && (
              <Box mb={3}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <AttachFile fontSize="small" />
                  첨부파일 ({suggestion.attachments.length})
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    {suggestion.attachments.map((file, index) => (
                      <Box
                        key={index}
                        onClick={() => handleFileDownload(file.storedFileName, file.originalFileName)}
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: "action.hover",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          border: 1,
                          borderColor: "divider",
                          "&:hover": {
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            transform: "translateX(4px)",
                            "& .MuiSvgIcon-root": {
                              color: "primary.contrastText",
                            },
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            wordBreak: "break-all",
                            fontSize: { xs: "0.85rem", sm: "0.9rem" },
                            flex: 1,
                            color: "text.primary",
                          }}
                        >
                          {file.originalFileName}
                        </Typography>
                        <Download
                          sx={{
                            fontSize: 20,
                            ml: 1,
                            color: "text.secondary"
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            )}

            {/* 기존 관리자 답변 표시 (읽기 전용) */}
            {!isAdmin && suggestion.adminComment && (
              <Alert
                icon={<AdminPanelSettings />}
                severity={
                  suggestion.status === "COMPLETED"
                    ? "success"
                    : suggestion.status === "REJECTED"
                    ? "error"
                    : "info"
                }
                sx={{ mt: 3 }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  관리자 답변
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: 1.6,
                  }}
                >
                  {suggestion.adminComment}
                </Typography>
              </Alert>
            )}

            {/* 관리자 전용: 코멘트 입력 및 저장 */}
            {isAdmin && (
              <Paper
                variant="outlined"
                sx={{
                  mt: 3,
                  p: { xs: 2, sm: 3 },
                  bgcolor: "action.hover",
                  borderColor: "primary.main",
                  borderWidth: 2,
                }}
              >
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <AdminPanelSettings color="primary" />
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      관리자 코멘트
                    </Typography>
                  </Box>

                  <TextField
                    label="관리자 답변"
                    multiline
                    rows={4}
                    fullWidth
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="사용자에게 전달할 답변을 입력하세요..."
                    variant="outlined"
                    sx={{
                      bgcolor: "background.paper",
                    }}
                  />

                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                      onClick={handleSaveAdminUpdate}
                      disabled={isSaving}
                      sx={{
                        px: 3,
                        py: 1,
                      }}
                    >
                      {isSaving ? "저장 중..." : "저장"}
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* 수정 날짜 */}
            {suggestion.updatedAt && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 3, textAlign: "right" }}
              >
                최종 수정: {formatDate(suggestion.updatedAt)}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* 하단 버튼 */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={handleBack}
            sx={{
              px: { xs: 3, sm: 5 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            목록으로 돌아가기
          </Button>
        </Box>
      </Container>

      {/* Toast 알림 */}
      <Toast {...toast} />
    </Box>
  );
};

export default SuggestionDetail;
