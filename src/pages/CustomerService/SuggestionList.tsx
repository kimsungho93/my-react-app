import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  Button,
  CircularProgress,
  Container,
  Divider,
} from "@mui/material";
import {
  Add,
  AccessTime,
  Person,
  Category as CategoryIcon,
  FilterList,
} from "@mui/icons-material";
// import { suggestionApi } from "../../services/api/suggestion.api";
import { SUGGESTION_CATEGORY_LABELS } from "../../types/suggestion.types";
import type { Suggestion } from "../../types/suggestion.types";
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
 * 건의사항 목록 페이지
 *
 * @description
 * - 등록된 건의사항 목록 조회
 * - 카드 형태의 모바일 최적화 UI
 * - 상태별 필터링 및 검색
 */
const SuggestionList = () => {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL"); // ALL, PENDING, IN_PROGRESS, COMPLETED, REJECTED

  /**
   * 건의사항 목록 조회
   */
  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: API 구현 전 Mock 데이터 사용
      // const data = await suggestionApi.getSuggestions();

      // Mock 데이터
      const mockData: Suggestion[] = [
        {
          id: 1,
          title: "대시보드 로딩 속도 개선 요청",
          content: "대시보드 페이지가 로딩될 때 3초 이상 걸립니다. 초기 로딩 속도를 개선해주시면 좋겠습니다.",
          category: "SYSTEM",
          name: "홍길동",
          attachments: ["screenshot1.png", "screenshot2.png"],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
          status: "IN_PROGRESS",
        },
        {
          id: 2,
          title: "모바일 환경에서 버튼이 잘립니다",
          content: "iPhone 13에서 게임 메뉴의 버튼이 화면 밖으로 잘려서 클릭할 수 없습니다. Safe Area 처리가 필요할 것 같습니다.",
          category: "BUG",
          name: "김철수",
          attachments: [],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전
          status: "PENDING",
        },
        {
          id: 3,
          title: "다크모드 지원 건의",
          content: "밤에 사용할 때 눈이 부셔서 다크모드를 추가해주시면 좋겠습니다.",
          category: "UI",
          name: "이영희",
          attachments: [],
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
          status: "COMPLETED",
        },
        {
          id: 4,
          title: "사다리타기 결과 저장 기능",
          content: "사다리타기 게임 결과를 저장하고 나중에 다시 볼 수 있는 기능이 있으면 좋겠습니다.",
          category: "ETC",
          name: "박민수",
          attachments: ["design.pdf"],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 전
          status: "PENDING",
        },
        {
          id: 5,
          title: "룰렛 애니메이션 속도 조절",
          content: "룰렛 돌아가는 속도가 너무 빨라서 결과를 확인하기 어렵습니다. 속도 조절 옵션이 있으면 좋겠어요.",
          category: "UI",
          name: "최지은",
          attachments: [],
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 전
          status: "REJECTED",
        },
      ];

      // 로딩 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuggestions(mockData);
    } catch (error) {
      console.error("건의사항 목록 조회 실패:", error);
      showToast("건의사항 목록을 불러오는데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  /**
   * 건의사항 작성 페이지로 이동
   */
  const handleCreateClick = useCallback(() => {
    navigate("/customer-service/suggestions/create");
  }, [navigate]);

  /**
   * 건의사항 상세 페이지로 이동 (추후 구현)
   */
  const handleSuggestionClick = useCallback(
    (id: number) => {
      // 추후 상세 페이지 구현
      console.log("건의사항 상세:", id);
      showToast("상세 페이지는 추후 구현 예정입니다.", "info");
    },
    [showToast]
  );

  /**
   * 필터링된 건의사항 목록
   */
  const filteredSuggestions =
    statusFilter === "ALL"
      ? suggestions
      : suggestions.filter((s) => s.status === statusFilter);

  /**
   * 상태별 개수 계산
   */
  const statusCounts = {
    ALL: suggestions.length,
    PENDING: suggestions.filter((s) => s.status === "PENDING").length,
    IN_PROGRESS: suggestions.filter((s) => s.status === "IN_PROGRESS").length,
    COMPLETED: suggestions.filter((s) => s.status === "COMPLETED").length,
    REJECTED: suggestions.filter((s) => s.status === "REJECTED").length,
  };

  /**
   * 날짜 포맷팅
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diff / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diff / (1000 * 60));
        return `${diffMinutes}분 전`;
      }
      return `${diffHours}시간 전`;
    } else if (diffDays === 1) {
      return "어제";
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

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
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h5" fontWeight="bold">
                건의사항
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                등록된 건의사항을 확인하세요.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateClick}
              size="small"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "grey.100",
                },
                fontSize: { xs: "0.813rem", sm: "0.875rem" },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 0.75 },
              }}
            >
              작성
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* 필터 */}
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3 } }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflowX: "auto",
            pb: 2,
            "&::-webkit-scrollbar": {
              height: 6,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,.2)",
              borderRadius: 3,
            },
          }}
        >
          <Chip
            icon={<FilterList />}
            label={`전체 (${statusCounts.ALL})`}
            onClick={() => setStatusFilter("ALL")}
            color={statusFilter === "ALL" ? "primary" : "default"}
            sx={{ fontWeight: statusFilter === "ALL" ? "bold" : "normal" }}
          />
          <Chip
            label={`대기중 (${statusCounts.PENDING})`}
            onClick={() => setStatusFilter("PENDING")}
            color={statusFilter === "PENDING" ? "primary" : "default"}
            sx={{ fontWeight: statusFilter === "PENDING" ? "bold" : "normal" }}
          />
          <Chip
            label={`처리중 (${statusCounts.IN_PROGRESS})`}
            onClick={() => setStatusFilter("IN_PROGRESS")}
            color={statusFilter === "IN_PROGRESS" ? "primary" : "default"}
            sx={{
              fontWeight: statusFilter === "IN_PROGRESS" ? "bold" : "normal",
            }}
          />
          <Chip
            label={`완료 (${statusCounts.COMPLETED})`}
            onClick={() => setStatusFilter("COMPLETED")}
            color={statusFilter === "COMPLETED" ? "success" : "default"}
            sx={{
              fontWeight: statusFilter === "COMPLETED" ? "bold" : "normal",
            }}
          />
          <Chip
            label={`반려 (${statusCounts.REJECTED})`}
            onClick={() => setStatusFilter("REJECTED")}
            color={statusFilter === "REJECTED" ? "error" : "default"}
            sx={{ fontWeight: statusFilter === "REJECTED" ? "bold" : "normal" }}
          />
        </Stack>
      </Container>

      {/* 콘텐츠 */}
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        ) : filteredSuggestions.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
            gap={2}
          >
            <Typography variant="h6" color="text.secondary">
              {statusFilter === "ALL"
                ? "등록된 건의사항이 없습니다."
                : "해당 상태의 건의사항이 없습니다."}
            </Typography>
            {statusFilter === "ALL" && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateClick}
              >
                첫 건의사항 작성하기
              </Button>
            )}
          </Box>
        ) : (
          <Stack spacing={2}>
            {filteredSuggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                elevation={2}
                sx={{
                  transition: "all 0.2s",
                  "&:hover": {
                    elevation: 4,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleSuggestionClick(suggestion.id)}
                  sx={{ p: { xs: 2, sm: 3 } }}
                >
                  <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                    {/* 상단: 제목 & 상태 */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={2}
                      mb={1.5}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          flex: 1,
                          fontSize: { xs: "1rem", sm: "1.25rem" },
                          lineHeight: 1.4,
                        }}
                      >
                        {suggestion.title}
                      </Typography>
                      <Chip
                        label={SUGGESTION_STATUS_LABELS[suggestion.status]}
                        color={SUGGESTION_STATUS_COLORS[suggestion.status]}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </Stack>

                    {/* 내용 미리보기 */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.6,
                      }}
                    >
                      {suggestion.content}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    {/* 하단: 메타 정보 */}
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={{ xs: 1, sm: 2 }}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      flexWrap="wrap"
                    >
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CategoryIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {SUGGESTION_CATEGORY_LABELS[suggestion.category]}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Person
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {suggestion.name}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <AccessTime
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(suggestion.createdAt)}
                        </Typography>
                      </Stack>

                      {suggestion.attachments.length > 0 && (
                        <Chip
                          label={`첨부 ${suggestion.attachments.length}`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      )}
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        )}
      </Container>

      {/* Toast 알림 */}
      <Toast {...toast} />
    </Box>
  );
};

export default SuggestionList;
