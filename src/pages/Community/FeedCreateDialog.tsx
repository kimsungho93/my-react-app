import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  Stack,
  Avatar,
  InputAdornment,
  useMediaQuery,
  useTheme,
  ImageList,
  ImageListItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import DeleteIcon from "@mui/icons-material/Delete";

// --- Mock Data for Location Search ---
const MOCK_LOCATIONS = [
  "Seoul, Korea",
  "Gangnam Station",
  "Han River Park",
  "Lotte World Tower",
  "Bukchon Hanok Village",
];

interface FeedCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

/**
 * 피드 작성 다이얼로그
 * - 이미지와 글을 자유롭게 추가/수정 가능
 * - 이미지 없이 글만 작성 가능
 */
const FeedCreateDialog = ({ open, onClose, onSubmit }: FeedCreateDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  /** 이미지 업로드 핸들러 */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 10 - selectedImages.length;

      if (remainingSlots <= 0) {
        alert("사진은 최대 10장까지 업로드할 수 있습니다.");
        return;
      }

      const filesToUpload = filesArray.slice(0, remainingSlots);

      if (filesArray.length > remainingSlots) {
        alert(`사진은 최대 10장까지 업로드할 수 있습니다. ${remainingSlots}장만 추가됩니다.`);
      }

      const newImages = filesToUpload.map((file) => URL.createObjectURL(file));
      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  /** 이미지 삭제 핸들러 */
  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  /** 게시 버튼 활성화 여부 */
  const canSubmit = content.trim().length > 0 || selectedImages.length > 0;

  /** 게시 핸들러 */
  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      images: selectedImages,
      content,
      location,
      createdAt: new Date(),
    });
    handleClose();
  };

  /** 다이얼로그 닫기 */
  const handleClose = () => {
    setSelectedImages([]);
    setContent("");
    setLocation("");
    setShowLocationSearch(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1.5,
        }}
      >
        <IconButton onClick={handleClose} edge="start">
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>
          새 게시물
        </Typography>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          variant="text"
          size="small"
          sx={{ fontWeight: 600 }}
        >
          공유
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* 사용자 정보 */}
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src="https://i.pravatar.cc/150?u=me"
            sx={{ width: 40, height: 40 }}
          />
          <Typography variant="subtitle1" fontWeight={600}>
            my_username
          </Typography>
        </Box>

        {/* 글 입력 */}
        <Box sx={{ px: 2 }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={10}
            placeholder="무슨 생각을 하고 계신가요?"
            variant="standard"
            InputProps={{ disableUnderline: true }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ fontSize: "1rem" }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textAlign: "right", mt: 1 }}
          >
            {content.length}/2,200
          </Typography>
        </Box>

        {/* 이미지 미리보기 */}
        {selectedImages.length > 0 && (
          <Box sx={{ px: 2, py: 1 }}>
            <ImageList
              cols={selectedImages.length === 1 ? 1 : selectedImages.length === 2 ? 2 : 3}
              gap={8}
              sx={{ m: 0 }}
            >
              {selectedImages.map((img, index) => (
                <ImageListItem key={index} sx={{ position: "relative" }}>
                  <Box
                    component="img"
                    src={img}
                    alt={`Selected ${index + 1}`}
                    sx={{
                      width: "100%",
                      height: selectedImages.length === 1 ? 300 : 150,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(0,0,0,0.6)",
                      color: "white",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                      p: 0.5,
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ImageListItem>
              ))}
            </ImageList>
            <Typography variant="caption" color="text.secondary">
              {selectedImages.length}/10장
            </Typography>
          </Box>
        )}

        {/* 하단 옵션들 */}
        <Box sx={{ borderTop: 1, borderColor: "divider", mt: 2 }}>
          {/* 사진 추가 */}
          <Box
            sx={{
              p: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              borderBottom: 1,
              borderColor: "divider",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Typography variant="body1">사진 추가</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              {selectedImages.length > 0 && (
                <Typography variant="body2" color="primary">
                  {selectedImages.length}장 선택됨
                </Typography>
              )}
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="feed-image-upload"
                multiple
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="feed-image-upload">
                <IconButton component="span" color={selectedImages.length > 0 ? "primary" : "default"}>
                  <AddPhotoAlternateIcon />
                </IconButton>
              </label>
            </Stack>
          </Box>

          {/* 위치 추가 */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Box
              sx={{
                p: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover" },
              }}
              onClick={() => setShowLocationSearch(!showLocationSearch)}
            >
              <Typography variant="body1">위치 추가</Typography>
              <Stack direction="row" alignItems="center">
                {location && (
                  <Typography variant="body2" color="primary" sx={{ mr: 1 }}>
                    {location}
                  </Typography>
                )}
                <LocationOnIcon color={location ? "primary" : "action"} />
              </Stack>
            </Box>

            {showLocationSearch && (
              <Box sx={{ p: 2, bgcolor: "background.default" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="위치 검색"
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {location && (
                    <Box
                      sx={{
                        p: 1,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" },
                        borderRadius: 1,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                      onClick={() => {
                        setLocation("");
                        setShowLocationSearch(false);
                      }}
                    >
                      <Typography variant="body2" color="error">
                        위치 삭제
                      </Typography>
                    </Box>
                  )}
                  {MOCK_LOCATIONS.map((loc) => (
                    <Box
                      key={loc}
                      sx={{
                        p: 1,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" },
                        borderRadius: 1,
                      }}
                      onClick={() => {
                        setLocation(loc);
                        setShowLocationSearch(false);
                      }}
                    >
                      <Typography variant="body2">{loc}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>

          {/* 사람 태그하기 */}
          <Box
            sx={{
              p: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Typography variant="body1">사람 태그하기</Typography>
            <LocalOfferIcon color="action" />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FeedCreateDialog;
