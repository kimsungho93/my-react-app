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
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 공지사항 아이콘 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: `${priorityColor[currentNotice.priority]}15`,
          }}
        >
          <Notifications
            sx={{ color: priorityColor[currentNotice.priority] }}
          />
        </Box>

        {/* 공지사항 내용 */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            noWrap
            sx={{ mb: 0.5 }}
          >
            {currentNotice.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
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
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <IconButton onClick={handlePrev} size="small">
              <ChevronLeft />
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              {currentIndex + 1} / {notices.length}
            </Typography>
            <IconButton onClick={handleNext} size="small">
              <ChevronRight />
            </IconButton>
          </Box>
        )}
      </Paper>
    );
  }
);

NoticeSlider.displayName = "NoticeSlider";
