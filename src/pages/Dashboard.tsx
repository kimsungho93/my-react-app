import { useMemo, useCallback, useEffect, useState } from "react";
import { Box, Stack, CircularProgress, Alert, Paper, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { fetchBudget, fetchBudgetUsageHistory, deductBudget } from "../store/slices/budgetSlice";
import { NoticeSlider } from "../components/common/NoticeSlider";
import { BudgetDonutChart } from "../components/common/BudgetDonutChart";
import { DashboardCalendar } from "../components/common/DashboardCalendar";
import { BudgetUsageModal } from "../components/common/BudgetUsageModal";
import { BudgetDeductModal } from "../components/common/BudgetDeductModal";
import type {
  Notice,
  CalendarEvent,
  BudgetDeductRequest,
} from "../types/dashboard.types";

/**
 * 대시보드 페이지
 * 공지사항, 부서 회식비, 캘린더를 표시
 */
const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { departmentBudget, loading, error, usageHistory, usageHistoryLoading } = useAppSelector(
    (state) => state.budget
  );
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [isDeductModalOpen, setIsDeductModalOpen] = useState(false);

  // 컴포넌트 마운트 시 현재 년월의 예산 데이터 조회
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript Date는 0-based month

    dispatch(fetchBudget({ year, month }));
  }, [dispatch]);

  // 도넛 차트 더블클릭 핸들러 (사용 이력 모달 열기)
  const handleChartDoubleClick = useCallback(() => {
    if (departmentBudget) {
      dispatch(fetchBudgetUsageHistory(departmentBudget.budgetId));
      setIsUsageModalOpen(true);
    }
  }, [dispatch, departmentBudget]);

  // 사용 이력 모달 닫기 핸들러
  const handleUsageModalClose = useCallback(() => {
    setIsUsageModalOpen(false);
  }, []);

  // 예산 사용 입력 버튼 클릭 핸들러
  const handleDeductButtonClick = useCallback(() => {
    if (departmentBudget) {
      setIsDeductModalOpen(true);
    }
  }, [departmentBudget]);

  // 예산 차감 모달 닫기 핸들러
  const handleDeductModalClose = useCallback(() => {
    setIsDeductModalOpen(false);
  }, []);

  // 예산 차감 제출 핸들러
  const handleDeductSubmit = useCallback(
    async (data: BudgetDeductRequest) => {
      if (!departmentBudget) return;

      try {
        await dispatch(
          deductBudget({
            budgetId: departmentBudget.budgetId,
            request: data,
          })
        ).unwrap();

        // 성공 시 모달 닫기
        setIsDeductModalOpen(false);

        // 예산 정보 새로고침
        dispatch(fetchBudget({ year: departmentBudget.year, month: departmentBudget.month }));
      } catch (error) {
        // 에러는 Redux에서 처리됨
        console.error("예산 차감 실패:", error);
      }
    },
    [dispatch, departmentBudget]
  );

  // TODO: 실제로는 Redux 또는 API에서 데이터를 가져와야 함
  // 임시 데이터 (메모이제이션)
  const mockNotices = useMemo<Notice[]>(
    () => [
      {
        id: "1",
        title: "2025년 1월 정기 회의 안내",
        content:
          "2025년 1월 20일 오후 2시, 본사 대회의실에서 정기 회의가 진행됩니다.",
        createdAt: "2025-01-15",
        priority: "high",
      },
      {
        id: "2",
        title: "신규 복지 제도 도입",
        content: "재택근무 및 유연근무제가 2월부터 시행됩니다.",
        createdAt: "2025-01-14",
        priority: "normal",
      },
      {
        id: "3",
        title: "주차장 공사 안내",
        content:
          "1월 25일부터 27일까지 주차장 보수 공사로 인해 일부 구역 사용이 제한됩니다.",
        createdAt: "2025-01-13",
        priority: "low",
      },
    ],
    []
  );

  const mockEvents = useMemo<CalendarEvent[]>(
    () => [
      {
        id: "1",
        title: "팀 회의",
        start: new Date(2025, 0, 20, 14, 0),
        end: new Date(2025, 0, 20, 15, 0),
        resource: { type: "meeting", description: "정기 팀 회의" },
      },
      {
        id: "2",
        title: "프로젝트 마감",
        start: new Date(2025, 0, 25),
        end: new Date(2025, 0, 25),
        allDay: true,
        resource: { type: "deadline", description: "1분기 프로젝트 마감" },
      },
      {
        id: "3",
        title: "연차",
        start: new Date(2025, 0, 27),
        end: new Date(2025, 0, 28),
        allDay: true,
        resource: { type: "vacation", description: "개인 연차" },
      },
    ],
    []
  );

  // 이벤트 선택 핸들러
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    console.log("Selected event:", event);
    // TODO: 모달 열기 또는 상세 정보 표시
  }, []);

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    console.log("Selected slot:", slotInfo);
    // TODO: 새 일정 생성 모달 열기
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* 상단: 공지사항 슬라이더 */}
        <NoticeSlider notices={mockNotices} />

        {/* 중단: 부서 회식비 차트 & 캘린더 */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{ height: 450 }}
        >
          {/* 좌측: 부서 회식비 차트 */}
          <Box sx={{ width: { xs: "100%", md: "33.33%" }, height: "100%" }}>
            {loading ? (
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  데이터를 불러오는 중...
                </Typography>
              </Paper>
            ) : error ? (
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  부서 회식비
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Alert severity="error" sx={{ width: "100%" }}>
                    {error}
                  </Alert>
                </Box>
              </Paper>
            ) : departmentBudget ? (
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* 헤더: 제목 + 사용 입력 버튼 */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    부서 회식비
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleDeductButtonClick}
                    sx={{
                      fontSize: "0.875rem",
                      py: 0.5,
                      px: 1.5,
                    }}
                  >
                    사용 입력
                  </Button>
                </Box>

                {/* 차트 영역 */}
                <Box
                  sx={{
                    flex: 1,
                    position: "relative",
                  }}
                  onDoubleClick={handleChartDoubleClick}
                >
                  <BudgetDonutChart
                    data={departmentBudget}
                    onDoubleClick={handleChartDoubleClick}
                  />
                </Box>
              </Paper>
            ) : (
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  부서 회식비
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Alert severity="info" sx={{ width: "100%" }}>
                    부서 회식비 정보가 없습니다.
                  </Alert>
                </Box>
              </Paper>
            )}
          </Box>

          {/* 우측: 캘린더 */}
          <Box sx={{ width: { xs: "100%", md: "66.67%" }, height: "100%" }}>
            <DashboardCalendar
              events={mockEvents}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
            />
          </Box>
        </Stack>

        {/* 예산 사용 이력 모달 */}
        <BudgetUsageModal
          open={isUsageModalOpen}
          onClose={handleUsageModalClose}
          usageHistory={usageHistory}
          loading={usageHistoryLoading}
          error={error}
          year={departmentBudget?.year || 0}
          month={departmentBudget?.month || 0}
        />

        {/* 예산 차감 입력 모달 */}
        <BudgetDeductModal
          open={isDeductModalOpen}
          onClose={handleDeductModalClose}
          onSubmit={handleDeductSubmit}
          loading={loading}
          error={error}
          year={departmentBudget?.year || 0}
          month={departmentBudget?.month || 0}
        />
      </Stack>
    </Box>
  );
};

export default Dashboard;
