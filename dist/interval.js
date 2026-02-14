/**
 * Represents a numeric endpoint in an interval with an inclusivity flag.
 *
 * @example
 * new IntervalNumber(5, true)   // Closed endpoint: included in interval
 * new IntervalNumber(5, false)  // Open endpoint: excluded from interval
 *
 * @property number - The numeric value (number or bigint)
 * @property isClosed - If true, endpoint is inclusive (bracket []); if false, exclusive (parenthesis ())
 */
export class IntervalNumber {
    number;
    isClosed;
    constructor(number, isClosed = true) {
        this.number = number;
        this.isClosed = isClosed;
    }
    /**
     * Returns true if the given IntervalNumber is equal to this IntervalNumber.
     */
    equals(x) {
        if (typeof x === "number" || typeof x === "bigint") {
            x = new IntervalNumber(x);
        }
        return this.number === x.number && this.isClosed === x.isClosed;
    }
}
/**
 * Represents an interval.
 * To not be opinionated, we use a and b to represent the interval, where either a or b can be greater than the other.
 * name is optional, but can be useful for keeping track of the interval.
 * @example
 * const interval: Interval = new Interval({ a: new IntervalNumber(1, false), b: new IntervalNumber(10), name: 'Interval 1' });
 * console.log(interval.toString()); // (1, 10]
 */
