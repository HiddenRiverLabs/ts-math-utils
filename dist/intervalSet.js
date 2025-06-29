import { Interval, IntervalNumber } from './interval';
/**
 * Represents interval set options.
 * mergeAddedInterval is optional and defaults to true.
 * mergeAddedInterval, when true, is used to merge overlapping Intervals when adding a new interval.
 */
export class IntervalSetOptions {
    mergeAddedInterval = true;
}
/**
 * Represents a set of intervals.
 * intervals is optional and defaults to an empty array.
 * mergeAddedInterval is optional and defaults to true.
 * mergeAddedInterval, when true, is used to merge overlapping Intervals when adding a new interval.
 * @example
 * const intervalSet: IntervalSet = new IntervalSet({ intervals: [new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(10, false) }), new Interval({ a: new IntervalNumber(5), b: new IntervalNumber(15, false) })], options: { mergeAddedInterval: true });
 */
export class IntervalSet {
    _intervals = [];
    _mergeAddedInterval = true;
    /**
     * Creates a new IntervalSet object.
     * intervalSet is optional and defaults to undefined.
     * @param intervalSet - The interval set object.
     * @example
     * const intervalSet: IntervalSet = new IntervalSet({ intervals: [new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(10, false) }), new Interval({ a: new IntervalNumber(5), b: new IntervalNumber(15, false) })], options: { mergeAddedInterval: true });
     */
    constructor(intervalSet) {
        if (intervalSet?.intervals) {
            for (const interval of intervalSet.intervals) {
                const intervalObject = new Interval(interval);
                this._intervals.push(intervalObject);
            }
        }
        this.mergeAddedInterval = intervalSet?.options?.mergeAddedInterval ?? this._mergeAddedInterval;
    }
    /**
     * Returns a copy of the intervals in the interval set.
     */
    get intervals() {
        return this._intervals.map((r) => new Interval(r));
    }
    /**
     * Gets or sets the mergeAddedInterval option.
     * mergeAddedInterval, when true, is used to merge overlapping Intervals when adding a new interval.
     * Setting this option to true will merge the intervals in the interval set.
     */
    get mergeAddedInterval() {
        return this._mergeAddedInterval;
    }
    set mergeAddedInterval(value) {
        this._mergeAddedInterval = value;
        if (this.mergeAddedInterval) {
            IntervalSet.mergeIntervals(this._intervals);
        }
    }
    /**
     * Sorts the intervals in the interval set, ascending based on the minimum value of each interval and isClosed is before !isClosed.
     */
    static sort(intervals) {
        intervals.sort((a, b) => {
            if (a.min.number < b.min.number) {
                return -1;
            }
            else if (a.min.number > b.min.number) {
                return 1;
            }
            else {
                if (a.min.isClosed && !b.min.isClosed) {
                    return -1;
                }
                else if (!a.min.isClosed && b.min.isClosed) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
        });
    }
    /**
     * Adds an interval to the interval set.
     * @param interval - The interval object or string representation.
     * @example
     * intervalSet.addInterval(new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(10, false) }));
     * @example
     * intervalSet.addInterval('[1, 10)');
     */
    addInterval(interval) {
        const intervalObject = new Interval(interval);
        this._intervals.push(intervalObject);
        if (this._mergeAddedInterval) {
            IntervalSet.mergeIntervals(this._intervals);
        }
    }
    /**
     * Removes an interval from the interval set.
     * @param interval - The interval object or string representation.
     * @example
     * intervalSet.removeInterval(new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(10, false) }));
     * @example
     * intervalSet.removeInterval('[1, 10)');
     */
    removeInterval(interval) {
        const intervalObject = new Interval(interval);
        this._intervals = this._intervals.filter((r) => r.toString() !== intervalObject.toString());
    }
    /**
     * Remove interval by name.
     * @param name - The name of the interval.
     * @example
     * intervalSet.removeIntervalByName('Interval 1');
     */
    removeIntervalByName(name) {
        this._intervals = this._intervals.filter((r) => r.name !== name);
    }
    /**
     * Removes all intervals from the interval set.
     */
    clear() {
        this._intervals = [];
    }
    /**
     * Merge overlapping intervals in the interval set.
     */
    static mergeIntervals(intervals) {
        IntervalSet.sort(intervals);
        let i = 0;
        while (i < intervals.length - 1) {
            const current = intervals[i];
            const next = intervals[i + 1];
            // Check if intervals overlap or are adjacent
            if (current.overlaps(next) ||
                (current.max.number === next.min.number && (current.max.isClosed || next.min.isClosed))) {
                // Merge intervals
                current.min = new IntervalNumber(safeMin(current.min.number, next.min.number), current.min.isClosed || next.min.isClosed);
                current.max = new IntervalNumber(safeMax(current.max.number, next.max.number), current.max.isClosed || next.max.isClosed);
                intervals.splice(i + 1, 1); // Remove the merged interval
            }
            else {
                i++;
            }
        }
    }
    /**
     * Returns the gaps between the intervals in the passed in interval..
     * If interval is provided, the gaps are calculated based on the given interval.
     * If interval is not provided, the gaps are calculated based on the intervals in the interval set.
     * @param interval - The interval object or string representation.
     * @returns An array of Interval objects representing the gaps.
     */
    getIntervalGaps(interval) {
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
    _getGapsForInterval(interval, intervals) {
        const gaps = [];
        const isContained = intervals.some((r) => r.contains(interval));
        if (isContained) {
            return gaps; // No gaps if the interval is contained within existing intervals
        }
        const overlappingIntervals = intervals.filter((r) => interval.overlaps(r));
        if (overlappingIntervals.length === 0) {
            return [interval];
        }
        if (!overlappingIntervals[0].containsMin(interval.min)) {
            gaps.push(new Interval({
                a: interval.min,
                b: new IntervalNumber(overlappingIntervals[0].min.number, !overlappingIntervals[0].min.isClosed),
            }));
        }
        for (let i = 0; i < overlappingIntervals.length - 1; i++) {
            const current = overlappingIntervals[i];
            const next = overlappingIntervals[i + 1];
            gaps.push(new Interval({
                a: new IntervalNumber(current.max.number, !current.max.isClosed),
                b: new IntervalNumber(next.min.number, !next.min.isClosed),
            }));
        }
        if (!overlappingIntervals[overlappingIntervals.length - 1].containsMax(interval.max)) {
            gaps.push(new Interval({
                a: new IntervalNumber(overlappingIntervals[overlappingIntervals.length - 1].max.number, !overlappingIntervals[overlappingIntervals.length - 1].max.isClosed),
                b: interval.max,
            }));
        }
        return gaps;
    }
    _getGapsForSet(intervals) {
        const gaps = [];
        if (intervals.length < 2) {
            return gaps;
        }
        if (intervals.length > 1) {
            for (let i = 0; i < intervals.length - 1; i++) {
                const current = intervals[i];
                const next = intervals[i + 1];
                // if they don't overlap, create a gap interval
                if (!current.overlaps(next) && (current.max.number !== next.min.number || (!current.max.isClosed && !next.min.isClosed))) {
                    // Create a gap interval
                    gaps.push(new Interval({
                        a: new IntervalNumber(current.max.number, !current.max.isClosed),
                        b: new IntervalNumber(next.min.number, !next.min.isClosed),
                    }));
                }
            }
        }
        return gaps;
    }
    /**
     * Create an interval gap in the interval set.
     * @param interval - The interval object or string representation.
     * @example
     * intervalSet.createIntervalGap(new Interval({ a: new IntervalNumber(5), b: new IntervalNumber(10, false) }));
     */
    createIntervalGap(interval) {
        const intervalObject = new Interval(interval);
        // use internal intervals array to properly update the intervals
        const overlappingIntervals = this._intervals.filter((r) => r.overlaps(intervalObject));
        if (overlappingIntervals.length > 0) {
            const overlappingIntervalSet = new IntervalSet({ intervals: overlappingIntervals, options: { mergeAddedInterval: false } });
            // get the overlapping intervals that contain the given interval's max but not min, and update their max
            const minIntervals = this._intervals.filter((r) => intervalObject.containsMax(r.max) && !intervalObject.containsMin(r.min));
            for (const minInterval of minIntervals) {
                minInterval.max = new IntervalNumber(intervalObject.min.number, !intervalObject.min.isClosed);
                overlappingIntervalSet.removeInterval(minInterval);
            }
            // get the overlapping intervals that contain the given interval's min but not max, and update their min
            const maxIntervals = this._intervals.filter((r) => intervalObject.containsMin(r.min) && !intervalObject.containsMax(r.max));
            for (const maxInterval of maxIntervals) {
                maxInterval.min = new IntervalNumber(intervalObject.max.number, !intervalObject.max.isClosed);
                overlappingIntervalSet.removeInterval(maxInterval);
            }
            // if there's only 1 overlapping interval and it contains the given interval, then split the overlapping interval into 2 intervals
            if (overlappingIntervalSet.intervals.length === 1 && overlappingIntervalSet.intervals[0].contains(intervalObject)) {
                this.clear();
                this.addInterval(new Interval({ a: overlappingIntervalSet.intervals[0].min, b: new IntervalNumber(intervalObject.min.number, !intervalObject.min.isClosed) }));
                this.addInterval(new Interval({ a: new IntervalNumber(intervalObject.max.number, !intervalObject.max.isClosed), b: overlappingIntervalSet.intervals[0].max }));
            }
            else {
                // remove the overlapping intervals that are contained in the given interval
                for (const overlappingInterval of overlappingIntervalSet.intervals) {
                    this.removeInterval(overlappingInterval);
                }
            }
        }
    }
    /**
     * Remove interval gaps in the interval set.
     * If interval set is already merged, then the gaps are removed depending on the replaceGapsWithNewIntervals parameter.
     * If interval set is not merged, then resolve the existing sets annd remove contained intervals, hen remove the gaps depending on the replaceGapsWithNewIntervals parameter.
     */
    chainIntervals() {
        const intervalsCopy = this.intervals;
        IntervalSet.sort(intervalsCopy);
        if (this._mergeAddedInterval) {
            for (let i = 0; i < intervalsCopy.length - 1; i++) {
                const current = intervalsCopy[i];
                const next = intervalsCopy[i + 1];
                // Update the next interval's min if not already chained
                if (current.max.number !== next.min.number || current.max.isClosed === next.min.isClosed) {
                    const localIntervalToUpdate = this._intervals.find((r) => r.toString() === next.toString());
                    if (localIntervalToUpdate) {
                        localIntervalToUpdate.min = new IntervalNumber(current.max.number, !current.max.isClosed);
                    }
                }
            }
            this.mergeAddedInterval = false;
        }
        else {
            for (let i = 0; i < intervalsCopy.length - 1; i++) {
                const current = intervalsCopy[i];
                const next = intervalsCopy[i + 1];
                if (current.containsMax(next.max) || next.max.number < current.max.number) {
                    intervalsCopy.splice(i + 1, 1); // Remove the next interval
                    // Adjust the current interval's max if necessary
                    current.max = new IntervalNumber(safeMax(current.max.number, next.max.number), current.max.isClosed || next.max.isClosed);
                    // update the current interval in the original intervals array
                    const localIntervalToUpdate = this._intervals.find((r) => r.toString() === current.toString());
                    if (localIntervalToUpdate) {
                        localIntervalToUpdate.max = current.max;
                    }
                    // Remove the next interval from the original intervals array
                    this.removeInterval(next);
                    // Decrement i to recheck the current position after removal
                    i--;
                }
                else if (!current.containsMax(next.max)) {
                    const localIntervalToUpdate = this._intervals.find((r) => r.toString() === next.toString());
                    if (localIntervalToUpdate) {
                        localIntervalToUpdate.min = new IntervalNumber(current.max.number, !current.max.isClosed);
                    }
                }
            }
        }
    }
    /**
     * Returns the interval in the interval set that contain the given number.
     * @param x - The number to check.
     * @example
     * const intervalSet: IntervalSet = new IntervalSet({ intervals: [new Interval({ a: 1, b: 10 }), new Interval({ a: 20, b: 30 })], options: { mergeAddedInterval: true });
     * const intervals: Interval[] = intervalSet.getIntervalsContaining(5);
     * @returns An array of Interval objects that contain the provided number.
     */
    getIntervalsContaining(x) {
        return this._intervals.filter((r) => r.containsNumber(x));
    }
    /**
     * Returns a string representation of the interval set.
     * Example: "[1, 5), (10, 15]"
     */
    toString() {
        return this._intervals.map(interval => interval.toString()).join(', ');
    }
}
/**
 * Returns the minimum of two numeric values, handling both numbers and bigints.
 * @param a The first value to compare.
 * @param b The second value to compare.
 * @returns The smaller of the two values.
 */
export function safeMin(a, b) {
    return a < b ? a : b;
}
/**
 * Returns the maximum of two numeric values, handling both numbers and bigints.
 * @param a The first value to compare.
 * @param b The second value to compare.
 * @returns The larger of the two values.
 */
export function safeMax(a, b) {
    return a > b ? a : b;
}
