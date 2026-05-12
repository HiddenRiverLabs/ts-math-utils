import { IInterval, Interval, IntervalNumber, NumericValue } from "./interval";

/**
 * Configuration options for IntervalSet behavior.
 *
 * @property mergeAddedInterval - When true, automatically merges overlapping or adjacent intervals when adding new intervals (default: true)
 */
export class IntervalSetOptions {
  mergeAddedInterval: boolean = true;
}

/**
 * A collection of intervals with optional automatic merging of overlapping/adjacent intervals.
 *
 * IntervalSet can operate in two modes:
 * - Merged mode (default): Automatically combines overlapping or adjacent intervals when adding
 * - Unmerged mode: Maintains intervals as added, allowing overlaps
 *
 * @example
 * // Create with automatic merging (default)
 * const set1 = new IntervalSet({
 *   intervals: ['[1, 5]', '[3, 10]']
 * });
 * console.log(set1.toString()); // "[1, 10]" (automatically merged)
 *
 * @example
 * // Create without merging
 * const set2 = new IntervalSet({
 *   intervals: ['[1, 5]', '[3, 10]'],
 *   options: { mergeAddedInterval: false }
 * });
 * console.log(set2.toString()); // "[1, 5], [3, 10]" (kept separate)
 */
export class IntervalSet {
  private _intervals: Interval[] = [];
  private _mergeAddedInterval: boolean = true;

  /**
   * Creates a new IntervalSet.
   *
   * @param intervalSet - Optional configuration object
   * @param intervalSet.intervals - Array of intervals (as IInterval objects or strings)
   * @param intervalSet.options - Configuration options for the set
   * @example
   * // Empty set
   * const emptySet = new IntervalSet();
   *
   * @example
   * // From string notation
   * const set1 = new IntervalSet({ intervals: ['[1, 10]', '[20, 30]'] });
   *
   * @example
   * // From objects with merging disabled
   * const set2 = new IntervalSet({
   *   intervals: [
   *     { a: new IntervalNumber(1), b: new IntervalNumber(10) }
   *   ],
   *   options: { mergeAddedInterval: false }
   * });
   */
  constructor(intervalSet?: { intervals?: (IInterval | string)[]; options?: IntervalSetOptions }) {
    if (intervalSet?.intervals) {
      for (const interval of intervalSet.intervals) {
        const intervalObject = new Interval(interval);
        this._intervals.push(intervalObject);
      }
    }
    this.mergeAddedInterval = intervalSet?.options?.mergeAddedInterval ?? this._mergeAddedInterval;
  }

  /**
   * Gets a defensive copy of all intervals in the set.
   *
   * Returns copies to prevent external modification of internal state.
   *
   * @returns Array of Interval objects (copies, not references)
   */
  get intervals(): Interval[] {
    return this._intervals.map((r: Interval): Interval => new Interval(r));
  }

  /**
   * Controls whether intervals are automatically merged when added.
   *
   * When set to true, immediately merges all existing intervals in the set.
   * When set to false, disables automatic merging for future additions.
   *
   * @example
   * const set = new IntervalSet({ intervals: ['[1, 5]', '[7, 10]'] });
   * set.addInterval('[4, 8]');  // Results in [1, 10] (auto-merged)
   *
   * set.mergeAddedInterval = false;  // Merges existing, then disables
   * set.addInterval('[15, 20]');     // Added separately
   */
  get mergeAddedInterval(): boolean {
    return this._mergeAddedInterval;
  }
  set mergeAddedInterval(value: boolean) {
    this._mergeAddedInterval = value;
    if (this.mergeAddedInterval) {
      IntervalSet.mergeIntervals(this._intervals);
    }
  }