export class Interval {
    _a;
    _b;
    name;
    constructor(interval) {
        if (typeof interval === "string") {
            interval = Interval.toInterval(interval);
        }
        if (!Interval.validInterval(interval)) {
            throw new Error(`Invalid interval: Cannot exclude either minimum (${interval.a.number}) or maximum (${interval.b.number}) values if they are equal.`);
        }
        this._a = interval.a;
        this._b = interval.b;
        this.name = interval.name;
    }
    get a() {
        // return a copy of the interval number
        return new IntervalNumber(this._a.number, this._a.isClosed);
    }
    set a(value) {
        value = Interval.toIntervalNumber(value);
        this.validateTypeCompatibility(value, this._b);
        this.validateBoundaryEqualityConstraint(value, this._b);
        this._a = value;
    }
    get b() {
        // return a copy of the interval number
        return new IntervalNumber(this._b.number, this._b.isClosed);
    }
    set b(value) {
        value = Interval.toIntervalNumber(value);
        this.validateTypeCompatibility(value, this._a);
        this.validateBoundaryEqualityConstraint(value, this._a);
        this._b = value;
    }
    get min() {
        return this._a.number < this._b.number ? this._a : this._b;
    }
    set min(value) {
        value = Interval.toIntervalNumber(value);
        if (this._a.number === this.min.number) {
            this.validateTypeCompatibility(value, this._b);
            this.validateBoundaryEqualityConstraint(value, this._b);
            this.a = value;
        }
        else {
            this.validateTypeCompatibility(value, this._a);
            this.validateBoundaryEqualityConstraint(value, this._a);
            this.b = value;
        }
    }
    get max() {
        return this._a.number > this._b.number ? this._a : this._b;
    }
    set max(value) {
        value = Interval.toIntervalNumber(value);
        if (this._a.number === this.max.number) {
            this.validateTypeCompatibility(value, this._b);
            this.validateBoundaryEqualityConstraint(value, this._b);
            this.a = value;
        }
        else {
            this.validateTypeCompatibility(value, this._a);
            this.validateBoundaryEqualityConstraint(value, this._a);
            this.b = value;
        }
    }
    /**
     * Returns true if the interval contains the given number.
     * @throws Error if x has incompatible type (finite number vs bigint)
     */
    containsNumber(x) {
        return this.contains(new IntervalNumber(x, true));
    }
    /**
     * Checks if this interval contains the given IntervalNumber passed in as a minimum.
     *
     * @param x - The minimum as IntervalNumber
     * @returns true if x is a valid minimum within this interval
     * @throws Error if x has incompatible type (finite number vs bigint)
     * @example
     * new Interval('[1, 10]').containsMin(new IntervalNumber(5, true))  // true
     * new Interval('[1, 10]').containsMin(new IntervalNumber(5, false)) // true
     */
    containsMin(x) {
        const minCmp = Interval.compareNumeric(this.min.number, x.number);
        const maxCmp = Interval.compareNumeric(this.max.number, x.number);
        let containsMinValue = false;
        // there's directionality when the number passed in is open and a minimum
        if (!x.isClosed) {
            containsMinValue = minCmp <= 0 && maxCmp > 0;
        }
        else {
            containsMinValue =
                (minCmp < 0 || (minCmp === 0 && this.min.isClosed)) &&
                    (maxCmp > 0 || (maxCmp === 0 && this.max.isClosed));
        }
        return containsMinValue;
    }
    /**
     * Checks if this interval contains the given IntervalNumber passed in as a maximum.
     *
     * @param x - The maximum as IntervalNumber
     * @returns true if x is a valid maximum within this interval
     * @throws Error if x has incompatible type (finite number vs bigint)
     * @example
     * new Interval('[1, 10]').containsMax(new IntervalNumber(5, true))  // true
     * new Interval('[1, 10]').containsMax(new IntervalNumber(5, false)) // true
     */
    containsMax(x) {
        const minCmp = Interval.compareNumeric(this.min.number, x.number);
        const maxCmp = Interval.compareNumeric(this.max.number, x.number);
        let containsMaxValue = false;
        // there's directionality when the number passed in is open and a maximum
        if (!x.isClosed) {
            containsMaxValue = minCmp < 0 && maxCmp >= 0;
        }
        else {
            containsMaxValue =
                (minCmp < 0 || (minCmp === 0 && this.min.isClosed)) &&
                    (maxCmp > 0 || (maxCmp === 0 && this.max.isClosed));
        }
        return containsMaxValue;
    }
    /**
     * Returns true if the interval contains the given IntervalNumber or Interval.
     * @throws Error if x has incompatible type (finite number vs bigint)
     */
    contains(x) {
        if (Interval.isIntervalNumber(x)) {
            const minCmp = Interval.compareNumeric(this.min.number, x.number);
            const maxCmp = Interval.compareNumeric(this.max.number, x.number);
            const isAboveMin = minCmp < 0 || (minCmp === 0 && this.min.isClosed && x.isClosed);
            const isBelowMax = maxCmp > 0 || (maxCmp === 0 && this.max.isClosed && x.isClosed);
            return isAboveMin && isBelowMax;
        }
        return this.containsMin(x.min) && this.containsMax(x.max);
    }
    /**
     * Returns true if the interval overlaps with the given interval.
     */
    overlaps(interval) {
        return this.containsMin(interval.min) || this.containsMax(interval.max) ||
            interval.containsMin(this.min) || interval.containsMax(this.max);
    }
    /**
     * Returns true if the interval is chained with the given interval, meaning they overlap or touch at a point where one is closed and the other is open.
     * @param interval
     * @returns true if the intervals are chained, false otherwise
     */
    compliments(interval) {
        const minCmp = Interval.compareNumeric(this.max.number, interval.min.number);
        const maxCmp = Interval.compareNumeric(this.min.number, interval.max.number);
        const touchAtMin = minCmp === 0 && (this.max.isClosed !== interval.min.isClosed);
        const touchAtMax = maxCmp === 0 && (this.min.isClosed !== interval.max.isClosed);
        return touchAtMin || touchAtMax;
    }
    /**
     * Returns true if this interval is empty (no points).
     * Note: the constructor and validInterval prevent creation of empty intervals from inputs,
     * but intersection operations can produce empty results which this method detects.
     */
    isEmpty() {
        const min = this.min;
        const max = this.max;
        const cmp = Interval.compareNumeric(min.number, max.number);
        if (cmp > 0)
            return true;
        if (cmp < 0)
            return false;
        // numbers equal
        return !(min.isClosed && max.isClosed);
    }
    /**
     * Returns a string representation of the interval.
     * @example
     * const interval: Interval = new Interval({ a: new IntervalNumber(1, false), b: new IntervalNumber(10), name: 'Interval 1' });
     * console.log(interval.toString()); // (1, 10]
     */
    toString() {
        const aIsClosedChar = this._a.isClosed ? "[" : "(";
        const bIsClosedChar = this._b.isClosed ? "]" : ")";
        return `${aIsClosedChar}${formatNumericValue(this._a.number)}, ${formatNumericValue(this._b.number)}${bIsClosedChar}`;
    }
    // ============================================================================
    // Public Static Methods
    // ============================================================================
    static intervalType(interval) {
        // check interval validity first
        if (!Interval.validInterval(interval)) {
            throw new Error(`Invalid interval: Cannot exclude either minimum (${interval.a.number}) or maximum (${interval.b.number}) values if they are equal.`);
        }
        const minType = typeof interval.min.number;
        const maxType = typeof interval.max.number;
        if (minType === maxType) {
            return minType;
        }
        // If types differ, check if one is numeric Infinity/-Infinity
        const minIsInfinite = minType === "number" && !isFinite(interval.min.number);
        const maxIsInfinite = maxType === "number" && !isFinite(interval.max.number);
        if (minIsInfinite && maxType === "bigint") {
            return "bigint";
        }
        if (maxIsInfinite && minType === "bigint") {
            return "bigint";
        }
        throw new Error(`Invalid interval: Both endpoints must be of the same type (number or bigint), unless one is numeric Infinity/-Infinity. Got ${minType} and ${maxType}.`);
    }
    /**
     * Computes the intersection of two intervals.
     *
     * Returns a new interval containing only the values that exist in both intervals.
     * If the intervals don't overlap, returns null.
     *
     * @param i1 - First interval
     * @param i2 - Second interval
     * @returns The intersection interval, or null if disjoint or resulting interval is empty
     * @throws Error if intervals have incompatible types (number vs bigint without Infinity)
     * @example
     * Interval.intersection(
     *   new Interval('[1, 10]'),
     *   new Interval('[5, 15]')
     * ) // Returns [5, 10]
     *
     * Interval.intersection(
     *   new Interval('[1, 5)'),
     *   new Interval('[5, 10]')
     * ) // Returns null (disjoint)
     */
    static intersects(i1, i2) {
        // ensure type compatibility
        if (!Interval.areTypesCompatible(i1.min.number, i2.min.number)) {
            return null;
        }
        // Intersection lower bound is the greater of the two mins
        const cmpMin = Interval.compareNumeric(i1.min.number, i2.min.number);
        const newMin = cmpMin > 0
            ? new IntervalNumber(i1.min.number, i1.min.isClosed)
            : cmpMin < 0
                ? new IntervalNumber(i2.min.number, i2.min.isClosed)
                : new IntervalNumber(i1.min.number, i1.min.isClosed && i2.min.isClosed);
        // Intersection upper bound is the lesser of the two maxes
        const cmpMax = Interval.compareNumeric(i1.max.number, i2.max.number);
        const newMax = cmpMax < 0
            ? new IntervalNumber(i1.max.number, i1.max.isClosed)
            : cmpMax > 0
                ? new IntervalNumber(i2.max.number, i2.max.isClosed)
                : new IntervalNumber(i1.max.number, i1.max.isClosed && i2.max.isClosed);
        // Check if the result would be empty (min > max)
        const cmpResult = Interval.compareNumeric(newMin.number, newMax.number);
        if (cmpResult > 0)
            return null;
        const candidate = { a: newMin, b: newMax };
        // Check if the result is valid (handles edge case where min === max but both open)
        if (!Interval.validInterval(candidate))
            return null;
        return new Interval(candidate);
    }
    /**
     * Alias for mergeIntervals. Merges two overlapping or adjacent intervals into a single interval.
     *
     * @param i1 - First interval
     * @param i2 - Second interval
     * @returns A new merged interval
     * @throws Error if intervals don't overlap or touch, or have incompatible types
     * @example
     * // Overlapping → merged
     * Interval.union(
     *   new Interval('[1, 10]'),
     *   new Interval('[5, 15]')
     * ) // Returns [1, 15]
     *
     * // Adjacent with closed endpoint → merged
     * Interval.union(
     *   new Interval('[1, 5]'),
     *   new Interval('[5, 10]')
     * ) // Returns [1, 10]
     *
     * // Disjoint → throws error
     * Interval.union(
     *   new Interval('[1, 5)'),
     *   new Interval('[10, 15]')
     * ) // Throws error
     */
    static union(i1, i2) {
        return Interval.mergeIntervals(i1, i2);
    }
    /**
     * Merges two overlapping or adjacent intervals into a single interval.
     * Order doesn't matter - validates that intervals overlap OR that the smallest max equals
     * the largest min with at least one closed endpoint before merging.
     *
     * @param a - First interval
     * @param b - Second interval
     * @returns A new merged interval
     * @throws Error if intervals don't overlap or touch
     * @public
     */
    static mergeIntervals(a, b) {
        // Check if they overlap or complement each other (touch with opposite closure)
        const canMerge = a.overlaps(b) || a.compliments(b);
        if (!canMerge) {
            throw new Error(`Cannot merge disjoint intervals. [${a.toString()}] and [${b.toString()}] do not overlap or touch.`);
        }
        // They can be merged - compute the union
        const minCmp = Interval.compareNumeric(a.min.number, b.min.number);
        const maxCmp = Interval.compareNumeric(a.max.number, b.max.number);
        const newMin = minCmp <= 0
            ? (minCmp === 0
                ? new IntervalNumber(a.min.number, a.min.isClosed || b.min.isClosed)
                : new IntervalNumber(a.min.number, a.min.isClosed))
            : new IntervalNumber(b.min.number, b.min.isClosed);
        const newMax = maxCmp >= 0
            ? (maxCmp === 0
                ? new IntervalNumber(a.max.number, a.max.isClosed || b.max.isClosed)
                : new IntervalNumber(a.max.number, a.max.isClosed))
            : new IntervalNumber(b.max.number, b.max.isClosed);
        return new Interval({ a: newMin, b: newMax });
    }
    // ============================================================================
    // Private Instance Methods
    // ============================================================================
    /**
     * Validates that a new endpoint is type-compatible with an existing endpoint.
     * Enforces the same-type rule: both endpoints must be the same runtime type (number/bigint),
     * unless one is numeric Infinity/-Infinity.
     *
     * @param newValue - The new endpoint to set
     * @param existingValue - The existing endpoint to compare against
     * @throws Error if types are incompatible
     * @private
     */
    validateTypeCompatibility(newValue, existingValue) {
        const newType = typeof newValue.number;
        const existingType = typeof existingValue.number;
        const newIsInfinite = newType === "number" && !isFinite(newValue.number);
        const existingIsInfinite = existingType === "number" && !isFinite(existingValue.number);
        if (newType !== existingType && !newIsInfinite && !existingIsInfinite) {
            throw new Error(`Invalid interval. Both numbers must be of the same type. Got ${newType} and ${existingType}.`);
        }
    }
    /**
     * Validates that two endpoints don't form an invalid empty interval.
     * An interval is invalid if both endpoints are equal and both are open (exclusive).
     *
     * @param endpoint1 - First endpoint
     * @param endpoint2 - Second endpoint
     * @throws Error if both endpoints are equal and both are open
     * @private
     */
    validateBoundaryEqualityConstraint(endpoint1, endpoint2) {
        if (endpoint1.number === endpoint2.number && !endpoint1.isClosed && !endpoint2.isClosed) {
            throw new Error("Invalid interval. Cannot exclude either minimum and maximum values if they are equal.");
        }
    }
    // ============================================================================
    // Private Static Methods
    // ============================================================================
    /**
     * Checks if two numeric values are type-compatible for interval operations.
     * Allows mixing only when one is Infinity/-Infinity.
     *
     * @param a - First numeric value
     * @param b - Second numeric value
     * @returns true if types are compatible, false otherwise
     * @private
     */
    static areTypesCompatible(a, b) {
        const typeA = typeof a;
        const typeB = typeof b;
        const aIsInfinite = typeA === "number" && !isFinite(a);
        const bIsInfinite = typeB === "number" && !isFinite(b);
        return typeA === typeB || aIsInfinite || bIsInfinite;
    }
    /**
     * Safely compares two numeric values (number or bigint).
     *
     * Supports comparing bigint with numeric Infinity/-Infinity.
     * Prevents unsafe comparisons (e.g., finite number vs bigint).
     *
     * @param a - First value to compare
     * @param b - Second value to compare
     * @returns -1 if a < b, 0 if a === b, 1 if a > b
     * @throws Error if attempting to compare finite number with bigint (type mismatch)
     * @example
     * Interval.compareNumeric(5, 10)        // -1
     * Interval.compareNumeric(5n, 10n)      // -1
     * Interval.compareNumeric(5n, Infinity) // -1
     * Interval.compareNumeric(5n, 5)        // Throws: "Cannot compare bigint with finite number"
     */
    static compareNumeric(a, b) {
        if (typeof a === "bigint" && typeof b === "bigint") {
            return a < b ? -1 : a > b ? 1 : 0;
        }
        if (typeof a === "number" && typeof b === "number") {
            if (a < b)
                return -1;
            if (a > b)
                return 1;
            return 0;
        }
        // Mixed types: allow comparison only when the numeric side is infinite
        if (typeof a === "bigint" && typeof b === "number") {
            if (!isFinite(b)) {
                return b === Infinity ? -1 : 1;
            }
            throw new Error("Cannot compare bigint with finite number");
        }
        if (typeof a === "number" && typeof b === "bigint") {
            if (!isFinite(a)) {
                return a === Infinity ? 1 : -1;
            }
            throw new Error("Cannot compare finite number with bigint");
        }
        // fallback
        return 0;
    }
    static parseNumericString(str) {
        const trimmed = str.trim();
        // Handle BigInt notation (ends with 'n')
        if (trimmed.endsWith("n")) {
            try {
                const bigintPart = BigInt(trimmed.slice(0, -1));
                return bigintPart;
            }
            catch {
                throw new Error(`Invalid bigint string: ${str}`);
            }
        }
        // Use Number() for everything else (handles hex, octal, binary automatically)
        const num = Number(trimmed);
        if (isNaN(num)) {
            throw new Error(`Invalid numeric string: ${str}`);
        }
        return num;
    }
    /**
     * Returns true if the given interval is valid.
     */
    static validInterval(interval) {
        const aIsValid = typeof interval.a.number === "number" || typeof interval.a.number === "bigint";
        const bIsValid = typeof interval.b.number === "number" || typeof interval.b.number === "bigint";
        // Allow a numeric Infinity/-Infinity to be paired with a bigint endpoint.
        const aIsInfinite = typeof interval.a.number === "number" && !isFinite(interval.a.number);
        const bIsInfinite = typeof interval.b.number === "number" && !isFinite(interval.b.number);
        const sameTypeOrInfinite = typeof interval.a.number === typeof interval.b.number || aIsInfinite || bIsInfinite;
        return (aIsValid &&
            bIsValid &&
            sameTypeOrInfinite &&
            (interval.a.number !== interval.b.number || (interval.a.isClosed && interval.b.isClosed)));
    }
    /**
     * Returns true if the given string is a valid interval.
     * Supports the use of -Infinity and Infinity.
     * @param interval - The string representation of the interval.
     * @example
     * console.log(Interval.validIntervalString('(1, 10]')); // true
     * console.log(Interval.validIntervalString('1, 10]')); // false
     * @returns A boolean indicating if the string is a valid interval.
     */
    static validIntervalString(interval) {
        try {
            const intervalObj = Interval.toInterval(interval);
            return Interval.validInterval(intervalObj);
        }
        catch {
            return false;
        }
    }
    /**
     * Takes a string representation of an interval and returns an Interval object.
     * @param interval - The string representation of the interval.
     * @returns An Interval object.
     * @example
     * const interval: Interval = Interval.toInterval('(1, 10]');
     * console.log(interval.toString()); // (1, 10]
     */
    static toInterval(interval) {
        const intervalTrimmed = interval.trim();
        const startSymbol = intervalTrimmed[0];
        const endSymbol = intervalTrimmed[intervalTrimmed.length - 1];
        if ((startSymbol !== "(" && startSymbol !== "[") || (endSymbol !== ")" && endSymbol !== "]")) {
            throw new Error(`Invalid interval string: ${interval}`);
        }
        const a = intervalTrimmed.slice(1, intervalTrimmed.indexOf(",")).trim();
        const b = intervalTrimmed
            .slice(intervalTrimmed.indexOf(",") + 1, intervalTrimmed.length - 1)
            .trim();
        const aNum = Interval.parseNumericString(a);
        const bNum = Interval.parseNumericString(b);
        const aIsClosed = startSymbol === "[";
        const bIsClosed = endSymbol === "]";
        const iInterval = {
            a: new IntervalNumber(aNum, aIsClosed),
            b: new IntervalNumber(bNum, bIsClosed),
        };
        if (!Interval.validInterval(iInterval)) {
            throw new Error(`Invalid interval string: ${interval}`);
        }
        return iInterval;
    }
    static toIntervalNumber(x, isClosed = true) {
        return Interval.isIntervalNumber(x) ? x : new IntervalNumber(x, isClosed);
    }
    static isIntervalNumber(x) {
        return x instanceof IntervalNumber;
    }
}
/**
 * Formats a numeric value as a string, appending 'n' for bigints.
 * @param v The numeric value to format, can be a number or bigint.
 * @description Formats a numeric value as a string, appending 'n' for bigints.
 * @returns A string representation of the numeric value.
 */
export function formatNumericValue(v) {
    return typeof v === "bigint" ? `${v}n` : `${v}`;
}
