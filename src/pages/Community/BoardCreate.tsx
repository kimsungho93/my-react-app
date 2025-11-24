import { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RichTextEditor from "../../components/common/RichTextEditor/RichTextEditor";
import type { RootState } from "../../store";
import { boardApi } from "../../services/api/board.api";
import type { BoardCategory } from "../../services/api/board.api";

/**
 * 게시글 작성 페이지
 */
const BoardCreate = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [category, setCategory] = useState<BoardCategory>("free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 사용자가 ADMIN 권한인지 확인
   */
  const isAdmin = user?.role === "ADMIN";

  /**
   * HTML 태그 제거 함수
   */
  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  /**
   * 게시글 작성 핸들러
   */
  const handleSubmit = async () => {
    // HTML 태그 제거 후 공백 체크
    const strippedContent = stripHtml(content).trim();
    const trimmedTitle = title.trim();

    if (!trimmedTitle || !strippedContent) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    // 제목 최소 길이 체크 (2글자)
    if (trimmedTitle.length < 2) {
      alert("제목은 최소 2글자 이상 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await boardApi.createPost({
        category: category.toUpperCase(), // 백엔드 ENUM에 맞게 대문자로 변환
        title: trimmedTitle,
        content,
      });

      // 게시글 목록으로 이동
      navigate("/community/board/list");
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("게시글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 취소 핸들러
   */
  const handleCancel = () => {
    navigate(-1);
  };

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
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              게시글 작성
            </Typography>
          </Box>

          {/* 카테고리 선택 */}
          <TextField
            select
            label="카테고리"
            value={category}
            onChange={(e) => setCategory(e.target.value as BoardCategory)}
            fullWidth
            required
            disabled={isSubmitting}
          >
            {isAdmin && <MenuItem value="notice">공지사항</MenuItem>}
            <MenuItem value="free">자유게시판</MenuItem>
            <MenuItem value="humor">유머글</MenuItem>
            <MenuItem value="knowledge">지식공유</MenuItem>
          </TextField>

          {/* 제목 입력 */}
          <TextField
            label="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요 (최소 2글자)"
            fullWidth
            required
            disabled={isSubmitting}
            inputProps={{ maxLength: 100 }}
            helperText={`${title.length} / 100 (최소 2글자)`}
            error={title.length > 0 && title.trim().length < 2}
          />

          {/* 내용 입력 - 리치 텍스트 에디터 */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              내용 <span style={{ color: "#d32f2f" }}>*</span>
            </Typography>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="내용을 입력하세요. 이미지도 붙여넣을 수 있습니다!"
              height={400}
            />
          </Box>

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
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              size="large"
              disabled={
                title.trim().length < 2 || 
                !stripHtml(content).trim() || 
                isSubmitting
              }
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? "작성 중..." : "작성완료"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default BoardCreate;