  /**
   * Sorts intervals in-place by their minimum values.
   *
   * Sort order:
   * 1. By min.number (ascending)
   * 2. If min.number is equal, closed endpoints [  come before open endpoints (
   *
   * @param intervals - Array of intervals to sort (modified in-place)
   * @example
   * const intervals = [
   *   new Interval('[5, 10]'),
   *   new Interval('(1, 3]'),
   *   new Interval('[1, 2]')
   * ];
   * IntervalSet.sort(intervals);
   * // Result order: [1, 2], (1, 3], [5, 10]
   */
  static sort(intervals: Interval[]): void {
    intervals.sort((a: Interval, b: Interval): number => {
      if (a.min.number < b.min.number) {
        return -1;
      } else if (a.min.number > b.min.number) {
        return 1;
      } else {
        if (a.min.isClosed && !b.min.isClosed) {
          return -1;
        } else if (!a.min.isClosed && b.min.isClosed) {
          return 1;
        } else {
          return 0;
        }
      }
    });
  }

  /**
   * Adds an interval to the set.
   *
   * If mergeAddedInterval is true, automatically merges with overlapping or adjacent intervals.
   * If false, adds the interval as-is (may create overlaps).
   *
   * @param interval - Interval to add (IInterval object or string notation)
   * @example
   * const set = new IntervalSet();
   * set.addInterval('[1, 10]');
   * set.addInterval(new Interval('[5, 15]'));  // Merges to [1, 15]
   */
  addInterval(interval: IInterval | string): void {
    const intervalObject = new Interval(interval);
    this._intervals.push(intervalObject);
    if (this._mergeAddedInterval) {
      IntervalSet.mergeIntervals(this._intervals);
    }
  }

  /**
   * Removes an interval from the set by exact match.
   *
   * Compares intervals using their string representation. Only removes exact matches.
   * Does not subtract or create gaps - use createIntervalGap() for that.
   *
   * @param interval - Interval to remove (IInterval object or string notation)
   * @example
   * const set = new IntervalSet({ intervals: ['[1, 10]', '[20, 30]'] });
   * set.removeInterval('[1, 10]');
   * console.log(set.toString()); // "[20, 30]"
   */
  removeInterval(interval: IInterval | string): void {
    const intervalObject = new Interval(interval);
    this._intervals = this._intervals.filter(
      (r: Interval): boolean => r.toString() !== intervalObject.toString(),
    );
  }

  /**
   * Removes all intervals with the specified name.
   *
   * @param name - Name of the interval(s) to remove
   * @example
   * const interval = new Interval({
   *   a: new IntervalNumber(1),
   *   b: new IntervalNumber(10),
   *   name: 'myInterval'
   * });
   * set.addInterval(interval);
   * set.removeIntervalByName('myInterval');
   */
  removeIntervalByName(name: string): void {
    this._intervals = this._intervals.filter((r: Interval): boolean => r.name !== name);
  }

  /**
   * Removes all intervals from the set.
   *
   * @example
   * set.clear();
   * console.log(set.intervals.length); // 0
   */
  clear(): void {
    this._intervals = [];
  }

  /**
   * Merges overlapping and adjacent (complementary) intervals in-place.
   *
   * Combines intervals that overlap or touch with opposite closure.
   * Modifies the input array by merging and removing intervals.
   *
   * @param intervals - Array of intervals to merge (modified in-place)
   * @private
   */
  private static mergeIntervals(intervals: Interval[]): void {
    IntervalSet.sort(intervals);

    let i = 0;
    while (i < intervals.length - 1) {
      const current = intervals[i];
      const next = intervals[i + 1];

      // Check if intervals overlap or complement each other (touch with opposite closure)
      if (current.overlaps(next) || current.compliments(next)) {
        // Merge intervals using Interval.mergeIntervals()
        const merged = Interval.mergeIntervals(current, next);
        current.min = merged.min;
        current.max = merged.max;
        intervals.splice(i + 1, 1); // Remove the merged interval
      } else {
        i++;
      }
    }
  }

