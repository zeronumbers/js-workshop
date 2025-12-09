const isPrimitive = (() => {
  // NOTE: without null because it's type is 'object'
  const TYPE_STRINGS_OF_PRIMITIVES_WITHOUT_NULL = new Set([
    "undefined",
    "number",
    "string",
    "boolean",
    "bigint",
    "symbol",
    "bigint",
  ]);

  return (value) => {
    const valueTypeString = typeof value;
    return (
      value === null ||
      TYPE_STRINGS_OF_PRIMITIVES_WITHOUT_NULL.has(valueTypeString)
    );
  };
})();

// NOTE: date can be invalid, example: new Date('foo') // => Invalid Date
// Invalid Date is still a Date
const isDate = (value) =>
  Object.prototype.toString.call(value) === "[object Date]";

const isRegExp = (value) =>
  Object.prototype.toString.call(value) === "[object RegExp]";

const isMap = (value) =>
  Object.prototype.toString.call(value) === "[object Map]";

const isSet = (value) =>
  Object.prototype.toString.call(value) === "[object Set]";

/**
 * Deep Clone Implementation
 *
 * Create a deep copy of any JavaScript value, including nested objects,
 * arrays, and special types like Date, RegExp, Map, and Set.
 *
 * @param {*} value - The value to clone
 * @param {WeakMap} [visited] - WeakMap to track circular references (used internally)
 * @returns {*} A deep clone of the input value
 */
function deepClone(value, visited = new WeakMap()) {
  if (isPrimitive(value)) {
    return value;
  }

  // Check for circular references using the visited WeakMap
  if (visited.has(value)) {
    return visited.get(value);
  }

  // NOTE: Invalid Date is considered a Date, no special handling.
  if (isDate(value)) {
    const clone = new Date(value);
    visited.set(value, clone);
    return clone;
  }

  if (isRegExp(value)) {
    const clone = new RegExp(value.source, value.flags);
    visited.set(value, clone);
    return clone;
  }

  if (isMap(value)) {
    const clone = new Map();
    visited.set(value, clone);
    for (const pair of value) {
      const [newKey, newValue] = deepClone(pair, visited);
      clone.set(newKey, newValue);
    }
    return clone;
  }

  if (isSet(value)) {
    const clone = new Set();
    visited.set(value, clone);
    for (const item of value) {
      clone.add(deepClone(item, visited));
    }
    return clone;
  }

  if (Array.isArray(value)) {
    const clone = [];
    visited.set(value, clone);
    for (const item of value) {
      clone.push(deepClone(item, visited));
    }
    return clone;
  }

  const clone = {};
  visited.set(value, clone);
  for (const [k, v] of Object.entries(value)) {
    clone[k] = deepClone(v, visited);
  }
  return clone;
}

module.exports = { deepClone };
