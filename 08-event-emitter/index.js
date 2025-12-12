/**
 * Event Emitter Implementation
 *
 * A pub/sub event system similar to Node.js EventEmitter.
 */
class EventEmitter {
  constructor() {
    this.events = new Map();

    // NOTE: used to remove listeners that are created by `once`.
    this.callbackToWrapper = new WeakMap();
  }

  /**
   * Register a listener for an event
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   * @returns {EventEmitter} this (for chaining)
   */
  on(event, listener) {
    const listeners = this.listeners(event);
    listeners.push(listener);
    this.events.set(event, listeners);
    return this;
  }

  /**
   * Remove a specific listener for an event
   * @param {string} event - Event name
   * @param {Function} listener - Callback to remove
   * @returns {EventEmitter} this (for chaining)
   */
  off(event, listener) {
    const fn = this.callbackToWrapper.get(listener) ?? listener;
    const listeners = this.listeners(event);
    const index = listeners.indexOf(fn);
    if (index !== -1) {
      this.events.set(event, listeners.toSpliced(index, 1));
    }
    return this;
  }

  /**
   * Emit an event, calling all registered listeners
   * @param {string} event - Event name
   * @param {...*} args - Arguments to pass to listeners
   * @returns {boolean} true if event had listeners
   */
  emit(event, ...args) {
    const listeners = this.listeners(event);
    if (!listeners.length) {
      return false;
    }
    listeners.forEach((listener) => {
      listener(...args);
    });
    return true;
  }

  /**
   * Register a one-time listener
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   * @returns {EventEmitter} this (for chaining)
   */
  once(event, listener) {
    const wrapper = (...args) => {
      this.events = new Map(this.events);
      this.events.set(
        event,
        this.listeners(event).filter((listener) => listener !== wrapper),
      );
      listener(...args);
    };

    this.callbackToWrapper.set(listener, wrapper);

    this.on(event, wrapper);
    return this;
  }

  /**
   * Remove all listeners for an event (or all events)
   * @param {string} [event] - Event name (optional)
   * @returns {EventEmitter} this (for chaining)
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  /**
   * Get array of listeners for an event
   * @param {string} event - Event name
   * @returns {Function[]} Array of listener functions
   */
  listeners(event) {
    if (this.events.has(event)) {
      return [...this.events.get(event)];
    }
    return [];
  }

  /**
   * Get number of listeners for an event
   * @param {string} event - Event name
   * @returns {number} Listener count
   */
  listenerCount(event) {
    return this.events.get(event)?.length ?? 0;
  }
}

module.exports = { EventEmitter };
