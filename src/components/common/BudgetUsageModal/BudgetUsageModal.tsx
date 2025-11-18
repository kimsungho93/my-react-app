import React, { useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Draggable from "react-draggable";
import type { BudgetUsage } from "../../../types/dashboard.types";

/**
 * 드래그 가능한 Paper 컴포넌트
 */
function DraggablePaper(props: React.ComponentProps<typeof Paper>) {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper ref={nodeRef} {...props} />
    </Draggable>
  );
}

interface BudgetUsageModalProps {
  open: boolean;
  onClose: () => void;
  usageHistory: BudgetUsage[];
  loading: boolean;
  error: string | null;
  year: number;
  month: number;
}

/**
 * 예산 사용 이력 모달 컴포넌트
 * 사용 날짜, 금액, 사유를 표로 표시
 */
export const BudgetUsageModal = React.memo<BudgetUsageModalProps>(
  ({ open, onClose, usageHistory, loading, error, year, month }) => {
    /**
     * 날짜 포맷팅 (YYYY-MM-DD)
     */
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    };

    /**
     * 금액 포맷팅 (천단위 콤마)
     */
    const formatAmount = (amount: number) => {
      return `${amount.toLocaleString()}원`;
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperComponent={DraggablePaper}
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        {/* 헤더 */}
        <DialogTitle
          id="draggable-dialog-title"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
            cursor: "move",
          }}
        >
          <Box>
            <Typography variant="h6" component="span" fontWeight={600}>
              예산 사용 이력
            </Typography>
            <Chip
              label={`${year}년 ${month}월`}
              size="small"
              color="primary"
              sx={{ ml: 1.5 }}
            />
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "text.secondary",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* 컨텐츠 */}
        <DialogContent dividers>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : usageHistory.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                사용 이력이 없습니다.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, width: "15%" }}
                    >
                      사용 날짜
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, width: "20%" }}
                    >
                      금액
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, width: "65%" }}
                    >
                      사유
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usageHistory.map((usage) => (
                    <TableRow
                      key={usage.usageId}
                      sx={{
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <TableCell align="center" sx={{ width: "15%" }}>
                        {formatDate(usage.usageDate)}
                      </TableCell>
                      <TableCell align="right" sx={{ width: "20%" }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="error.main"
                        >
                          {formatAmount(usage.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: "65%" }}>
                        {usage.reason}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* 요약 정보 */}
          {!loading && !error && usageHistory.length > 0 && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "grey.50",
                borderRadius: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                총 {usageHistory.length}건
              </Typography>
              <Typography
                variant="body1"
                fontWeight={600}
                color="text.primary"
              >
                합계:{" "}
                {formatAmount(
                  usageHistory.reduce((sum, usage) => sum + usage.amount, 0)
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    );
  }
);

BudgetUsageModal.displayName = "BudgetUsageModal";
