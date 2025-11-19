import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import { Reorder } from "framer-motion";
import { userApi } from "../../services/api/user.api";

/**
 * 사다리 타기 게임 페이지
 */
const Ladder = () => {
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [winnerCount, setWinnerCount] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [winners, setWinners] = useState<number[]>([]);
  const [winnerNames, setWinnerNames] = useState<string[]>([]);
  const [highlightedPaths, setHighlightedPaths] = useState<Set<string>>(
    new Set()
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // 사다리 구조 생성
  const ladderStructure = useMemo(() => {
    if (participants.length === 0) return [];

    const rows = 12;
    const cols = participants.length - 1;
    const structure: boolean[][] = [];

    for (let row = 0; row < rows; row++) {
      const rowBars: boolean[] = [];
      for (let col = 0; col < cols; col++) {
        if (col > 0 && rowBars[col - 1]) {
          rowBars.push(false);
        } else {
          rowBars.push(Math.random() > 0.5);
        }
      }
      structure.push(rowBars);
    }

    return structure;
  }, [participants]);

  /**
   * 활성 사용자 목록 조회
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const names = await userApi.getActiveUserNames();
      setAllUsers(names);
      setParticipants(names);
    } catch (err) {
      setError("사용자 목록을 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * 사다리 타기 시뮬레이션
   */
  const simulateLadder = useCallback(
    (startCol: number): number => {
      let currentCol = startCol;

      for (let row = 0; row < ladderStructure.length; row++) {
        if (currentCol > 0 && ladderStructure[row][currentCol - 1]) {
          currentCol--;
        } else if (
          currentCol < ladderStructure[row].length &&
          ladderStructure[row][currentCol]
        ) {
          currentCol++;
        }
      }

      return currentCol;
    },
    [ladderStructure]
  );

  /**
   * 당첨자로 향하는 경로를 단계별로 하이라이트
   */
  const highlightWinningPathsStepByStep = useCallback(
    async (winnerStarts: number[]) => {
      const allPaths: string[][] = [];
      const winnerMapping: { startIdx: number; endIdx: number }[] = [];

      // 각 당첨자의 전체 경로 계산 및 시작-끝 매핑 저장
      winnerStarts.forEach((startCol) => {
        const path: string[] = [];
        let currentCol = startCol;

        // 첫 번째 세로선 (행 0 시작 전)
        path.push(`v-0-${currentCol}`);

        for (let row = 0; row < ladderStructure.length; row++) {
          // 왼쪽 가로선 체크
          if (currentCol > 0 && ladderStructure[row][currentCol - 1]) {
            path.push(`h-${row}-${currentCol - 1}`);
            currentCol--;
          }
          // 오른쪽 가로선 체크
          else if (
            currentCol < ladderStructure[row].length &&
            ladderStructure[row][currentCol]
          ) {
            path.push(`h-${row}-${currentCol}`);
            currentCol++;
          }

          // 다음 세로선 (가로선 이동 후 새로운 컬럼의 세로선)
          path.push(`v-${row + 1}-${currentCol}`);
        }

        allPaths.push(path);
        winnerMapping.push({ startIdx: startCol, endIdx: currentCol });
      });

      // 단계별로 경로 표시
      const maxLength = Math.max(...allPaths.map((p) => p.length));
      for (let step = 0; step < maxLength; step++) {
        const currentPaths = new Set<string>();

        allPaths.forEach((path) => {
          for (let i = 0; i <= Math.min(step, path.length - 1); i++) {
            currentPaths.add(path[i]);
          }
        });

        setHighlightedPaths(currentPaths);
        // requestAnimationFrame을 사용하여 부드러운 업데이트
        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 80); // 속도 조절 (80ms)
          });
        });
      }

      return winnerMapping;
    },
    [ladderStructure]
  );

  /**
   * 참가자 제거
   */
  const handleRemoveParticipant = useCallback(
    (name: string) => {
      if (isPlaying) return;
      setParticipants((prev) => prev.filter((p) => p !== name));
    },
    [isPlaying]
  );

  /**
   * 게임 시작
   */
  const handleStart = useCallback(async () => {
    const count = parseInt(winnerCount);
    if (isNaN(count) || count < 1 || count >= participants.length) {
      setError(`당첨자 수는 1부터 ${participants.length - 1} 사이여야 합니다.`);
      return;
    }

    setIsPlaying(true);
    setWinners([]);
    setWinnerNames([]);
    setHighlightedPaths(new Set());
    setError(null);

    // 긴장감 넘치는 추첨 사운드 재생
    try {
      if (!audioContextRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;

      // 기존 사운드 정지
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
      }

      // 틱톡 소리를 위한 설정
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.connect(ctx.destination);

      gainNodeRef.current = gainNode;

      let tickInterval = 200; // 시작 간격 (ms)
      let lastTickTime = Date.now();
      let tickCount = 0;
      const maxTicks = Math.ceil(
        (ladderStructure.length * 80 + 1500) / tickInterval
      );

      // 점점 빨라지는 틱톡 사운드
      const playTick = () => {
        const now = Date.now();
        if (now - lastTickTime < tickInterval) return;

        lastTickTime = now;
        tickCount++;

        // 틱 사운드 생성 (짧고 날카로운 비프음)
        const tickOsc = ctx.createOscillator();
        const tickGain = ctx.createGain();

        tickOsc.type = "sine";
        tickOsc.frequency.setValueAtTime(800, ctx.currentTime);
        tickOsc.frequency.exponentialRampToValueAtTime(
          400,
          ctx.currentTime + 0.05
        );

        tickGain.gain.setValueAtTime(0.2, ctx.currentTime);
        tickGain.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + 0.05
        );

        tickOsc.connect(tickGain);
        tickGain.connect(ctx.destination);

        tickOsc.start(ctx.currentTime);
        tickOsc.stop(ctx.currentTime + 0.05);

        // 점점 빨라지는 효과
        const progress = tickCount / maxTicks;
        tickInterval = Math.max(50, 200 - progress * 150);
      };

      const tickIntervalId = setInterval(playTick, 50);

      // cleanup
      setTimeout(() => {
        clearInterval(tickIntervalId);
      }, (ladderStructure.length * 80 + 1500) as number);
    } catch (err) {
      console.error("Audio play failed:", err);
    }

    // 당첨 위치 랜덤 선택
    const winnerPositions = new Set<number>();
    while (winnerPositions.size < count) {
      winnerPositions.add(Math.floor(Math.random() * participants.length));
    }

    // 각 시작 위치에서 시뮬레이션
    const results: { start: number; end: number }[] = [];
    for (let i = 0; i < participants.length; i++) {
      const endPos = simulateLadder(i);
      results.push({ start: i, end: endPos });
    }

    // 당첨 위치로 향하는 시작점 찾기
    const winnerStarts: number[] = [];
    winnerPositions.forEach((winPos) => {
      const result = results.find((r) => r.end === winPos);
      if (result) {
        winnerStarts.push(result.start);
      }
    });

    // 경로 하이라이트 (단계별 애니메이션)
    await new Promise((resolve) => setTimeout(resolve, 500));
    const winnerMapping = await highlightWinningPathsStepByStep(winnerStarts);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 당첨자 표시 (끝 위치와 이름 저장)
    const winnerEndPositions = winnerMapping.map((m) => m.endIdx);
    const winnerNamesList = winnerMapping.map((m) => participants[m.startIdx]);
    setWinners(winnerEndPositions);
    setWinnerNames(winnerNamesList);
    setIsPlaying(false);

    // 오디오 정지
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (err) {
        // already stopped
      }
    }
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect();
      } catch (err) {
        // already disconnected
      }
    }
  }, [
    participants,
    winnerCount,
    simulateLadder,
    highlightWinningPathsStepByStep,
    ladderStructure.length,
  ]);

  /**
   * 리셋
   */
  const handleReset = useCallback(() => {
    setWinners([]);
    setWinnerNames([]);
    setHighlightedPaths(new Set());
    setIsPlaying(false);
    setError(null);

    // 오디오 정지
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (err) {
        // already stopped
      }
    }
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect();
      } catch (err) {
        // already disconnected
      }
    }
  }, []);

  /**
   * 모든 참가자 복원
   */
  const handleRestoreAll = useCallback(() => {
    setParticipants(allUsers);
  }, [allUsers]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2}>
        {/* 설정 영역 */}
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            {/* 참가자 목록 */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                  gap: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{ fontSize: "0.95rem", whiteSpace: "nowrap" }}
                >
                  참가자 ({participants.length}명)
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleRestoreAll}
                    disabled={isPlaying}
                    sx={{
                      fontSize: "0.75rem",
                      py: 0.5,
                      px: 1,
                      minWidth: "auto",
                    }}
                  >
                    전체복원
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={fetchUsers}
                    disabled={isPlaying}
                    sx={{
                      fontSize: "0.75rem",
                      py: 0.5,
                      px: 1,
                      minWidth: "auto",
                    }}
                  >
                    새로고침
                  </Button>
                </Box>
              </Box>
              {loading ? (
                <CircularProgress size={24} />
              ) : participants.length > 0 ? (
                <Reorder.Group
                  axis="x"
                  values={participants}
                  onReorder={setParticipants}
                  as="div"
                >
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {participants.map((user) => (
                      <Reorder.Item
                        key={user}
                        value={user}
                        as="div"
                        style={{ listStyle: "none" }}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Chip
                            label={user}
                            color="primary"
                            variant="outlined"
                            onDelete={
                              isPlaying
                                ? undefined
                                : () => handleRemoveParticipant(user)
                            }
                            deleteIcon={<CloseIcon />}
                            sx={{ cursor: isPlaying ? "default" : "grab" }}
                          />
                        </motion.div>
                      </Reorder.Item>
                    ))}
                  </Box>
                </Reorder.Group>
              ) : (
                <Alert severity="info">참가자가 없습니다.</Alert>
              )}
            </Box>

            {/* 당첨자 수 입력 */}
            <Box>
              <TextField
                label="당첨자 수"
                type="number"
                value={winnerCount}
                onChange={(e) => setWinnerCount(e.target.value)}
                disabled={isPlaying || participants.length === 0}
                size="small"
                inputProps={{
                  min: 1,
                  max: Math.max(1, participants.length - 1),
                }}
                helperText={`최대 ${Math.max(1, participants.length - 1)}명`}
                sx={{ width: 200 }}
              />
            </Box>

            {/* 에러 메시지 */}
            {error && <Alert severity="error">{error}</Alert>}

            {/* 버튼 */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleStart}
                disabled={isPlaying || participants.length < 2}
              >
                시작
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                disabled={isPlaying}
              >
                초기화
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* 사다리 영역 */}
        {participants.length > 1 && (
          <Paper elevation={2} sx={{ p: 2, overflow: "auto" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: `${Math.max(320, participants.length * 60)}px`,
                width: "100%",
              }}
            >
              {/* 시작 이름 */}
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  mb: 0.5,
                  justifyContent: "space-evenly",
                }}
              >
                {participants.map((user, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minWidth: 0,
                    }}
                  >
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{ width: "100%" }}
                    >
                      <Box
                        sx={{
                          textAlign: "center",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          color: highlightedPaths.has(`v-0-${idx}`)
                            ? "primary.main"
                            : "text.primary",
                          transition: "color 0.3s ease",
                          whiteSpace: "nowrap",
                          px: 0.25,
                        }}
                      >
                        {user}
                      </Box>
                    </motion.div>
                  </Box>
                ))}
              </Box>

              {/* 사다리 */}
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: `${(ladderStructure.length + 1) * 2.5}rem`,
                }}
              >
                {/* 세로선 (전체 길이) */}
                {Array.from({ length: participants.length }).map(
                  (_, colIdx) => (
                    <Box
                      key={`vertical-${colIdx}`}
                      sx={{
                        position: "absolute",
                        left: `${
                          (100 / participants.length) * colIdx +
                          100 / participants.length / 2
                        }%`,
                        top: 0,
                        width: "3px",
                        height: "100%",
                        transform: "translateX(-50%)",
                        bgcolor: "rgb(189, 189, 189)",
                        zIndex: 1,
                      }}
                    >
                      {/* 세로선 세그먼트들 - 가로선 위/아래로 분할 */}
                      {Array.from({ length: ladderStructure.length }).map(
                        (_, rowIdx) => (
                          <React.Fragment key={`v-row-${rowIdx}`}>
                            {/* 가로선 위쪽 세그먼트 */}
                            <Box
                              sx={{
                                position: "absolute",
                                top: `${
                                  (100 / (ladderStructure.length + 1)) * rowIdx
                                }%`,
                                width: "100%",
                                height: `${50 / (ladderStructure.length + 1)}%`,
                                bgcolor: highlightedPaths.has(
                                  `v-${rowIdx}-${colIdx}`
                                )
                                  ? "rgb(25, 118, 210)"
                                  : "transparent",
                                transition: "none",
                                willChange: "background-color",
                              }}
                            />
                            {/* 가로선 아래쪽 세그먼트 */}
                            <Box
                              sx={{
                                position: "absolute",
                                top: `${
                                  (100 / (ladderStructure.length + 1)) * (rowIdx + 0.5)
                                }%`,
                                width: "100%",
                                height: `${50 / (ladderStructure.length + 1)}%`,
                                bgcolor: highlightedPaths.has(
                                  `v-${rowIdx + 1}-${colIdx}`
                                )
                                  ? "rgb(25, 118, 210)"
                                  : "transparent",
                                transition: "none",
                                willChange: "background-color",
                              }}
                            />
                          </React.Fragment>
                        )
                      )}
                      {/* 마지막 세로선 세그먼트 */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: `${
                            (100 / (ladderStructure.length + 1)) * ladderStructure.length
                          }%`,
                          width: "100%",
                          height: `${100 / (ladderStructure.length + 1)}%`,
                          bgcolor: highlightedPaths.has(
                            `v-${ladderStructure.length}-${colIdx}`
                          )
                            ? "rgb(25, 118, 210)"
                            : "transparent",
                          transition: "none",
                          willChange: "background-color",
                        }}
                      />
                    </Box>
                  )
                )}

                {/* 가로막대들 */}
                {ladderStructure.map((row, rowIdx) => (
                  <Box
                    key={rowIdx}
                    sx={{
                      position: "absolute",
                      top: `${
                        (100 / (ladderStructure.length + 1)) * (rowIdx + 0.5)
                      }%`,
                      width: "100%",
                      height: 0,
                    }}
                  >
                    {Array.from({ length: participants.length }).map(
                      (_, colIdx) => (
                        <Box key={colIdx}>
                          {colIdx < row.length && row[colIdx] && (
                            <motion.div
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{
                                delay: rowIdx * 0.05 + 0.1,
                                duration: 0.3,
                              }}
                              style={{
                                position: "absolute",
                                left: `${
                                  (100 / participants.length) * colIdx +
                                  100 / participants.length / 2
                                }%`,
                                top: 0,
                                width: `${100 / participants.length}%`,
                                height: "3px",
                                backgroundColor: highlightedPaths.has(
                                  `h-${rowIdx}-${colIdx}`
                                )
                                  ? "rgb(25, 118, 210)"
                                  : "rgb(189, 189, 189)",
                                transform: "translateY(-50%)",
                                transformOrigin: "left",
                                transition: "none",
                                willChange: "background-color",
                                zIndex: 2,
                              }}
                            />
                          )}
                        </Box>
                      )
                    )}
                  </Box>
                ))}
              </Box>

              {/* 결과 (당첨/꽝) */}
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  mt: 0.5,
                  justifyContent: "space-evenly",
                }}
              >
                {Array.from({ length: participants.length }).map((_, idx) => {
                  const isWinner = winners.includes(idx);
                  return (
                    <Box
                      key={idx}
                      sx={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minWidth: 0,
                      }}
                    >
                      <AnimatePresence>
                        {winners.length > 0 && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              damping: 15,
                            }}
                          >
                            <Box
                              sx={{
                                textAlign: "center",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                color: isWinner ? "success.main" : "error.main",
                                bgcolor: isWinner
                                  ? "success.light"
                                  : "error.light",
                                py: 0.4,
                                px: 0.8,
                                borderRadius: 1.5,
                                border: 2,
                                borderColor: isWinner
                                  ? "success.main"
                                  : "error.main",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {isWinner ? "🎉 당첨" : "😢 꽝"}
                            </Box>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Paper>
        )}

        {/* 당첨자 결과 */}
        <AnimatePresence>
          {winners.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 2, sm: 3 },
                  bgcolor: "success.light",
                  borderLeft: 4,
                  borderColor: "success.main",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ mb: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  🎉 당첨자 발표
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {winnerNames.map((name, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: idx * 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <Chip
                        label={name}
                        color="success"
                        sx={{ fontSize: "1rem", py: 2.5, px: 1 }}
                      />
                    </motion.div>
                  ))}
                </Box>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
    </Box>
  );
};

export default Ladder;
