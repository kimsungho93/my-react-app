// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Container,
//   Paper,
//   TextField,
//   Button,
//   Typography,
//   Alert,
//   CircularProgress,
//   InputAdornment,
//   IconButton,
// } from "@mui/material";
// import { Visibility, VisibilityOff, Lock, Email } from "@mui/icons-material"; // Person → Email로 변경
// import { useNavigate } from "react-router-dom";
// import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
// import { login, clearError } from "../../store/slices/authSlice";

// /**
//  * 로그인 페이지
//  */
// export const Login = () => {
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
//   const { loading, error, isAuthenticated } = useAppSelector(
//     (state) => state.auth
//   );

//   const [email, setEmail] = useState(""); // username → email로 변경
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   // 이미 로그인된 경우 대시보드로 리다이렉트
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate("/dashboard");
//     }
//   }, [isAuthenticated, navigate]);

//   // 컴포넌트 언마운트 시 에러 초기화
//   useEffect(() => {
//     return () => {
//       dispatch(clearError());
//     };
//   }, [dispatch]);

//   /**
//    * 로그인 처리
//    */
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!email || !password) {
//       return;
//     }

//     const result = await dispatch(login({ email, password })); // email로 변경

//     if (login.fulfilled.match(result)) {
//       navigate("/dashboard");
//     }
//   };

//   /**
//    * 비밀번호 표시/숨김 토글
//    */
//   const handleTogglePassword = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor: "background.default",
//       }}
//     >
//       <Container maxWidth="sm">
//         <Paper
//           elevation={3}
//           sx={{
//             p: 4,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           {/* 로고 */}
//           <Box
//             sx={{
//               mb: 3,
//               p: 2,
//               borderRadius: 2,
//               backgroundColor: "primary.main",
//               color: "white",
//             }}
//           >
//             <Lock sx={{ fontSize: 40 }} />
//           </Box>

//           {/* 제목 */}
//           <Typography
//             component="h1"
//             variant="h5"
//             sx={{ mb: 3, fontWeight: 600 }}
//           >
//             로그인
//           </Typography>

//           {/* 에러 메시지 */}
//           {error && (
//             <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
//               {error}
//             </Alert>
//           )}

//           {/* 로그인 폼 */}
//           <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
//             {/* 이메일 입력 */}
//             <TextField
//               margin="normal"
//               required
//               fullWidth
//               id="email"
//               label="이메일"
//               name="email"
//               type="email"
//               autoComplete="email"
//               autoFocus
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               disabled={loading}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Email />
//                   </InputAdornment>
//                 ),
//               }}
//             />

//             {/* 비밀번호 입력 */}
//             <TextField
//               margin="normal"
//               required
//               fullWidth
//               name="password"
//               label="비밀번호"
//               type={showPassword ? "text" : "password"}
//               id="password"
//               autoComplete="current-password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               disabled={loading}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Lock />
//                   </InputAdornment>
//                 ),
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton onClick={handleTogglePassword} edge="end">
//                       {showPassword ? <VisibilityOff /> : <Visibility />}
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//             />

//             {/* 로그인 버튼 */}
//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               sx={{ mt: 3, mb: 2, py: 1.5 }}
//               disabled={loading || !email || !password}
//             >
//               {loading ? (
//                 <CircularProgress size={24} color="inherit" />
//               ) : (
//                 "로그인"
//               )}
//             </Button>
//           </Box>
//         </Paper>
//       </Container>
//     </Box>
//   );
// };

// src/pages/Login/Login.tsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  keyframes,
} from "@mui/material";
import { Visibility, VisibilityOff, Lock, Email } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { login, clearError } from "../../store/slices/authSlice";

/**
 * 별 애니메이션 키프레임
 */
const twinkle = keyframes`
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const moveStars = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-2000px);
  }
`;

/**
 * 별 생성 함수
 */
const generateStars = (count: number, size: number) => {
  let stars = "";
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 2000;
    const y = Math.random() * 2000;
    stars += `${x}px ${y}px ${size}px rgba(255, 255, 255, ${
      Math.random() * 0.5 + 0.5
    })`;
    if (i < count - 1) stars += ", ";
  }
  return stars;
};

/**
 * 로그인 페이지
 */
