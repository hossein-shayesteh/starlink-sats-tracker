import React, { useMemo, useRef, useState } from "react";

import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

import { convertToSphereCoords } from "@/src/features/eath/utils/geojsonUtils";

interface SatellitePosition {
  lat: number;
  lon: number;
  name?: string;
  id: string;
  altitude?: number;
  velocity?: number;
  timestamp?: Date;
  orbitData?: {
    inclination: number;
    eccentricity: number;
    semiMajorAxis: number;
    period: number;
    perigee: number;
    apogee: number;
    meanMotion: number;
  };
  status?: string;
  launchDate?: string;
}

interface SatelliteProps {
  satellites: SatellitePosition[];
  radius?: number;
  pointSize?: number;
  color?: string | THREE.Color;
  onSatelliteClick?: (satellite: SatellitePosition) => void;
}

interface SatellitePointProps {
  satellite: SatellitePosition;
  position: [number, number, number];
  pointSize: number;
  color: string | THREE.Color;
  onSatelliteClick?: (satellite: SatellitePosition) => void;
}

const SatellitePoint = ({
  satellite,
  position,
  pointSize,
  color,
  onSatelliteClick,
}: SatellitePointProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (onSatelliteClick) {
      onSatelliteClick(satellite);
    }
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[pointSize, 4, 4]} />
      <meshBasicMaterial
        color={hovered ? "#ffaa00" : color}
        transparent={true}
        opacity={hovered ? 1.0 : 0.9}
      />
      {/* Glow effect */}
    </mesh>
  );
};

const Satellite = ({
  satellites,
  radius = 3,
  pointSize = 0.02,
  color = "#ff4444",
  onSatelliteClick,
}: SatelliteProps) => {
  const groupRef = useRef<THREE.Group>(null);

  const satellitePoints = useMemo(() => {
    return satellites.map((satellite) => {
      const [x, y, z] = convertToSphereCoords(
        [satellite.lon, satellite.lat],
        radius,
      );
      return {
        position: [x, y, z] as [number, number, number],
        ...satellite,
      };
    });
  }, [satellites, radius]);

  return (
    <group ref={groupRef} rotation-x={-Math.PI * 0.5}>
      {satellitePoints.map((satellite) => (
        <SatellitePoint
          key={satellite.id}
          satellite={satellite}
          position={satellite.position}
          pointSize={pointSize}
          color={color}
          onSatelliteClick={onSatelliteClick}
        />
      ))}
    </group>
  );
};

export default Satellite;
export type { SatellitePosition };
