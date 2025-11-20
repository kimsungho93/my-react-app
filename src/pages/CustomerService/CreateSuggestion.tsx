import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  AttachFile,
  Close,
  Send,
  ArrowBack,
} from "@mui/icons-material";
import { suggestionApi } from "../../services/api/suggestion.api";
import {
  SuggestionCategory,
  SUGGESTION_CATEGORY_LABELS,
} from "../../types/suggestion.types";
import { Toast, useToast } from "../../components/common/Toast";

/**
 * 건의하기 페이지
 *
 * @description
 * - 사용자가 서비스 개선 건의사항을 작성하는 페이지
 * - MUI TextField multiline 에디터 사용
 * - 파일 첨부 기능
 * - 모바일 환경 최적화
 */
const CreateSuggestion = () => {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  // 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<SuggestionCategory | "">("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 유효성 검증 에러
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    category: "",
  });

  /**
   * 실시간 유효성 검증
   */
  const validateField = useCallback(
    (field: string, value: string | SuggestionCategory) => {
      let error = "";

      switch (field) {
        case "title":
          if (!value) {
            error = "제목을 입력해주세요.";
          } else if ((value as string).length < 5) {
            error = "제목은 최소 5자 이상이어야 합니다.";
          } else if ((value as string).length > 100) {
            error = "제목은 최대 100자까지 입력 가능합니다.";
          }
          break;
        case "content": {
          const textContent = (value as string).trim();
          if (!textContent) {
            error = "내용을 입력해주세요.";
          } else if (textContent.length < 10) {
            error = "내용은 최소 10자 이상이어야 합니다.";
          }
          break;
        }
        case "category":
          if (!value) {
            error = "카테고리를 선택해주세요.";
          }
          break;
      }

      setErrors((prev) => ({ ...prev, [field]: error }));
      return error === "";
    },
    []
  );

  /**
   * 제목 변경 핸들러
   */
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setTitle(value);
      validateField("title", value);
    },
    [validateField]
  );

  /**
   * 내용 변경 핸들러
   */
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setContent(value);
      validateField("content", value);
    },
    [validateField]
  );

  /**
   * 카테고리 변경 핸들러
   */
  const handleCategoryChange = useCallback(
    (value: SuggestionCategory | "") => {
      setCategory(value);
      if (value) {
        validateField("category", value);
      }
    },
    [validateField]
  );

  /**
   * 파일 선택 핸들러
   */
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);

      // 파일 개수 제한 (최대 5개)
      if (files.length + selectedFiles.length > 5) {
        showToast("파일은 최대 5개까지 첨부 가능합니다.", "warning");
        return;
      }

      // 파일 크기 제한 (각 파일 최대 10MB)
      const invalidFiles = selectedFiles.filter(
        (file) => file.size > 10 * 1024 * 1024
      );
      if (invalidFiles.length > 0) {
        showToast("파일 크기는 최대 10MB까지 가능합니다.", "warning");
        return;
      }

      setFiles((prev) => [...prev, ...selectedFiles]);
      e.target.value = ""; // 동일 파일 재선택 가능하도록
    },
    [files.length, showToast]
  );

  /**
   * 파일 제거 핸들러
   */
  const handleFileRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * 폼 유효성 검증
   */
  const isFormValid =
    title.length >= 5 &&
    title.length <= 100 &&
    content.trim().length >= 10 &&
    category !== "";

  /**
   * 제출 핸들러
   */
  const handleSubmit = useCallback(async () => {
    // 최종 유효성 검증
    const isTitleValid = validateField("title", title);
    const isContentValid = validateField("content", content);
    const isCategoryValid = validateField("category", category);

    if (!isTitleValid || !isContentValid || !isCategoryValid) {
      showToast("입력 항목을 확인해주세요.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // 파일 업로드 (있는 경우)
      let uploadedFileNames: string[] = [];
      if (files.length > 0) {
        const uploadPromises = files.map((file) =>
          suggestionApi.uploadFile(file)
        );
        const uploadResults = await Promise.all(uploadPromises);
        uploadedFileNames = uploadResults.map((result) => result.fileName);
      }

      // 건의사항 생성
      await suggestionApi.createSuggestion({
        title,
        content,
        category: category as SuggestionCategory,
        name: "사용자", // 추후 로그인한 사용자 정보로 대체
        attachments: uploadedFileNames,
      });

      showToast("건의사항이 성공적으로 제출되었습니다.", "success");

      // 1.5초 후 목록으로 이동
      setTimeout(() => {
        navigate("/customer-service/suggestions");
      }, 1500);
    } catch (error) {
      console.error("건의사항 제출 실패:", error);
      showToast("건의사항 제출에 실패했습니다. 다시 시도해주세요.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [title, content, category, files, validateField, showToast, navigate]);

  /**
   * 취소 핸들러
   */
  const handleCancel = useCallback(() => {
    navigate("/customer-service/suggestions");
  }, [navigate]);

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
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            onClick={handleCancel}
            sx={{ color: "white", mr: 1 }}
            aria-label="뒤로가기"
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              건의하기
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              서비스 개선을 위해 의견을 남겨주세요.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* 폼 영역 */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3 } }}>
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            maxWidth: 800,
            mx: "auto",
          }}
        >
          <Stack spacing={3}>
            {/* 제목 */}
            <TextField
              label="제목"
              placeholder="건의사항의 제목을 입력해주세요."
              value={title}
              onChange={handleTitleChange}
              error={!!errors.title}
              helperText={errors.title || `${title.length}/100`}
              required
              fullWidth
              inputProps={{ maxLength: 100 }}
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                },
              }}
            />

            {/* 카테고리 */}
            <FormControl fullWidth required error={!!errors.category}>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={category}
                onChange={(e) =>
                  handleCategoryChange(e.target.value as SuggestionCategory)
                }
                label="카테고리"
                sx={{
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                <MenuItem value="">
                  <em>선택해주세요</em>
                </MenuItem>
                {Object.entries(SUGGESTION_CATEGORY_LABELS).map(
                  ([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  )
                )}
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.category}
                </Typography>
              )}
            </FormControl>

            {/* 내용 */}
            <TextField
              label="내용"
              placeholder="건의사항의 내용을 상세히 작성해주세요. (최소 10자)"
              value={content}
              onChange={handleContentChange}
              error={!!errors.content}
              helperText={errors.content || `${content.length}자`}
              required
              fullWidth
              multiline
              rows={10}
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  alignItems: "flex-start",
                },
                "& .MuiInputBase-input": {
                  minHeight: { xs: "200px", sm: "300px" },
                },
              }}
            />

            {/* 파일 첨부 */}
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFile />}
                disabled={files.length >= 5}
                sx={{
                  mb: 1,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                파일 첨부 ({files.length}/5)
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
              </Button>
              <Typography variant="caption" color="text.secondary" display="block">
                파일당 최대 10MB, 최대 5개까지 첨부 가능
              </Typography>

              {/* 첨부된 파일 목록 */}
              {files.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                  {files.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => handleFileRemove(index)}
                      deleteIcon={<Close />}
                      size="small"
                      sx={{
                        maxWidth: { xs: "100%", sm: "300px" },
                        mb: 1,
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Box>

            {/* 버튼 영역 */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 2 }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={isSubmitting}
                fullWidth
                sx={{
                  py: 1.5,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                취소
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                startIcon={
                  isSubmitting ? <CircularProgress size={20} /> : <Send />
                }
                fullWidth
                sx={{
                  py: 1.5,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                {isSubmitting ? "제출 중..." : "제출하기"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* Toast 알림 */}
      <Toast {...toast} />
    </Box>
  );
};

export default CreateSuggestion;
