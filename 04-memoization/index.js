/**
 * Memoization Implementation
 *
 * Creates a memoized version of a function that caches results based on arguments.
 *
 * @param {Function} fn - The function to memoize
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.maxSize] - Maximum number of cached entries
 * @param {number} [options.ttl] - Time-to-live for cache entries in milliseconds
 * @param {Function} [options.keyGenerator] - Custom function to generate cache keys
 * @returns {Function} Memoized function with cache control methods
 */
function memoize(fn, options = {}) {
  const {
    maxSize = 100,
    ttl = 5000,
    keyGenerator = (args) => JSON.stringify(args),
  } = options;

  const cache = new Map();

  const memoized = function (...args) {
    const cacheKey = keyGenerator(args);
    const cacheObj = cache?.get(cacheKey);
    const value = cacheObj?.value;
    const timestamp = cacheObj?.timestamp;

    if (timestamp && new Date() - timestamp < ttl) {
      return value;
    }

    const computedValue = fn.apply(this, args);
    cache.set(cacheKey, { value: computedValue, timestamp: new Date() });

    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return computedValue;
  };
  memoized.cache = {
    clear: () => cache.clear(),
    delete: () => cache.delete(key),
    has: (key) => cache.has(key),
    get size() {
      return cache.size;
    },
  };
  return memoized;
}

module.exports = { memoize };
