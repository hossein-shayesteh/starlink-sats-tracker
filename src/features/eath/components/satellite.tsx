import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ThreeEvent, useFrame } from "@react-three/fiber";
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
    meanAnomaly: number;
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
  selectedOrbitId?: string | null;
}

const Satellite = ({
  satellites,
  radius = 3,
  pointSize = 0.02,
  color = "#ff4444",
  onSatelliteClick,
  selectedOrbitId,
}: SatelliteProps) => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const tempObject = useRef(new THREE.Object3D());
  const colorAttributeRef = useRef<THREE.InstancedBufferAttribute | null>(null);

  // Convert color to THREE.Color if it's a string
  const baseColor = useMemo(() => {
    return typeof color === "string" ? new THREE.Color(color) : color;
  }, [color]);

  const hoverColor = useMemo(() => new THREE.Color("#ffaa00"), []);
  const selectedColor = useMemo(() => new THREE.Color("#ff5500"), []);

  // Filter valid satellites once and reuse
  const validSatellites = useMemo(() => {
    return satellites.filter(
      (satellite) =>
        satellite &&
        typeof satellite.lon === "number" &&
        typeof satellite.lat === "number" &&
        !isNaN(satellite.lat) &&
        !isNaN(satellite.lon),
    );
  }, [satellites]);

  // Memoize satellite positions and setup instanced mesh
  const colorArray = useMemo(() => {
    const colors = new Float32Array(validSatellites.length * 3);

    validSatellites.forEach((satellite, index) => {
      // Set base color for each instance
      baseColor.toArray(colors, index * 3);
    });

    return colors;
  }, [validSatellites, baseColor]);

  // Create geometry and material once
  const geometry = useMemo(
    () => new THREE.SphereGeometry(pointSize, 8, 6),
    [pointSize],
  );

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.9,
      }),
    [],
  );

  // Initialize color attribute
  useEffect(() => {
    if (instancedMeshRef.current && validSatellites.length > 0) {
      const instancedMesh = instancedMeshRef.current;

      // Create or update the instanceColor attribute
      if (!instancedMesh.geometry.attributes.instanceColor) {
        colorAttributeRef.current = new THREE.InstancedBufferAttribute(
          colorArray,
          3,
          false,
        );
        instancedMesh.geometry.setAttribute(
          "instanceColor",
          colorAttributeRef.current,
        );
      } else {
        colorAttributeRef.current = instancedMesh.geometry.attributes
          .instanceColor as THREE.InstancedBufferAttribute;
        colorAttributeRef.current.set(colorArray);
        colorAttributeRef.current.needsUpdate = true;
      }
    }
  }, [colorArray, validSatellites]);

  // Update instance matrices and colors
  useFrame(() => {
    if (
      !instancedMeshRef.current ||
      validSatellites.length === 0 ||
      !colorAttributeRef.current
    )
      return;

    const instancedMesh = instancedMeshRef.current;

    validSatellites.forEach((satellite, index) => {
      const [x, y, z] = convertToSphereCoords(
        [satellite.lon, satellite.lat],
        radius,
      );

      tempObject.current.position.set(x, y, z);

      // Scale up selected satellites
      const scale = selectedOrbitId === satellite.id ? 1.5 : 1;
      tempObject.current.scale.setScalar(scale);

      tempObject.current.updateMatrix();
      instancedMesh.setMatrixAt(index, tempObject.current.matrix);

      // Update colors based on hover and selection state
      if (index === hoveredIndex) {
        hoverColor.toArray(
          colorAttributeRef.current!.array as Float32Array,
          index * 3,
        );
      } else if (selectedOrbitId === satellite.id) {
        selectedColor.toArray(
          colorAttributeRef.current!.array as Float32Array,
          index * 3,
        );
      } else {
        baseColor.toArray(
          colorAttributeRef.current!.array as Float32Array,
          index * 3,
        );
      }
    });

    instancedMesh.instanceMatrix.needsUpdate = true;

    if (colorAttributeRef.current) {
      colorAttributeRef.current.needsUpdate = true;
    }
  });

  // Fixed click handler with proper mouse coordinate calculation
  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (
        !instancedMeshRef.current ||
        !onSatelliteClick ||
        validSatellites.length === 0
      )
        return;

      event.stopPropagation();

      // Get the canvas element and its bounding rectangle
      const canvas = event.nativeEvent.target as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();

      // Calculate normalized device coordinates (-1 to 1)
      mouse.current.x =
        ((event.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y =
        -((event.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1;

      // Cast ray and find intersections
      raycaster.current.setFromCamera(mouse.current, event.camera);

      // Increase raycaster threshold for better detection of small objects
      raycaster.current.params.Points!.threshold = pointSize * 2;

      const intersects = raycaster.current.intersectObject(
        instancedMeshRef.current,
      );

      if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
        const instanceId = intersects[0].instanceId;
        const satellite = validSatellites[instanceId];
        if (satellite) {
          onSatelliteClick(satellite);
        }
      }
    },
    [validSatellites, onSatelliteClick, pointSize],
  );

  // Fixed hover handler with proper mouse coordinate calculation
  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!instancedMeshRef.current || validSatellites.length === 0) return;

      event.stopPropagation();

      // Get the canvas element and its bounding rectangle
      const canvas = event.nativeEvent.target as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();

      // Calculate normalized device coordinates (-1 to 1)
      mouse.current.x =
        ((event.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y =
        -((event.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1;

      // Cast ray and find intersections
      raycaster.current.setFromCamera(mouse.current, event.camera);
      raycaster.current.params.Points!.threshold = pointSize * 2;

      const intersects = raycaster.current.intersectObject(
        instancedMeshRef.current,
      );

      if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
        const newHoveredIndex = intersects[0].instanceId;
        if (newHoveredIndex !== hoveredIndex) {
          setHoveredIndex(newHoveredIndex);
          document.body.style.cursor = "pointer";
        }
      } else {
        if (hoveredIndex !== -1) {
          setHoveredIndex(-1);
          document.body.style.cursor = "auto";
        }
      }
    },
    [hoveredIndex, validSatellites.length, pointSize],
  );

  const handlePointerLeave = useCallback(() => {
    setHoveredIndex(-1);
    document.body.style.cursor = "auto";
  }, []);

  // Don't render if no valid satellites
  if (validSatellites.length === 0) {
    return null;
  }

  return (
    <group rotation-x={-Math.PI * 0.5}>
      <instancedMesh
        ref={instancedMeshRef}
        args={[geometry, material, validSatellites.length]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        frustumCulled={false}
      />
    </group>
  );
};

export default Satellite;
export type { SatellitePosition };
