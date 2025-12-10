/**
 * Promise.all Implementation
 *
 * Returns a promise that resolves when all promises resolve,
 * or rejects when any promise rejects.
 *
 * @param {Iterable} promises - An iterable of promises (or values)
 * @returns {Promise} A promise that resolves to an array of results
 */
function promiseAll(promises) {
  const promiseArray = Array.from(promises);

  if (!promiseArray.length) {
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    const results = new Array(promiseArray.length);
    let completed = 0;

    promiseArray.forEach((promise, i) => {
      Promise.resolve(promise)
        .then(
          (value) => {
            completed++;
            results[i] = value;
            if (completed === promiseArray.length) {
              resolve(results);
            }
          },
          (reason) => {
            reject(reason);
          },
        )
        .catch((err) => reject(err));
    });
  });
}

/**
 * Promise.race Implementation
 *
 * Returns a promise that settles with the first promise to settle.
 *
 * @param {Iterable} promises - An iterable of promises (or values)
 * @returns {Promise} A promise that settles with the first result
 */
function promiseRace(promises) {
  const promiseArray = Array.from(promises);

  if (!promiseArray.length) {
    return new Promise(() => {});
  }

  return new Promise((resolve, reject) => {
    promiseArray.forEach((promise, i) => {
      Promise.resolve(promise)
        .then(
          (value) => {
            resolve(value);
          },
          (reason) => {
            reject(reason);
          },
        )
        .catch((err) => reject(err));
    });
  });
}

/**
 * Promise.allSettled Implementation
 *
 * Returns a promise that resolves when all promises have settled.
 * Never rejects.
 *
 * @param {Iterable} promises - An iterable of promises (or values)
 * @returns {Promise} A promise that resolves to an array of settlement objects
 */
function promiseAllSettled(promises) {
  const promiseArray = Array.from(promises);

  if (!promiseArray.length) {
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    const results = new Array(promiseArray.length);
    let completed = 0;

    promiseArray.forEach((promise, i) => {
      Promise.resolve(promise)
        .then(
          (value) => {
            completed++;
            results[i] = { status: "fulfilled", value };
            if (completed === promiseArray.length) {
              resolve(results);
            }
          },
          (reason) => {
            completed++;
            results[i] = { status: "rejected", reason };
            if (completed === promiseArray.length) {
              resolve(results);
            }
          },
        )
        .catch((err) => reject(err));
    });
  });
}

/**
 * Promise.any Implementation
 *
 * Returns a promise that resolves with the first fulfilled promise,
 * or rejects with an AggregateError if all reject.
 *
 * @param {Iterable} promises - An iterable of promises (or values)
 * @returns {Promise} A promise that resolves with the first fulfilled value
 */
function promiseAny(promises) {
  const promiseArray = Array.from(promises);

  if (!promiseArray.length) {
    return Promise.reject(new AggregateError("No promises"));
  }

  return new Promise((resolve, reject) => {
    const errors = [];
    let rejectedCount = 0;

    promiseArray.forEach((promise, i) => {
      Promise.resolve(promise)
        .then(
          (value) => {
            resolve(value);
          },
          (reason) => {
            rejectedCount++;
            errors.push(reason);
            if (rejectedCount === promiseArray.length) {
              reject(new AggregateError(errors, "All promises were rejected"));
            }
          },
        )
        .catch((err) => reject(err));
    });
  });
}

module.exports = { promiseAll, promiseRace, promiseAllSettled, promiseAny };
