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
     * Checks equality between this IntervalNumber and another value.
     *
     * @param x - The value to compare (IntervalNumber or NumericValue)
     * @returns true if both number and isClosed properties match
     * @example
     * new IntervalNumber(5, true).equals(new IntervalNumber(5, true))   // true
     * new IntervalNumber(5, true).equals(5)                             // true (converts to closed)
     * new IntervalNumber(5, true).equals(new IntervalNumber(5, false))  // false
     */
    equals(x) {
        if (typeof x === "number" || typeof x === "bigint") {
            x = new IntervalNumber(x);
        }
        return this.number === x.number && this.isClosed === x.isClosed;
    }
}
/**
 * Represents a mathematical interval with flexible endpoints.
 *
 * Intervals use order-agnostic endpoints (a and b) internally but expose ordered min/max properties.
 * Supports both number and bigint values, with special handling for Infinity/-Infinity.
 *
 * @example
 * // From object notation
 * const interval1 = new Interval({ a: new IntervalNumber(1, false), b: new IntervalNumber(10) });
 * console.log(interval1.toString()); // (1, 10]
 *
 * // From string notation
 * const interval2 = new Interval('[1, 10)');
 * console.log(interval2.min.number); // 1
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
     * Checks if this interval contains the given numeric value.
     *
     * @param x - The numeric value to check (number or bigint)
     * @returns true if the value is within this interval
     * @throws Error if x has incompatible type (finite number vs bigint)
     * @example
     * new Interval('[1, 10]').containsNumber(5)   // true
     * new Interval('[1, 10)').containsNumber(10)  // false
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
     * Checks if this interval contains the given IntervalNumber or Interval.
     *
     * For IntervalNumber: checks if the value and closure are valid within this interval.
     * For Interval: checks if the entire interval is contained (both min and max).
     *
     * @param x - The IntervalNumber or Interval to check
     * @returns true if x is fully contained within this interval
     * @throws Error if x has incompatible type (finite number vs bigint)
     * @example
     * new Interval('[1, 10]').contains(new IntervalNumber(5, true))    // true
     * new Interval('[1, 10]').contains(new Interval('[2, 8]'))         // true
     * new Interval('[1, 10]').contains(new Interval('[5, 15]'))        // false
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
     * Checks if this interval overlaps with another interval.
     *
     * Two intervals overlap if they share any common points.
     *
     * @param interval - The interval to check for overlap
     * @returns true if the intervals have any points in common
     * @throws Error if intervals have incompatible types (finite number vs bigint)
     * @example
     * new Interval('[1, 10]').overlaps(new Interval('[5, 15]'))  // true
     * new Interval('[1, 5)').overlaps(new Interval('[5, 10]'))   // false
     * new Interval('[1, 5]').overlaps(new Interval('[5, 10]'))   // true (touch at 5)
     */
    overlaps(interval) {
        return this.containsMin(interval.min) || this.containsMax(interval.max) ||
            interval.containsMin(this.min) || interval.containsMax(this.max);
    }
    /**
     * Checks if this interval complements another interval (they touch but don't overlap).
     *
     * Two intervals complement each other when they meet at exactly one point where
     * one endpoint is closed and the other is open. This allows them to be merged into
     * a continuous interval without gaps or overlaps.
     *
     * @param interval - The interval to check for complementarity
     * @returns true if the intervals touch with opposite closure (e.g., [1,5) and [5,10])
     * @throws Error if intervals have incompatible types (finite number vs bigint)
     * @example
     * new Interval('[1, 5)').compliments(new Interval('[5, 10]'))   // true (touch at 5)
     * new Interval('[1, 5]').compliments(new Interval('[5, 10]'))   // false (overlap at 5)
     * new Interval('[1, 5)').compliments(new Interval('(5, 10]'))   // false (gap at 5)
     */
    compliments(interval) {
        const minCmp = Interval.compareNumeric(this.max.number, interval.min.number);
        const maxCmp = Interval.compareNumeric(this.min.number, interval.max.number);
        const touchAtMin = minCmp === 0 && (this.max.isClosed !== interval.min.isClosed);
        const touchAtMax = maxCmp === 0 && (this.min.isClosed !== interval.max.isClosed);
        return touchAtMin || touchAtMax;
    }
    /**
     * Checks if this interval is empty (contains no points).
     *
     * An interval is empty if min > max, or if min === max but both endpoints are open.
     * Note: The constructor and validInterval prevent direct creation of empty intervals,
     * but operations like intersection can produce them.
     *
     * @returns true if the interval contains no points
     * @example
     * new Interval('[5, 5]').isEmpty()   // false (single point)
     * // Empty intervals can't be created directly, but can result from operations
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
    /**
     * Determines the primary numeric type of an interval.
     *
     * Returns 'number' or 'bigint' based on the interval's finite endpoints.
     * When one endpoint is Infinity/-Infinity, returns the type of the finite endpoint.
     *
     * @param interval - The interval to check
     * @returns 'number' if interval uses numbers, 'bigint' if it uses bigints
     * @throws Error if interval is invalid or has incompatible mixed types
     * @example
     * Interval.intervalType(new Interval('[1, 10]'))           // 'number'
     * Interval.intervalType(new Interval('[1n, 10n]'))         // 'bigint'
     * Interval.intervalType(new Interval('[-Infinity, 10n]'))  // 'bigint'
     */
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
     * If the intervals don't overlap or the result would be empty, returns null.
     *
     * @param i1 - First interval
     * @param i2 - Second interval
     * @returns The intersection interval, or null if disjoint or resulting interval is empty
     * @example
     * Interval.intersects(
     *   new Interval('[1, 10]'),
     *   new Interval('[5, 15]')
     * ) // Returns [5, 10]
     *
     * Interval.intersects(
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
     * Computes the union of two overlapping or adjacent intervals.
     *
     * Alias for mergeIntervals. Merges two intervals that overlap or complement each other
     * (touch with opposite closure) into a single continuous interval.
     *
     * @param i1 - First interval
     * @param i2 - Second interval
     * @returns A new merged interval spanning both input intervals
     * @throws Error if intervals don't overlap or touch (are disjoint)
     * @example
     * // Overlapping intervals
     * Interval.union(
     *   new Interval('[1, 10]'),
     *   new Interval('[5, 15]')
     * ) // Returns [1, 15]
     *
     * // Complementary intervals (touch with opposite closure)
     * Interval.union(
     *   new Interval('[1, 5)'),
     *   new Interval('[5, 10]')
     * ) // Returns [1, 10]
     *
     * // Disjoint intervals throw error
     * Interval.union(
     *   new Interval('[1, 5)'),
     *   new Interval('[10, 15]')
     * ) // Throws: "Cannot merge disjoint intervals"
     */
    static union(i1, i2) {
        return Interval.mergeIntervals(i1, i2);
    }
    /**
     * Merges two overlapping or adjacent intervals into a single interval.
     *
     * Combines two intervals that either overlap or complement each other (touch with
     * opposite closure). Order doesn't matter. The result spans from the minimum of
     * both intervals to the maximum, with closure determined by the original endpoints.
     *
     * @param a - First interval
     * @param b - Second interval
     * @returns A new merged interval spanning both input intervals
     * @throws Error if intervals don't overlap or complement (are disjoint)
     * @example
     * Interval.mergeIntervals(
     *   new Interval('[1, 5]'),
     *   new Interval('[3, 10]')
     * ) // Returns [1, 10]
     *
     * Interval.mergeIntervals(
     *   new Interval('[1, 5)'),
     *   new Interval('[5, 10]')
     * ) // Returns [1, 10]
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
        // Use compareNumeric for type-safe comparison (handles bigint, number, Infinity)
        const cmp = Interval.compareNumeric(endpoint1.number, endpoint2.number);
        if (cmp === 0 && !endpoint1.isClosed && !endpoint2.isClosed) {
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
    /**
     * Parses a numeric string into a NumericValue (number or bigint).
     *
     * Handles bigint notation (suffix 'n'), standard numbers, Infinity/-Infinity,
     * and various number formats (hex, octal, binary).
     *
     * @param str - The string to parse
     * @returns A number or bigint value
     * @throws Error if the string is not a valid numeric value
     * @private
     */
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
     * Validates whether an interval meets all requirements.
     *
     * An interval is valid if:
     * - Both endpoints are numeric (number or bigint)
     * - Both endpoints are the same type, unless one is Infinity/-Infinity
     * - If endpoints are equal, at least one must be closed (to contain a point)
     *
     * @param interval - The interval to validate
     * @returns true if the interval is valid
     * @example
     * Interval.validInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10) })      // true
     * Interval.validInterval({ a: new IntervalNumber(5, false), b: new IntervalNumber(5, false) }) // false (empty)
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
     * Parses a string representation of an interval into an IInterval object.
     *
     * Supports mathematical notation with brackets/parentheses for open/closed endpoints.
     * Numbers can include 'n' suffix for bigint (e.g., "10n").
     * Supports Infinity and -Infinity.
     *
     * @param interval - The string representation (e.g., "[1, 10)", "(5n, 20n]")
     * @returns An IInterval object
     * @throws Error if the string format is invalid
     * @example
     * Interval.toInterval('[1, 10]')       // { a: IntervalNumber(1, true), b: IntervalNumber(10, true) }
     * Interval.toInterval('(1, 10]')       // { a: IntervalNumber(1, false), b: IntervalNumber(10, true) }
     * Interval.toInterval('[5n, 10n)')     // { a: IntervalNumber(5n, true), b: IntervalNumber(10n, false) }
     * Interval.toInterval('[-Infinity, 0)') // Works with Infinity
     */
    static toInterval(interval) {
        const intervalTrimmed = interval.trim();
        const startSymbol = intervalTrimmed[0];
        const endSymbol = intervalTrimmed[intervalTrimmed.length - 1];
        if ((startSymbol !== "(" && startSymbol !== "[") || (endSymbol !== ")" && endSymbol !== "]")) {
            throw new Error(`Invalid interval string: ${interval}`);
        }
        const commaIndex = intervalTrimmed.indexOf(",");
        if (commaIndex === -1) {
            throw new Error(`Invalid interval string: missing comma in ${interval}`);
        }
        const a = intervalTrimmed.slice(1, commaIndex).trim();
        const b = intervalTrimmed.slice(commaIndex + 1, intervalTrimmed.length - 1).trim();
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
    /**
     * Converts a value to an IntervalNumber.
     *
     * @param x - Value to convert (IntervalNumber or NumericValue)
     * @param isClosed - Default closure if converting from NumericValue
     * @returns IntervalNumber instance
     * @private
     */
    static toIntervalNumber(x, isClosed = true) {
        return Interval.isIntervalNumber(x) ? x : new IntervalNumber(x, isClosed);
    }
    /**
     * Type guard to check if a value is an IntervalNumber.
     *
     * @param x - Value to check
     * @returns true if x is an IntervalNumber instance
     */
    static isIntervalNumber(x) {
        return x instanceof IntervalNumber;
    }
}
/**
 * Formats a numeric value as a string, appending 'n' suffix for bigints.
 *
 * @param v - The numeric value to format (number or bigint)
 * @returns A string representation (e.g., "5", "10n", "Infinity")
 * @example
 * formatNumericValue(5)         // "5"
 * formatNumericValue(5n)        // "5n"
 * formatNumericValue(Infinity)  // "Infinity"
 */
export function formatNumericValue(v) {
    return typeof v === "bigint" ? `${v}n` : `${v}`;
}
