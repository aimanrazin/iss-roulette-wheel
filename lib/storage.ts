/**
 * Save a value into localStorage under the given key.
 *
 * - Automatically serializes the value using JSON.stringify
 * - Safe to call in Next.js (will not run during SSR)
 *
 * @param key - The localStorage key name
 * @param value - Any serializable value (object, array, string, number, etc.)
 */
export const setConfig = (key: string, value: unknown): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

/**
 * Retrieve and deserialize a value from localStorage.
 *
 * - Automatically parses JSON data
 * - Returns null if the key does not exist
 * - Safe to call in Next.js (will not run during SSR)
 *
 * @typeParam T - Expected return type
 * @param key - The localStorage key name
 * @returns The parsed value or null if not found
 */
export const getConfig = <T = any>(key: string): T | null => {
  if (typeof window === 'undefined') return null

  const data = localStorage.getItem(key)
  if (!data) return null

  try {
    return JSON.parse(data) as T
  } catch (error) {
    console.error(`Failed to parse localStorage key "${key}"`, error)
    return null
  }
}

/**
 * Remove a value from localStorage by key.
 *
 * - Safely deletes stored data
 * - Useful for reset or logout flows
 * - Safe to call in Next.js (will not run during SSR)
 *
 * @param key - The localStorage key name to remove
 */
export const removeConfig = (key: string): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(key)
}