export const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 비밀번호 유효성 검사 추가
  const isPasswordValid = password.length >= 8 && password.length <= 20;
  const isFormValid = email && isPasswordValid;

  // 이미 로그인된 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // 컴포넌트 언마운트 시 에러 초기화
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  /**
   * 로그인 처리
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    const result = await dispatch(login({ email, password }));

    if (login.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  /**
   * 비밀번호 표시/숨김 토글
   */
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(to bottom, #000428, #004e92)",
      }}
    >
      {/* 우주 배경 레이어 */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      >
        {/* 작은 별들 */}
        <Box
          sx={{
            position: "absolute",
            width: "1px",
            height: "1px",
            background: "transparent",
            boxShadow: generateStars(700, 1),
            animation: `${moveStars} 100s linear infinite`,
            "&::after": {
              content: '""',
              position: "absolute",
              top: "2000px",
              width: "1px",
              height: "1px",
              background: "transparent",
              boxShadow: generateStars(700, 1),
            },
          }}
        />

        {/* 중간 별들 */}
        <Box
          sx={{
            position: "absolute",
            width: "2px",
            height: "2px",
            background: "transparent",
            boxShadow: generateStars(200, 2),
            animation: `${moveStars} 150s linear infinite`,
            "&::after": {
              content: '""',
              position: "absolute",
              top: "2000px",
              width: "2px",
              height: "2px",
              background: "transparent",
              boxShadow: generateStars(200, 2),
            },
          }}
        />

        {/* 큰 별들 */}
        <Box
          sx={{
            position: "absolute",
            width: "3px",
            height: "3px",
            background: "transparent",
            boxShadow: generateStars(100, 3),
            animation: `${moveStars} 200s linear infinite`,
            "&::after": {
              content: '""',
              position: "absolute",
              top: "2000px",
              width: "3px",
              height: "3px",
              background: "transparent",
              boxShadow: generateStars(100, 3),
            },
          }}
        />

        {/* 반짝이는 별들 */}
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: "4px",
              height: "4px",
              background: "white",
              borderRadius: "50%",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `${twinkle} ${
                2 + Math.random() * 3
              }s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
            }}
          />
        ))}

        {/* 행성/혜성 효과 */}
        <Box
          sx={{
            position: "absolute",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(138, 43, 226, 0.3), transparent)",
            top: "10%",
            right: "10%",
            animation: `${float} 6s ease-in-out infinite`,
            filter: "blur(40px)",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(30, 144, 255, 0.2), transparent)",
            bottom: "15%",
            left: "5%",
            animation: `${float} 8s ease-in-out infinite`,
            animationDelay: "1s",
            filter: "blur(50px)",
          }}
        />
      </Box>

      {/* 로그인 폼 컨테이너 */}
      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            animation: `${float} 3s ease-in-out infinite`,
          }}
        >
          {/* 로고 */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
            }}
          >
            <Lock sx={{ fontSize: 40 }} />
          </Box>

          {/* 제목 */}
          <Typography
            component="h1"
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 600,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            로그인 해주세요
          </Typography>

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* 로그인 폼 */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            {/* 이메일 입력 */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="이메일"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  "&:hover fieldset": {
                    borderColor: "#667eea",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#000000",
                  // autofill 스타일 덮어쓰기
                  "&:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 100px white inset",
                    WebkitTextFillColor: "#000000",
                    caretColor: "#000000",
                    borderRadius: "inherit",
                  },
                  "&:-webkit-autofill:hover": {
                    WebkitBoxShadow: "0 0 0 100px white inset",
                  },
                  "&:-webkit-autofill:focus": {
                    WebkitBoxShadow: "0 0 0 100px white inset",
                  },
                  "&:-webkit-autofill:active": {
                    WebkitBoxShadow: "0 0 0 100px white inset",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(0, 0, 0, 0.6)",
                  "&.Mui-focused": {
                    color: "#667eea",
                  },
                },
              }}
            />

            {/* 비밀번호 입력 */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="비밀번호"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "rgba(0, 0, 0, 0.54)" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        sx={{ color: "rgba(0, 0, 0, 0.54)" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  "&:hover fieldset": {
                    borderColor: "#667eea",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#000000",
                  // autofill 스타일 덮어쓰기
                  "&:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 100px white inset",
                    WebkitTextFillColor: "#000000",
                    caretColor: "#000000",
                    borderRadius: "inherit",
                  },
                  "&:-webkit-autofill:hover": {
                    WebkitBoxShadow: "0 0 0 100px white inset",
                  },
                  "&:-webkit-autofill:focus": {
                    WebkitBoxShadow: "0 0 0 100px white inset",
                  },
                  "&:-webkit-autofill:active": {
                    WebkitBoxShadow: "0 0 0 100px white inset",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(0, 0, 0, 0.6)",
                  "&.Mui-focused": {
                    color: "#667eea",
                  },
                },
              }}
            />
            {/* 로그인 버튼 */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                },
                "&:disabled": {
                  background: "rgba(0, 0, 0, 0.12)",
                },
              }}
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "로그인"
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
