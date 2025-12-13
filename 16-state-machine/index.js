/**
 * State Machine Implementation
 */
class StateMachine {
  /**
   * Create a state machine
   * @param {Object} config - Machine configuration
   * @param {string} config.initial - Initial state
   * @param {Object} config.states - State definitions
   * @param {Object} [config.context] - Initial context data
   */
  constructor(config) {
    if (!config.hasOwnProperty("states") || !config.hasOwnProperty("initial")) {
      throw new Error("invalid config, it must have states and initial.");
    }

    this.config = config;
    this.currentState = config.initial;
    this.context = config.context || {};

    if (!config?.states?.hasOwnProperty(config?.initial)) {
      throw new Error(
        `"config.states" doesn't have "config.initial" value ${config?.initial}`,
      );
    }
  }

  /**
   * Get current state
   * @returns {string}
   */
  get state() {
    return this.currentState;
  }

  /**
   * Attempt a state transition
   * @param {string} event - Event name
   * @param {Object} [payload] - Optional data for the transition
   * @returns {boolean} Whether transition was successful
   */
  transition(event, payload) {
    const currentStateConfig = this.config.states[this.currentState];

    if (!currentStateConfig.on.hasOwnProperty(event)) {
      return false;
    }

    const transitionConfig = currentStateConfig.on[event];
    const target =
      typeof transitionConfig === "string"
        ? transitionConfig
        : transitionConfig.target;

    if (transitionConfig.guard && !transitionConfig?.guard?.(this.context)) {
      return false;
    }
    console.log(this.currentState, target, transitionConfig);
    this.currentState = target;

    transitionConfig?.action?.(this.context);

    return true;
  }

  /**
   * Check if a transition is possible
   * @param {string} event - Event name
   * @returns {boolean}
   */
  can(event) {
    const currentStateConfig = this.config.states[this.currentState];

    if (!currentStateConfig.on.hasOwnProperty(event)) {
      return false;
    }

    if (currentStateConfig.on[event].guard) {
      return false;
    }

    const transitionConfig = currentStateConfig.on[event];

    return transitionConfig.hasOwnProperty("guard")
      ? transitionConfig.guard(this.context)
      : true;
  }

  /**
   * Get available transitions from current state
   * @returns {string[]} Array of event names
   */
  getAvailableTransitions() {
    return Object.keys(this.config.states?.[this.currentState]?.on ?? {});
  }

  /**
   * Get the context data
   * @returns {Object}
   */
  getContext() {
    return this.context;
  }

  /**
   * Update context data
   * @param {Object|Function} updater - New context or updater function
   */
  updateContext(updater) {
    if (typeof updater === "function") {
      this.context = updater(this.context);
    } else {
      this.context = { ...this.context, ...updater };
    }
  }

  /**
   * Check if machine is in a final state (no transitions out)
   * @returns {boolean}
   */
  isFinal() {
    return (
      !this.config.states.hasOwnProperty(this.currentState) ||
      !Object.keys(this.config.states[this.currentState]).length
    );
  }

  /**
   * Reset machine to initial state
   * @param {Object} [newContext] - Optional new context
   */
  reset(newContext) {
    this.currentState = this.config.initial;
    this.context = newContext;
  }
}

/**
 * Create a state machine factory
 *
 * @param {Object} config - Machine configuration
 * @returns {Function} Factory function that creates machines
 */
function createMachine(config) {
  return () => new StateMachine(config);
}

module.exports = { StateMachine, createMachine };
