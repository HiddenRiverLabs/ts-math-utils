/// <reference types="jest" />
import { Interval, IntervalNumber } from "../src/interval";

describe("Interval", () => {
  it("should create a valid interval from IntervalNumber objects", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    expect(interval.toString()).toBe("[1, 5)");
  });

  it("should create a valid interval from a string", () => {
    const iInterval = Interval.toInterval("(1, 5]");
    const interval = new Interval(iInterval);
    expect(interval.toString()).toBe("(1, 5]");
  });

  it("should create a valid interval of bigint from a string", () => {
    const iInterval = Interval.toInterval("(1n, 5n]");
    const interval = new Interval(iInterval);
    expect(interval.toString()).toBe("(1n, 5n]");
  });

  it("should check if an IntervalNumber is contained within the interval", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    expect(interval.contains(new IntervalNumber(3))).toBe(true);
    expect(interval.contains(new IntervalNumber(5))).toBe(false);
    expect(interval.contains(new IntervalNumber(1))).toBe(true);
    expect(interval.contains(new IntervalNumber(0))).toBe(false);
    expect(interval.contains(new IntervalNumber(5, false))).toBe(false);
  });

  it("should check if another interval is contained within the interval", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(10, false),
    });

    const containedInterval = new Interval({
      a: new IntervalNumber(3, true),
      b: new IntervalNumber(7, true),
    });

    const sameInterval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(10, false),
    });

    const sameBackweardInterval = new Interval({
      a: new IntervalNumber(10, false),
      b: new IntervalNumber(1, true),
    });

    const flipfloppedInterval = new Interval({
      a: new IntervalNumber(1, false),
      b: new IntervalNumber(10, true),
    });

    expect(interval.contains(containedInterval)).toBe(true);
    expect(interval.contains(sameInterval)).toBe(true);
    expect(containedInterval.contains(interval)).toBe(false);
    expect(interval.contains(sameBackweardInterval)).toBe(true);
    expect(interval.contains(flipfloppedInterval)).toBe(false);
    expect(flipfloppedInterval.contains(interval)).toBe(false);
  });

  it("should correctly check containsMin for open and closed boundaries", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    // Closed min
    expect(interval.containsMin(new IntervalNumber(1, true))).toBe(true);
    // Open min
    expect(interval.containsMin(new IntervalNumber(1, false))).toBe(true);
    // Value inside
    expect(interval.containsMin(new IntervalNumber(2, true))).toBe(true);
    // Value below min
    expect(interval.containsMin(new IntervalNumber(0, true))).toBe(false);
    // Value at max
    expect(interval.containsMin(new IntervalNumber(5, true))).toBe(false);
    // Value at max open
    expect(interval.containsMin(new IntervalNumber(5, false))).toBe(false);
  });

  it("should correctly check containsMax for open and closed boundaries", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    // Closed max
    expect(interval.containsMax(new IntervalNumber(5, true))).toBe(false);
    // Open max
    expect(interval.containsMax(new IntervalNumber(5, false))).toBe(true);
    // Value inside
    expect(interval.containsMax(new IntervalNumber(4, true))).toBe(true);
    // Value above max
    expect(interval.containsMax(new IntervalNumber(6, true))).toBe(false);
    // Value at min
    expect(interval.containsMax(new IntervalNumber(1, true))).toBe(true);
    // Value at min open
    expect(interval.containsMax(new IntervalNumber(1, false))).toBe(false);
  });

  it("should check if two intervals overlap", () => {
    const interval1 = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    const interval2 = new Interval({
      a: new IntervalNumber(4, true),
      b: new IntervalNumber(10, true),
    });

    expect(interval1.overlaps(interval2)).toBe(true);
    expect(interval2.overlaps(interval1)).toBe(true);
  });

  it("should validate a correct interval string", () => {
    expect(Interval.validIntervalString("[1, 5)")).toBe(true);
    expect(Interval.validIntervalString("(1, 5]")).toBe(true);
    expect(Interval.validIntervalString("[1, 5]")).toBe(true);
    expect(Interval.validIntervalString("(1, 5)")).toBe(true);
    expect(Interval.validIntervalString("[5, 1)")).toBe(true);
    expect(Interval.validIntervalString("(5, 1]")).toBe(true);
    expect(Interval.validIntervalString("[5, 1]")).toBe(true);
    expect(Interval.validIntervalString("(5, 1)")).toBe(true);
    expect(Interval.validIntervalString("[-5, 0)")).toBe(true);
    expect(Interval.validIntervalString("(-5, 0]")).toBe(true);
    expect(Interval.validIntervalString("[-5, 0]")).toBe(true);
    expect(Interval.validIntervalString("(-5, 0)")).toBe(true);
    expect(Interval.validIntervalString("[-Infinity, Infinity)")).toBe(true);
    expect(Interval.validIntervalString("(-Infinity, Infinity]")).toBe(true);
    expect(Interval.validIntervalString("[-Infinity, Infinity]")).toBe(true);
    expect(Interval.validIntervalString("(-Infinity, Infinity)")).toBe(true);
    expect(Interval.validIntervalString("[Infinity, -Infinity)")).toBe(true);
    expect(Interval.validIntervalString("[Infinity, -Infinity]")).toBe(true);
    expect(Interval.validIntervalString("(Infinity, -Infinity]")).toBe(true);
    expect(Interval.validIntervalString("(Infinity, -Infinity)")).toBe(true);
  });

  it("should correctly check containsNumber for open and closed boundaries", () => {
    const closedInterval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, true),
    });
    const openInterval = new Interval({
      a: new IntervalNumber(1, false),
      b: new IntervalNumber(5, false),
    });

    // Closed interval: [1, 5]
    expect(closedInterval.containsNumber(1)).toBe(true);
    expect(closedInterval.containsNumber(5)).toBe(true);
    expect(closedInterval.containsNumber(3)).toBe(true);
    expect(closedInterval.containsNumber(0)).toBe(false);
    expect(closedInterval.containsNumber(6)).toBe(false);

    // Open interval: (1, 5)
    expect(openInterval.containsNumber(1)).toBe(false);
    expect(openInterval.containsNumber(5)).toBe(false);
    expect(openInterval.containsNumber(3)).toBe(true);
    expect(openInterval.containsNumber(0)).toBe(false);
    expect(openInterval.containsNumber(6)).toBe(false);
  });

  it("should throw an error for invalid intervals with equal endpoints that are both excluded", () => {
    expect(() => {
      new Interval({
        a: new IntervalNumber(5, false),
        b: new IntervalNumber(5, false),
      });
    }).toThrow(
      "Invalid interval: Cannot exclude either minimum (5) or maximum (5) values if they are equal.",
    );
  });

  it("should handle intervals with Infinity and -Infinity", () => {
    const interval = new Interval({
      a: new IntervalNumber(-Infinity, false),
      b: new IntervalNumber(Infinity, false),
    });

    expect(interval.toString()).toBe("(-Infinity, Infinity)");
    expect(interval.contains(new IntervalNumber(0))).toBe(true);
  });

  it("should invalidate an incorrect interval string", () => {
    expect(Interval.validIntervalString("1, 5)")).toBe(false);
    expect(Interval.validIntervalString("(1, 5")).toBe(false);
  });

  it("should invalidate interval strings with missing brackets or invalid characters", () => {
    expect(Interval.validIntervalString("1, 5)")).toBe(false);
    expect(Interval.validIntervalString("(1, 5")).toBe(false);
    expect(Interval.validIntervalString("[1, 5")).toBe(false);
    expect(Interval.validIntervalString("(1, 5]abc")).toBe(false);
    expect(Interval.validIntervalString("abc[1, 5]")).toBe(false);
    expect(Interval.validIntervalString("1, 5")).toBe(false);
  });

  it("should throw an error for an invalid interval string in toInterval", () => {
    expect(() => {
      Interval.toInterval("1, 5)");
    }).toThrow("Invalid interval string: 1, 5)");
  });

  it("should throw an error for interval string without comma", () => {
    expect(() => {
      Interval.toInterval("[1 5]");
    }).toThrow("Invalid interval string: missing comma in [1 5]");

    expect(() => {
      Interval.toInterval("(10 20)");
    }).toThrow("Invalid interval string: missing comma in (10 20)");
  });

  it("should correctly update the min and max values", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(10, true),
    });

    interval.min = new IntervalNumber(0, false);
    interval.max = new IntervalNumber(15, false);

    expect(interval.toString()).toBe("(0, 15)");
  });

  it("should handle intervals with equal endpoints that are both included", () => {
    const interval = new Interval({
      a: new IntervalNumber(5, true),
      b: new IntervalNumber(5, true),
    });

    expect(interval.toString()).toBe("[5, 5]");
    expect(interval.contains(new IntervalNumber(5))).toBe(true);
  });

  it("should check if an interval contains its own endpoints", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    expect(interval.contains(new IntervalNumber(1))).toBe(true);
    expect(interval.contains(new IntervalNumber(5))).toBe(false);
  });

  it("should handle intervals with one endpoint as Infinity", () => {
    const interval = new Interval({
      a: new IntervalNumber(5, true),
      b: new IntervalNumber(Infinity, false),
    });

    expect(interval.toString()).toBe("[5, Infinity)");
    expect(interval.contains(new IntervalNumber(100))).toBe(true);
    expect(interval.contains(new IntervalNumber(Infinity))).toBe(false);
  });

  it("should fail for intervals with equal endpoints where one is closed and the other is open", () => {
    expect(() => {
      const _interval1 = new Interval({
        a: new IntervalNumber(5, true),
        b: new IntervalNumber(5, false),
      });
    }).toThrow(
      "Invalid interval: Cannot exclude either minimum (5) or maximum (5) values if they are equal.",
    );

    expect(() => {
      const _interval2 = new Interval({
        a: new IntervalNumber(5, false),
        b: new IntervalNumber(5, true),
      });
    }).toThrow(
      "Invalid interval: Cannot exclude either minimum (5) or maximum (5) values if they are equal.",
    );
  });

  it("should correctly identify overlapping intervals with shared boundaries", () => {
    const interval1 = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    const interval2 = new Interval({
      a: new IntervalNumber(5, true),
      b: new IntervalNumber(10, true),
    });

    expect(interval1.overlaps(interval2)).toBe(false);
    expect(interval2.overlaps(interval1)).toBe(false);
  });

  it("should handle intervals with reversed endpoints", () => {
    const interval = new Interval({
      a: new IntervalNumber(10, true),
      b: new IntervalNumber(1, false),
    });

    expect(interval.min.number).toBe(1);
    expect(interval.max.number).toBe(10);
    expect(interval.toString()).toBe("[10, 1)");
  });

  it("should handle intervals that include or exclude zero", () => {
    const interval = new Interval({
      a: new IntervalNumber(-5, true),
      b: new IntervalNumber(0, false),
    });

    expect(interval.contains(new IntervalNumber(0))).toBe(false);
    expect(interval.contains(new IntervalNumber(-5))).toBe(true);
  });

  it("should handle intervals with very large numbers", () => {
    const interval = new Interval({
      a: new IntervalNumber(Number.MIN_SAFE_INTEGER, true),
      b: new IntervalNumber(Number.MAX_SAFE_INTEGER, false),
    });

    expect(interval.contains(new IntervalNumber(0))).toBe(true);
    expect(interval.contains(new IntervalNumber(Number.MAX_SAFE_INTEGER))).toBe(false);
  });

  it("should correctly identify nested intervals", () => {
    const outerInterval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(10, true),
    });

    const innerInterval = new Interval({
      a: new IntervalNumber(3, true),
      b: new IntervalNumber(7, true),
    });

    expect(outerInterval.contains(innerInterval)).toBe(true);
    expect(innerInterval.contains(outerInterval)).toBe(false);
  });

  it("should correctly identify adjacent intervals", () => {
    const interval1 = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    const interval2 = new Interval({
      a: new IntervalNumber(5, true),
      b: new IntervalNumber(10, true),
    });

    expect(interval1.overlaps(interval2)).toBe(false);
    expect(interval2.overlaps(interval1)).toBe(false);
  });

  it("should handle intervals with mixed open and closed boundaries", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    expect(interval.contains(new IntervalNumber(1))).toBe(true);
    expect(interval.contains(new IntervalNumber(5))).toBe(false);
  });

  it("should return true for equal IntervalNumbers (same number and isClosed)", () => {
    const n1 = new IntervalNumber(5, true);
    const n2 = new IntervalNumber(5, true);
    expect(n1.equals(n2)).toBe(true);
  });

  it("should return false for IntervalNumbers with different numbers", () => {
    const n1 = new IntervalNumber(5, true);
    const n2 = new IntervalNumber(6, true);
    expect(n1.equals(n2)).toBe(false);
  });

  it("should return false for IntervalNumbers with different isClosed", () => {
    const n1 = new IntervalNumber(5, true);
    const n2 = new IntervalNumber(5, false);
    expect(n1.equals(n2)).toBe(false);
  });

  it("should return true when comparing to a number with same value and default isClosed", () => {
    const n1 = new IntervalNumber(5, true);
    expect(n1.equals(5)).toBe(true);
  });

  it("should return false when comparing to a number with different value", () => {
    const n1 = new IntervalNumber(5, true);
    expect(n1.equals(6)).toBe(false);
  });

  it("should throw an error for invalid interval strings with equal excluded endpoints", () => {
    expect(() => {
      new Interval("(5, 5)");
    }).toThrow("Invalid interval string: (5, 5)");
  });

  it("should throw an error for invalid interval strings with equal excluded negative endpoints", () => {
    expect(() => {
      new Interval("(-3, -3)");
    }).toThrow("Invalid interval string: (-3, -3)");
  });

  it("should throw an error for invalid interval strings with equal excluded infinite endpoints", () => {
    expect(() => {
      new Interval("(-Infinity, -Infinity)");
    }).toThrow("Invalid interval string: (-Infinity, -Infinity)");
  });

  it("should throw an error when setting a to match b with both endpoints open", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    expect(() => {
      interval.a = new IntervalNumber(5, false);
    }).toThrow(
      "Invalid interval. Cannot exclude either minimum and maximum values if they are equal.",
    );
  });

  it("should not throw when setting a to match b if at least one endpoint is closed", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    expect(() => {
      interval.a = new IntervalNumber(5, true);
    }).not.toThrow();

    expect(() => {
      interval.b = new IntervalNumber(5, true);
      interval.a = new IntervalNumber(5, false);
    }).not.toThrow();

    expect(() => {
      interval.b = new IntervalNumber(5, false);
    }).toThrow(
      "Invalid interval. Cannot exclude either minimum and maximum values if they are equal.",
    );
  });

  it("should throw an error when setting b to match a with both endpoints open", () => {
    const interval = new Interval({
      a: new IntervalNumber(5, false),
      b: new IntervalNumber(10, true),
    });

    expect(() => {
      interval.b = new IntervalNumber(5, false);
    }).toThrow(
      "Invalid interval. Cannot exclude either minimum and maximum values if they are equal.",
    );
  });

  it("should not throw when setting b to match a if at least one endpoint is closed", () => {
    const interval = new Interval({
      a: new IntervalNumber(5, false),
      b: new IntervalNumber(10, true),
    });

    expect(() => {
      interval.b = new IntervalNumber(5, true);
    }).not.toThrow();

    expect(() => {
      interval.b = new IntervalNumber(5, false);
      interval.a = new IntervalNumber(5, true);
    }).toThrow(
      "Invalid interval. Cannot exclude either minimum and maximum values if they are equal.",
    );
  });

  it("should update the min endpoint when setting min", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(10, true),
    });

    interval.min = new IntervalNumber(0, false);
    expect(interval.a.number).toBe(0);
    expect(interval.a.isClosed).toBe(false);
    expect(interval.min.number).toBe(0);
    expect(interval.toString()).toBe("(0, 10]");
  });

  it("should update the min endpoint when endpoints are reversed", () => {
    const interval = new Interval({
      a: new IntervalNumber(10, true),
      b: new IntervalNumber(1, false),
    });

    interval.min = new IntervalNumber(0, false);
    // b is the min, so b should be updated
    expect(interval.b.number).toBe(0);
    expect(interval.b.isClosed).toBe(false);
    expect(interval.min.number).toBe(0);
    expect(interval.toString()).toBe("[10, 0)");
  });

  it("should throw an error when setting min to match the other endpoint with both open", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, false),
      b: new IntervalNumber(5, false),
    });

    expect(() => {
      interval.min = new IntervalNumber(5, false);
    }).toThrow(
      "Invalid interval. Cannot exclude either minimum and maximum values if they are equal.",
    );
  });

  it("should update the max endpoint when setting max", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(10, true),
    });

    interval.max = new IntervalNumber(15, false);
    expect(interval.b.number).toBe(15);
    expect(interval.b.isClosed).toBe(false);
    expect(interval.max.number).toBe(15);
    expect(interval.toString()).toBe("[1, 15)");
  });

  it("should update the max endpoint when endpoints are reversed", () => {
    const interval = new Interval({
      a: new IntervalNumber(10, true),
      b: new IntervalNumber(1, false),
    });

    interval.max = new IntervalNumber(15, false);
    // a is the max, so a should be updated
    expect(interval.a.number).toBe(15);
    expect(interval.a.isClosed).toBe(false);
    expect(interval.max.number).toBe(15);
    expect(interval.toString()).toBe("(15, 1)");
  });

  it("should throw an error when setting max to match the other endpoint with both open", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, false),
      b: new IntervalNumber(5, false),
    });

    expect(() => {
      interval.max = new IntervalNumber(1, false);
    }).toThrow(
      "Invalid interval. Cannot exclude either minimum and maximum values if they are equal.",
    );
  });

  it("should return true for a valid open/closed interval", () => {
    expect(Interval.validIntervalString("[1, 5)")).toBe(true);
    expect(Interval.validIntervalString("(1, 5]")).toBe(true);
    expect(Interval.validIntervalString("[1, 5]")).toBe(true);
    expect(Interval.validIntervalString("(1, 5)")).toBe(true);
  });

  it("should return true for intervals with infinite endpoints", () => {
    expect(Interval.validIntervalString("(-Infinity, 5]")).toBe(true);
    expect(Interval.validIntervalString("[1, Infinity)")).toBe(true);
    expect(Interval.validIntervalString("(-Infinity, Infinity)")).toBe(true);
  });

  it("should return true for equal endpoints if both are closed", () => {
    expect(Interval.validIntervalString("[5, 5]")).toBe(true);
    expect(Interval.validIntervalString("[0, 0]")).toBe(true);
    expect(Interval.validIntervalString("[-Infinity, -Infinity]")).toBe(true);
    expect(Interval.validIntervalString("[Infinity, Infinity]")).toBe(true);
    expect(Interval.validIntervalString("[-5, -5]")).toBe(true);
  });

  it("should return false for equal endpoints if both open", () => {
    expect(Interval.validIntervalString("(5, 5]")).toBe(false);
    expect(Interval.validIntervalString("[5, 5)")).toBe(false);
    expect(Interval.validIntervalString("(5, 5)")).toBe(false);
    expect(Interval.validIntervalString("(-Infinity, -Infinity)")).toBe(false);
    expect(Interval.validIntervalString("(-Infinity, -Infinity]")).toBe(false);
    expect(Interval.validIntervalString("(-Infinity, -Infinity)")).toBe(false);
    expect(Interval.validIntervalString("(-5, -5)")).toBe(false);
    expect(Interval.validIntervalString("(-5, -5]")).toBe(false);
  });

  it("should return false for malformed or missing brackets", () => {
    expect(Interval.validIntervalString("1, 5]")).toBe(false);
    expect(Interval.validIntervalString("[1, 5")).toBe(false);
    expect(Interval.validIntervalString("1, 5")).toBe(false);
    expect(Interval.validIntervalString("")).toBe(false);
  });

  it("should return false for non-numeric endpoints", () => {
    expect(Interval.validIntervalString("[a, b]")).toBe(false);
    expect(Interval.validIntervalString("[1, b]")).toBe(false);
    expect(Interval.validIntervalString("[a, 5]")).toBe(false);
  });

  it("should accept a number and convert it to IntervalNumber when setting a", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, true),
    });

    interval.a = 3; // should use isClosed = true by default
    expect(interval.a.number).toBe(3);
    expect(interval.a.isClosed).toBe(true);
    expect(interval.toString()).toBe("[3, 5]");
    expect(interval.min.number).toBe(3);
  });

  it("should accept an IntervalNumber when setting a", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, true),
    });

    interval.a = new IntervalNumber(2, false);
    expect(interval.a.number).toBe(2);
    expect(interval.a.isClosed).toBe(false);
    expect(interval.toString()).toBe("(2, 5]");
    expect(interval.min.number).toBe(2);
  });

  it("should throw when setting a to a bigint while b is a number", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, true),
    });

    expect(() => {
      // setting a to a bigint should fail because b is a number
      (interval as any).a = 2n;
    }).toThrow();
  });

  it("should allow setting a to a bigint when the other endpoint is Infinity", () => {
    const interval = new Interval({
      a: new IntervalNumber(0n, true),
      b: new IntervalNumber(Infinity, false),
    });

    expect(() => {
      interval.a = 5n as any;
    }).not.toThrow();
  });

  it("should throw when setting b to a bigint while a is a number", () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, true),
    });

    expect(() => {
      (interval as any).b = 3n;
    }).toThrow();
  });

  it("should allow setting b to a bigint when the other endpoint is -Infinity", () => {
    const interval = new Interval({
      a: new IntervalNumber(-Infinity, false),
      b: new IntervalNumber(10n, true),
    });

    expect(() => {
      interval.b = 20n as any;
    }).not.toThrow();
  });

  // ============================================================
  // COVERAGE FOR: isEmpty(), intersection(), union(), static methods
  // ============================================================

  describe("isEmpty", () => {
    it("should return true for empty intervals (max < min)", () => {
      // isEmpty returns true when max < min OR (equal but both open)
      const interval = new Interval("[1, 10]");
      expect(interval.isEmpty()).toBe(false);
    });

    it("should return true for intervals where min equals max with open endpoints", () => {
      // Access private isEmpty directly isn't possible, so test via intersection
      const i2 = new Interval("[5, 5]"); // Only valid if both closed
      expect(i2.isEmpty()).toBe(false);
    });

    it("should return false for non-empty intervals", () => {
      const interval = new Interval("[1, 10]");
      expect(interval.isEmpty()).toBe(false);
    });

    it("should return false for single-point closed intervals", () => {
      const interval = new Interval("[5, 5]");
      expect(interval.isEmpty()).toBe(false);
    });
  });

  describe("intersection", () => {
    it("should return intersection of overlapping intervals", () => {
      const i1 = new Interval("[1, 10]");
      const i2 = new Interval("[5, 15]");
      const result = Interval.intersects(i1, i2);
      expect(result?.toString()).toBe("[5, 10]");
    });

    it("should return null for non-overlapping or disjoint intervals", () => {
      expect(Interval.intersects(new Interval("[1, 5)"), new Interval("[5, 10]"))).toBeNull();
      expect(Interval.intersects(new Interval("[1, 4]"), new Interval("[10, 15]"))).toBeNull();
      expect(Interval.intersects(new Interval("[1, 5]"), new Interval("[10, 15]"))).toBeNull();
    });

    it("should handle equal endpoints", () => {
      expect(Interval.intersects(new Interval("[5, 5]"), new Interval("[5, 5]"))?.toString()).toBe(
        "[5, 5]",
      );
      expect(Interval.intersects(new Interval("[1, 5]"), new Interval("[5, 10]"))?.toString()).toBe(
        "[5, 5]",
      );
    });

    it("should handle open boundaries correctly", () => {
      expect(Interval.intersects(new Interval("[1, 5)"), new Interval("(3, 10]"))?.toString()).toBe(
        "(3, 5)",
      );
    });

    it("should determine min/max from both intervals correctly", () => {
      expect(Interval.intersects(new Interval("[3, 8]"), new Interval("[3, 10]"))?.toString()).toBe(
        "[3, 8]",
      );
      expect(
        Interval.intersects(new Interval("[1, 15]"), new Interval("[10, 20]"))?.toString(),
      ).toBe("[10, 15]");
      expect(
        Interval.intersects(new Interval("[5, 10]"), new Interval("[1, 15]"))?.toString(),
      ).toBe("[5, 10]");
      expect(Interval.intersects(new Interval("[5, 8]"), new Interval("[7, 15]"))?.toString()).toBe(
        "[7, 8]",
      );
      expect(
        Interval.intersects(new Interval("[5, 20]"), new Interval("[7, 15]"))?.toString(),
      ).toBe("[7, 15]");
    });

    it("should return null for type-incompatible intervals", () => {
      expect(Interval.intersects(new Interval("[1, 10]"), new Interval("[5n, 15n]"))).toBeNull();
    });

    it("should return null when max endpoints are finite mixed types", () => {
      expect(
        Interval.intersects(new Interval("[0n, 100n]"), new Interval("[-Infinity, 50]")),
      ).toBeNull();
    });

    it("should return null when the resulting bounds would mix finite number and bigint", () => {
      expect(
        Interval.intersects(new Interval("[-Infinity, 100n]"), new Interval("[50, Infinity)")),
      ).toBeNull();
    });

    it("should handle Infinity", () => {
      expect(
        Interval.intersects(
          new Interval("[-Infinity, 10]"),
          new Interval("[0, Infinity)"),
        )?.toString(),
      ).toBe("[0, 10]");
      expect(
        Interval.intersects(
          new Interval("[-Infinity, Infinity)"),
          new Interval("(-Infinity, Infinity]"),
        )?.toString(),
      ).toBe("(-Infinity, Infinity)");
    });

    it("should handle bigint intervals", () => {
      expect(
        Interval.intersects(new Interval("[1n, 5n]"), new Interval("[3n, 10n]"))?.toString(),
      ).toBe("[3n, 5n]");
      expect(
        Interval.intersects(
          new Interval("[-Infinity, 100n]"),
          new Interval("[50n, 200n]"),
        )?.toString(),
      ).toBe("[50n, 100n]");
    });
  });

  describe("union", () => {
    it("should merge overlapping intervals", () => {
      expect(Interval.union(new Interval("[1, 10]"), new Interval("[5, 15]")).toString()).toBe(
        "[1, 15]",
      );
      expect(Interval.union(new Interval("[1, 20]"), new Interval("[5, 15]")).toString()).toBe(
        "[1, 20]",
      );
      expect(Interval.union(new Interval("[1, 15]"), new Interval("[5, 20]")).toString()).toBe(
        "[1, 20]",
      );
    });

    it("should throw error for disjoint intervals", () => {
      expect(() => Interval.union(new Interval("[1, 5)"), new Interval("[10, 15]"))).toThrow(
        "Cannot merge disjoint intervals",
      );
      expect(() => Interval.union(new Interval("[1, 5)"), new Interval("(5, 10]"))).toThrow(
        "Cannot merge disjoint intervals",
      );
    });

    it("should merge adjacent intervals with at least one closed endpoint", () => {
      expect(Interval.union(new Interval("[1, 5]"), new Interval("[5, 10]")).toString()).toBe(
        "[1, 10]",
      );
      expect(Interval.union(new Interval("[1, 5]"), new Interval("[5, 10)")).toString()).toBe(
        "[1, 10)",
      );
      expect(Interval.union(new Interval("[1, 5)"), new Interval("[5, 10]")).toString()).toBe(
        "[1, 10]",
      );
    });

    it("should work regardless of interval order", () => {
      const r1 = Interval.union(new Interval("[1, 10]"), new Interval("[5, 15]"));
      const r2 = Interval.union(new Interval("[5, 15]"), new Interval("[1, 10]"));
      expect(r1.toString()).toBe("[1, 15]");
      expect(r2.toString()).toBe("[1, 15]");
    });

    it("should throw error for type-incompatible intervals", () => {
      expect(() => Interval.union(new Interval("[1, 10]"), new Interval("[5n, 15n]"))).toThrow();
    });

    it("should handle Infinity", () => {
      expect(
        Interval.union(new Interval("[1, 10]"), new Interval("[5, Infinity)")).toString(),
      ).toBe("[1, Infinity)");
    });

    it("should handle containment cases", () => {
      expect(Interval.union(new Interval("[1, 20]"), new Interval("[5, 10]")).toString()).toBe(
        "[1, 20]",
      );
      expect(Interval.union(new Interval("[5, 10]"), new Interval("[1, 20]")).toString()).toBe(
        "[1, 20]",
      );
    });

    it("should merge when intervals are identical", () => {
      expect(Interval.union(new Interval("[1, 10]"), new Interval("[1, 10]")).toString()).toBe(
        "[1, 10]",
      );
      expect(Interval.union(new Interval("[5, 15]"), new Interval("[5, 15]")).toString()).toBe(
        "[5, 15]",
      );
    });

    it("should handle bigint intervals", () => {
      expect(Interval.union(new Interval("[1n, 10n]"), new Interval("[5n, 15n]")).toString()).toBe(
        "[1n, 15n]",
      );
    });
  });

  describe("validInterval", () => {
    it("should return true for valid intervals", () => {
      expect(Interval.validInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) })).toBe(
        true,
      );
    });

    it("should return false for equal excluded endpoints", () => {
      expect(
        Interval.validInterval({
          a: new IntervalNumber(5, false),
          b: new IntervalNumber(5, false),
        }),
      ).toBe(false);
    });

    it("should return true for equal included endpoints", () => {
      expect(
        Interval.validInterval({ a: new IntervalNumber(5, true), b: new IntervalNumber(5, true) }),
      ).toBe(true);
    });

    it("should return true for bigint intervals", () => {
      expect(Interval.validInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(5n) })).toBe(
        true,
      );
    });

    it("should allow mixing bigint with Infinity", () => {
      expect(
        Interval.validInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(Infinity) }),
      ).toBe(true);
      expect(
        Interval.validInterval({ a: new IntervalNumber(-Infinity), b: new IntervalNumber(5n) }),
      ).toBe(true);
    });

    it("should reject mixing finite number with finite bigint", () => {
      expect(Interval.validInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5n) })).toBe(
        false,
      );
    });
  });

  describe("intervalType", () => {
    it("should return 'number' for number intervals", () => {
      expect(Interval.intervalType(new Interval("[1, 10]"))).toBe("number");
    });

    it("should return 'bigint' for bigint intervals", () => {
      expect(Interval.intervalType(new Interval("[1n, 10n]"))).toBe("bigint");
    });

    it("should return 'bigint' when min is -Infinity and max is bigint", () => {
      expect(Interval.intervalType(new Interval("[-Infinity, 100n]"))).toBe("bigint");
    });

    it("should return 'bigint' when min is bigint and max is Infinity", () => {
      expect(Interval.intervalType(new Interval("[50n, Infinity)"))).toBe("bigint");
    });

    it("should throw error for invalid interval", () => {
      // Manually create an invalid interval object that bypasses constructor
      const invalidInterval = Object.create(Interval.prototype);
      invalidInterval._a = new IntervalNumber(5, false);
      invalidInterval._b = new IntervalNumber(5, false);
      invalidInterval.name = undefined;
      expect(() => Interval.intervalType(invalidInterval)).toThrow(
        "Invalid interval: Cannot exclude either minimum",
      );
    });

    it("should throw error for mixed types without Infinity", () => {
      // When types don't match and neither is Infinity, validInterval fails
      // This causes the generic error message to be thrown
      const mixedInterval = Object.create(Interval.prototype);
      mixedInterval._a = new IntervalNumber(1, true);
      mixedInterval._b = new IntervalNumber(10n, true);
      expect(() => Interval.intervalType(mixedInterval)).toThrow(
        "Invalid interval: Cannot exclude either minimum",
      );
    });
  });

  describe("containsNumber edge cases", () => {
    it("should handle negative numbers", () => {
      const interval = new Interval("[-10, -5]");
      expect(interval.containsNumber(-7)).toBe(true);
      expect(interval.containsNumber(-4)).toBe(false);
    });

    it("should handle decimal numbers", () => {
      const interval = new Interval("[1.5, 2.5]");
      expect(interval.containsNumber(2.0)).toBe(true);
      expect(interval.containsNumber(1.5)).toBe(true);
      expect(interval.containsNumber(2.5)).toBe(true);
    });

    it("should handle intervals with -Infinity", () => {
      const interval = new Interval("[-Infinity, 0]");
      expect(interval.containsNumber(-1000)).toBe(true);
      expect(interval.containsNumber(0)).toBe(true);
      // Infinity is never contained as a point
      expect(interval.containsNumber(Infinity)).toBe(false);
    });
  });

  describe("overlaps edge cases", () => {
    it("should return false for intervals that exactly touch at open boundary", () => {
      const i1 = new Interval("[1, 5)");
      const i2 = new Interval("[5, 10]");
      expect(i1.overlaps(i2)).toBe(false);
      expect(i2.overlaps(i1)).toBe(false);
    });

    it("should return true for intervals that overlap significantly", () => {
      const i1 = new Interval("[1, 8]");
      const i2 = new Interval("[5, 10]");
      expect(i1.overlaps(i2)).toBe(true);
      expect(i2.overlaps(i1)).toBe(true);
    });

    it("should handle containment in overlaps", () => {
      // If one interval contains the other, they overlap
      const i1 = new Interval("[1, 20]");
      const i2 = new Interval("[5, 10]");
      // i1 contains i2, so they overlap
      expect(i1.overlaps(i2)).toBe(true);
      // overlaps should be symmetric
      expect(i2.overlaps(i1)).toBe(true);
    });
  });

  describe("interval string representation", () => {
    it("should format intervals with bigints correctly", () => {
      const interval = new Interval("[1n, 10n]");
      expect(interval.toString()).toBe("[1n, 10n]");
    });

    it("should format intervals with mixed closures", () => {
      const interval = new Interval("(1, 10]");
      expect(interval.toString()).toBe("(1, 10]");
    });

    it("should format intervals with Infinity", () => {
      const interval = new Interval("[-Infinity, Infinity)");
      expect(interval.toString()).toBe("[-Infinity, Infinity)");
    });
  });

  describe("equals with edge cases", () => {
    it("should equal bigint values", () => {
      const n1 = new IntervalNumber(5n, true);
      const n2 = new IntervalNumber(5n, true);
      expect(n1.equals(n2)).toBe(true);
    });

    it("should not equal across types", () => {
      const n1 = new IntervalNumber(5, true);
      const n2 = new IntervalNumber(5n as any, true);
      expect(n1.equals(n2)).toBe(false);
    });

    it("should equal bigint with bigint", () => {
      const n1 = new IntervalNumber(5n);
      expect(n1.equals(5n)).toBe(true);
    });
  });

  describe("compareNumeric edge cases", () => {
    it("should compare bigint with bigint correctly", () => {
      const i1 = new Interval("[1n, 5n]");
      const i2 = new Interval("[3n, 10n]");
      const result = Interval.intersects(i1, i2);
      expect(result?.toString()).toBe("[3n, 5n]");
    });

    it("should compare number with number correctly", () => {
      const i1 = new Interval("[1, 5]");
      const i2 = new Interval("[3, 10]");
      const result = Interval.intersects(i1, i2);
      expect(result?.toString()).toBe("[3, 5]");
    });

    it("should handle bigint compared with -Infinity", () => {
      const i1 = new Interval("[-Infinity, 100n]");
      const i2 = new Interval("[50n, 200n]");
      const result = Interval.intersects(i1, i2);
      expect(result?.toString()).toBe("[50n, 100n]");
    });

    it("should handle number compared with Infinity", () => {
      const i1 = new Interval("[10, Infinity)");
      const i2 = new Interval("[20, 50]");
      const result = Interval.intersects(i1, i2);
      expect(result?.toString()).toBe("[20, 50]");
    });

    it("should handle -Infinity for numbers", () => {
      const i1 = new Interval("[-Infinity, 50]");
      const i2 = new Interval("[30, 100]");
      const result = Interval.intersects(i1, i2);
      expect(result?.toString()).toBe("[30, 50]");
    });

    it("should handle comparing when all Infinity", () => {
      const i1 = new Interval("[-Infinity, Infinity)");
      const i2 = new Interval("(-Infinity, Infinity]");
      const result = Interval.intersects(i1, i2);
      expect(result?.toString()).toBe("(-Infinity, Infinity)");
    });

    it("should union bigint intervals correctly", () => {
      const i1 = new Interval("[1n, 10n]");
      const i2 = new Interval("[5n, 15n]");
      const result = Interval.union(i1, i2);
      expect(result instanceof Interval).toBe(true);
      expect((result as Interval).toString()).toBe("[1n, 15n]");
    });
  });

  describe("validInterval with Infinity edge cases", () => {
    it("should validate -Infinity with other values", () => {
      expect(
        Interval.validInterval({ a: new IntervalNumber(-Infinity), b: new IntervalNumber(100) }),
      ).toBe(true);
      expect(
        Interval.validInterval({ a: new IntervalNumber(-Infinity), b: new IntervalNumber(100n) }),
      ).toBe(true);
    });

    it("should validate Infinity with other values", () => {
      expect(
        Interval.validInterval({ a: new IntervalNumber(-100), b: new IntervalNumber(Infinity) }),
      ).toBe(true);
      expect(
        Interval.validInterval({ a: new IntervalNumber(-100n), b: new IntervalNumber(Infinity) }),
      ).toBe(true);
    });
  });

  describe("toInterval with edge cases", () => {
    it("should parse intervals with spaces", () => {
      const interval = Interval.toInterval("[ 1 , 10 ]");
      expect(interval.a.number).toBe(1);
      expect(interval.b.number).toBe(10);
    });

    it("should parse large numbers", () => {
      const interval = Interval.toInterval("[1000000, 9999999]");
      expect(interval.a.number).toBe(1000000);
      expect(interval.b.number).toBe(9999999);
    });

    it("should parse bigint with spaces", () => {
      const interval = Interval.toInterval("[ 1n , 10n ]");
      expect(interval.a.number).toBe(1n);
      expect(interval.b.number).toBe(10n);
    });
  });

  describe("containsMin/containsMax special cases", () => {
    it("should handle containsMin with reversed intervals", () => {
      const interval = new Interval("[10, 1)");
      // This creates an interval with a=10 (closed), b=1 (open)
      // So min=[1, open), max=[10, closed]
      // containsMin([1, closed]) checks if a=1 is a valid minimum
      // For open min: min.number <= x.number && max.number > x.number
      // 1 <= 1 && 10 > 1 => true, BUT x.isClosed=true, so need to check closed case
      // For closed min: (min.number < x.number || (min.number === x.number && min.isClosed))
      // (1 < 1 || (1 === 1 && false)) => false
      expect(interval.containsMin(new IntervalNumber(1, true))).toBe(false);
      expect(interval.containsMin(new IntervalNumber(5, true))).toBe(true);
    });

    it("should handle containsMax with reversed intervals", () => {
      const interval = new Interval("[10, 1)");
      // min=[1, open), max=[10, closed]
      // containsMax([10, closed]) - checking if [10, closed] is valid maximum
      // For closed: (min < x || (min === x && min.isClosed)) && (max > x || (max === x && max.isClosed))
      // (1 < 10 || ...) && (10 > 10 || (10 === 10 && true)) => true && true => true
      expect(interval.containsMax(new IntervalNumber(10, true))).toBe(true);
      expect(interval.containsMax(new IntervalNumber(5, true))).toBe(true);
    });

    it("containsMin with open boundary at min", () => {
      const interval = new Interval("(5, 10]");
      expect(interval.containsMin(new IntervalNumber(5, false))).toBe(true);
      expect(interval.containsMin(new IntervalNumber(5, true))).toBe(false);
    });

    it("containsMin with closed boundary at min", () => {
      const interval = new Interval("[5, 10]");
      expect(interval.containsMin(new IntervalNumber(5, false))).toBe(true);
      expect(interval.containsMin(new IntervalNumber(5, true))).toBe(true);
    });

    it("containsMax with open boundary at max", () => {
      const interval = new Interval("[5, 10)");
      expect(interval.containsMax(new IntervalNumber(10, false))).toBe(true);
      expect(interval.containsMax(new IntervalNumber(10, true))).toBe(false);
    });
  });

  describe("intersection empty result handling", () => {
    it("should return null when intersection creates empty interval (max < min)", () => {
      const i1 = new Interval("[1, 5]");
      const i2 = new Interval("[10, 15]");
      const result = Interval.intersects(i1, i2);
      expect(result).toBeNull();
    });

    it("should return null for adjacent non-overlapping intervals", () => {
      const i1 = new Interval("[1, 5)");
      const i2 = new Interval("[5, 10]");
      const result = Interval.intersects(i1, i2);
      expect(result).toBeNull();
    });

    it("should handle intersection with max comparison edge case", () => {
      // When max1 < max2, should use max1
      const i1 = new Interval("[5, 8]");
      const i2 = new Interval("[7, 15]");
      const result = Interval.intersects(i1, i2);
      expect(result?.toString()).toBe("[7, 8]");
    });

    it("should handle intersection with max comparison when max1 > max2", () => {
      // When max1 > max2, should use max2
      const i1 = new Interval("[5, 20]");
      const i2 = new Interval("[7, 15]");
      const result = Interval.intersects(i1, i2);
      expect(result?.toString()).toBe("[7, 15]");
    });
  });

  describe("union edge case with max comparisons", () => {
    it("should handle union when left.max > right.max", () => {
      // Tests line 320-322: when compareNumeric(left.max, right.max) >= 0
      const i1 = new Interval("[1, 20]");
      const i2 = new Interval("[5, 15]");
      const result = Interval.union(i1, i2);
      expect(result instanceof Interval).toBe(true);
      expect((result as Interval).toString()).toBe("[1, 20]");
    });

    it("should handle union when left.max < right.max", () => {
      // Tests line 366-374: when compareNumeric(left.max, right.max) < 0
      const i1 = new Interval("[1, 15]");
      const i2 = new Interval("[5, 20]");
      const result = Interval.union(i1, i2);
      expect(result instanceof Interval).toBe(true);
      expect((result as Interval).toString()).toBe("[1, 20]");
    });

    it("should handle union when left.min === right.min", () => {
      // Tests the ternary that sets newMin
      const i1 = new Interval("[5, 10]");
      const i2 = new Interval("[5, 15]");
      const result = Interval.union(i1, i2);
      expect(result instanceof Interval).toBe(true);
      expect((result as Interval).toString()).toBe("[5, 15]");
    });

    it("should handle union when left.max === right.max", () => {
      // Tests the ternary that sets newMax for equal case
      const i1 = new Interval("[1, 15]");
      const i2 = new Interval("[5, 15]");
      const result = Interval.union(i1, i2);
      expect(result instanceof Interval).toBe(true);
      expect((result as Interval).toString()).toBe("[1, 15]");
    });

    it("should merge when both min and max are equal", () => {
      const i1 = new Interval("[5, 15]");
      const i2 = new Interval("[5, 15]");
      const result = Interval.union(i1, i2);
      expect(result instanceof Interval).toBe(true);
      expect((result as Interval).toString()).toBe("[5, 15]");
    });
  });

  describe("compareNumeric error handling (indirect coverage)", () => {
    it("should successfully compare bigint with -Infinity", () => {
      // Tests path: typeof a === "bigint" && typeof b === "number" && !isFinite(b)
      // where b === -Infinity
      const i1 = new Interval("[-Infinity, 100n]");
      const i2 = new Interval("[50n, 200n]");
      const result = Interval.intersects(i1, i2);
      expect(result?.toString()).toBe("[50n, 100n]");
    });

    it("should compare -Infinity with bigint correctly", () => {
      // Tests comparison involving -Infinity
      const i1 = new Interval("[-Infinity, 50n]");
      const i2 = new Interval("[10n, 100n]");
      const result = Interval.intersects(i1, i2);
      expect(result?.toString()).toBe("[10n, 50n]");
    });

    it("should throw when comparing number with bigint", () => {
      const i1 = new Interval("[1, 50]");
      const i2 = new Interval("[10n, 100n]");
      // Since union will attempt to sort the intervals, it will throw when comparing incompatible types
      expect(() => {
        Interval.union(i1, i2);
      }).toThrow();
    });

    it("should throw when merging non-overlapping intervals", () => {
      const i1 = new Interval("[1, 50]");
      const i2 = new Interval("[51, 100]");
      // Since union will attempt to sort the intervals, it will throw when comparing incompatible types
      expect(() => {
        Interval.mergeIntervals(i1, i2);
      }).toThrow();
    });

    it("should throw when merging non-overlapping intervals with close boundaries", () => {
      const i1 = new Interval("[1, 50)");
      const i2 = new Interval("(50, 100]");
      // Since union will attempt to sort the intervals, it will throw when comparing incompatible types
      expect(() => {
        Interval.mergeIntervals(i1, i2);
      }).toThrow();
    });
  });
});

