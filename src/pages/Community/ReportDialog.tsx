import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import type { ReportTargetType } from "./types";

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: number;
  onSubmit: (data: { reason: string; description: string }) => void;
}

const REPORT_REASONS = [
  { value: "SPAM", label: "스팸 / 부적절한 홍보" },
  { value: "ABUSIVE", label: "욕설 / 비하 발언" },
  { value: "INAPPROPRIATE", label: "부적절한 콘텐츠" },
  { value: "FALSE_INFO", label: "거짓 정보" },
  { value: "OTHER", label: "기타" },
];

const ReportDialog = ({
  open,
  onClose,
  targetType,
  targetId: _targetId,
  onSubmit,
}: ReportDialogProps) => {
  const [reason, setReason] = useState("SPAM");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    onSubmit({ reason, description });
    handleClose();
  };

  const handleClose = () => {
    setReason("SPAM");
    setDescription("");
    onClose();
  };

  const getTitle = () => {
    switch (targetType) {
      case "FEED":
        return "게시물 신고";
      case "COMMENT":
        return "댓글 신고";
      case "USER":
        return "사용자 신고";
      default:
        return "신고하기";
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 600 }}>{getTitle()}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            신고 사유를 선택해주세요.
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REPORT_REASONS.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">{option.label}</Typography>}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="상세 내용을 입력해주세요 (선택)"
          variant="outlined"
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} color="inherit">
          취소
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="error">
          신고하기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;
