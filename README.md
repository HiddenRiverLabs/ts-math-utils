# ts-math-utils

![Jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

Math-based objects not included in JS, built in TS.

## Installation

```bash
npm install ts-math-utils
```

## Intervals

The `Interval` class represents a mathematical interval with flexible endpoints and inclusivity. Supports number and bigint.

**Key Types:**

- `IntervalNumber` — Wraps a numeric value with an `isClosed` flag (true = inclusive `[]`, false = exclusive `()`).
- `IInterval` — Object with `a` and `b` endpoints and optional `name`.

**Features:**

- Create an `Interval` from an `IInterval` object or a string in mathematical notation (e.g., `[1, 5)`, `(2, 10]`).
- Endpoints can be open or closed (`[]` for inclusive, `()` for exclusive).
- Supports infinite endpoints (`-Infinity`, `Infinity`).
- `.toString()` returns the interval in mathematical notation.
- Static methods:
  - `Interval.validInterval(x: IInterval)` — Validates an IInterval type
  - `Interval.validIntervalString(str)` — Validates a string as interval notation.
  - `Interval.toInterval(str)` — Parses a string into an `Interval` instance.
- Methods for containment and overlap:
  - `.containsNumber(x)` — Checks if a number is within the interval.
  - `.contains(x)` — Checks if an `IntervalNumber` or another `Interval` is fully contained.
  - `.overlaps(interval)` — Checks if two intervals overlap.
  - `.isEmpty()` — Checks if the interval is empty.
- Equality and copying:
  - `.equals(other: IntervalNumber)` — Checks if two `IntervalNumber`s are equal.
- Properties:
  - `.min` and `.max` — Get or set the minimum and maximum endpoints as `IntervalNumber`.
  - `.a` and `.b` — Get or set the original endpoints.
  - `.name` — Optional name for the interval.

## Interval Sets

The `IntervalSet` class manages a collection of `Interval` objects with advanced set operations. Supports number and bigint.

**Features:**

- Add, remove, and clear intervals:
  - `.addInterval(interval)` — Add an interval (object or string).
  - `.removeInterval(interval)` — Remove an interval (object or string).
  - `.removeIntervalByName(name)` — Remove an interval by its name.
  - `.clear()` — Remove all intervals.
- Merging and chaining:
  - `mergeAddedInterval` (option) — When `true`, automatically merges overlapping or adjacent intervals on add.
  - `.chainIntervals()` — Adjusts intervals to remove gaps and disables `mergeAddedInterval` so they don't get merged.
- Sorting:
  - `.sort()` (static) — Sorts intervals by minimum value and inclusivity.
- Gap and containment queries:
  - `.getIntervalGaps([interval])` — Returns intervals representing gaps between existing intervals, or gaps within a provided interval.
  - `.createIntervalGap(interval)` — Creates a gap in the set by splitting or trimming intervals.
  - `.getIntervalsContaining(x)` — Returns intervals containing a specific number.
- String representation:
  - `.toString()` — Returns a comma-separated string of all intervals in mathematical notation.
- Accessors:
  - `.intervals` — Returns a copy of the current intervals array.
  - `.mergeAddedInterval` — Get or set the merging behavior for added intervals.

## Example Usage

```typescript
import { Interval, IntervalNumber, IntervalSet } from 'ts-math-utils';

// Create intervals
const i1 = new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
const i2 = Interval.toInterval('[10, 15)'); // [10, 15)

// Work with interval sets
const set = new IntervalSet();
set.addInterval(i1);
set.addInterval(i2);

console.log(set.toString()); // "[1, 5), [10, 15)"

// Find gaps
const gaps = set.getIntervalGaps();
console.log(gaps.map(gap => gap.toString())); // e.g., [5, 10)

// Chain intervals
set.chainIntervals()
console.log(set.toString()); // "[1, 5), [5, 15)"
```

## Range

The `range()` function creates an iterable for a specified `IInterval` with a configurable step size. Supports number and bigint.

**Features:**

- Accepts an `IInterval` or string representation of an `Interval`.
- Default step is `1`.
- Loop forever by passing `Infinity` as an endpoint.
- If either endpoint is bigint, all values are evaluated and yielded as bigint.

## Example Usage

```typescript
import { NumericValue, range } from 'ts-math-utils';

const result: NumericValue[] = [];
for (const n of range('[0n, Infinity)')) {
    result.push(n);
    if (n >= 5n) break; // Limit to 5
}
console.log(result); // [0n, 1n, 2n, 3n, 4n, 5n]

const result2: NumericValue[] = [];
for (const n of range('[0, 0.5]', 0.1)) {
    result2.push(n);
}
console.log(result2); // [0, 0.1, 0.2, 0.3, 0.4, 0.5]
```

## Testing

Run the following command in the root directory:

```bash
npm test
```
