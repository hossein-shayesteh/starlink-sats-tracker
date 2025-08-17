import React, { useEffect, useRef, useState } from "react";

import { Line } from "@react-three/drei";
import * as THREE from "three";

import { GeoJSONFeatureCollection, Lines } from "@/src/features/eath/types";
import {
  convertToSphereCoords,
  createCoordinateArray,
  createGeometryArray,
} from "@/src/features/eath/utils/geojsonUtils";

const CountryLines = ({
  geoJsonData,
  radius = 2,
  fill,
}: {
  geoJsonData: GeoJSONFeatureCollection;
  radius: number;
  fill: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [lines, setLines] = useState<Lines[]>([]);

  useEffect(() => {
    if (!geoJsonData) return;

    const newLines = [];
    const json_geom = createGeometryArray(geoJsonData);

    for (let geom_num = 0; geom_num < json_geom.length; geom_num++) {
      const geom = json_geom[geom_num];
      let coordinate_array = [];

      if (geom.type === "Polygon") {
        for (
          let segment_num = 0;
          segment_num < geom.coordinates.length;
          segment_num++
        ) {
          coordinate_array = createCoordinateArray(
            geom.coordinates[segment_num],
          );
          const points = coordinate_array.map((coord) =>
            convertToSphereCoords(coord, radius),
          );
          newLines.push({ points, id: `polygon-${geom_num}-${segment_num}` });
        }
      } else if (geom.type === "MultiPolygon") {
        for (
          let polygon_num = 0;
          polygon_num < geom.coordinates.length;
          polygon_num++
        ) {
          for (
            let segment_num = 0;
            segment_num < geom.coordinates[polygon_num].length;
            segment_num++
          ) {
            coordinate_array = createCoordinateArray(
              geom.coordinates[polygon_num][segment_num],
            );
            const points = coordinate_array.map((coord) =>
              convertToSphereCoords(coord, radius),
            );
            newLines.push({
              points,
              id: `multipoly-${geom_num}-${polygon_num}-${segment_num}`,
            });
          }
        }
      }
    }

    setLines(newLines);
  }, [geoJsonData, radius]);

  return (
    <group ref={groupRef} rotation-x={-Math.PI * 0.5}>
      {lines.map((line) => {
        if (line.points.length < 2) return null;

        return (
          <Line
            key={line.id}
            points={line.points} // Now strictly [number,number,number][]
            color={new THREE.Color().setHSL(0.3 + Math.random() * 0.2, 1, 1)}
            transparent
            opacity={fill ? 0.3 : 0.8}
          />
        );
      })}
    </group>
  );
};

const Earth = ({ fill }: { fill: boolean }) => {
  const [geoJsonData, setGeoJsonData] =
    useState<GeoJSONFeatureCollection | null>(null);

  useEffect(() => {
    // In your real implementation, replace this with:
    fetch("/geojson/ne_110m_admin_0_countries.json")
      .then((response) => response.json())
      .then((data) => setGeoJsonData(data));
  }, []);

  return (
    <>
      {fill ? (
        <mesh>
          <sphereGeometry args={[2, 32, 32]} />
          <meshBasicMaterial color={0x2c3e50} transparent={true} opacity={1} />
        </mesh>
      ) : (
        <mesh>
          <sphereGeometry args={[2.00002, 32, 32]} />
          <meshBasicMaterial
            color={0xffffff}
            transparent={true}
            opacity={0.1}
            wireframe={true}
          />
        </mesh>
      )}

      {/* Country lines */}
      {geoJsonData && (
        <CountryLines geoJsonData={geoJsonData} radius={2.00002} fill={fill} />
      )}
    </>
  );
};

export default Earth;
