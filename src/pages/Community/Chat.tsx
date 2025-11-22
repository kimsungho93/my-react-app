import { Box } from "@mui/material";

/**
 * 채팅 페이지
 */
const Chat = () => {
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
      <h1>채팅</h1>
    </Box>
  );
};

export default Chat;
