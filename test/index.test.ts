/// <reference types="jest" />
import { formatNumericValue, Interval, IntervalSet, range } from "../src/index";

describe("index re-exports", () => {
  it("formatNumericValue re-export works for bigint and number", () => {
    expect(formatNumericValue(10n)).toBe("10n");
    expect(formatNumericValue(5)).toBe("5");
  });

  it("Interval and IntervalSet are usable via index exports", () => {
    const i = new Interval("[1, 3]");
    expect(i.toString()).toBe("[1, 3]");

    const set = new IntervalSet({ intervals: ["[1, 3]"] });
    expect(set.toString()).toBe("[1, 3]");
  });

  it("range is exported and iterable", () => {
    const out: number[] = [];
    for (const n of range("[0, 1]", 1)) {
      out.push(n as number);
    }
    expect(out).toEqual([0, 1]);
  });
});
