"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import Earth from "@/src/features/eath/components/earth";
import Nebula from "@/src/features/eath/components/nebula";
import Starfield from "@/src/features/eath/components/starfield";

const EarthSphere = () => {
  return (
    <div className={"h-screen w-screen"}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true }}
      >
        {/* Fog */}
        <fog attach="fog" args={[0x000000, 1, 100]} />

        {/* Earth */}
        <Earth fill={true} />

        {/* Starfield */}
        <Starfield />

        {/* Nebula */}
        <Nebula />

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
