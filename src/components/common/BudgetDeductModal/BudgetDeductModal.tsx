import React, { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Draggable from "react-draggable";

/**
 * 드래그 가능한 Paper 컴포넌트
 */
function DraggablePaper(props: React.ComponentProps<typeof Paper>) {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      handle="#draggable-deduct-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper ref={nodeRef} {...props} />
    </Draggable>
  );
}

interface BudgetDeductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; reason: string; usageDate: string }) => void;
  loading: boolean;
  error: string | null;
  year: number;
  month: number;
}

/**
 * 예산 차감 입력 모달 컴포넌트
 * 금액, 사유, 사용일자를 입력받아 예산을 차감
 */
export const BudgetDeductModal = React.memo<BudgetDeductModalProps>(
  ({ open, onClose, onSubmit, loading, error, year, month }) => {
    const [amount, setAmount] = useState<string>("");
    const [displayAmount, setDisplayAmount] = useState<string>(""); // 콤마 포맷팅된 표시용
    const [reason, setReason] = useState<string>("");
    const [usageDate, setUsageDate] = useState<string>("");
    const [validationErrors, setValidationErrors] = useState<{
      amount?: string;
      reason?: string;
      usageDate?: string;
    }>({});

    /**
     * 모달이 열릴 때 사용일자를 오늘 날짜로 초기화
     */
    React.useEffect(() => {
      if (open) {
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD 형식
        setUsageDate(formattedDate);
      }
    }, [open]);

    /**
     * 폼 초기화
     */
    const resetForm = useCallback(() => {
      setAmount("");
      setDisplayAmount("");
      setReason("");
      setUsageDate("");
      setValidationErrors({});
    }, []);

    /**
     * 모달 닫기 핸들러
     */
    const handleClose = useCallback(() => {
      if (!loading) {
        resetForm();
        onClose();
      }
    }, [loading, resetForm, onClose]);

    /**
     * 유효성 검사
     */
    const validate = useCallback(() => {
      const errors: {
        amount?: string;
        reason?: string;
        usageDate?: string;
      } = {};

      // 금액 검증
      if (!amount || amount.trim() === "") {
        errors.amount = "금액을 입력해주세요.";
      } else {
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
          errors.amount = "금액은 0보다 큰 숫자여야 합니다.";
        }
      }

      // 사유 검증
      if (!reason || reason.trim() === "") {
        errors.reason = "사유를 입력해주세요.";
      }

      // 사용일자 검증
      if (!usageDate || usageDate.trim() === "") {
        errors.usageDate = "사용일자를 선택해주세요.";
      }

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    }, [amount, reason, usageDate]);

    /**
     * 제출 핸들러
     */
    const handleSubmit = useCallback(() => {
      if (!validate()) {
        return;
      }

      onSubmit({
        amount: Number(amount),
        reason: reason.trim(),
        usageDate,
      });

      // 성공 시 폼 초기화는 부모 컴포넌트에서 처리
    }, [validate, amount, reason, usageDate, onSubmit]);

    /**
     * 금액 입력 핸들러 (숫자만 허용 + 콤마 포맷팅)
     */
    const handleAmountChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 콤마 제거
        const rawValue = value.replace(/,/g, "");

        // 숫자만 허용 (소수점 제거)
        if (rawValue === "" || /^\d+$/.test(rawValue)) {
          setAmount(rawValue);

          // 천단위 콤마 추가
          if (rawValue === "") {
            setDisplayAmount("");
          } else {
            const formattedValue = Number(rawValue).toLocaleString();
            setDisplayAmount(formattedValue);
          }

          if (validationErrors.amount) {
            setValidationErrors((prev) => ({ ...prev, amount: undefined }));
          }
        }
      },
      [validationErrors.amount]
    );

    /**
     * 사유 입력 핸들러
     */
    const handleReasonChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setReason(e.target.value);
        if (validationErrors.reason) {
          setValidationErrors((prev) => ({ ...prev, reason: undefined }));
        }
      },
      [validationErrors.reason]
    );

    /**
     * 사용일자 입력 핸들러
     */
    const handleUsageDateChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsageDate(e.target.value);
        if (validationErrors.usageDate) {
          setValidationErrors((prev) => ({ ...prev, usageDate: undefined }));
        }
      },
      [validationErrors.usageDate]
    );

    /**
     * Enter 키 핸들러
     */
    const handleKeyPress = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !loading) {
          handleSubmit();
        }
      },
      [loading, handleSubmit]
    );

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
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
          id="draggable-deduct-dialog-title"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
            cursor: "move",
          }}
        >
          <Typography variant="h6" component="span" fontWeight={600}>
            예산 사용 입력 ({year}년 {month}월)
          </Typography>
          <IconButton
            onClick={handleClose}
            size="small"
            disabled={loading}
            sx={{
              color: "text.secondary",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* 컨텐츠 */}
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* 에러 메시지 */}
            {error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}

            {/* 금액 입력 */}
            <TextField
              label="금액 (원)"
              value={displayAmount}
              onChange={handleAmountChange}
              onKeyPress={handleKeyPress}
              error={!!validationErrors.amount}
              helperText={validationErrors.amount}
              disabled={loading}
              fullWidth
              required
              placeholder="예: 50,000"
              inputProps={{
                inputMode: "numeric",
              }}
            />

            {/* 사유 입력 */}
            <TextField
              label="사용 사유"
              value={reason}
              onChange={handleReasonChange}
              onKeyPress={handleKeyPress}
              error={!!validationErrors.reason}
              helperText={validationErrors.reason}
              disabled={loading}
              fullWidth
              required
              multiline
              rows={3}
              placeholder="예: 팀 회식 (2025년 1월)"
            />

            {/* 사용일자 입력 */}
            <TextField
              label="사용일자"
              type="date"
              value={usageDate}
              onChange={handleUsageDateChange}
              error={!!validationErrors.usageDate}
              helperText={validationErrors.usageDate}
              disabled={loading}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>

        {/* 액션 버튼 */}
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="contained"
            color="primary"
          >
            {loading ? "처리 중..." : "등록"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

BudgetDeductModal.displayName = "BudgetDeductModal";
