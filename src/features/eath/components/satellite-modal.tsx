import React from "react";

import { Clock, Globe, Satellite, X, Zap } from "lucide-react";

import { SatellitePosition } from "@/src/features/eath/components/satellite";

interface SatelliteModalProps {
  satellite: SatellitePosition | null;
  isOpen: boolean;
  onClose: () => void;
  onShowOrbit?: (satelliteId: string) => void;
}

const SatelliteModal = ({
  satellite,
  isOpen,
  onClose,
  onShowOrbit,
}: SatelliteModalProps) => {
  if (!isOpen || !satellite) return null;

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="m-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-lg border-b bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <Satellite size={32} />
            <div>
              <h2 className="text-2xl font-bold">{satellite.name}</h2>
              <p className="text-blue-100">ID: {satellite.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white transition-colors hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Real-time Status */}
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="mb-2 flex items-center space-x-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
              <h3 className="text-lg font-semibold text-green-800">
                Live Tracking
              </h3>
            </div>
            <p className="text-sm text-green-700">
              Last updated: {satellite.timestamp?.toLocaleString()}
            </p>
          </div>

          {/* Current Position */}
          <div className="mb-6">
            <div className="mb-3 flex items-center space-x-2">
              <Globe className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">
                Current Position
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-600">Latitude</p>
                <p className="font-mono text-xl text-blue-800">
                  {formatNumber(satellite.lat, 4)}°
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-600">Longitude</p>
                <p className="font-mono text-xl text-blue-800">
                  {formatNumber(satellite.lon, 4)}°
                </p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <p className="text-sm font-medium text-purple-600">Altitude</p>
                <p className="font-mono text-xl text-purple-800">
                  {formatNumber(satellite.altitude || 0)} km
                </p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <p className="text-sm font-medium text-purple-600">Velocity</p>
                <p className="font-mono text-xl text-purple-800">
                  {formatNumber(satellite.velocity || 0)} km/s
                </p>
              </div>
            </div>
          </div>

          {/* Orbital Parameters */}
          <div className="mb-6">
            <div className="mb-3 flex items-center space-x-2">
              <Zap className="text-orange-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">
                Orbital Elements
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-medium text-orange-600">
                  Inclination
                </p>
                <p className="font-mono text-lg text-orange-800">
                  {formatNumber(satellite.orbitData?.inclination || 0)}°
                </p>
                <p className="mt-1 text-xs text-orange-600">
                  Orbit angle to equator
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-medium text-orange-600">
                  Eccentricity
                </p>
                <p className="font-mono text-lg text-orange-800">
                  {formatNumber(satellite.orbitData?.eccentricity || 0, 6)}
                </p>
                <p className="mt-1 text-xs text-orange-600">
                  Orbit shape (0 = circular)
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-medium text-orange-600">
                  Semi-Major Axis
                </p>
                <p className="font-mono text-lg text-orange-800">
                  {formatNumber(satellite.orbitData?.semiMajorAxis || 0)} km
                </p>
                <p className="mt-1 text-xs text-orange-600">
                  Average orbital radius
                </p>
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                <p className="text-sm font-medium text-teal-600">Apogee</p>
                <p className="font-mono text-lg text-teal-800">
                  {formatNumber(satellite.orbitData?.apogee || 0)} km
                </p>
                <p className="mt-1 text-xs text-teal-600">
                  Farthest point from Earth
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-6">
            <div className="mb-3 flex items-center space-x-2">
              <Clock className="text-gray-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">
                Mission Information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      satellite.status === "Active"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <p className="text-lg text-gray-800">{satellite.status}</p>
                </div>
              </div>
              {satellite.launchDate && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-600">
                    Launch Year
                  </p>
                  <p className="text-lg text-gray-800">
                    {satellite.launchDate}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Orbit Statistics */}
          {/* Orbit Statistics */}
          <div className="rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
            <h4 className="mb-2 font-semibold text-indigo-800">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              <div>
                <p className="text-2xl font-bold text-indigo-600">
                  {formatNumber(satellite.orbitData?.meanMotion ?? 0, 2)}
                </p>
                <p className="text-xs text-indigo-600">Revolutions/day</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {satellite.orbitData?.period
                    ? Math.round(1440 / satellite.orbitData.period)
                    : 0}
                </p>
                <p className="text-xs text-purple-600">Orbits/day</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-600">
                  {formatNumber((satellite.velocity ?? 0) * 3600, 0)}
                </p>
                <p className="text-xs text-pink-600">km/hour</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {satellite.altitude !== undefined
                    ? formatNumber((satellite.altitude / 6371) * 100, 1)
                    : 0}
                  %
                </p>
                <p className="text-xs text-red-600">of Earth radius</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between rounded-b-lg border-t bg-gray-50 p-6">
          <div className="text-sm text-gray-600">
            TLE data provides real-time orbital tracking
          </div>
          <div className="flex space-x-3">
            {onShowOrbit && (
              <button
                onClick={() => onShowOrbit(satellite.id)}
                className="rounded bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
              >
                Show Orbit
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteModal;
