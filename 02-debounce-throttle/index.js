/**
 * Debounce Implementation
 *
 * Creates a debounced function that delays invoking `fn` until after `delay`
 * milliseconds have elapsed since the last time the debounced function was called.
 *
 * @param {Function} fn - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} The debounced function with a cancel() method
 */
function debounce(fn, delay) {
  let timeoutId;

  const debounced = function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };

  debounced.cancel = () => {
    clearTimeout(timeoutId);
  };

  return debounced;
}

/**
 * Throttle Implementation
 *
 * Creates a throttled function that only invokes `fn` at most once per
 * every `limit` milliseconds.
 *
 * @param {Function} fn - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} The throttled function with a cancel() method
 */
function throttle(fn, limit) {
  let isThrottlePeriod = false;
  let timeoutId = setTimeout(() => {
    isThrottlePeriod = false;
  }, limit);

  const throttled = function (...args) {
    if (!isThrottlePeriod) {
      isThrottlePeriod = true;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        isThrottlePeriod = false;
      }, limit);
      fn.apply(this, args);
    }
  };

  throttled.cancel = () => {
    isThrottlePeriod = false;
    clearTimeout(timeoutId);
  };

  return throttled;
}

module.exports = { debounce, throttle };
