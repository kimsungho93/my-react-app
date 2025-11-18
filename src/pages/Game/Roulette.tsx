import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Box, Button, Typography, Stack, Paper } from "@mui/material";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Howl } from "howler";
import { userApi } from "../../services/api/user.api";
import RouletteWheel from "../../components/game/RouletteWheel";
import Dart from "../../components/game/Dart";
import ParticipantList from "../../components/game/ParticipantList";

/**
 * 룰렛 돌리기 게임 페이지
 */
const Roulette: React.FC = () => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [dartFired, setDartFired] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // 오디오 ref
  const spinSoundRef = useRef<Howl | null>(null);
  const dartSoundRef = useRef<Howl | null>(null);
  const winnerSoundRef = useRef<Howl | null>(null);

  // 오디오 초기화
  useEffect(() => {
    // Howler.js를 사용한 사운드 초기화
    // public/sounds/ 폴더에 오디오 파일을 추가하고 경로를 지정하세요

    // 룰렛 회전 사운드 (반복 재생)
    spinSoundRef.current = new Howl({
      src: ["/sounds/spinning-roulette.mp3"],
      loop: true,
      volume: 0.3,
      html5: true, // 큰 파일의 경우 스트리밍
    });

    // 다트 던지는 사운드
    dartSoundRef.current = new Howl({
      src: ["/sounds/dart-throw.mp3"],
      volume: 0.5,
    });

    // 당첨자 발표 사운드
    winnerSoundRef.current = new Howl({
      src: ["/sounds/winning.mp3"],
      volume: 0.4,
    });

    return () => {
      spinSoundRef.current?.unload();
      dartSoundRef.current?.unload();
      winnerSoundRef.current?.unload();
    };
  }, []);

  // 활성 사용자 목록 불러오기
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const names = await userApi.getActiveUserNames();
        setParticipants(names);
      } catch (error) {
        console.error("사용자 목록 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  /** 참가자 제거 핸들러 */
  const handleRemoveParticipant = useCallback((name: string) => {
    setParticipants((prev) => prev.filter((p) => p !== name));
  }, []);

  /** 룰렛 회전 시작 */
  const handleSpin = useCallback(() => {
    if (isSpinning || participants.length === 0) return;

    setIsSpinning(true);
    setDartFired(false);
    setWinner(null);

    // 룰렛 회전 사운드 재생
    spinSoundRef.current?.play();

    // 3~5바퀴 회전 (1080~1800도) - 다트를 던질 때까지 계속 회전
    const randomRotation = 1080 + Math.random() * 720;
    setRotation((prev) => prev + randomRotation);
  }, [isSpinning, participants.length]);

  /** 다트 던지기 및 당첨자 결정 */
  const handleThrowDart = useCallback(() => {
    if (!isSpinning || dartFired || participants.length === 0) return;

    setIsSpinning(false); // 다트 던질 때 회전 멈춤

    // 룰렛 회전 사운드 정지
    spinSoundRef.current?.stop();

    // 다트 던지는 사운드 재생
    dartSoundRef.current?.play();

    // 현재 회전 위치 저장
    const currentRotation = Math.random() * 360; // 랜덤 위치에서 멈춤
    setRotation(currentRotation);

    setDartFired(true);

    // 다트 애니메이션 완료 후 당첨자 결정
    setTimeout(() => {
      // 다트는 정면(Z+ 방향, 90도 위치)에서 날아옴
      // 룰렛은 Z축을 중심으로 회전 (반시계방향이 양의 회전)
      // THREE.js에서 angle 0 = X+ (오른쪽), angle π/2 = Z+ (정면/위쪽)

      const sectorSize = 360 / participants.length;

      // 다트가 맞는 위치는 고정 (90도, 정면)
      // 룰렛 회전을 고려하여 실제로 90도 위치에 있는 섹터를 찾음
      // 룰렛이 시계방향으로 회전하면 더 큰 인덱스의 섹터가 위로 올라옴
      const dartAngle = 90; // 다트는 항상 정면(90도)을 가리킴

      // 현재 회전각에서 다트 위치를 뺀 값이 실제 당첨 섹터의 각도
      const winnerAngle = (dartAngle - (currentRotation % 360) + 360) % 360;

      // 섹터는 0도(오른쪽)부터 시작하므로, 해당 각도가 속한 섹터의 인덱스 계산
      const winnerIndex =
        Math.floor(winnerAngle / sectorSize) % participants.length;
      const selectedWinner = participants[winnerIndex];

      setWinner(selectedWinner);

      // 당첨자 발표 사운드 재생
      winnerSoundRef.current?.play();
    }, 1500);
  }, [isSpinning, dartFired, participants]);

  /** 게임 리셋 */
  const handleReset = useCallback(() => {
    setDartFired(false);
    setWinner(null);
    setRotation(0);
  }, []);

  // 버튼 비활성화 조건
  const spinDisabled = useMemo(
    () => isSpinning || participants.length === 0 || dartFired,
    [isSpinning, participants.length, dartFired]
  );

  const dartDisabled = useMemo(
    () => !isSpinning || dartFired || participants.length === 0,
    [isSpinning, dartFired, participants.length]
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h5">참가자 목록을 불러오는 중...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🎯 3D 룰렛 게임
      </Typography>

      <Box sx={{ display: "flex", gap: 3, height: 600 }}>
        {/* 3D 룰렛 영역 */}
        <Paper
          elevation={3}
          sx={{
            flex: 2,
            position: "relative",
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          <Canvas
            shadows
            camera={{ position: [0, 3, 5], fov: 50 }}
            style={{
              background:
                "linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%)",
            }}
          >
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2}
              target={[0, 0, 0]}
            />

            {/* 조명 */}
            <ambientLight intensity={0.7} />
            <directionalLight
              position={[5, 10, 5]}
              intensity={1.5}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <spotLight
              position={[0, 10, 0]}
              angle={0.4}
              penumbra={1}
              intensity={1}
              castShadow
            />
            <hemisphereLight intensity={0.3} />

            {/* 룰렛 휠 */}
            <RouletteWheel
              participants={participants}
              rotation={rotation}
              isSpinning={isSpinning}
            />

            {/* 다트 */}
            <Dart fired={dartFired} />

            {/* 바닥 그림자 */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.5, 0]}
              receiveShadow
            >
              <planeGeometry args={[20, 20]} />
              <shadowMaterial opacity={0.3} />
            </mesh>
          </Canvas>
        </Paper>

        {/* 컨트롤 패널 */}
        <Paper
          elevation={3}
          sx={{ flex: 1, p: 3, display: "flex", flexDirection: "column" }}
        >
          <Typography variant="h6" gutterBottom>
            참가자 목록 ({participants.length}명)
          </Typography>

          {/* 참가자 리스트 */}
          <ParticipantList
            participants={participants}
            onRemove={handleRemoveParticipant}
          />

          {/* 컨트롤 버튼 */}
          <Stack spacing={2} sx={{ mt: "auto" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSpin}
              disabled={spinDisabled}
              fullWidth
            >
              🎰 룰렛 돌리기
            </Button>

            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleThrowDart}
              disabled={dartDisabled}
              fullWidth
            >
              🎯 다트 던지기
            </Button>

            <Button
              variant="outlined"
              color="info"
              onClick={handleReset}
              disabled={!dartFired && !winner}
              fullWidth
            >
              🔄 리셋
            </Button>
          </Stack>

          {participants.length === 0 && (
            <Typography
              variant="body2"
              color="error"
              sx={{ mt: 2, textAlign: "center" }}
            >
              참가자가 없습니다!
            </Typography>
          )}
        </Paper>
      </Box>

      {/* 당첨자 결과 - 하단 표시 */}
      {winner && (
        <Paper
          elevation={3}
          sx={{
            mt: 1.5,
            py: 1,
            px: 2,
            textAlign: "center",
            bgcolor: "success.light",
            borderLeft: 6,
            borderColor: "success.main",
            animation: "fadeInUp 0.5s ease-in-out",
            "@keyframes fadeInUp": {
              from: { opacity: 0, transform: "translateY(20px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
            🎉 당첨자 발표!
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "success.dark",
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {winner}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Roulette;
