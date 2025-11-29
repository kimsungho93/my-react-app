import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
  Divider,
  TextField,
  Button,
  Avatar,
  Typography,
  Alert,
} from "@mui/material";
import { Close as CloseIcon, PhotoCamera } from "@mui/icons-material";
import type { UserInfo } from "../../types/auth.types";
import { authApi } from "../../services/api/auth.api";

/**
 * 설정 모달 Props
 */
interface SettingsModalProps {
  /** 모달 열림 상태 */
  open: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 사용자 정보 */
  user: UserInfo | null;
}

/**
 * 비밀번호 변경 폼 상태
 */
interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 사용자 설정을 관리하는 모달 컴포넌트
 * 프로필 사진 변경, 비밀번호 변경 기능 제공
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  user,
}) => {
  // 프로필 사진 상태 (Mock)
  const [profileImage, setProfileImage] = useState(
    "https://i.pravatar.cc/150?img=68"
  );

  // 비밀번호 변경 폼 상태
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 에러 메시지
  const [error, setError] = useState<string>("");
  // 성공 메시지
  const [success, setSuccess] = useState<string>("");

  if (!user) {
    return null;
  }

  /**
   * 프로필 사진 변경 핸들러 (Mock)
   */
  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setSuccess("프로필 사진이 변경되었습니다.");
        setTimeout(() => setSuccess(""), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * 비밀번호 입력 핸들러
   */
  const handlePasswordChange = (field: keyof PasswordFormState) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError("");
  };

  /**
   * 비밀번호 변경 제출 핸들러
   */
  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    // 유효성 검사
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (passwordForm.newPassword.length < 8 || passwordForm.newPassword.length > 20) {
      setError("새 비밀번호는 8-20자 사이여야 합니다.");
      return;
    }

    try {
      // 백엔드에서 현재 비밀번호 검증 및 새 비밀번호 이중 검증
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setSuccess("비밀번호가 성공적으로 변경되었습니다.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("비밀번호 변경에 실패했습니다. 입력 정보를 확인해주세요.");
    }
  };

  /**
   * 모달 닫기 및 상태 초기화
   */
  const handleClose = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setError("");
    setSuccess("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          // 모바일 환경 최적화
          mx: 2,
        },
      }}
    >
      {/* 헤더 */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" component="h2">
          설정
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="닫기"
          sx={{
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        {/* 알림 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* 프로필 사진 변경 섹션 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            프로필 사진
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar
              src={profileImage}
              alt={user.name}
              sx={{
                width: 80,
                height: 80,
                border: 2,
                borderColor: "primary.main",
              }}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              sx={{
                borderRadius: 2,
              }}
            >
              사진 변경
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleProfileImageChange}
              />
            </Button>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            JPG, PNG 파일을 업로드해주세요. (최대 5MB)
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 비밀번호 변경 섹션 */}
        <Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            비밀번호 변경
          </Typography>
          <Box
            component="form"
            onSubmit={handlePasswordSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              type="password"
              label="현재 비밀번호"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange("currentPassword")}
              fullWidth
              size="small"
            />
            <TextField
              type="password"
              label="새 비밀번호"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange("newPassword")}
              fullWidth
              size="small"
              helperText="8-20자 사이로 입력해주세요"
            />
            <TextField
              type="password"
              label="새 비밀번호 확인"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange("confirmPassword")}
              fullWidth
              size="small"
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                mt: 1,
                borderRadius: 2,
              }}
            >
              비밀번호 변경
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
