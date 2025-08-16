import React, { memo, useMemo } from "react";

import { Line } from "@react-three/drei";
import * as satellite from "satellite.js";
import * as THREE from "three";

import { convertToSphereCoords } from "@/src/features/eath/utils/geojsonUtils";

interface OrbitProps {
  date: {
    name: string;
    satrec: satellite.SatRec;
  } | null;
  radius?: number;
  color?: THREE.ColorRepresentation;
  opacity?: number;
  width?: number;
}

const Orbit = memo(
  ({
    date,
    radius = 2,
    color = "#00ff88",
    opacity = 0.7,
    width = 1,
  }: OrbitProps) => {
    const points = useMemo(() => {
      if (!date) return [];

      const { satrec } = date;
      const points: THREE.Vector3[] = [];

      // Calculate orbital period in minutes
      const period = (2 * Math.PI) / satrec.no; // minutes
      const baseTime = new Date();

      const numPoints = 100;

      for (let i = 0; i <= numPoints; i++) {
        try {
          // Calculate time offset in minutes, then convert to milliseconds
          const timeOffsetMs = (i / 100) * period * 60 * 1000;
          const time = new Date(baseTime.getTime() + timeOffsetMs);

          const positionAndVelocity = satellite.propagate(satrec, time);

          if (
            !positionAndVelocity?.position ||
            typeof positionAndVelocity.position === "boolean"
          ) {
            continue;
          }

          const positionEci = positionAndVelocity.position;
          const gmst = satellite.gstime(time);
          const positionGd = satellite.eciToGeodetic(positionEci, gmst);

          // Convert radians to degrees
          const longitude = positionGd.longitude * (180 / Math.PI);
          const latitude = positionGd.latitude * (180 / Math.PI);

          // Validate coordinates
          if (
            isNaN(longitude) ||
            isNaN(latitude) ||
            Math.abs(latitude) > 90 ||
            Math.abs(longitude) > 180
          ) {
            continue;
          }

          const [x, y, z] = convertToSphereCoords(
            [longitude, latitude],
            radius,
          );

          // Validate the converted coordinates
          if (isNaN(x) || isNaN(y) || isNaN(z)) {
            continue;
          }

          points.push(new THREE.Vector3(x, y, z));
        } catch (error) {
          console.warn(`Error calculating orbit point ${i}:`, error);
          continue;
        }
      }

      // Ensure we have enough points for a meaningful orbit
      if (points.length < 10) {
        console.warn("Insufficient orbit points generated:", points.length);
        return [];
      }

      return points;
    }, [date, radius]);

    if (!date || points.length === 0) {
      return null;
    }

    return (
      <group rotation-x={-Math.PI * 0.5}>
        <Line
          points={points}
          color={color}
          transparent
          opacity={opacity}
          lineWidth={width}
        />
      </group>
    );
  },
);

Orbit.displayName = "Orbit";
export default Orbit;