  /**
   * Finds gaps in coverage, either within a target interval or between intervals in the set.
   *
   * Two behaviors:
   * - With interval parameter: Returns uncovered portions of the target interval
   * - Without parameter: Returns gaps between consecutive intervals in the set
   *
   * @param interval - Optional target interval to check for gaps
   * @returns Array of Interval objects representing the gaps
   * @example
   * // Find gaps between intervals in the set
   * const set = new IntervalSet({ intervals: ['[1, 5]', '[10, 15]'] });
   * const gaps = set.getIntervalGaps();
   * console.log(gaps[0].toString()); // "(5, 10)"
   *
   * @example
   * // Find gaps within a target interval
   * const set = new IntervalSet({ intervals: ['[2, 4]', '[7, 9]'] });
   * const gaps = set.getIntervalGaps('[0, 10]');
   * // Returns: [0, 2), (4, 7), (9, 10]
   */
  getIntervalGaps(interval?: IInterval | string): Interval[] {
    const intervalObject = interval ? new Interval(interval) : undefined;
    const intervalsCopy = this._intervals.map((r) => new Interval(r));
    if (!this._mergeAddedInterval) {
      IntervalSet.mergeIntervals(intervalsCopy);
    }
    IntervalSet.sort(intervalsCopy);

    return intervalObject
      ? this._getGapsForInterval(intervalObject, intervalsCopy)
      : this._getGapsForSet(intervalsCopy);
  }

  /**
   * Computes gaps within a target interval based on existing intervals.
   *
   * @param interval - Target interval to check for coverage
   * @param intervals - Existing intervals in the set
   * @returns Array of gap intervals
   * @private
   */
  private _getGapsForInterval(interval: Interval, intervals: Interval[]): Interval[] {
    const gaps: Interval[] = [];
    const isContained = intervals.some((r) => r.contains(interval));
    if (isContained) {
      return gaps; // No gaps if the interval is contained within existing intervals
    }
    const overlappingIntervals = intervals.filter((r) => interval.overlaps(r));

    if (overlappingIntervals.length === 0) {
      return [interval];
    }

    if (!overlappingIntervals[0].containsMin(interval.min)) {
      gaps.push(
        new Interval({
          a: interval.min,
          b: new IntervalNumber(
            overlappingIntervals[0].min.number,
            !overlappingIntervals[0].min.isClosed,
          ),
        }),
      );
    }

    for (let i = 0; i < overlappingIntervals.length - 1; i++) {
      const current = overlappingIntervals[i];
      const next = overlappingIntervals[i + 1];
      gaps.push(
        new Interval({
          a: new IntervalNumber(current.max.number, !current.max.isClosed),
          b: new IntervalNumber(next.min.number, !next.min.isClosed),
        }),
      );
    }

    if (!overlappingIntervals[overlappingIntervals.length - 1].containsMax(interval.max)) {
      gaps.push(
        new Interval({
          a: new IntervalNumber(
            overlappingIntervals[overlappingIntervals.length - 1].max.number,
            !overlappingIntervals[overlappingIntervals.length - 1].max.isClosed,
          ),
          b: interval.max,
        }),
      );
    }

    return gaps;
  }

  /**
   * Computes gaps between consecutive intervals in a sorted set.
   *
   * @param intervals - Sorted array of intervals
   * @returns Array of gap intervals between consecutive intervals
   * @private
   */
  private _getGapsForSet(intervals: Interval[]): Interval[] {
    const gaps: Interval[] = [];
    if (intervals.length < 2) {
      return gaps;
    }
    if (intervals.length > 1) {
      for (let i = 0; i < intervals.length - 1; i++) {
        const current = intervals[i];
        const next = intervals[i + 1];
        // if they don't overlap, create a gap interval
        if (
          !current.overlaps(next) &&
          (current.max.number !== next.min.number || (!current.max.isClosed && !next.min.isClosed))
        ) {
          // Create a gap interval
          gaps.push(
            new Interval({
              a: new IntervalNumber(current.max.number, !current.max.isClosed),
              b: new IntervalNumber(next.min.number, !next.min.isClosed),
            }),
          );
        }
      }
    }
    return gaps;
  }

