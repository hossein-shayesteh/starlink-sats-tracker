"use client";

import React, { useRef } from "react";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import EarthMaterial from "@/src/features/components/earth-material";
import Nebula from "@/src/features/components/nebula";
import Starfield from "@/src/features/components/starfield";

const sunDirection = new THREE.Vector3(-2, 0.5, 1.5);

const Earth = () => {
  const ref = useRef<THREE.Mesh>(null!);
  const axialTilt = (23.4 * Math.PI) / 180;

  useFrame(() => {
    ref.current.rotation.y += 1 / (24 * 60 * 60);
  });

  return (
    <group rotation-z={axialTilt}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[2, 64]} />
        <EarthMaterial sunDirection={sunDirection} />
      </mesh>
    </group>
  );
};

const EarthSphere = () => {
  const { x, y, z } = sunDirection;
  return (
    <Canvas
      camera={{ position: [0, 0.1, 5] }}
      gl={{ toneMapping: THREE.NoToneMapping }}
    >
      <Earth />
      <hemisphereLight args={[0xffffff, 0x000000, 3.0]} />
      <directionalLight position={[x, y, z]} />
      <Starfield />
      <Nebula />
      <OrbitControls />
    </Canvas>
  );
};

export default EarthSphere;
