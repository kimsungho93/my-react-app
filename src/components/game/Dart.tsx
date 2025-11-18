import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DartProps {
  fired: boolean;
}

/**
 * 다트 컴포넌트
 * 던지기 애니메이션과 함께 룰렛을 향해 날아가는 효과
 */
const Dart: React.FC<DartProps> = React.memo(({ fired }) => {
  const dartRef = useRef<THREE.Group>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // 초기 위치와 목표 위치 (정면에서 룰렛 안쪽으로)
  const startPosition = new THREE.Vector3(0, 1.5, 5);
  const endPosition = new THREE.Vector3(0, 1.5, 0.5);

  // 애니메이션 초기화
  useEffect(() => {
    if (fired) {
      setAnimationProgress(0);
    }
  }, [fired]);

  // 다트 던지기 애니메이션
  useFrame((_state, delta) => {
    if (!dartRef.current) return;

    if (fired && animationProgress < 1) {
      // 애니메이션 진행도 업데이트 (0 ~ 1)
      const newProgress = Math.min(animationProgress + delta * 1.2, 1);
      setAnimationProgress(newProgress);

      // Easing 함수 (easeInQuad)
      const eased = newProgress * newProgress;

      // 위치 보간
      dartRef.current.position.lerpVectors(
        startPosition,
        endPosition,
        eased
      );

      // 회전 애니메이션 (정면에서 날아오므로)
      dartRef.current.rotation.y = 0;
      dartRef.current.rotation.z = Math.sin(newProgress * Math.PI * 4) * 0.1;

      // 스케일 애니메이션 (약간 커졌다 작아짐)
      const scaleValue = 1 + Math.sin(newProgress * Math.PI) * 0.2;
      dartRef.current.scale.set(scaleValue, scaleValue, scaleValue);
    } else if (!fired) {
      // 초기 위치로 복귀
      dartRef.current.position.copy(startPosition);
      dartRef.current.rotation.set(0, 0, 0);
      dartRef.current.scale.set(1, 1, 1);
    } else {
      // 애니메이션 완료 후 고정
      dartRef.current.position.copy(endPosition);
    }
  });

  return (
    <group ref={dartRef} position={[0, 1.5, 5]} rotation={[0, 0, 0]}>
      {/* 다트 끝 (뾰족한 부분) - 룰렛을 향하도록 */}
      <mesh position={[0, 0, -0.2]} castShadow rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.04, 0.4, 8]} />
        <meshStandardMaterial
          color="#C0C0C0"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* 다트 몸통 */}
      <mesh position={[0, 0, 0.15]} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
        <meshStandardMaterial
          color="#2C3E50"
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* 다트 날개 1 (우측 상단) */}
      <mesh position={[0.08, 0.08, 0.45]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[0.01, 0.12, 0.2]} />
        <meshStandardMaterial
          color="#FF6B6B"
          metalness={0.2}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 다트 날개 2 (좌측 상단) */}
      <mesh
        position={[-0.08, 0.08, 0.45]}
        rotation={[0, -Math.PI / 4, 0]}
        castShadow
      >
        <boxGeometry args={[0.01, 0.12, 0.2]} />
        <meshStandardMaterial
          color="#FF6B6B"
          metalness={0.2}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 다트 날개 3 (우측 하단) */}
      <mesh position={[0.08, -0.08, 0.45]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[0.01, 0.12, 0.2]} />
        <meshStandardMaterial
          color="#4ECDC4"
          metalness={0.2}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 다트 날개 4 (좌측 하단) */}
      <mesh
        position={[-0.08, -0.08, 0.45]}
        rotation={[0, -Math.PI / 4, 0]}
        castShadow
      >
        <boxGeometry args={[0.01, 0.12, 0.2]} />
        <meshStandardMaterial
          color="#4ECDC4"
          metalness={0.2}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 발사 시 이펙트 (파티클 효과) */}
      {fired && animationProgress < 0.3 && (
        <group>
          {[...Array(8)].map((_, i) => {
            const angle = (Math.PI * 2 * i) / 8;
            const radius = 0.2 * animationProgress * 3;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(angle) * radius,
                  -0.2,
                ]}
              >
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshStandardMaterial
                  color="#FFD700"
                  emissive="#FFD700"
                  emissiveIntensity={1}
                  transparent
                  opacity={1 - animationProgress * 3}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* 포인트 라이트 (다트가 빛남) */}
      {fired && (
        <pointLight
          position={[0, 0, 0]}
          intensity={animationProgress < 1 ? 2 : 0.5}
          distance={2}
          color="#FFD700"
        />
      )}
    </group>
  );
});

Dart.displayName = "Dart";

export default Dart;
