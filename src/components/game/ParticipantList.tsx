import React, { useCallback } from "react";
import { Box, Chip, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ParticipantListProps {
  participants: string[];
  onRemove: (name: string) => void;
}

/**
 * 참가자 목록 컴포넌트
 * X 버튼 클릭으로 참가자를 제거할 수 있는 기능 제공
 */
const ParticipantList: React.FC<ParticipantListProps> = React.memo(
  ({ participants, onRemove }) => {
    /** 칩 삭제 핸들러 */
    const handleDelete = useCallback(
      (name: string) => {
        onRemove(name);
      },
      [onRemove]
    );

    if (participants.length === 0) {
      return (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #ccc",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            참가자가 없습니다
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          p: 2,
          bgcolor: "#fafafa",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#bdbdbd",
            borderRadius: "4px",
          },
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {participants.map((name) => (
            <Chip
              key={name}
              label={name}
              onDelete={() => handleDelete(name)}
              deleteIcon={<CloseIcon />}
              sx={{
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: 2,
                },
              }}
              color="primary"
              variant="filled"
            />
          ))}
        </Box>

        <Typography
          variant="caption"
          sx={{ display: "block", mt: 2, color: "text.secondary" }}
        >
          💡 X 버튼을 클릭해서 참가자를 제거할 수 있습니다
        </Typography>
      </Box>
    );
  }
);

ParticipantList.displayName = "ParticipantList";

export default ParticipantList;
