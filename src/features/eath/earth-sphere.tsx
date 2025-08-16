"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";

import Orbit from "./components/orbit";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as satellite from "satellite.js";

import Earth from "@/src/features/eath/components/earth";
import Nebula from "@/src/features/eath/components/nebula";
import Satellite from "@/src/features/eath/components/satellite";
import SatelliteModal from "@/src/features/eath/components/satellite-modal";
import Starfield from "@/src/features/eath/components/starfield";
import { SatellitePosition } from "@/src/features/eath/types";

const StaticNebula = memo(Nebula);
const StaticStarfield = memo(Starfield);

interface SatelitesInfo {
  name: string;
  satrec: satellite.SatRec;
}

const EarthSphere = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [satellites, setSatellites] = useState<SatellitePosition[]>([]);
  const [satellitesInfo, setSatellitesInfo] = useState<SatelitesInfo[]>([]);
  const orbitInfo = useRef<SatelitesInfo | null>(null);
  const [selectedSatellite, setSelectedSatellite] =
    useState<SatellitePosition | null>(null);

  const lastUpdateRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  const positionsRef = useRef<SatellitePosition[]>([]);

  const loadTLEFromFile = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch TLE form celestrak
      // const response = await fetch("http://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle");

      // Fetch TLE data from file
      const response = await fetch("/TLE/starlink.txt");
      if (!response.ok) {
        throw new Error(`Failed to load TLE file: ${response.status}`);
      }

      const tleContent = await response.text();
      const tleLines = tleContent.trim().split("\n");
      const info: SatelitesInfo[] = [];

      // Process all TLE data
      for (let i = 0; i < tleLines.length; i += 3) {
        if (i + 2 >= tleLines.length) break;

        const name = tleLines[i].trim();
        const line1 = tleLines[i + 1];
        const line2 = tleLines[i + 2];

        try {
          const satrec = satellite.twoline2satrec(line1, line2);
          info.push({ name, satrec });
        } catch (error) {
          console.error(`Error parsing TLE for ${name}:`, error);
        }
      }

      setSatellitesInfo(info);
    } catch (error) {
      console.error("Error loading TLE data:", error);
    }
    setIsLoading(false);
  }, []);

  // Calculate satellite positions using satellite-js
  const updateSatellitePositions = useCallback(() => {
    if (satellitesInfo.length === 0) return;

    const currentTime = new Date();
    const positions: SatellitePosition[] = [];

    satellitesInfo.forEach(({ name, satrec }) => {
      try {
        const positionAndVelocity = satellite.propagate(satrec, currentTime);

        if (
          !positionAndVelocity?.position ||
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
            velocityEci.x ** 2 + velocityEci.y ** 2 + velocityEci.z ** 2,
          );
        }

        // Calculate orbital parameters
        const semiMajorAxis = satrec.a * 6378.135; // Earth radii to km
        const eccentricity = satrec.ecco;

        positions.push({
          lat: latitude,
          lon: longitude,
          altitude,
          velocity,
          name,
          id: satrec.satnum.toString(),
          timestamp: currentTime,
          orbitData: {
            inclination: satrec.inclo * (180 / Math.PI), // degrees
            eccentricity,
            semiMajorAxis,
            period: (2 * Math.PI) / satrec.no, // minutes
            perigee: satrec.argpo * (180 / Math.PI), // degrees
            apogee: semiMajorAxis * (1 + eccentricity),
            meanAnomaly: satrec.mo * (180 / Math.PI), // degrees
            meanMotion: satrec.no * (1440 / (2 * Math.PI)), // revolutions per day
          },
          status: "Active",
        });
      } catch (error) {
        console.error("Error calculating satellite position:", error);
      }
    });

    positionsRef.current = positions;
  }, [satellitesInfo]);

  // Animation loop for efficient updates
  const animate = useCallback(() => {
    const now = Date.now();

    // Only update positions every 500ms (2 FPS)
    if (now - lastUpdateRef.current > 500) {
      updateSatellitePositions();
      lastUpdateRef.current = now;
    }

    // Update visible satellites at 60 FPS
    setSatellites((prev) => {
      return prev.map((sat, i) => {
        const newSat = positionsRef.current[i];
        if (!newSat) return sat;

        // Simple interpolation for smooth movement
        const factor = 1 / 60;
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
    if (satellitesInfo.length > 0) {
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
  }, [satellitesInfo, animate, updateSatellitePositions]);

  const handleSatelliteClick = (satellite: SatellitePosition) => {
    setSelectedSatellite(satellite);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSatellite(null);
    orbitInfo.current = null;
  };

  const handleShowOrbit = (satelliteId: string) => {
    const satellite = satellitesInfo.find(
      ({ satrec }) => satrec.satnum.toString() === satelliteId,
    );

    if (satellite) {
      orbitInfo.current = satellite;
    }
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

          {/* Satellites */}
          {satellites.length > 0 && !isLoading && (
            <Satellite
              satellites={satellites}
              radius={2.01}
              pointSize={0.002}
              color="#00ff88"
              selectedSatelliteId={selectedSatellite?.id || null}
              onSatelliteClick={handleSatelliteClick}
            />
          )}

          {/* Static background elements */}
          <StaticStarfield />
          <StaticNebula />

          <Orbit
            date={orbitInfo.current}
            radius={2.01}
            color="#69b3a6"
            opacity={0.9}
            width={10}
          />

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
