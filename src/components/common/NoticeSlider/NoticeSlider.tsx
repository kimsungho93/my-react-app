import React, { useState, useEffect, useCallback } from "react";
import { Box, Paper, Typography, IconButton } from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Notifications,
} from "@mui/icons-material";
import type { Notice } from "../../../types/dashboard.types";

interface NoticeSliderProps {
  notices: Notice[];
  autoPlayInterval?: number;
}

/**
 * 공지사항 슬라이더 컴포넌트
 * 좌에서 우로 자동 슬라이드되는 공지사항 표시
 */
export const NoticeSlider = React.memo<NoticeSliderProps>(
  ({ notices, autoPlayInterval = 5000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // 다음 공지사항으로 이동
    const handleNext = useCallback(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, [notices.length]);

    // 이전 공지사항으로 이동
    const handlePrev = useCallback(() => {
      setCurrentIndex((prev) => (prev - 1 + notices.length) % notices.length);
    }, [notices.length]);

    // 자동 슬라이드
    useEffect(() => {
      if (notices.length <= 1) return;

      const timer = setInterval(handleNext, autoPlayInterval);
      return () => clearInterval(timer);
    }, [notices.length, autoPlayInterval, handleNext]);

    if (notices.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            등록된 공지사항이 없습니다
          </Typography>
        </Paper>
      );
    }

    const currentNotice = notices[currentIndex];
    const priorityColor = {
      high: "error.main",
      normal: "primary.main",
      low: "info.main",
    };

    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 헤더: 아이콘 + 제목 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: `${priorityColor[currentNotice.priority]}15`,
              flexShrink: 0,
            }}
          >
            <Notifications
              sx={{
                color: priorityColor[currentNotice.priority],
                fontSize: 20,
              }}
            />
          </Box>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{
              flex: 1,
              fontSize: "0.95rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentNotice.title}
          </Typography>
        </Box>

        {/* 공지사항 내용 */}
        <Box sx={{ px: 0.5 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: "0.875rem",
              lineHeight: 1.6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {currentNotice.content}
          </Typography>
        </Box>

        {/* 네비게이션 버튼 */}
        {notices.length > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pt: 1,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <IconButton
              onClick={handlePrev}
              size="medium"
              sx={{
                bgcolor: "action.hover",
                "&:hover": {
                  bgcolor: "action.selected",
                },
                width: 44,
                height: 44,
              }}
            >
              <ChevronLeft />
            </IconButton>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
              sx={{ fontSize: "0.875rem" }}
            >
              {currentIndex + 1} / {notices.length}
            </Typography>
            <IconButton
              onClick={handleNext}
              size="medium"
              sx={{
                bgcolor: "action.hover",
                "&:hover": {
                  bgcolor: "action.selected",
                },
                width: 44,
                height: 44,
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        )}
      </Paper>
    );
  }
);

NoticeSlider.displayName = "NoticeSlider";
