/**
 * Represents an interval number
 * isClosed is optional and defaults to true.
 * isClosed represents if the number is included in the interval.
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
        if (typeof x === 'number' || typeof x === 'bigint') {
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
        if (typeof interval === 'string') {
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
        if (this._b.number === value.number && !this._b.isClosed && !value.isClosed) {
            throw new Error('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
        }
        this._a = value;
    }
    get b() {
        // return a copy of the interval number
        return new IntervalNumber(this._b.number, this._b.isClosed);
    }
    set b(value) {
        value = Interval.toIntervalNumber(value);
        if (this._a.number === value.number && !this._a.isClosed && !value.isClosed) {
            throw new Error('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
        }
        this._b = value;
    }
    get min() {
        return this._a.number < this._b.number ? this._a : this._b;
    }
    set min(value) {
        value = Interval.toIntervalNumber(value);
        if (this._a.number === this.min.number) {
            this.a = value;
        }
        else {
            this.b = value;
        }
    }
    get max() {
        return this._a.number > this._b.number ? this._a : this._b;
    }
    set max(value) {
        value = Interval.toIntervalNumber(value);
        if (this._a.number === this.max.number) {
            this.a = value;
        }
        else {
            this.b = value;
        }
    }
    /**
     * Returns true if the interval contains the given number.
     */
    containsNumber(x) {
        const isAboveMin = this.min.number < x || (this.min.number === x && this.min.isClosed);
        const isBelowMax = this.max.number > x || (this.max.number === x && this.max.isClosed);
        return isAboveMin && isBelowMax;
    }
    /**
     * Returns true if the interval contains the given IntervalNumber that represents a minimum value.
     */
    containsMin(x) {
        let containsMinValue = false;
        // there's directionality when the number passed in is open and a minimum
        if (!x.isClosed) {
            containsMinValue = this.min.number <= x.number && this.max.number > x.number;
        }
        else {
            containsMinValue = (this.min.number < x.number || (this.min.number === x.number && this.min.isClosed)) &&
                (this.max.number > x.number || (this.max.number === x.number && this.max.isClosed));
        }
        return containsMinValue;
    }
    /**
     * Returns true if the interval contains the given IntervalNumber that represents a maximum value.
     */
    containsMax(x) {
        let containsMaxValue = false;
        // there's directionality when the number passed in is open and a maximum
        if (!x.isClosed) {
            containsMaxValue = this.min.number < x.number && this.max.number >= x.number;
        }
        else {
            containsMaxValue = (this.min.number < x.number || (this.min.number === x.number && this.min.isClosed)) &&
                (this.max.number > x.number || (this.max.number === x.number && this.max.isClosed));
        }
        return containsMaxValue;
    }
    /**
     * Returns true if the interval contains the given IntervalNumber or Interval.
     */
    contains(x) {
        if (Interval.isIntervalNumber(x)) {
            const isAboveMin = this.min.number < x.number || (this.min.number === x.number && this.min.isClosed && x.isClosed);
            const isBelowMax = this.max.number > x.number || (this.max.number === x.number && this.max.isClosed && x.isClosed);
            return isAboveMin && isBelowMax;
        }
        return this.containsMin(x.min) && this.containsMax(x.max);
    }
    /**
     * Returns true if the interval overlaps with the given interval.
     */
    overlaps(interval) {
        return this.containsMin(interval.min) || this.containsMax(interval.max);
    }
    /**
     * Returns a string representation of the interval.
     * @example
     * const interval: Interval = new Interval({ a: new IntervalNumber(1, false), b: new IntervalNumber(10), name: 'Interval 1' });
     * console.log(interval.toString()); // (1, 10]
     */
    toString() {
        const aIsClosedChar = this._a.isClosed ? '[' : '(';
        const bIsClosedChar = this._b.isClosed ? ']' : ')';
        return `${aIsClosedChar}${formatNumericValue(this._a.number)}, ${formatNumericValue(this._b.number)}${bIsClosedChar}`;
    }
    static parseNumericString(str) {
        const trimmed = str.trim();
        // Handle BigInt notation (ends with 'n')
        if (trimmed.endsWith('n')) {
            return BigInt(trimmed.slice(0, -1));
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
        const aIsValid = typeof interval.a.number === 'number' || typeof interval.a.number === 'bigint';
        const bIsValid = typeof interval.b.number === 'number' || typeof interval.b.number === 'bigint';
        return aIsValid && bIsValid &&
            (interval.a.number !== interval.b.number || (interval.a.isClosed && interval.b.isClosed));
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
        if (startSymbol !== '(' && startSymbol !== '[' || endSymbol !== ')' && endSymbol !== ']') {
            throw new Error(`Invalid interval string: ${interval}`);
        }
        const a = intervalTrimmed.slice(1, intervalTrimmed.indexOf(',')).trim();
        const b = intervalTrimmed.slice(intervalTrimmed.indexOf(',') + 1, intervalTrimmed.length - 1).trim();
        const aNum = Interval.parseNumericString(a);
        const bNum = Interval.parseNumericString(b);
        const aIsClosed = startSymbol === '[';
        const bIsClosed = endSymbol === ']';
        const iInterval = {
            a: new IntervalNumber(aNum, aIsClosed),
            b: new IntervalNumber(bNum, bIsClosed)
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
    return typeof v === 'bigint' ? `${v}n` : `${v}`;
}
