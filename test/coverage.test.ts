/// <reference types="jest" />
import { Interval, IntervalNumber } from "../src/interval";
import { IntervalSet } from "../src/intervalSet";
import { compareNumeric } from "../src/intervalUtils";
import { range } from "../src/range";

describe("coverage targets", () => {
  it("intervalType throws specific message for mixed types when validInterval bypassed", () => {
    const originalValid = (Interval as any).validInterval;
    (Interval as any).validInterval = () => true;

    const mixed = Object.create(Interval.prototype);
    mixed._a = new IntervalNumber(1, true);
    mixed._b = new IntervalNumber(2n, true);
    // Provide min/max directly to avoid invoking getters that call compareNumericValue
    Object.defineProperty(mixed, "min", { value: mixed._a, writable: true, configurable: true });
    Object.defineProperty(mixed, "max", { value: mixed._b, writable: true, configurable: true });

    expect(() => Interval.intervalType(mixed)).toThrow("Both endpoints must be of the same type");

    (Interval as any).validInterval = originalValid;
  });

  it("createIntervalGap removes fully contained intervals", () => {
    const set = new IntervalSet();
    set.addInterval("[1, 10]");
    set.createIntervalGap("[0, 20]");
    expect(set.intervals.length).toBe(0);
  });

  it("compareNumeric returns 0 for unexpected types", () => {
    expect(compareNumeric(null as any, undefined as any)).toBe(0);
  });

  it("range throws for non-integer start when step is bigint", () => {
    expect(() => {
      for (const _ of range("[0.5, 3]", 1n)) {
        /* empty */
      }
    }).toThrow("Cannot convert non-integer start value 0.5 to bigint");
  });

  it("range throws for non-integer end when step is bigint", () => {
    expect(() => {
      for (const _ of range("[0, 1.5]", 1n)) {
        /* empty */
      }
    }).toThrow("Cannot convert non-integer end value 1.5 to bigint");
  });

  it("rangeBigInt stops when Interval.compareNumeric throws", () => {
    const originalCompare = (Interval as any).compareNumeric;
    let calls = 0;
    (Interval as any).compareNumeric = () => {
      calls++;
      if (calls >= 2) throw new Error("boom");
      return -1;
    };

    const out: any[] = [];
    for (const n of range("[0n, 10n]", 1n)) {
      out.push(n);
    }
    // If inner catch worked, iteration should stop gracefully with at most one element
    expect(out.length).toBeLessThanOrEqual(1);

    (Interval as any).compareNumeric = originalCompare;
  });

  it("range wraps non-Error thrown values as Error with stringified message", () => {
    const badInterval = {
      a: {
        get number() {
          throw "bad";
        },
        isClosed: true,
      },
      b: { number: 10, isClosed: true },
    };

    expect(() => {
      for (const _ of range(badInterval as any, 1)) {
        /* empty */
      }
    }).toThrow("Invalid interval: bad");
  });
});
