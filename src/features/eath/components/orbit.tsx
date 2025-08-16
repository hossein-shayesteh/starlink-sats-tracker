import React, { memo, useMemo } from "react";

import { Line } from "@react-three/drei";
import * as satellite from "satellite.js";
import * as THREE from "three";

interface OrbitProps {
  date: {
    name: string;
    satrec: satellite.SatRec;
  } | null;
  radius?: number;
  color?: THREE.ColorRepresentation;
  opacity?: number;
  resolution?: number;
  width?: number;
}

const Orbit = memo(
  ({
    date,
    radius = 2,
    color = "#00ff88",
    opacity = 0.7,
    width,
    resolution = 100,
  }: OrbitProps) => {
    const points = useMemo(() => {
      if (!date) return [];
      const satrec = date.satrec;
      const points: THREE.Vector3[] = [];
      const period = (2 * Math.PI) / satrec.no; // Period in minutes

      for (let i = 0; i <= resolution; i++) {
        const timeOffset = (i / resolution) * period * 60;
        const time = new Date(Date.now() + timeOffset * 1000);

        const positionAndVelocity = satellite.propagate(satrec, time);
        if (
          !positionAndVelocity?.position ||
          typeof positionAndVelocity?.position === "boolean"
        ) {
          continue;
        }

        const { position } = positionAndVelocity;
        const gmst = satellite.gstime(time);
        const positionGd = satellite.eciToGeodetic(position, gmst);

        const longitude = positionGd.longitude * (180 / Math.PI);
        const latitude = positionGd.latitude * (180 / Math.PI);

        // Convert to Cartesian coordinates with fixed radius
        const phi = (90 - latitude) * (Math.PI / 180);
        const theta = (longitude + 180) * (Math.PI / 180);
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        points.push(new THREE.Vector3(x, y, z));
      }
      return points;
    }, [date, radius, resolution]);

    return points.length > 0 ? (
      <Line
        points={points}
        color={color}
        transparent
        linewidth={width}
        opacity={opacity}
        lineWidth={1}
      />
    ) : null;
  },
);

Orbit.displayName = "Orbit";
export default Orbit;
