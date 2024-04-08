/**
 * Ensure that the input is an array. If it is not an array, wrap it in an array.
 */
export const ensureArray = <T>(x: T | T[]): T[] => (Array.isArray(x) ? x : [x]);
