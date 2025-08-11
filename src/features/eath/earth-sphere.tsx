"use client";

import { useEffect, useState } from "react";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import Earth from "@/src/features/eath/components/earth";
import Nebula from "@/src/features/eath/components/nebula";
import Satellite from "@/src/features/eath/components/satellite";
import Starfield from "@/src/features/eath/components/starfield";

interface SatelliteData {
  lat: number;
  lon: number;
  name?: string;
  id: string;
}

const EarthSphere = () => {
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);

  useEffect(() => {
    const exampleSatellites: SatelliteData[] = [
      { lat: 40.7128, lon: -74.006, name: "New York", id: "sat1" },
      { lat: 51.5074, lon: -0.1278, name: "London", id: "sat2" },
      { lat: 35.6762, lon: 139.6503, name: "Tokyo", id: "sat3" },
      { lat: -33.8688, lon: 151.2093, name: "Sydney", id: "sat4" },
      { lat: 55.7558, lon: 37.6173, name: "Moscow", id: "sat5" },
    ];

    setSatellites(exampleSatellites);
  }, []);

  return (
    <div className={"h-screen w-screen"}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true }}
      >
        {/* Fog */}
        <fog attach="fog" args={[0x000000, 1, 100]} />

        {/* Earth with satellites */}
        <Earth fill={true} />

        {/* Starfield */}
        <Starfield />

        {/* Nebula */}
        <Nebula />

        {satellites.length > 0 && (
          <Satellite
            satellites={satellites}
            radius={2.1724}
            pointSize={0.005}
            color="#fff"
          />
        )}

        {/* Controls */}
        <OrbitControls
          minDistance={2.1}
          maxDistance={10}
          rotateSpeed={0.1}
          enableDamping={true}
        />
      </Canvas>
    </div>
  );
};

export default EarthSphere;
