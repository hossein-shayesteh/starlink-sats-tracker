import React, { useRef } from "react";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const getPoints = ({ numStars = 500 }: { numStars: number }) => {
  const randomSpherePoint = () => {
    const radius = Math.random() * 25 + 500;
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    const rate = Math.random();
    const prob = Math.random();
    const light = Math.random() * 0.8;

    const update = (t: number) => {
      return prob > 0.8 ? light + Math.sin(t * rate) : light;
    };

    return {
      pos: new THREE.Vector3(x, y, z),
      update,
      minDist: radius,
    };
  };

  let col;
  const vert = [];
  const colors = [];
  const positions: {
    pos: THREE.Vector3;
    update: (t: number) => number;
    minDist: number;
  }[] = [];

  for (let i = 0; i < numStars; i += 1) {
    const p = randomSpherePoint();
    const { pos } = p;

    positions.push(p);
    col = new THREE.Color().setHSL(0.2, 0.2, Math.random());
    vert.push(pos.x, pos.y, pos.z);
    colors.push(col.r, col.g, col.b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vert, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    map: new THREE.TextureLoader().load("./circle.png"),
  });

  const points = new THREE.Points(geo, mat);
  const update = (t: number) => {
    let col;
    const colors = [];
    for (let i = 0; i < numStars; i += 1) {
      const p = positions[i];
      const { update } = p;
      const bright = update(t);
      col = new THREE.Color().setHSL(0.6, 0.2, bright);
      colors.push(col.r, col.g, col.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.attributes.color.needsUpdate = true;
  };
  points.userData = { update };
  return points;
};

const Starfield = () => {
  const ref = useRef<THREE.Points>(null!);
  const points = getPoints({ numStars: 3000 });

  useFrame((state) => {
    const { clock } = state;
    if (ref.current?.userData?.update) {
      ref.current.userData.update(clock.elapsedTime);
    }
  });
  return <primitive object={points} ref={ref} />;
};

export default Starfield;
