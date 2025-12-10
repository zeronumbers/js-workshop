/**
 * Custom Bind Implementation
 *
 * Creates a new function that, when called, has its `this` keyword set to
 * the provided context, with a given sequence of arguments preceding any
 * provided when the new function is called.
 *
 * @param {Function} fn - The function to bind
 * @param {*} context - The value to bind as `this`
 * @param {...*} boundArgs - Arguments to prepend to the bound function
 * @returns {Function} A new bound function
 */
function customBind(fn, context, ...boundArgs) {
  if (typeof fn !== "function") {
    throw TypeError("fn is not a function");
  }

  // when fn is arrow function
  if (!fn.hasOwnProperty("prototype")) {
    return (...args) => {
      return fn(...boundArgs, ...args);
    };
  }

  let boundFunction = function (...args) {
    // when called as constructor
    if (this instanceof boundFunction) {
      return fn.apply(this, [...boundArgs, ...args]);
    }
    return fn.apply(context, [...boundArgs, ...args]);
  };

  boundFunction.prototype = Object.create(fn.prototype);

  return boundFunction;
}

/**
 * BONUS: Prototype Method Implementation
 *
 * Add customBind to Function.prototype so it can be called as:
 * myFunction.customBind(context, ...args)
 */
Function.prototype.customBind = function (context, ...boundArgs) {
  return customBind(this, context, ...boundArgs);
};

module.exports = { customBind };
