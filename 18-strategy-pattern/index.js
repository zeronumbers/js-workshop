/**
 * Strategy Pattern Implementation
 */

// ============================================
// SORTING STRATEGIES
// ============================================

/**
 * Sort Context
 *
 * Delegates sorting to a strategy.
 */
class SortContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  sort(array) {
    return array.toSorted(this.strategy.execute);
  }
}

/**
 * Bubble Sort Strategy
 */
class BubbleSort {
  sort(array) {
    if (!array.length) return [];
    let res = [...array];
    // NOTE: a hack to start while loop, maybe do while is better idk.
    let swapped = true;
    while (swapped) {
      swapped = false;
      for (let i = 0; i < res.length - 1; i++) {
        const num = res[i];
        const nextNum = res[i + 1];

        if (num > nextNum) {
          res[i] = nextNum;
          res[i + 1] = num;
          swapped = true;
        }
      }
    }
    return res;
  }
}

/**
 * Quick Sort Strategy
 */
class QuickSort {
  // NOTE: Lomuto partition scheme
  // from: https://en.wikipedia.org/wiki/Quicksort
  // most variables are renamed.
  sort(array) {
    return this.#quickSort([...array], 0, array.length - 1);
  }

  #quickSort(arr, firstIndex, lastIndex) {
    if (firstIndex >= lastIndex || firstIndex < 0) {
      return arr;
    }

    const pivotIndex = this.#partition(arr, firstIndex, lastIndex);

    this.#quickSort(arr, firstIndex, pivotIndex - 1);
    this.#quickSort(arr, pivotIndex + 1, lastIndex);

    return arr;
  }

  #partition(arr, firstIndex, lastIndex) {
    const pivot = arr[lastIndex];

    let i = firstIndex;

    for (let j = firstIndex; j < lastIndex; j++) {
      const current = arr[j];
      if (current <= pivot) {
        const ith = arr[i];
        arr[i] = current;
        arr[j] = ith;
        i++;
      }
    }
    const ith = arr[i];
    const last = arr[lastIndex];

    arr[i] = last;
    arr[lastIndex] = ith;
    return i;
  }
}

/**
 * Merge Sort Strategy
 */
class MergeSort {
  // https://en.wikipedia.org/wiki/Merge_sort#Top-down_implementation_using_lists
  // with minor changes like storing left[0] right[0] in variables.
  sort(array) {
    return this.#mergeSort([...array]);
  }
  #mergeSort(arr) {
    if (arr.length <= 1) {
      return arr;
    }

    let left = [];
    let right = [];
    arr.forEach((x, i) => {
      if (i < arr.length / 2) {
        left.push(x);
      } else {
        right.push(x);
      }
    });
    left = this.#mergeSort(left);
    right = this.#mergeSort(right);

    return this.#merge(left, right);
  }
  #merge(left, right) {
    let result = [];

    while (left.length && right.length) {
      const lFirst = left[0];
      const rFirst = right[0];

      if (lFirst <= rFirst) {
        result.push(lFirst);
        left.shift();
      } else {
        result.push(rFirst);
        right.shift();
      }
    }

    while (left.length) {
      result.push(left[0]);
      left.shift();
    }

    while (right.length) {
      result.push(right[0]);
      right.shift();
    }
    return result;
  }
}

// ============================================
// PRICING STRATEGIES
// ============================================

/**
 * Pricing Context
 *
 * Calculates prices using a strategy.
 */
class PricingContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  calculateTotal(items) {
    return this.strategy.calculate(items);
  }
}

const sumPrices = (items) => items.reduce((sum, { price }) => sum + price, 0);

/**
 * Regular Pricing (no discount)
 */
class RegularPricing {
  calculate(items) {
    return sumPrices(items);
  }
}

/**
 * Percentage Discount
 */
class PercentageDiscount {
  constructor(percentage) {
    this.percentage = percentage;
  }

  calculate(items) {
    const total = sumPrices(items);

    return total * (1 - this.percentage / 100);
  }
}

/**
 * Fixed Discount
 */
class FixedDiscount {
  constructor(amount) {
    this.amount = amount;
  }

  calculate(items) {
    const total = sumPrices(items) - this.amount;
    return total >= 0 ? total : 0;
  }
}

/**
 * Buy One Get One Free
 */
class BuyOneGetOneFree {
  calculate(items) {
    let total = 0;
    items
      .toSorted((a, b) => b.price - a.price)
      .forEach(({ price }, i) => {
        if (i % 2 === 0) {
          total += price;
        }
      });
    return total;
  }
}

/**
 * Tiered Discount
 *
 * Different discount based on total.
 */
class TieredDiscount {
  constructor(tiers) {
    this.tiers = tiers;
  }

  calculate(items) {
    const total = sumPrices(items);
    const tier = this.tiers
      .toSorted((a, b) => b.threshold - a.threshold)
      .find((obj) => total >= obj.threshold);
    return tier ? total * (1 - tier.discount / 100) : total;
  }
}

// ============================================
// VALIDATION STRATEGIES
// ============================================

/**
 * Validation Context
 */
class ValidationContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  validate(data) {
    return this.strategy.validate(data);
  }
}

/**
 * Strict Validation
 *
 * Requires all three fields to be present and valid:
 * - name: must be a non-empty string
 * - email: must be a non-empty string (no regex validation required)
 * - age: must be a number (any number is valid, no range check required)
 */
class StrictValidation {
  validate(data) {
    let errors = [];
    if (!(typeof data?.name === "string")) {
      errors.push("Name is required");
    } else if (!data.name) {
      errors.push("Empty name");
    }

    if (!(typeof data?.email === "string")) {
      errors.push("Email is required");
    } else if (!data.email) {
      errors.push("Empty email");
    }

    if (!(typeof data?.age === "number")) {
      errors.push("Age is required");
      // NOTE: considering NaN and Infinity as not valid.
    } else if (!Number.isFinite(data.age)) {
      errors.push("Age must be number");
    }

    return { valid: !errors.length, errors };
  }
}

/**
 * Lenient Validation
 *
 * Accepts any data, including empty objects.
 * No validation rules - always passes.
 */
class LenientValidation {
  validate(data) {
    return { valid: true, errors: [] };
  }
}

// ============================================
// STRATEGY REGISTRY
// ============================================

/**
 * Strategy Registry
 *
 * Register and retrieve strategies by name.
 */
class StrategyRegistry {
  constructor() {
    this.strategies = new Map();
  }

  register(name, strategy) {
    this.strategies.set(name, strategy);
  }

  get(name) {
    return this.strategies.get(name) ?? null;
  }

  has(name) {
    return this.strategies.has(name);
  }
}

module.exports = {
  // Sorting
  SortContext,
  BubbleSort,
  QuickSort,
  MergeSort,
  // Pricing
  PricingContext,
  RegularPricing,
  PercentageDiscount,
  FixedDiscount,
  BuyOneGetOneFree,
  TieredDiscount,
  // Validation
  ValidationContext,
  StrictValidation,
  LenientValidation,
  // Registry
  StrategyRegistry,
};
