import React, { useMemo, useRef } from "react";

import * as THREE from "three";

import { convertToSphereCoords } from "@/src/features/eath/utils/geojsonUtils";

interface SatellitePosition {
  lat: number;
  lon: number;
  name?: string;
  id: string;
}

interface SatelliteProps {
  satellites: SatellitePosition[];
  radius?: number;
  pointSize?: number;
  color?: string | THREE.Color;
}

const Satellite = ({
  satellites,
  radius = 3,
  pointSize = 0.02,
  color = "#ff4444",
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
        <mesh key={satellite.id} position={satellite.position}>
          <sphereGeometry args={[pointSize, 16, 16]} />
          <meshBasicMaterial color={color} transparent={true} opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
};

export default Satellite;
