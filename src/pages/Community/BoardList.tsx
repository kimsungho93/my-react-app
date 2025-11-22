import { useState } from "react";
import { Box, Tabs, Tab, Typography, Container } from "@mui/material";

type BoardCategory = "all" | "notice" | "humor" | "knowledge";

/**
 * 게시글 조회 페이지
 * 공지사항, 유머글, 지식공유 필터 기능 포함
 */
const BoardList = () => {
  const [category, setCategory] = useState<BoardCategory>("all");

  /**
   * 탭 변경 핸들러
   */
  const handleCategoryChange = (_: React.SyntheticEvent, newValue: BoardCategory) => {
    setCategory(newValue);
  };

  /**
   * 카테고리별 콘텐츠 렌더링
   */
  const renderContent = () => {
    switch (category) {
      case "notice":
        return <h1>공지사항</h1>;
      case "humor":
        return <h1>유머글</h1>;
      case "knowledge":
        return <h1>지식공유</h1>;
      default:
        return <h1>게시글 조회</h1>;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          게시판
        </Typography>

        {/* 카테고리 탭 */}
        <Tabs
          value={category}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              minHeight: 44, // 모바일 터치 타겟 크기
              fontSize: "0.875rem",
            },
          }}
        >
          <Tab label="전체" value="all" />
          <Tab label="공지사항" value="notice" />
          <Tab label="유머글" value="humor" />
          <Tab label="지식공유" value="knowledge" />
        </Tabs>
      </Box>

      {/* 게시글 목록 영역 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        {renderContent()}
      </Box>
    </Container>
  );
};

export default BoardList;
