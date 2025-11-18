import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface RouletteWheelProps {
  participants: string[];
  rotation: number;
  isSpinning: boolean;
}

/**
 * 3D 룰렛 휠 컴포넌트
 * 참가자 수에 따라 동적으로 섹터를 생성하고 회전 애니메이션 제공
 */
const RouletteWheel: React.FC<RouletteWheelProps> = React.memo(
  ({ participants, rotation, isSpinning }) => {
    const wheelRef = useRef<THREE.Group>(null);
    const targetRotation = useRef(0);
    const currentRotation = useRef(0);

    // 섹터별 색상 생성
    const colors = useMemo(() => {
      const baseColors = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#FFA07A",
        "#98D8C8",
        "#F7DC6F",
        "#BB8FCE",
        "#85C1E2",
        "#F8B500",
        "#52B788",
        "#FF8FA3",
        "#6A4C93",
      ];
      return participants.map((_, i) => baseColors[i % baseColors.length]);
    }, [participants.length]);

    // 회전 애니메이션 (Easing 적용)
    useFrame((_state, delta) => {
      if (!wheelRef.current) return;

      if (isSpinning) {
        // 회전 중일 때는 계속 일정 속도로 회전
        currentRotation.current += delta * 3.5; // 초당 3.5 라디안 (속도 증가)
        wheelRef.current.rotation.z = currentRotation.current;
      } else {
        // 멈췄을 때는 현재 rotation 값으로 부드럽게 이동
        targetRotation.current = (rotation * Math.PI) / 180;
        const easingFactor = 0.05;
        currentRotation.current +=
          (targetRotation.current - currentRotation.current) * easingFactor;
        wheelRef.current.rotation.z = currentRotation.current;
      }
    });

    // 섹터 메쉬 생성
    const sectors = useMemo(() => {
      if (participants.length === 0) return null;

      const sectorAngle = (Math.PI * 2) / participants.length;
      const radius = 2;
      const height = 0.3;

      return participants.map((name, index) => {
        const angle = sectorAngle * index;
        const nextAngle = sectorAngle * (index + 1);

        // 섹터 형태 생성
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.arc(0, 0, radius, angle, nextAngle, false);
        shape.lineTo(0, 0);

        const extrudeSettings = {
          depth: height,
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.02,
          bevelSegments: 2,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // 텍스트 위치 계산
        const textAngle = angle + sectorAngle / 2;
        const textRadius = radius * 0.65;
        const textX = Math.cos(textAngle) * textRadius;
        const textZ = Math.sin(textAngle) * textRadius;

        return (
          <group key={`sector-${index}-${name}`}>
            {/* 섹터 메쉬 */}
            <mesh
              geometry={geometry}
              position={[0, 0, -height / 2]}
              rotation={[0, 0, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={colors[index]}
                metalness={0.3}
                roughness={0.4}
                emissive={colors[index]}
                emissiveIntensity={0.1}
              />
            </mesh>

            {/* 참가자 이름 텍스트 */}
            <Html
              position={[textX, textZ, 0.3]}
              rotation={[-Math.PI / 2, 0, -textAngle + Math.PI / 2]}
              center
              transform
              sprite
            >
              <div
                style={{
                  color: "white",
                  fontSize: "8px",
                  fontWeight: "bold",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.9)",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                {name}
              </div>
            </Html>

            {/* 구분선 */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, angle]}>
              <boxGeometry args={[radius, height + 0.1, 0.02]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        );
      });
    }, [participants, colors]);

    if (participants.length === 0) {
      return (
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[2, 2, 0.3, 32]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      );
    }

    return (
      <group ref={wheelRef} position={[0, 0, 0]}>
        {sectors}

        {/* 중앙 원통 (장식) */}
        <mesh position={[0, 0, 0]} castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.5, 32]} />
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.8}
            roughness={0.2}
            emissive="#FFD700"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    );
  }
);

RouletteWheel.displayName = "RouletteWheel";

export default RouletteWheel;
