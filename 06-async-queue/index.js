/**
 * Async Queue Implementation
 *
 * A queue that processes async tasks with concurrency control.
 */
class AsyncQueue {
  /**
   * Create an async queue
   * @param {Object} options - Queue options
   * @param {number} [options.concurrency=1] - Maximum concurrent tasks
   * @param {boolean} [options.autoStart=true] - Start processing immediately
   */
  constructor(options = {}) {
    this.concurrency = options.concurrency || 1;
    this.autoStart = options.autoStart !== false;

    this.queue = []; // Pending tasks
    this.running = 0; // Currently running count
    this.paused = false; // Paused state
    this.emptyCallbacks = []; // Callbacks for empty event
  }

  /**
   * Add a task to the queue
   * @param {Function} task - Async function to execute
   * @param {Object} [options] - Task options
   * @param {number} [options.priority=0] - Task priority (higher = sooner)
   * @returns {Promise} Resolves when task completes
   */
  add(task, options = {}) {
    const promise = new Promise((resolve, reject) => {
      const priority = options.priority ?? 0;
      const taskEntry = { task, priority, resolve, reject };

      const lastIndex = this.queue.findLastIndex(
        (obj) => obj.priority >= priority,
      );
      this.queue = this.queue.toSpliced(lastIndex + 1, 0, taskEntry);

      if (this.autoStart && !this.paused) {
        this._process();
      }
    });

    return promise;
  }

  /**
   * Start processing the queue
   */
  start() {
    this.paused = false;
    this._process();
  }

  /**
   * Pause the queue (running tasks will complete)
   */
  pause() {
    this.paused = true;
  }

  /**
   * Clear all pending tasks
   */
  clear() {
    // NOTE: doesn't reject pending promises with error
    this.queue = [];
  }

  /**
   * Register callback for when queue becomes empty
   * @param {Function} callback - Called when queue is empty
   */
  onEmpty(callback) {
    // Store callback to be called when size becomes 0 and nothing running
    this.emptyCallbacks = [...this.emptyCallbacks, callback];
  }

  /**
   * Number of pending tasks
   * @returns {number}
   */
  get size() {
    return this.queue.length;
  }

  /**
   * Number of currently running tasks
   * @returns {number}
   */
  get pending() {
    return this.running;
  }

  /**
   * Whether queue is paused
   * @returns {boolean}
   */
  get isPaused() {
    return this.paused;
  }

  /**
   * Internal: Process next tasks from queue
   * @private
   */
  _process() {
    if (!this.paused && this.running < this.concurrency && this.queue.length) {
      this.running++;

      const [taskEntry, ...rest] = this.queue;
      this.queue = rest;
      taskEntry
        ?.task()
        ?.then((value) => {
          taskEntry?.resolve(value);
        })
        .catch((reason) => {
          taskEntry?.reject(reason);
        })
        .finally(() => {
          this.running--;
          this._process();
          this._checkEmpty();
        });
    }
  }

  /**
   * Internal: Check and trigger empty callbacks
   * @private
   */
  _checkEmpty() {
    if (!this.queue.length && !this.running) {
      this.emptyCallbacks.forEach((f) => {
        f();
      });
    }
  }
}

module.exports = { AsyncQueue };
