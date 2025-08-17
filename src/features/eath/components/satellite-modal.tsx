import { Globe, Rotate3D, Satellite, X } from "lucide-react";

import { SatellitePosition } from "@/src/features/eath/types";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";

interface SatelliteModalProps {
  satellite: SatellitePosition | null;
  isOpen: boolean;
  onClose: () => void;
}

const SatelliteModal = ({
  satellite,
  isOpen,
  onClose,
}: SatelliteModalProps) => {
  if (!isOpen || !satellite) return null;

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  return (
    <Card className="fixed inset-y-5 right-5 z-50 w-full max-w-md overflow-y-auto border-none p-0">
      {/* Header */}
      <CardHeader className="sticky top-0 flex items-center justify-between border-b bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex items-center space-x-2">
          <Satellite size={24} />
          <div>
            <h2 className="text-xl font-bold">{satellite.name}</h2>
            <div className="text-sm">NORAD ID: {satellite.id}</div>
          </div>
        </div>
        <Button
          onClick={onClose}
          variant={"ghost"}
          className="cursor-pointer bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Status Bar */}
        <div className="mb-4 flex items-center space-x-2 rounded-lg bg-green-50 p-3">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-green-800">
            Live Tracking - {satellite.timestamp?.toLocaleTimeString()}
          </span>
        </div>

        {/* Position Section */}
        <div className="mb-4">
          <div className="mb-2 flex items-center space-x-2">
            <Globe className="text-blue-600" size={18} />
            <h3 className="font-semibold text-gray-800">Position</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2 rounded border border-blue-100 bg-blue-50 p-2">
              <p className="text-xs font-medium text-blue-600">Latitude</p>
              <p className="font-mono text-sm text-blue-800">
                {formatNumber(satellite.lat, 4)}°
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded border border-blue-100 bg-blue-50 p-2">
              <p className="text-xs font-medium text-blue-600">Longitude</p>
              <p className="font-mono text-sm text-blue-800">
                {formatNumber(satellite.lon, 4)}°
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded border border-purple-100 bg-purple-50 p-2">
              <p className="text-xs font-medium text-purple-600">Altitude</p>
              <p className="font-mono text-sm text-purple-800">
                {formatNumber(satellite.altitude || 0)} km
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded border border-purple-100 bg-purple-50 p-2">
              <p className="text-xs font-medium text-purple-600">Velocity</p>
              <p className="font-mono text-sm text-purple-800">
                {formatNumber(satellite.velocity || 0)} km/s
              </p>
            </div>
          </div>
        </div>

        {/* Orbit Parameters */}
        <div className="mb-4">
          <div className="mb-2 flex items-center space-x-2">
            <Rotate3D className="text-orange-600" size={18} />
            <h3 className="font-semibold text-gray-800">Orbit</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2 rounded border border-orange-100 bg-orange-50 p-2">
              <p className="text-xs font-medium text-orange-600">Inclination</p>
              <p className="font-mono text-sm text-orange-800">
                {formatNumber(satellite.orbitData?.inclination || 0, 4)}°
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded border border-orange-100 bg-orange-50 p-2">
              <p className="text-xs font-medium text-orange-600">
                Eccentricity
              </p>
              <p className="font-mono text-sm text-orange-800">
                {formatNumber(satellite.orbitData?.eccentricity || 0, 6)}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded border border-orange-100 bg-orange-50 p-2">
              <p className="text-xs font-medium text-orange-600">
                Semi-Major Axis
              </p>
              <p className="font-mono text-sm text-orange-800">
                {formatNumber(satellite.orbitData?.semiMajorAxis || 0)} km
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded border border-orange-100 bg-orange-50 p-2">
              <p className="text-xs font-medium text-orange-600">period</p>
              <p className="font-mono text-sm text-orange-800">
                {formatNumber(satellite.orbitData?.period || 0)} min
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded border border-orange-100 bg-orange-50 p-2">
              <p className="text-xs font-medium text-orange-600">
                Argument of Perigee
              </p>
              <p className="font-mono text-sm text-orange-800">
                {formatNumber(satellite.orbitData?.perigee || 0, 4)}°
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded border border-orange-100 bg-orange-50 p-2">
              <p className="text-xs font-medium text-orange-600">
                Mean Anormaly
              </p>
              <p className="font-mono text-sm text-orange-800">
                {formatNumber(satellite.orbitData?.meanAnomaly || 0, 4)}°
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded border border-orange-100 bg-orange-50 p-2">
              <p className="text-xs font-medium text-orange-600">Mean Motion</p>
              <p className="font-mono text-sm text-orange-800">
                {formatNumber(satellite.orbitData?.meanMotion || 0, 6)} rev/day
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SatelliteModal;
