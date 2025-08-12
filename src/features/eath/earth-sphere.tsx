"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as satellite from "satellite.js";

import Earth from "@/src/features/eath/components/earth";
import Nebula from "@/src/features/eath/components/nebula";
import Satellite, {
  SatellitePosition,
} from "@/src/features/eath/components/satellite";
import SatelliteModal from "@/src/features/eath/components/satellite-modal";
import Starfield from "@/src/features/eath/components/starfield";

const StaticNebula = memo(Nebula);
const StaticStarfield = memo(Starfield);

const EarthSphere = () => {
  const [satellites, setSatellites] = useState<SatellitePosition[]>([]);
  const [satelliteRecords, setSatelliteRecords] = useState<satellite.SatRec[]>(
    [],
  );
  const [selectedSatellite, setSelectedSatellite] =
    useState<SatellitePosition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const positionsRef = useRef<SatellitePosition[]>([]);
  const animationRef = useRef<number | null>(null);

  // Load TLE data from file
  const loadTLEFromFile = useCallback(async () => {
    try {
      const response = await fetch("/TLE/starlink.txt");
      if (!response.ok) {
        throw new Error(`Failed to load TLE file: ${response.status}`);
      }

      const tleContent = await response.text();
      const tleLines = tleContent.trim().split("\n");
      const records: satellite.SatRec[] = [];

      // Process all TLE data
      for (let i = 0; i < tleLines.length; i += 3) {
        if (i + 2 >= tleLines.length) break;

        const name = tleLines[i].trim();
        const line1 = tleLines[i + 1];
        const line2 = tleLines[i + 2];

        try {
          const satrec = satellite.twoline2satrec(line1, line2);
          records.push(satrec);
        } catch (error) {
          console.error(`Error parsing TLE for ${name}:`, error);
        }
      }

      setSatelliteRecords(records);
    } catch (error) {
      console.error("Error loading TLE data:", error);
    }
  }, []);

  // Calculate satellite positions using satellite-js
  const updateSatellitePositions = useCallback(() => {
    if (satelliteRecords.length === 0) return;

    const currentTime = new Date();
    const positions: SatellitePosition[] = [];

    // Limit to first 100 satellites for performance
    const limitedRecords = satelliteRecords;

    limitedRecords.forEach((satrec) => {
      try {
        const positionAndVelocity = satellite.propagate(satrec, currentTime);

        if (
          !positionAndVelocity ||
          !positionAndVelocity.position ||
          typeof positionAndVelocity.position === "boolean"
        ) {
          return;
        }

        const positionEci = positionAndVelocity.position;
        const gmst = satellite.gstime(currentTime);
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);

        // Convert radians to degrees
        const longitude = positionGd.longitude * (180 / Math.PI);
        const latitude = positionGd.latitude * (180 / Math.PI);
        const altitude = positionGd.height;

        // Validate coordinates
        if (isNaN(longitude) || isNaN(latitude) || isNaN(altitude)) {
          return;
        }

        // Calculate velocity magnitude
        let velocity = 0;
        if (positionAndVelocity.velocity) {
          const velocityEci = positionAndVelocity.velocity;
          velocity = Math.sqrt(
            velocityEci.x * velocityEci.x +
              velocityEci.y * velocityEci.y +
              velocityEci.z * velocityEci.z,
          );
        }

        positions.push({
          lat: latitude,
          lon: longitude,
          altitude,
          velocity,
          name: `STARLINK-${satrec.satnum.toString()}`,
          id: satrec.satnum.toString(),
          timestamp: currentTime,
          orbitData: {
            inclination: satrec.inclo * (180 / Math.PI),
            eccentricity: satrec.ecco,
            semiMajorAxis: 0,
            period: 0,
            perigee: 0,
            apogee: 0,
            meanMotion: 0,
          },
          status: "Active",
        });
      } catch (error) {
        console.error("Error calculating satellite position:", error);
      }
    });

    positionsRef.current = positions;
  }, [satelliteRecords]);

  // Animation loop for efficient updates
  const animate = useCallback(() => {
    const now = Date.now();

    // Only update positions every 500ms (2 FPS)
    if (now - lastUpdateRef.current > 500) {
      updateSatellitePositions();
      lastUpdateRef.current = now;
    }

    // Update visible satellites at 30 FPS
    setSatellites((prev) => {
      return prev.map((sat, i) => {
        const newSat = positionsRef.current[i];
        if (!newSat) return sat;

        // Simple interpolation for smooth movement
        const factor = 0.15;
        return {
          ...sat,
          lat: sat.lat + (newSat.lat - sat.lat) * factor,
          lon: sat.lon + (newSat.lon - sat.lon) * factor,
          altitude: sat.altitude! + (newSat.altitude! - sat.altitude!) * factor,
        };
      });
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [updateSatellitePositions]);

  // Load TLE data on component mount
  useEffect(() => {
    loadTLEFromFile();
  }, [loadTLEFromFile]);

  // Start animation when satellite records are loaded
  useEffect(() => {
    if (satelliteRecords.length > 0) {
      // Initialize positions
      updateSatellitePositions();
      setSatellites(positionsRef.current);

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [satelliteRecords, animate, updateSatellitePositions]);

  const handleSatelliteClick = (satellite: SatellitePosition) => {
    setSelectedSatellite(satellite);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSatellite(null);
  };

  const handleShowOrbit = (_satelliteId: string) => {
    // TODO: implement orbit visualization here
  };

  return (
    <>
      {/* Satellite Count Display */}
      <div className="bg-opacity-90 absolute top-4 left-4 z-10 rounded-lg bg-black p-3 text-white">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-400">
            {satellites.length}
          </div>
          <div className="text-xs text-gray-300">Active Satellites</div>
          <div className="mt-1 text-xs text-gray-400">
            Click to view details
          </div>
        </div>
      </div>

      {/* 3D Scene */}
      <div className="h-screen w-screen">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{
            antialias: false,
            powerPreference: "high-performance",
          }}
        >
          {/* Fog */}
          {/*<fog attach="fog" args={[0x000000, 1, 100]} />*/}

          {/* Earth */}
          <Earth fill={true} />

          {/* Satellites - Only render if positions are valid */}
          {satellites.length > 0 && (
            <Satellite
              satellites={satellites}
              radius={2.01}
              pointSize={0.001}
              color="#00ff88"
              onSatelliteClick={handleSatelliteClick}
            />
          )}

          {/* Static background elements */}
          <StaticStarfield />
          <StaticNebula />

          {/* Controls */}
          <OrbitControls
            minDistance={2.12}
            maxDistance={10}
            rotateSpeed={0.08}
            enableDamping={true}
            dampingFactor={0.03}
            enablePan={false}
            maxPolarAngle={Math.PI}
            minPolarAngle={0}
          />
        </Canvas>
      </div>

      {/* Satellite Modal */}
      <SatelliteModal
        satellite={selectedSatellite}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onShowOrbit={handleShowOrbit}
      />
    </>
  );
};

export default EarthSphere;
