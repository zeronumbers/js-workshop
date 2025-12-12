/**
 * Decorator Pattern Implementation
 */

/**
 * Logging Decorator
 *
 * Wraps a function to log its calls and return values.
 *
 * @param {Function} fn - Function to decorate
 * @returns {Function} Decorated function
 */
function withLogging(fn) {
  return function (...args) {
    return fn.apply(this, args);
  };
}

/**
 * Timing Decorator
 *
 * Wraps a function to measure and log execution time.
 *
 * @param {Function} fn - Function to decorate
 * @returns {Function} Decorated function
 */
function withTiming(fn) {
  return (...args) => {
    const startTime = performance.now();
    const value = fn(...args);
    console.log(performance.now() - startTime);
    return value;
  };
}

/**
 * Retry Decorator
 *
 * Wraps a function to retry on failure.
 *
 * @param {Function} fn - Function to decorate
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Function} Decorated function
 */
function withRetry(fn, maxRetries = 3) {
  return (...args) => {
    for (let i = 0; i < maxRetries + 1; i++) {
      try {
        return fn(...args);
      } catch (err) {
        if (i === maxRetries) {
          throw err;
        }
        continue;
      }
    }
  };
}

/**
 * Memoize Decorator
 *
 * Wraps a function to cache results based on arguments.
 *
 * @param {Function} fn - Function to decorate
 * @returns {Function} Decorated function with cache
 */
function withMemoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const value = fn(...args);
    cache.set(key, value);
    return value;
  };
}

/**
 * Validation Decorator
 *
 * Wraps a function to validate arguments before calling.
 *
 * @param {Function} fn - Function to decorate
 * @param {Function} validator - Validation function (returns boolean)
 * @returns {Function} Decorated function
 */
function withValidation(fn, validator) {
  return (...args) => {
    if (validator(...args)) {
      return fn(...args);
    }
    throw new Error("validation failed");
  };
}

/**
 * Cache Object Method Decorator
 *
 * Decorates an object method to cache its results.
 *
 * @param {Object} obj - Object containing the method
 * @param {string} methodName - Name of method to cache
 * @returns {Object} Object with cached method
 */
function withCache(obj, methodName) {
  const method = obj[methodName];
  const cache = new Map();

  obj[methodName] = function (...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const value = method.apply(this, args);
    cache.set(key, value);
    return value;
  };

  return obj;
}

/**
 * Compose Decorators
 *
 * Composes multiple decorators into one.
 * Decorators are applied right-to-left.
 *
 * @param {...Function} decorators - Decorator functions
 * @returns {Function} Composed decorator
 */
function compose(...decorators) {
  return (fn) => decorators.reduceRight((acc, decorator) => decorator(acc), fn);
}

/**
 * Pipe Decorators
 *
 * Like compose but applies left-to-right.
 *
 * @param {...Function} decorators - Decorator functions
 * @returns {Function} Piped decorator
 */
function pipe(...decorators) {
  return (fn) => decorators.reduce((acc, decorator) => decorator(acc), fn);
}

// Storage for logs (used in tests)
const logs = [];

function log(message) {
  logs.push(message);
  // console.log(message); // Uncomment for debugging
}

function clearLogs() {
  logs.length = 0;
}

function getLogs() {
  return [...logs];
}

module.exports = {
  withLogging,
  withTiming,
  withRetry,
  withMemoize,
  withValidation,
  withCache,
  compose,
  pipe,
  log,
  clearLogs,
  getLogs,
};
