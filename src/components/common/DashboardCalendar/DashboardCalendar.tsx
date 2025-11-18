import React, { useCallback, useMemo } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { CalendarEvent } from "../../../types/dashboard.types";

// date-fns localizer 설정
const locales = {
  ko: ko,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface DashboardCalendarProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
}

/**
 * 대시보드 캘린더 컴포넌트
 * react-big-calendar를 사용한 일정 표시
 */
export const DashboardCalendar = React.memo<DashboardCalendarProps>(
  ({ events, onSelectEvent, onSelectSlot }) => {
    // 이벤트 스타일 커스터마이징
    const eventStyleGetter = useCallback((event: CalendarEvent) => {
      const colorMap = {
        meeting: "#1976d2",
        vacation: "#9c27b0",
        deadline: "#d32f2f",
        etc: "#757575",
      };

      const backgroundColor =
        colorMap[event.resource?.type || "etc"] || colorMap.etc;

      return {
        style: {
          backgroundColor,
          borderRadius: "4px",
          opacity: 0.9,
          color: "white",
          border: "none",
          display: "block",
        },
      };
    }, []);

    // 메시지 한글화
    const messages = useMemo(
      () => ({
        allDay: "종일",
        previous: "이전",
        next: "다음",
        today: "오늘",
        month: "월",
        week: "주",
        day: "일",
        agenda: "일정",
        date: "날짜",
        time: "시간",
        event: "이벤트",
        noEventsInRange: "해당 기간에 일정이 없습니다.",
        showMore: (total: number) => `+${total} 더보기`,
      }),
      []
    );

    return (
      <Paper
        elevation={2}
        sx={{
          p: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 헤더 */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          일정 캘린더
        </Typography>

        {/* 캘린더 */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            "& .rbc-calendar": {
              height: "100%",
            },
            "& .rbc-header": {
              padding: "12px 4px",
              fontWeight: 600,
              fontSize: "0.875rem",
            },
            "& .rbc-today": {
              backgroundColor: "#e3f2fd",
            },
            "& .rbc-off-range-bg": {
              backgroundColor: "#fafafa",
            },
            "& .rbc-event": {
              padding: "2px 5px",
              fontSize: "0.75rem",
            },
            "& .rbc-toolbar": {
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "8px",
            },
            "& .rbc-toolbar button": {
              padding: "6px 12px",
              fontSize: "0.875rem",
              borderRadius: "4px",
              border: "1px solid #ddd",
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              "&.rbc-active": {
                backgroundColor: "#1976d2",
                color: "white",
                borderColor: "#1976d2",
              },
            },
          }}
        >
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            messages={messages}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={onSelectEvent}
            onSelectSlot={onSelectSlot}
            selectable
            culture="ko"
            views={["month", "week", "day", "agenda"]}
            defaultView="month"
          />
        </Box>

        {/* 범례 */}
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {[
            { type: "meeting", label: "회의", color: "#1976d2" },
            { type: "vacation", label: "휴가", color: "#9c27b0" },
            { type: "deadline", label: "마감", color: "#d32f2f" },
            { type: "etc", label: "기타", color: "#757575" },
          ].map(({ type, label, color }) => (
            <Box key={type} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "2px",
                  backgroundColor: color,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    );
  }
);

DashboardCalendar.displayName = "DashboardCalendar";
