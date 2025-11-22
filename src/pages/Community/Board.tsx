import { Box } from "@mui/material";

/**
 * 게시판 페이지
 */
const Board = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        p: 2,
      }}
    >
      <h1>게시판</h1>
    </Box>
  );
};

export default Board;
