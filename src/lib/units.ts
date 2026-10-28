export type UnitSystem = 'metric' | 'imperial';

const FEET_PER_METER = 3.28084;

export function metersToFeet(meters: number): number {
  return meters * FEET_PER_METER;
}

export function feetToMeters(feet: number): number {
  return feet / FEET_PER_METER;
}

/** Formats a route length (stored in meters) for display, e.g. "30 m" or "98 ft". */
export function formatLength(meters: number, system: UnitSystem): string {
  return system === 'metric' ? `${Math.round(meters)} m` : `${Math.round(metersToFeet(meters))} ft`;
}
