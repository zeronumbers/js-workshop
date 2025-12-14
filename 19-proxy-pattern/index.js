/**
 * Proxy Pattern Implementation
 */

/**
 * Create a validating proxy
 *
 * @param {Object} target - Target object
 * @param {Object} validators - Map of property name to validator function
 * @returns {Proxy} Proxy that validates on set
 */
function createValidatingProxy(target, validators) {
  return new Proxy(target, {
    set(obj, prop, value) {
      if (validators?.[prop]) {
        if (!validators[prop]?.(value)) {
          throw new Error("validation fail");
        }
      }

      target[prop] = value;
    },

    get(obj, prop) {
      return obj[prop];
    },
  });
}

/**
 * Create a logging proxy
 *
 * @param {Object} target - Target object
 * @param {Function} logger - Logging function (action, prop, value) => void
 * @returns {Proxy} Proxy that logs all operations
 */
function createLoggingProxy(target, logger) {
  return new Proxy(target, {
    get(obj, prop) {
      const value = obj[prop];
      logger("get", prop, value);
      return value;
    },

    set(obj, prop, value) {
      logger("set", prop, value);
      return value;
    },

    deleteProperty(obj, prop) {
      logger("delete", prop);
    },

    has(obj, prop) {
      const value = obj.hasOwnProperty(prop);
      logger("has", prop, value);
      return value;
    },
  });
}

/**
 * Create a caching proxy for methods
 *
 * @param {Object} target - Target object with methods
 * @param {string[]} methodNames - Names of methods to cache
 * @returns {Proxy} Proxy that caches method results
 */
function createCachingProxy(target, methodNames) {
  const cache = new Map();

  return new Proxy(target, {
    get(obj, prop) {
      const item = obj[prop];
      if (methodNames.includes(prop) && typeof item === "function") {
        return (...args) => {
          const cacheKey = JSON.stringify(args);
          if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
          }
          const value = item(...args);
          cache.set(cacheKey, value);
          return value;
        };
      }
      return item;
    },
  });
}

/**
 * Create an access control proxy
 *
 * @param {Object} target - Target object
 * @param {Object} permissions - Access permissions
 * @param {string[]} permissions.readable - Properties that can be read
 * @param {string[]} permissions.writable - Properties that can be written
 * @returns {Proxy} Proxy that enforces access control
 */
function createAccessProxy(target, permissions) {
  const { readable = [], writable = [] } = permissions;

  return new Proxy(target, {
    get(obj, prop) {
      if (!readable.includes(prop)) {
        throw new Error("Access denied");
      }
      return obj[prop];
    },

    set(obj, prop, value) {
      if (!writable.includes(prop)) {
        // NOTE: changed error text because it is not necessarily read-only
        throw new Error("Property is not writable");
      }
      obj[prop] = value;
      return true;
    },

    deleteProperty(obj, prop) {
      if (!writable.includes(prop)) {
        // NOTE: assuming it must error.
        throw new Error("Property is not writable");
      }
      delete obj[prop];
      return true;
    },
  });
}

/**
 * Create a lazy loading proxy
 *
 * @param {Function} loader - Function that returns the real object
 * @returns {Proxy} Proxy that loads object on first access
 */
function createLazyProxy(loader) {
  let instance = null;
  let loaded = false;

  return new Proxy(
    {},
    {
      get(obj, prop) {
        if (!loaded) {
          instance = loader();
          loaded = true;
        }
        return instance[prop];
      },

      set(obj, prop, value) {
        if (!loaded) {
          instance = loader();
          loaded = true;
        }
        instance[prop] = value;
        return value;
      },
    },
  );
}

/**
 * Create an observable proxy
 *
 * @param {Object} target - Target object
 * @param {Function} onChange - Callback when property changes
 * @returns {Proxy} Proxy that notifies on changes
 */
function createObservableProxy(target, onChange) {
  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop];
      obj[prop] = value;
      onChange(prop, value, oldValue);
      return value;
    },

    deleteProperty(obj, prop) {
      delete obj[prop];
      onChange(prop);
      return true;
    },
  });
}

module.exports = {
  createValidatingProxy,
  createLoggingProxy,
  createCachingProxy,
  createAccessProxy,
  createLazyProxy,
  createObservableProxy,
};
