/**
 * Dependency Injection Container Implementation
 */
class Container {
  constructor() {
    this.registry = new Map();
  }

  /**
   * Register a class with the container
   * @param {string} name - Service name
   * @param {Function} Class - Constructor function
   * @param {string[]} [dependencies=[]] - Names of dependencies
   * @param {Object} [options={}] - Registration options
   * @param {boolean} [options.singleton=false] - Whether to create singleton
   */
  register(name, Class, dependencies = [], options = {}) {
    this.registry.set(name, {
      type: "class",
      Class,
      dependencies,
      singleton: options.singleton ?? false,
      instance: null,
    });
  }

  /**
   * Register an existing instance
   * @param {string} name - Service name
   * @param {*} instance - Instance to register
   */
  registerInstance(name, instance) {
    this.registry.set(name, { type: "instance", instance });
  }

  /**
   * Register a factory function
   * @param {string} name - Service name
   * @param {Function} factory - Factory function
   * @param {string[]} [dependencies=[]] - Names of dependencies
   * @param {Object} [options={}] - Registration options
   */
  registerFactory(name, factory, dependencies = [], options = {}) {
    this.registry.set(name, {
      type: "factory",
      factory,
      dependencies,
      singleton: options.singleton ?? false,
      instance: null,
    });
  }

  /**
   * Resolve a service by name
   * @param {string} name - Service name
   * @param {Set} [resolutionStack] - Stack for circular dependency detection
   * @returns {*} The resolved instance
   */
  resolve(name, resolutionStack = new Set()) {
    if (this.registry.has(name)) {
      if (resolutionStack.has(name)) {
        throw new Error(`${name} is already in resolutionStack`);
      }

      const registration = this.registry.get(name);
      const {
        type,
        singleton,
        instance,
        Class,
        factory,
        dependencies = [],
      } = registration;

      switch (type) {
        case "instance": {
          return instance;
        }
        case "class":
        case "factory": {
          if (singleton && instance) {
            return instance;
          }

          resolutionStack.add(name);

          const deps = dependencies.map((dep) => {
            if (resolutionStack.has(dep)) {
              throw new Error("circular dependency");
            }
            return this.resolve(dep, resolutionStack);
          }, resolutionStack);

          let newInstance;
          if (type === "class") {
            newInstance = new Class(...deps);
          } else {
            newInstance = factory(...deps);
          }
          resolutionStack.delete(name);
          if (singleton) {
            this.registry.set(name, { ...registration, instance: newInstance });
          }
          return newInstance;
        }
      }
    }
    throw new Error(`${name} not found`);
  }

  /**
   * Check if a service is registered
   * @param {string} name - Service name
   * @returns {boolean}
   */
  has(name) {
    return this.registry.has(name);
  }

  /**
   * Unregister a service
   * @param {string} name - Service name
   * @returns {boolean} true if was registered
   */
  unregister(name) {
    return this.registry.delete(name);
  }

  /**
   * Clear all registrations
   */
  clear() {
    this.registry = new Map();
  }

  /**
   * Get all registered service names
   * @returns {string[]}
   */
  getRegistrations() {
    return [...this.registry.keys()];
  }
}

/**
 * Create a child container that inherits from parent
 *
 * @param {Container} parent - Parent container
 * @returns {Container} Child container
 */
function createChildContainer(parent) {
  // TODO: Implement createChildContainer

  // Create a new container that:
  // - First checks its own registry
  // - Falls back to parent for unregistered services

  const child = new Container();
  // Override resolve to check parent...
  return child;
}

// Example classes for testing
class Logger {
  constructor() {
    this.logs = [];
  }

  log(message) {
    this.logs.push(message);
  }

  getLogs() {
    return [...this.logs];
  }
}

class Database {
  constructor(logger) {
    this.logger = logger;
    this.connected = false;
  }

  connect() {
    this.logger.log("Database connected");
    this.connected = true;
  }

  query(sql) {
    this.logger.log(`Query: ${sql}`);
    return [];
  }
}

class UserRepository {
  constructor(database, logger) {
    this.database = database;
    this.logger = logger;
  }

  findById(id) {
    this.logger.log(`Finding user ${id}`);
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

class UserService {
  constructor(userRepository, logger) {
    this.userRepository = userRepository;
    this.logger = logger;
  }

  getUser(id) {
    this.logger.log(`Getting user ${id}`);
    return this.userRepository.findById(id);
  }
}

module.exports = {
  Container,
  createChildContainer,
  Logger,
  Database,
  UserRepository,
  UserService,
};
