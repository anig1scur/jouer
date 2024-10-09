/**
 * Get a random integer between min and max.
 * @param {number} min - min number
 * @param {number} max - max number
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Clamp a value
 * @param value
 * @param min
 * @param max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
