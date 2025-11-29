import React from "react";
import { Avatar } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useProfileImageUrl } from "../../hooks/useProfileImageUrl";

/**
 * 사용자 아바타 Props
 */
interface UserAvatarProps {
  /** 사용자 ID */
  userId?: number | string;
  /** 프로필 이미지 R2 URL (Presigned URL로 변환됨) */
  profileImageUrl?: string;
  /** 사용자 이름 또는 닉네임 (폴백용) */
  name?: string;
  /** 아바타 크기 (픽셀) */
  size?: number;
  /** 추가 스타일 */
  sx?: object;
}

/**
 * 사용자 프로필 아바타 컴포넌트
 * - R2 Presigned URL을 자동으로 조회하여 표시
 * - 프로필 이미지가 없을 경우 기본 아이콘 표시
 * - 이름의 첫 글자를 fallback으로 사용
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  userId,
  profileImageUrl,
  name,
  size = 40,
  sx = {},
}) => {
  // Presigned URL 조회 (userId와 profileImageUrl이 있을 때만)
  const { presignedUrl } = useProfileImageUrl(
    userId?.toString(),
    profileImageUrl
  );


  // 프로필 이미지가 있는 경우
  if (presignedUrl) {
    return (
      <Avatar
        src={presignedUrl}
        alt={name}
        sx={{
          width: size,
          height: size,
          ...sx,
        }}
      >
        {name?.[0] ?? "?"}
      </Avatar>
    );
  }

  // 프로필 이미지가 없는 경우 - 기본 아이콘 표시
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: "background.paper",
        ...sx,
      }}
    >
      <AccountCircle
        sx={{
          width: size * 0.8,
          height: size * 0.8,
          color: "text.secondary",
        }}
      />
    </Avatar>
  );
};
