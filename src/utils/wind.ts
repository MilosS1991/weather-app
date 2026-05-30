const CARDINALS: readonly string[] = [
  'N', 'NNE', 'NE', 'ENE',
  'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW',
  'W', 'WNW', 'NW', 'NNW',
];

/** Convert a meteorological wind direction (degrees from North, where wind comes FROM) to a cardinal label. */
export function degreesToCardinal(deg: number): string {
  const normalised = ((deg % 360) + 360) % 360;
  const idx = Math.round(normalised / 22.5) % 16;
  return CARDINALS[idx];
}

/**
 * CSS rotation for an upward-pointing arrow (↑) so it points in the downwind direction.
 * Open-Meteo gives the direction wind comes FROM; adding 180° gives where it blows TO.
 */
export function windArrowRotation(fromDeg: number): number {
  return (fromDeg + 180) % 360;
}
