import { useState } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

/**
 * 드래그 가능한 선택지 컴포넌트 Props
 */
interface DraggableOptionProps {
  option: { id?: number; text: string; tempId: string };
  index: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  disabled: boolean;
  canRemove: boolean;
}

/**
 * 드래그 가능한 선택지 컴포넌트
 */
const DraggableOption = ({
  option,
  index,
  onMove,
  onChange,
  onRemove,
  disabled,
  canRemove,
}: DraggableOptionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/html"));
    if (fromIndex !== index) {
      onMove(fromIndex, index);
    }
    setDragOverIndex(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        draggable={!disabled}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          opacity: isDragging ? 0.5 : 1,
          borderRadius: 1,
          border: dragOverIndex === index ? "2px dashed" : "2px solid transparent",
          borderColor: dragOverIndex === index ? "primary.main" : "transparent",
          transition: "all 0.2s",
          p: dragOverIndex === index ? 0.5 : 0,
        }}
      >
        <DragIndicatorIcon
          sx={{
            color: "text.disabled",
            cursor: disabled ? "default" : "grab",
            "&:active": { cursor: disabled ? "default" : "grabbing" },
          }}
        />
        <TextField
          value={option.text}
          onChange={(e) => onChange(index, e.target.value)}
          placeholder={`선택지 ${index + 1}`}
          fullWidth
          size="small"
          disabled={disabled}
          inputProps={{ maxLength: 100 }}
        />
        <IconButton
          onClick={() => onRemove(index)}
          disabled={!canRemove || disabled}
          color="error"
          size="small"
        >
          <DeleteOutlineIcon />
        </IconButton>
      </Box>
    </motion.div>
  );
};

export default DraggableOption;