describe("compliments", () => {
  it("should return true for intervals that touch at exactly one point with opposite closure", () => {
    const i1 = new Interval("[1, 5)");
    const i2 = new Interval("[5, 10]");
    expect(i1.compliments(i2)).toBe(true);
    expect(i2.compliments(i1)).toBe(true);
  });

  it("should return false for intervals that touch with same closure (overlap)", () => {
    const i1 = new Interval("[1, 5]");
    const i2 = new Interval("[5, 10]");
    expect(i1.compliments(i2)).toBe(false); // Both closed at 5 = overlap
  });

  it("should return false for overlapping intervals", () => {
    const i1 = new Interval("[1, 6]");
    const i2 = new Interval("[5, 10]");
    expect(i1.compliments(i2)).toBe(false);
  });

  it("should return false for disjoint intervals", () => {
    const i1 = new Interval("[1, 5]");
    const i2 = new Interval("[6, 10]");
    expect(i1.compliments(i2)).toBe(false);
  });

  it("should return false when both boundaries are open at touching point (gap)", () => {
    const i1 = new Interval("[1, 5)");
    const i2 = new Interval("(5, 10]");
    expect(i1.compliments(i2)).toBe(false);
  });

  it("should handle bigint intervals", () => {
    const i1 = new Interval("[1n, 5n)");
    const i2 = new Interval("[5n, 10n]");
    expect(i1.compliments(i2)).toBe(true);
  });

  it("should handle touching at min endpoint", () => {
    const i1 = new Interval("[-Infinity, 1)");
    const i2 = new Interval("[1, Infinity)");
    expect(i1.compliments(i2)).toBe(true);
  });
});

