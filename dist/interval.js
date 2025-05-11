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
        if (typeof x === 'number') {
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
    #a;
    #b;
    name = 'Not Specified';
    constructor(interval) {
        if (typeof interval === 'string') {
            interval = Interval.toInterval(interval);
        }
        // Check if both endpoints are excluded and equal
        if (interval.a.number === interval.b.number && !interval.a.isClosed && !interval.b.isClosed) {
            throw new Error(`Invalid interval: Cannot exclude both minimum (${interval.a.number}) and maximum (${interval.b.number}) values if they are equal.`);
        }
        this.#a = interval.a;
        this.#b = interval.b;
        this.name = interval.name ?? this.name;
    }
    static intervalRegex = /^(\[|\()(-?\d+|-?Infinity),\s*(-?\d+|-?Infinity)(\]|\))$/;
    get a() {
        // return a copy of the interval number
        return new IntervalNumber(this.#a.number, this.#a.isClosed);
    }
    set a(value) {
        value = Interval.toIntervalNumber(value);
        if (this.#b.number === value.number && !this.#b.isClosed && !value.isClosed) {
            throw new Error('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
        }
        this.#a = value;
    }
    get b() {
        // return a copy of the interval number
        return new IntervalNumber(this.#b.number, this.#b.isClosed);
    }
    set b(value) {
        value = Interval.toIntervalNumber(value);
        if (this.#a.number === value.number && !this.#a.isClosed && !value.isClosed) {
            throw new Error('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
        }
        this.#b = value;
    }
    get min() {
        return this.#a.number < this.#b.number ? this.a : this.b;
    }
    set min(value) {
        value = Interval.toIntervalNumber(value);
        if (this.#a.number === this.min.number) {
            this.a = value;
        }
        else {
            this.b = value;
        }
    }
    get max() {
        return this.#a.number > this.#b.number ? this.a : this.b;
    }
    set max(value) {
        value = Interval.toIntervalNumber(value);
        if (this.#a.number === this.max.number) {
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
        const aIsClosedChar = this.#a.isClosed ? '[' : '(';
        const bIsClosedChar = this.#b.isClosed ? ']' : ')';
        return `${aIsClosedChar}${this.#a.number}, ${this.#b.number}${bIsClosedChar}`;
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
        const match = interval.match(Interval.intervalRegex);
        if (!match)
            return false;
        const [, startSymbol, a, b, endSymbol] = match;
        const aNum = Number(a);
        const bNum = Number(b);
        return (!isNaN(aNum) &&
            !isNaN(bNum) &&
            (aNum !== bNum || (aNum === bNum && startSymbol === '[' && endSymbol === ']')));
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
        if (!Interval.validIntervalString(interval)) {
            throw new Error('Invalid interval string.');
        }
        const [, startSymbol, a, b, endSymbol] = interval.match(Interval.intervalRegex);
        const aNum = Number(a);
        const bNum = Number(b);
        const aIsClosed = startSymbol === '[';
        const bIsClosed = endSymbol === ']';
        return new Interval({
            a: new IntervalNumber(aNum, aIsClosed),
            b: new IntervalNumber(bNum, bIsClosed),
        });
    }
    static toIntervalNumber(x, isClosed = true) {
        return x instanceof IntervalNumber ? x : new IntervalNumber(x, isClosed);
    }
    static isIntervalNumber(x) {
        return x instanceof IntervalNumber;
    }
}
