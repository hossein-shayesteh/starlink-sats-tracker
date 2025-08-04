import { GeoJSONInput, Geometry, Position } from "@/src/features/eath/types";

export const createGeometryArray = (json: GeoJSONInput): Geometry[] => {
  const geometry_array: Geometry[] = [];

  if (json.type === "Feature") {
    geometry_array.push(json.geometry);
  } else if (json.type === "FeatureCollection") {
    for (
      let feature_num = 0;
      feature_num < json.features.length;
      feature_num++
    ) {
      geometry_array.push(json.features[feature_num].geometry);
    }
  } else if (json.type === "GeometryCollection") {
    for (let geom_num = 0; geom_num < json.geometries.length; geom_num++) {
      geometry_array.push(json.geometries[geom_num]);
    }
  } else {
    // This case should not be reachable if input is correctly typed,
    // but it's good practice for robustness.
    throw new Error("The geoJSON is not valid.");
  }
  return geometry_array;
};

export const needsInterpolation = (
  point2: Position,
  point1: Position,
): boolean => {
  const lon1 = point1[0];
  const lat1 = point1[1];
  const lon2 = point2[0];
  const lat2 = point2[1];
  const lon_distance = Math.abs(lon1 - lon2);
  const lat_distance = Math.abs(lat1 - lat2);

  return lon_distance > 5 || lat_distance > 5;
};

export const getMidpoint = (point1: Position, point2: Position): Position => {
  const midpoint_lon = (point1[0] + point2[0]) / 2;
  const midpoint_lat = (point1[1] + point2[1]) / 2;
  return [midpoint_lon, midpoint_lat];
};

export const interpolatePoints = (
  interpolation_array: Position[],
): Position[] => {
  const temp_array: Position[] = [];
  let point1: Position, point2: Position;

  for (
    let point_num = 0;
    point_num < interpolation_array.length - 1;
    point_num++
  ) {
    point1 = interpolation_array[point_num];
    point2 = interpolation_array[point_num + 1];

    if (needsInterpolation(point2, point1)) {
      temp_array.push(point1);
      temp_array.push(getMidpoint(point1, point2));
    } else {
      temp_array.push(point1);
    }
  }

  temp_array.push(interpolation_array[interpolation_array.length - 1]);

  if (temp_array.length > interpolation_array.length) {
    return interpolatePoints(temp_array);
  } else {
    return temp_array;
  }
};

export const createCoordinateArray = (feature: Position[]): Position[] => {
  const temp_array: Position[] = [];
  let interpolation_array: Position[] = [];

  for (let point_num = 0; point_num < feature.length; point_num++) {
    const point1 = feature[point_num];

    if (point_num > 0) {
      const point2 = feature[point_num - 1];
      if (needsInterpolation(point2, point1)) {
        interpolation_array = [point2, point1];
        interpolation_array = interpolatePoints(interpolation_array);

        for (
          let inter_point_num = 0;
          inter_point_num < interpolation_array.length;
          inter_point_num++
        ) {
          temp_array.push(interpolation_array[inter_point_num]);
        }
      } else {
        temp_array.push(point1);
      }
    } else {
      temp_array.push(point1);
    }
  }
  return temp_array;
};

export const convertToSphereCoords = (
  coordinates_array: Position,
  sphere_radius: number,
): [number, number, number] => {
  const lon = coordinates_array[0];
  const lat = coordinates_array[1];

  const x =
    Math.cos((lat * Math.PI) / 180) *
    Math.cos((lon * Math.PI) / 180) *
    sphere_radius;
  const y =
    Math.cos((lat * Math.PI) / 180) *
    Math.sin((lon * Math.PI) / 180) *
    sphere_radius;
  const z = Math.sin((lat * Math.PI) / 180) * sphere_radius;

  return [x, y, z];
};
