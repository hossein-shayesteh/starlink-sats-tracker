import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ThreeEvent, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { SatellitePosition } from "@/src/features/eath/types";
import { convertToSphereCoords } from "@/src/features/eath/utils/geojsonUtils";

interface SatelliteProps {
  satellites: SatellitePosition[];
  radius?: number;
  pointSize?: number;
  color?: string | THREE.Color;
  hoverColor?: string | THREE.Color;
  selectedColor?: string | THREE.Color;
  selectedSatelliteId?: string | null;
  onSatelliteClick?: (satellite: SatellitePosition) => void;
}

const Satellite = ({
  satellites,
  radius = 3,
  pointSize = 0.02,
  color = "#ff4444",
  hoverColor = "#ffaa00",
  selectedColor = "#ff0000",
  selectedSatelliteId,
  onSatelliteClick,
}: SatelliteProps) => {
  const mouse = useRef(new THREE.Vector2());
  const colorRef = useRef(new THREE.Color());
  const glowRingRef = useRef<THREE.Mesh>(null);
  const selectionRadius = useRef(pointSize * 10);
  const tempObject = useRef(new THREE.Object3D());
  const raycaster = useRef(new THREE.Raycaster());
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const validSatellitesRef = useRef<SatellitePosition[]>([]);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);

  // Memoized colors
  const baseColor = useMemo(
    () => (typeof color === "string" ? new THREE.Color(color) : color),
    [color],
  );
  const satelliteHoverColor = useMemo(
    () => new THREE.Color(hoverColor),
    [hoverColor],
  );
  const satelliteSelectedColor = useMemo(
    () => new THREE.Color(selectedColor),
    [selectedColor],
  );

  // Filter and memoize valid satellites
  const validSatellites = useMemo(() => {
    return satellites.filter(
      (satellite) =>
        satellite?.lon != null &&
        satellite?.lat != null &&
        !isNaN(satellite.lat) &&
        !isNaN(satellite.lon) &&
        Math.abs(satellite.lat) <= 90 &&
        Math.abs(satellite.lon) <= 180,
    );
  }, [satellites]);

  useEffect(() => {
    validSatellitesRef.current = validSatellites;
  }, [validSatellites]);

  // Find selected satellite index
  const selectedIndex = useMemo(() => {
    if (!selectedSatelliteId) return -1;
    return validSatellites.findIndex((sat) => sat.id === selectedSatelliteId);
  }, [validSatellites, selectedSatelliteId]);

  // Memoized geometry and materials
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

  // Glow ring geometry and material for selected satellite
  const glowGeometry = useMemo(
    () => new THREE.RingGeometry(pointSize * 3, pointSize * 4, 16),
    [pointSize],
  );

  const glowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: satelliteSelectedColor,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      }),
    [satelliteSelectedColor],
  );

  // Initialize instance colors once
  useEffect(() => {
    if (!instancedMeshRef.current || validSatellites.length === 0) return;

    const instancedMesh = instancedMeshRef.current;
    const tempColor = new THREE.Color();

    for (let i = 0; i < validSatellites.length; i++) {
      tempColor.copy(baseColor);
      instancedMesh.setColorAt(i, tempColor);
    }

    instancedMesh.instanceColor!.needsUpdate = true;
  }, [validSatellites.length, baseColor]);

  // Animation frame updates
  useFrame((state) => {
    if (!instancedMeshRef.current || validSatellites.length === 0) return;

    const instancedMesh = instancedMeshRef.current;
    const time = state.clock.elapsedTime;

    // Update satellite positions and colors
    for (let i = 0; i < validSatellites.length; i++) {
      const satellite = validSatellites[i];
      const [x, y, z] = convertToSphereCoords(
        [satellite.lon, satellite.lat],
        radius,
      );

      // Update position
      tempObject.current.position.set(x, y, z);

      // Determine scale and color based on state
      const isHovered = i === hoveredIndex;
      const isSelected = i === selectedIndex;

      // Scale: selected > hovered > normal
      let scale = 1;
      if (isSelected) {
        scale = 1.8 + Math.sin(time * 4) * 0.2; // Pulsing animation for selected
      } else if (isHovered) {
        scale = 1.5;
      }

      tempObject.current.scale.setScalar(scale);
      tempObject.current.updateMatrix();
      instancedMesh.setMatrixAt(i, tempObject.current.matrix);

      // Update color
      if (isSelected) {
        colorRef.current.copy(satelliteSelectedColor);
        // Add slight brightness pulsing
        const pulse = 0.8 + Math.sin(time * 3) * 0.2;
        colorRef.current.multiplyScalar(pulse);
      } else if (isHovered) {
        colorRef.current.copy(satelliteHoverColor);
      } else {
        colorRef.current.copy(baseColor);
      }
      instancedMesh.setColorAt(i, colorRef.current);
    }

    // Update glow ring for selected satellite
    if (glowRingRef.current && selectedIndex >= 0) {
      const satellite = validSatellites[selectedIndex];
      const [x, y, z] = convertToSphereCoords(
        [satellite.lon, satellite.lat],
        radius,
      );

      glowRingRef.current.position.set(x, y, z);
      glowRingRef.current.lookAt(0, 0, 0); // Face the center (Earth)

      // Animate the glow ring
      const glowScale = 1 + Math.sin(time * 2) * 0.3;
      glowRingRef.current.scale.setScalar(glowScale);

      // Animate opacity
      if (glowRingRef.current.material instanceof THREE.MeshBasicMaterial) {
        glowRingRef.current.material.opacity = 0.4 + Math.sin(time * 3) * 0.2;
      }

      glowRingRef.current.visible = true;
    } else if (glowRingRef.current) {
      glowRingRef.current.visible = false;
    }

    // Mark for updates
    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }
  });

  // Optimized click handler
  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (
        !instancedMeshRef.current ||
        !onSatelliteClick ||
        validSatellites.length === 0
      )
        return;

      event.stopPropagation();

      // Prevent double clicks
      if (clickTimeout.current) return;
      clickTimeout.current = setTimeout(() => {
        clickTimeout.current = null;
      }, 300);

      let foundSatellite: SatellitePosition | null = null;

      // Try direct intersection first
      for (const intersection of event.intersections) {
        if (
          intersection.object === instancedMeshRef.current &&
          intersection.instanceId !== undefined
        ) {
          foundSatellite = validSatellitesRef.current[intersection.instanceId];
          break;
        }
      }

      if (!foundSatellite) {
        const canvas = event.nativeEvent.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();

        mouse.current.set(
          ((event.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1,
        );

        raycaster.current.setFromCamera(mouse.current, event.camera);
        raycaster.current.params.Mesh = { threshold: selectionRadius.current };

        const intersects = raycaster.current.intersectObject(
          instancedMeshRef.current,
          true,
        );

        if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
          foundSatellite = validSatellitesRef.current[intersects[0].instanceId];
        }
      }

      if (foundSatellite) {
        onSatelliteClick(foundSatellite);
      }
    },
    [onSatelliteClick, validSatellites.length],
  );

  // Optimized hover handler
  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!instancedMeshRef.current || validSatellites.length === 0) return;

      event.stopPropagation();

      const intersection = event.intersections.find(
        (int) =>
          int.object === instancedMeshRef.current &&
          int.instanceId !== undefined,
      );

      if (intersection?.instanceId !== undefined) {
        if (intersection.instanceId !== hoveredIndex) {
          setHoveredIndex(intersection.instanceId);
          document.body.style.cursor = "pointer";
        }
      } else if (hoveredIndex !== -1) {
        setHoveredIndex(-1);
        document.body.style.cursor = "auto";
      }
    },
    [hoveredIndex, validSatellites.length],
  );

  const handlePointerLeave = useCallback(() => {
    setHoveredIndex(-1);
    document.body.style.cursor = "auto";
  }, []);

  if (validSatellites.length === 0) {
    return null;
  }

  return (
    <group rotation-x={-Math.PI * 0.5}>
      {/* Main satellite instances */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[geometry, material, validSatellites.length]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        frustumCulled={false}
        renderOrder={1000}
      />

      {/* Glow ring for selected satellite */}
      <mesh
        ref={glowRingRef}
        geometry={glowGeometry}
        material={glowMaterial}
        visible={false}
      />
    </group>
  );
};

export default Satellite;