  /**
   * Removes the specified interval from the set, creating gaps in overlapping intervals.
   *
   * This is a subtractive operation that:
   * - Trims overlapping intervals to exclude the gap region
   * - Splits intervals that fully contain the gap into two separate intervals
   * - Removes intervals fully contained within the gap
   *
   * @param interval - Interval region to remove (IInterval object or string notation)
   * @example
   * const set = new IntervalSet({ intervals: ['[1, 10]'] });
   * set.createIntervalGap('[4, 6]');
   * console.log(set.toString()); // "[1, 4), (6, 10]"
   *
   * @example
   * // Trimming an overlapping interval
   * const set2 = new IntervalSet({ intervals: ['[1, 10]', '[15, 20]'] });
   * set2.createIntervalGap('[8, 17]');
   * console.log(set2.toString()); // "[1, 8), (17, 20]"
   */
  createIntervalGap(interval: IInterval | string): void {
    const intervalObject = new Interval(interval);
    // use internal intervals array to properly update the intervals
    const overlappingIntervals: Interval[] = this._intervals.filter((r: Interval): boolean =>
      r.overlaps(intervalObject),
    );
    if (overlappingIntervals.length > 0) {
      const overlappingIntervalSet = new IntervalSet({
        intervals: overlappingIntervals,
        options: { mergeAddedInterval: false },
      });
      // get the overlapping intervals that contain the given interval's max but not min, and update their max
      const minIntervals: Interval[] = this._intervals.filter(
        (r: Interval): boolean =>
          intervalObject.containsMax(r.max) && !intervalObject.containsMin(r.min),
      );
      for (const minInterval of minIntervals) {
        minInterval.max = new IntervalNumber(
          intervalObject.min.number,
          !intervalObject.min.isClosed,
        );
        overlappingIntervalSet.removeInterval(minInterval);
      }
      // get the overlapping intervals that contain the given interval's min but not max, and update their min
      const maxIntervals: Interval[] = this._intervals.filter(
        (r: Interval): boolean =>
          intervalObject.containsMin(r.min) && !intervalObject.containsMax(r.max),
      );
      for (const maxInterval of maxIntervals) {
        maxInterval.min = new IntervalNumber(
          intervalObject.max.number,
          !intervalObject.max.isClosed,
        );
        overlappingIntervalSet.removeInterval(maxInterval);
      }
      // if there's only 1 overlapping interval and it contains the given interval, then split the overlapping interval into 2 intervals
      if (
        overlappingIntervalSet.intervals.length === 1 &&
        overlappingIntervalSet.intervals[0].contains(intervalObject)
      ) {
        // Remove only the specific interval being split, not all intervals
        this.removeInterval(overlappingIntervalSet.intervals[0]);
        this.addInterval(
          new Interval({
            a: overlappingIntervalSet.intervals[0].min,
            b: new IntervalNumber(intervalObject.min.number, !intervalObject.min.isClosed),
          } as IInterval),
        );
        this.addInterval(
          new Interval({
            a: new IntervalNumber(intervalObject.max.number, !intervalObject.max.isClosed),
            b: overlappingIntervalSet.intervals[0].max,
          } as IInterval),
        );
      } else {
        // remove the overlapping intervals that are contained in the given interval
        for (const overlappingInterval of overlappingIntervalSet.intervals) {
          this.removeInterval(overlappingInterval);
        }
      }
    }
  }

