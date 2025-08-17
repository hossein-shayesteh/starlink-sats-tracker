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
    <div className="pointer-events-none fixed inset-0 z-50">
      <Card className="pointer-events-auto fixed top-4 right-4 w-60 transform overflow-hidden rounded-lg border border-gray-700 bg-gray-900/95 pt-0 shadow-xl backdrop-blur-sm">
        {/* Compact Header */}
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-700 to-purple-800 p-2">
          <div className="flex min-w-0 flex-1 items-center space-x-2">
            <Satellite size={16} className="flex-shrink-0 text-white" />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-bold text-white">
                {satellite.name}
              </h2>
              <div className="text-xs text-blue-200">ID: {satellite.id}</div>
            </div>
          </div>
          <Button
            onClick={onClose}
            size="icon"
            variant="ghost"
            className="h-6 w-6 flex-shrink-0 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={12} />
          </Button>
        </CardHeader>

        <CardContent className="space-y-3 px-3 py-0">
          {/* Status Bar */}
          <div className="flex items-center space-x-2 rounded border border-green-800/30 bg-green-900/20 p-1.5">
            <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500"></div>
            <span className="truncate text-xs font-medium text-green-300">
              Live - {satellite.timestamp?.toLocaleTimeString()}
            </span>
          </div>

          {/* Position Section */}
          <div>
            <div className="mb-2 flex items-center space-x-1">
              <Globe className="text-blue-400" size={12} />
              <h3 className="text-xs font-semibold text-gray-300">
                Current Position
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <CompactDataCard
                label="Lat"
                value={`${formatNumber(satellite.lat, 2)}°`}
                color="blue"
              />
              <CompactDataCard
                label="Lon"
                value={`${formatNumber(satellite.lon, 2)}°`}
                color="blue"
              />
              <CompactDataCard
                label="Alt"
                value={`${formatNumber(satellite.altitude || 0)}km`}
                color="purple"
              />
              <CompactDataCard
                label="Vel"
                value={`${formatNumber(satellite.velocity || 0, 1)}km/s`}
                color="purple"
              />
            </div>
          </div>

          {/* Orbit Parameters */}
          <div>
            <div className="mb-2 flex items-center space-x-1">
              <Rotate3D className="text-orange-400" size={12} />
              <h3 className="text-xs font-semibold text-gray-300">Orbit</h3>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <CompactDataCard
                label="Inclination"
                value={`${formatNumber(satellite.orbitData?.inclination || 0)}°`}
                color="orange"
              />
              <CompactDataCard
                label="Eccentricity"
                value={`${formatNumber(satellite.orbitData?.eccentricity || 0, 6)}`}
                color="orange"
              />
              <CompactDataCard
                label="Period"
                value={`${formatNumber(satellite.orbitData?.period || 0)}min`}
                color="orange"
              />
              <CompactDataCard
                label="Semi-Major Axis"
                value={`${formatNumber(satellite.orbitData?.semiMajorAxis || 0)}km`}
                color="orange"
              />
              <CompactDataCard
                label="Perigee"
                value={`${formatNumber(satellite.orbitData?.perigee || 0, 4)}°`}
                color="orange"
              />
              <CompactDataCard
                label="Mean Anormaly"
                value={`${formatNumber(satellite.orbitData?.meanAnomaly || 0, 4)}°`}
                color="orange"
              />
              <CompactDataCard
                label="RAAN"
                value={`${formatNumber(satellite.orbitData?.raan || 0, 4)}°`}
                color="orange"
              />
              <CompactDataCard
                label="Apoapsis"
                value={`${formatNumber(satellite.orbitData?.apogee || 0, 4)}km`}
                color="orange"
              />
              <CompactDataCard
                label="Mean Motion"
                className="col-span-2"
                value={`${formatNumber(satellite.orbitData?.meanMotion || 0, 6)} rev/day`}
                color="orange"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Compact data card component
const CompactDataCard = ({
  label,
  value,
  className,
  color = "blue",
}: {
  label: string;
  value: string;
  className?: string;
  color?: "blue" | "purple" | "orange";
}) => {
  const colorClasses = {
    blue: "border-blue-500/30 bg-blue-900/20 text-blue-300",
    purple: "border-purple-500/30 bg-purple-900/20 text-purple-300",
    orange: "border-orange-500/30 bg-orange-900/20 text-orange-300",
  };

  return (
    <div
      className={`flex flex-col rounded border p-1 ${colorClasses[color]} ${className}`}
    >
      <p className="text-[10px] leading-tight font-medium opacity-80">
        {label}
      </p>
      <p className="truncate font-mono text-xs leading-tight">{value}</p>
    </div>
  );
};

export default SatelliteModal;
