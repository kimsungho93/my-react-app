import React from "react";
import {
  Dialog,
  DialogContent,
  Avatar,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import type { UserInfo } from "../../types/auth.types";

/**
 * 프로필 모달 Props
 */
interface ProfileModalProps {
  /** 모달 열림 상태 */
  open: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 사용자 정보 */
  user: UserInfo | null;
}

/**
 * 역할 코드를 한글로 변환
 */
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case "ADMIN":
      return "관리자";
    case "USER":
      return "회원";
    default:
      return role;
  }
};

/**
 * 프로필 정보를 표시하는 모달 컴포넌트
 * 사용자의 프로필 사진, 이름, 이메일, 역할 정보 표시
 */
export const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  user,
}) => {
  if (!user) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          // 모바일 환경 최적화
          mx: 2,
        },
      }}
    >
      {/* 헤더 영역 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          pb: 1,
        }}
      >
        <Typography variant="h6" component="h2">
          내 프로필
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="닫기"
          sx={{
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* 프로필 내용 */}
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          py: 3,
        }}
      >
        {/* 프로필 사진 (Mock) */}
        <Avatar
          src="https://i.pravatar.cc/150?img=68"
          alt={user.name}
          sx={{
            width: 100,
            height: 100,
            border: 3,
            borderColor: "primary.main",
          }}
        />

        {/* 사용자 이름 */}
        <Box sx={{ textAlign: "center", width: "100%" }}>
          <Typography variant="h6" fontWeight={600}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {user.positionDisplayName}
          </Typography>
        </Box>

        <Divider sx={{ width: "100%", my: 1 }} />

        {/* 상세 정보 */}
        <Box sx={{ width: "100%", px: 1 }}>
          {/* 이메일 */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              이메일
            </Typography>
            <Typography variant="body2">{user.email}</Typography>
          </Box>

          {/* 역할 */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              역할
            </Typography>
            <Typography variant="body2">{getRoleDisplayName(user.role)}</Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
