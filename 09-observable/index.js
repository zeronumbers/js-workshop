/**
 * Observable Implementation
 *
 * A simple Observable for reactive data streams.
 */
class Observable {
  /**
   * Create an Observable
   * @param {Function} subscribeFn - Function called with subscriber on subscribe
   */
  constructor(subscribeFn) {
    this._subscribeFn = subscribeFn;
    this._isComplete = false;
  }

  /**
   * Subscribe to the Observable
   * @param {Object|Function} observer - Observer object or next callback
   * @returns {Object} Subscription with unsubscribe method
   */
  subscribe(observer) {
    if (typeof observer === "function") {
      observer = { next: observer };
    }

    const subscriber = {
      next: (value) => {
        try {
          if (!this._isComplete) {
            return observer.next(value);
          }
          return observer;
        } catch (err) {
          return observer.error(err);
        }
      },
      error: (err) => {
        this._isComplete = true;
        return observer?.error?.(err);
      },
      complete: () => {
        this._isComplete = true;
        observer?.complete?.();
      },
    };

    const cleanup = this._subscribeFn(subscriber);

    const subscription = {
      unsubscribe: () => {
        this._isComplete = true;
        cleanup?.();
      },
    };
    return subscription;
  }

  /**
   * Transform each emitted value
   * @param {Function} fn - Transform function
   * @returns {Observable} New Observable with transformed values
   */
  map(fn) {
    return new Observable((subscriber) => {
      const subscription = this.subscribe({
        next: (value) => {
          try {
            subscriber.next(fn(value));
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Filter emitted values
   * @param {Function} predicate - Filter function
   * @returns {Observable} New Observable with filtered values
   */
  filter(predicate) {
    return new Observable((subscriber) => {
      const subscription = this.subscribe({
        next: (value) => {
          try {
            if (predicate(value)) {
              subscriber.next(value);
            }
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Take only first n values
   * @param {number} count - Number of values to take
   * @returns {Observable} New Observable limited to count values
   */
  take(count) {
    return new Observable((subscriber) => {
      const subscription = this.subscribe({
        next: (value) => {
          try {
            if (count > 0) {
              subscriber.next(value);
              count--;
            } else {
              subscriber.complete();
            }
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Skip first n values
   * @param {number} count - Number of values to skip
   * @returns {Observable} New Observable that skips first count values
   */
  skip(count) {
    return new Observable((subscriber) => {
      const subscription = this.subscribe({
        next: (value) => {
          try {
            if (count > 0) {
              count--;
            } else {
              subscriber.next(value);
            }
          } catch (err) {
            subscriber.error(err);
          }
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Create Observable from array
   * @param {Array} array - Array of values
   * @returns {Observable} Observable that emits array values
   */
  static from(array) {
    return new Observable((subscriber) => {
      for (let item of array) {
        subscriber.next(item);
      }
      subscriber.complete();
    });
  }

  /**
   * Create Observable from single value
   * @param {*} value - Value to emit
   * @returns {Observable} Observable that emits single value
   */
  static of(...values) {
    return Observable.from(values);
  }
}

module.exports = { Observable };