  /**
   * Connects all intervals by eliminating gaps between them.
   *
   * Adjusts interval endpoints so each interval touches the next with complementary closure,
   * creating a continuous chain without gaps or overlaps.
   * Automatically disables mergeAddedInterval mode after chaining.
   *
   * @example
   * const set = new IntervalSet({ intervals: ['[1, 5]', '[10, 15]', '[20, 25]'] });
   * set.chainIntervals();
   * console.log(set.toString()); // "[1, 5], (5, 10], (10, 15], (15, 20], (20, 25]"
   *
   * @example
   * // With overlapping intervals
   * const set2 = new IntervalSet({
   *   intervals: ['[1, 8]', '[5, 12]', '[15, 20]'],
   *   options: { mergeAddedInterval: false }
   * });
   * set2.chainIntervals();
   * // Removes overlaps and chains: [1, 8], (8, 12], (12, 20]
   */
  chainIntervals(): void {
    const intervalsCopy = this.intervals;
    IntervalSet.sort(intervalsCopy);

    if (this._mergeAddedInterval) {
      for (let i = 0; i < intervalsCopy.length - 1; i++) {
        const current = intervalsCopy[i];
        const next = intervalsCopy[i + 1];

        // Update the next interval's min if not already chained
        if (current.max.number !== next.min.number || current.max.isClosed === next.min.isClosed) {
          const localIntervalToUpdate = this._intervals.find(
            (r) => r.toString() === next.toString(),
          );
          if (localIntervalToUpdate) {
            localIntervalToUpdate.min = new IntervalNumber(
              current.max.number,
              !current.max.isClosed,
            );
          }
        }
      }
      this.mergeAddedInterval = false;
    } else {
      for (let i = 0; i < intervalsCopy.length - 1; i++) {
        const current = intervalsCopy[i];
        const next = intervalsCopy[i + 1];

        if (current.containsMax(next.max) || next.max.number < current.max.number) {
          intervalsCopy.splice(i + 1, 1); // Remove the next interval
          // Adjust the current interval's max if necessary
          const newMaxValue =
            current.max.number > next.max.number ? current.max.number : next.max.number;
          current.max = new IntervalNumber(newMaxValue, current.max.isClosed || next.max.isClosed);
          // update the current interval in the original intervals array
          const localIntervalToUpdate = this._intervals.find(
            (r) => r.toString() === current.toString(),
          );
          if (localIntervalToUpdate) {
            localIntervalToUpdate.max = current.max;
          }
          // Remove the next interval from the original intervals array
          this.removeInterval(next);
          // Decrement i to recheck the current position after removal
          i--;
        } else if (!current.containsMax(next.max)) {
          const localIntervalToUpdate = this._intervals.find(
            (r) => r.toString() === next.toString(),
          );
          if (localIntervalToUpdate) {
            localIntervalToUpdate.min = new IntervalNumber(
              current.max.number,
              !current.max.isClosed,
            );
          }
        }
      }
    }
  }

  /**
   * Finds all intervals in the set that contain the given numeric value.
   *
   * @param x - The numeric value to check (number or bigint)
   * @returns Array of intervals containing x (empty array if none)
   * @example
   * const set = new IntervalSet({ intervals: ['[1, 10]', '[5, 15]', '[20, 30]'] });
   * const containing = set.getIntervalsContaining(7);
   * console.log(containing.length); // 2 (both [1, 10] and [5, 15] contain 7)
   *
   * @example
   * const none = set.getIntervalsContaining(18);
   * console.log(none.length); // 0 (no intervals contain 18)
   */
  getIntervalsContaining(x: NumericValue): Interval[] {
    return this._intervals.filter((r: Interval): boolean => r.containsNumber(x));
  }

  /**
   * Returns a string representation of all intervals in the set.
   *
   * @returns Comma-separated list of interval strings
   * @example
   * const set = new IntervalSet({ intervals: ['[1, 5)', '(10, 15]'] });
   * console.log(set.toString()); // "[1, 5), (10, 15]"
   */
  toString(): string {
    return this._intervals.map((interval) => interval.toString()).join(", ");
  }
}
