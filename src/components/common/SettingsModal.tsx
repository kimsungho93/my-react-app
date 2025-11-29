import React, { useState, useRef } from "react";
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
import { Close as CloseIcon, PhotoCamera, AccountCircle } from "@mui/icons-material";
import type { UserInfo } from "../../types/auth.types";
import { authApi } from "../../services/api/auth.api";
import { userApi } from "../../services/api/user.api";
import { useAppDispatch } from "../../hooks/useRedux";
import { updateUser } from "../../store/slices/authSlice";
import { useProfileImageUrl } from "../../hooks/useProfileImageUrl";
import { profileImageCache } from "../../utils/profileImageCache";

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
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 프로필 이미지 Presigned URL 조회
  const { presignedUrl: profileImagePresignedUrl } = useProfileImageUrl(
    user?.id?.toString(),
    user?.profileImageUrl
  );

  // 선택된 이미지 파일
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // 이미지 미리보기 URL
  const [previewUrl, setPreviewUrl] = useState<string>("");
  // 프로필 사진 변경용 비밀번호
  const [profilePassword, setProfilePassword] = useState("");
  // 프로필 사진 업로드 중 상태
  const [isUploading, setIsUploading] = useState(false);

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

  // 현재 프로필 이미지 (미리보기가 있으면 미리보기, 없으면 Presigned URL)
  const currentProfileImage = previewUrl || profileImagePresignedUrl;
  const hasProfileImage = !!currentProfileImage;

  /**
   * 프로필 사진 파일 선택 핸들러
   */
  const handleProfileImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("파일 크기가 5MB를 초과합니다.");
      return;
    }

    // 파일 포맷 검증
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("JPG, PNG, WebP 파일만 업로드 가능합니다.");
      return;
    }

    // 파일 저장 및 미리보기 생성
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * 프로필 사진 업로드 핸들러
   */
  const handleProfileImageUpload = async () => {
    if (!selectedFile) {
      setError("업로드할 이미지를 선택해주세요.");
      return;
    }

    if (!profilePassword) {
      setError("현재 비밀번호를 입력해주세요.");
      return;
    }

    setError("");
    setSuccess("");
    setIsUploading(true);

    try {
      const response = await userApi.updateProfileImage(
        selectedFile,
        profilePassword
      );

      // Redux 상태 업데이트
      dispatch(updateUser({ profileImageUrl: response.profileImageUrl }));

      setSuccess("프로필 사진이 성공적으로 변경되었습니다.");
      setSelectedFile(null);
      setPreviewUrl("");
      setProfilePassword("");

      // 프로필 이미지 Presigned URL 즉시 갱신 및 전역 이벤트 발행
      // Redux 업데이트 후 약간의 지연을 두고 갱신 (R2 업로드 완료 보장)
      setTimeout(() => {
        // 캐시 삭제 및 전역 이벤트 발행
        // 모든 컴포넌트(게시글, 투표 목록, 설정 모달 등)에서 프로필 사진 즉시 갱신
        if (user?.id) {
          profileImageCache.deleteAndNotify(user.id.toString());
        }
      }, 500);

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      if (err.response?.data?.error?.code === "INVALID_PASSWORD") {
        setError("현재 비밀번호가 일치하지 않습니다.");
      } else if (err.response?.data?.error?.code === "FILE_TOO_LARGE") {
        setError("파일 크기가 5MB를 초과합니다.");
      } else if (err.response?.data?.error?.code === "INVALID_FILE_FORMAT") {
        setError("지원하지 않는 파일 형식입니다.");
      } else {
        setError("프로필 사진 업로드에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * 프로필 사진 변경 취소
   */
  const handleCancelImageChange = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setProfilePassword("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    setSelectedFile(null);
    setPreviewUrl("");
    setProfilePassword("");
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

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
            {hasProfileImage ? (
              <Avatar
                src={currentProfileImage}
                alt={user.name}
                sx={{
                  width: 80,
                  height: 80,
                  border: 2,
                  borderColor: selectedFile ? "warning.main" : "primary.main",
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  border: 2,
                  borderColor: selectedFile ? "warning.main" : "primary.main",
                  bgcolor: "background.paper",
                }}
              >
                <AccountCircle sx={{ width: 64, height: 64, color: "text.secondary" }} />
              </Avatar>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                disabled={isUploading}
                sx={{
                  borderRadius: 2,
                }}
              >
                사진 선택
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleProfileImageSelect}
                />
              </Button>
              {selectedFile && (
                <Typography variant="caption" color="text.secondary">
                  선택됨: {selectedFile.name}
                </Typography>
              )}
            </Box>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            JPG, PNG, WebP 파일을 업로드해주세요. (권장: 150x150px, 최대 5MB)
          </Typography>

          {/* 이미지 선택 시 비밀번호 입력 및 업로드 버튼 표시 */}
          {selectedFile && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "action.hover",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <TextField
                type="password"
                label="현재 비밀번호"
                placeholder="보안 확인을 위해 입력해주세요"
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                fullWidth
                size="small"
                disabled={isUploading}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleProfileImageUpload}
                  disabled={isUploading || !profilePassword}
                  sx={{ flex: 1, borderRadius: 2 }}
                >
                  {isUploading ? "업로드 중..." : "프로필 사진 변경"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancelImageChange}
                  disabled={isUploading}
                  sx={{ borderRadius: 2 }}
                >
                  취소
                </Button>
              </Box>
            </Box>
          )}
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