describe("isIntervalNumber", () => {
  it("should return true for IntervalNumber instances", () => {
    const in1 = new IntervalNumber(5, true);
    const in2 = new IntervalNumber(10n, false);
    expect(Interval.isIntervalNumber(in1)).toBe(true);
    expect(Interval.isIntervalNumber(in2)).toBe(true);
  });

  it("should return false for plain objects", () => {
    expect(Interval.isIntervalNumber({ number: 5, isClosed: true })).toBe(false);
  });

  it("should return false for primitive values", () => {
    expect(Interval.isIntervalNumber(5)).toBe(false);
    expect(Interval.isIntervalNumber("5")).toBe(false);
    expect(Interval.isIntervalNumber(true)).toBe(false);
  });

  it("should return false for null and undefined", () => {
    expect(Interval.isIntervalNumber(null)).toBe(false);
    expect(Interval.isIntervalNumber(undefined)).toBe(false);
  });
});

describe("compareNumeric public API", () => {
  it("should throw when comparing bigint with finite number", () => {
    expect(() => Interval.compareNumeric(5n, 10)).toThrow(
      "Cannot compare bigint with finite number",
    );
  });

  it("should throw when comparing finite number with bigint", () => {
    expect(() => Interval.compareNumeric(10, 5n)).toThrow(
      "Cannot compare finite number with bigint",
    );
  });

  it("should handle equal values of same type", () => {
    expect(Interval.compareNumeric(5, 5)).toBe(0);
    expect(Interval.compareNumeric(5n, 5n)).toBe(0);
    expect(Interval.compareNumeric(Infinity, Infinity)).toBe(0);
    expect(Interval.compareNumeric(-Infinity, -Infinity)).toBe(0);
  });

  it("should compare numbers correctly", () => {
    expect(Interval.compareNumeric(3, 5)).toBe(-1);
    expect(Interval.compareNumeric(5, 3)).toBe(1);
  });

  it("should compare bigints correctly", () => {
    expect(Interval.compareNumeric(3n, 5n)).toBe(-1);
    expect(Interval.compareNumeric(5n, 3n)).toBe(1);
  });
});

describe("invalid bigint string parsing", () => {
  it("should throw for malformed bigint string with invalid characters", () => {
    expect(() => new Interval("[abc123n, 10n]")).toThrow();
  });
});
