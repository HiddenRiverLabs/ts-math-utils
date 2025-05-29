import { Interval, IntervalNumber } from '../src/interval';

describe('Interval', () => {
  it('should create a valid interval from IntervalNumber objects', () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    expect(interval.toString()).toBe('[1, 5)');
  });

  it('should create a valid interval from a string', () => {
    const interval = Interval.toInterval('(1, 5]');
    expect(interval.toString()).toBe('(1, 5]');
  });

  it('should check if an IntervalNumber is contained within the interval', () => {
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

  it('should check if another interval is contained within the interval', () => {
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

  it('should correctly check containsMin for open and closed boundaries', () => {
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

  it('should correctly check containsMax for open and closed boundaries', () => {
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

  it('should check if two intervals overlap', () => {
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

  it('should validate a correct interval string', () => {
    expect(Interval.validIntervalString('[1, 5)')).toBe(true);
    expect(Interval.validIntervalString('(1, 5]')).toBe(true);
    expect(Interval.validIntervalString('[1, 5]')).toBe(true);
    expect(Interval.validIntervalString('(1, 5)')).toBe(true);
    expect(Interval.validIntervalString('[5, 1)')).toBe(true);
    expect(Interval.validIntervalString('(5, 1]')).toBe(true);
    expect(Interval.validIntervalString('[5, 1]')).toBe(true);
    expect(Interval.validIntervalString('(5, 1)')).toBe(true);
    expect(Interval.validIntervalString('[-5, 0)')).toBe(true);
    expect(Interval.validIntervalString('(-5, 0]')).toBe(true);
    expect(Interval.validIntervalString('[-5, 0]')).toBe(true);
    expect(Interval.validIntervalString('(-5, 0)')).toBe(true);
    expect(Interval.validIntervalString('[-Infinity, Infinity)')).toBe(true);
    expect(Interval.validIntervalString('(-Infinity, Infinity]')).toBe(true);
    expect(Interval.validIntervalString('[-Infinity, Infinity]')).toBe(true);
    expect(Interval.validIntervalString('(-Infinity, Infinity)')).toBe(true);
    expect(Interval.validIntervalString('[Infinity, -Infinity)')).toBe(true);
    expect(Interval.validIntervalString('[Infinity, -Infinity]')).toBe(true);
    expect(Interval.validIntervalString('(Infinity, -Infinity]')).toBe(true);
    expect(Interval.validIntervalString('(Infinity, -Infinity)')).toBe(true);
  });

  it('should correctly check containsNumber for open and closed boundaries', () => {
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

  it('should throw an error for invalid intervals with equal endpoints that are both excluded', () => {
    expect(() => {
      new Interval({
        a: new IntervalNumber(5, false),
        b: new IntervalNumber(5, false),
      });
    }).toThrow(
      'Invalid interval: Cannot exclude both minimum (5) and maximum (5) values if they are equal.'
    );
  });

  it('should handle intervals with Infinity and -Infinity', () => {
    const interval = new Interval({
      a: new IntervalNumber(-Infinity, false),
      b: new IntervalNumber(Infinity, false),
    });

    expect(interval.toString()).toBe('(-Infinity, Infinity)');
    expect(interval.contains(new IntervalNumber(0))).toBe(true);
  });

  it('should invalidate an incorrect interval string', () => {
    expect(Interval.validIntervalString('1, 5)')).toBe(false);
    expect(Interval.validIntervalString('(1, 5')).toBe(false);
  });

  it('should invalidate interval strings with missing brackets or invalid characters', () => {
    expect(Interval.validIntervalString('1, 5)')).toBe(false);
    expect(Interval.validIntervalString('(1, 5')).toBe(false);
    expect(Interval.validIntervalString('[1, 5')).toBe(false);
    expect(Interval.validIntervalString('(1, 5]abc')).toBe(false);
    expect(Interval.validIntervalString('abc[1, 5]')).toBe(false);
    expect(Interval.validIntervalString('1, 5')).toBe(false);
  });

  it('should throw an error for an invalid interval string in toInterval', () => {
    expect(() => {
      Interval.toInterval('1, 5)');
    }).toThrow('Invalid interval string.');
  });

  it('should correctly update the min and max values', () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(10, true),
    });

    interval.min = new IntervalNumber(0, false);
    interval.max = new IntervalNumber(15, false);

    expect(interval.toString()).toBe('(0, 15)');
  });

  it('should handle intervals with equal endpoints that are both included', () => {
    const interval = new Interval({
      a: new IntervalNumber(5, true),
      b: new IntervalNumber(5, true),
    });

    expect(interval.toString()).toBe('[5, 5]');
    expect(interval.contains(new IntervalNumber(5))).toBe(true);
  });

  it('should check if an interval contains its own endpoints', () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    expect(interval.contains(new IntervalNumber(1))).toBe(true);
    expect(interval.contains(new IntervalNumber(5))).toBe(false);
  });

  it('should handle intervals with one endpoint as Infinity', () => {
    const interval = new Interval({
      a: new IntervalNumber(5, true),
      b: new IntervalNumber(Infinity, false),
    });

    expect(interval.toString()).toBe('[5, Infinity)');
    expect(interval.contains(new IntervalNumber(100))).toBe(true);
    expect(interval.contains(new IntervalNumber(Infinity))).toBe(false);
  });

  it('should handle intervals with equal endpoints where one is closed and the other is open', () => {
    const interval1 = new Interval({
      a: new IntervalNumber(5, true),
      b: new IntervalNumber(5, false),
    });

    const interval2 = new Interval({
      a: new IntervalNumber(5, false),
      b: new IntervalNumber(5, true),
    });

    expect(interval1.toString()).toBe('[5, 5)');
    expect(interval2.toString()).toBe('(5, 5]');
  });

  it('should correctly identify overlapping intervals with shared boundaries', () => {
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

  it('should handle intervals with reversed endpoints', () => {
    const interval = new Interval({
      a: new IntervalNumber(10, true),
      b: new IntervalNumber(1, false),
    });

    expect(interval.min.number).toBe(1);
    expect(interval.max.number).toBe(10);
    expect(interval.toString()).toBe('[10, 1)');
  });

  it('should handle intervals that include or exclude zero', () => {
    const interval = new Interval({
      a: new IntervalNumber(-5, true),
      b: new IntervalNumber(0, false),
    });

    expect(interval.contains(new IntervalNumber(0))).toBe(false);
    expect(interval.contains(new IntervalNumber(-5))).toBe(true);
  });

  it('should handle intervals with very large numbers', () => {
    const interval = new Interval({
      a: new IntervalNumber(Number.MIN_SAFE_INTEGER, true),
      b: new IntervalNumber(Number.MAX_SAFE_INTEGER, false),
    });

    expect(interval.contains(new IntervalNumber(0))).toBe(true);
    expect(interval.contains(new IntervalNumber(Number.MAX_SAFE_INTEGER))).toBe(false);
  });

  it('should correctly identify nested intervals', () => {
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

  it('should correctly identify adjacent intervals', () => {
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

  it('should handle intervals with mixed open and closed boundaries', () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    expect(interval.contains(new IntervalNumber(1))).toBe(true);
    expect(interval.contains(new IntervalNumber(5))).toBe(false);
  });

  it('should return true for equal IntervalNumbers (same number and isClosed)', () => {
    const n1 = new IntervalNumber(5, true);
    const n2 = new IntervalNumber(5, true);
    expect(n1.equals(n2)).toBe(true);
  });

  it('should return false for IntervalNumbers with different numbers', () => {
    const n1 = new IntervalNumber(5, true);
    const n2 = new IntervalNumber(6, true);
    expect(n1.equals(n2)).toBe(false);
  });

  it('should return false for IntervalNumbers with different isClosed', () => {
    const n1 = new IntervalNumber(5, true);
    const n2 = new IntervalNumber(5, false);
    expect(n1.equals(n2)).toBe(false);
  });

  it('should return true when comparing to a number with same value and default isClosed', () => {
    const n1 = new IntervalNumber(5, true);
    expect(n1.equals(5)).toBe(true);
  });

  it('should return false when comparing to a number with different value', () => {
    const n1 = new IntervalNumber(5, true);
    expect(n1.equals(6)).toBe(false);
  });

  it('should throw an error for invalid interval strings with equal excluded endpoints', () => {
    expect(() => {
      new Interval('(5, 5)');
    }).toThrow(
      'Invalid interval string.'
    );
  });

  it('should throw an error for invalid interval strings with equal excluded negative endpoints', () => {
    expect(() => {
      new Interval('(-3, -3)');
    }).toThrow(
      'Invalid interval string.'
    );
  });

  it('should throw an error for invalid interval strings with equal excluded infinite endpoints', () => {
    expect(() => {
      new Interval('(-Infinity, -Infinity)');
    }).toThrow(
      'Invalid interval string.'
    );
  });

  it('should throw an error when setting a to match b with both endpoints open', () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, false),
    });

    expect(() => {
      interval.a = new IntervalNumber(5, false);
    }).toThrow('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
  });

  it('should not throw when setting a to match b if at least one endpoint is closed', () => {
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
    }).toThrow('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
  });

  it('should throw an error when setting b to match a with both endpoints open', () => {
    const interval = new Interval({
      a: new IntervalNumber(5, false),
      b: new IntervalNumber(10, true),
    });

    expect(() => {
      interval.b = new IntervalNumber(5, false);
    }).toThrow('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
  });

  it('should not throw when setting b to match a if at least one endpoint is closed', () => {
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
    }).toThrow('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
  });

  it('should update the min endpoint when setting min', () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(10, true),
    });

    interval.min = new IntervalNumber(0, false);
    expect(interval.a.number).toBe(0);
    expect(interval.a.isClosed).toBe(false);
    expect(interval.min.number).toBe(0);
    expect(interval.toString()).toBe('(0, 10]');
  });

  it('should update the min endpoint when endpoints are reversed', () => {
    const interval = new Interval({
      a: new IntervalNumber(10, true),
      b: new IntervalNumber(1, false),
    });

    interval.min = new IntervalNumber(0, false);
    // b is the min, so b should be updated
    expect(interval.b.number).toBe(0);
    expect(interval.b.isClosed).toBe(false);
    expect(interval.min.number).toBe(0);
    expect(interval.toString()).toBe('[10, 0)');
  });

  it('should throw an error when setting min to match the other endpoint with both open', () => {
    const interval = new Interval({
      a: new IntervalNumber(1, false),
      b: new IntervalNumber(5, false),
    });

    expect(() => {
      interval.min = new IntervalNumber(5, false);
    }).toThrow('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
  });

  it('should update the max endpoint when setting max', () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(10, true),
    });

    interval.max = new IntervalNumber(15, false);
    expect(interval.b.number).toBe(15);
    expect(interval.b.isClosed).toBe(false);
    expect(interval.max.number).toBe(15);
    expect(interval.toString()).toBe('[1, 15)');
  });

  it('should update the max endpoint when endpoints are reversed', () => {
    const interval = new Interval({
      a: new IntervalNumber(10, true),
      b: new IntervalNumber(1, false),
    });

    interval.max = new IntervalNumber(15, false);
    // a is the max, so a should be updated
    expect(interval.a.number).toBe(15);
    expect(interval.a.isClosed).toBe(false);
    expect(interval.max.number).toBe(15);
    expect(interval.toString()).toBe('(15, 1)');
  });

  it('should throw an error when setting max to match the other endpoint with both open', () => {
    const interval = new Interval({
      a: new IntervalNumber(1, false),
      b: new IntervalNumber(5, false),
    });

    expect(() => {
      interval.max = new IntervalNumber(1, false);
    }).toThrow('Invalid interval. Cannot exclude either minimum and maximum values if they are equal.');
  });

  it('should return true for a valid open/closed interval', () => {
    expect(Interval.validIntervalString('[1, 5)')).toBe(true);
    expect(Interval.validIntervalString('(1, 5]')).toBe(true);
    expect(Interval.validIntervalString('[1, 5]')).toBe(true);
    expect(Interval.validIntervalString('(1, 5)')).toBe(true);
  });

  it('should return true for intervals with infinite endpoints', () => {
    expect(Interval.validIntervalString('(-Infinity, 5]')).toBe(true);
    expect(Interval.validIntervalString('[1, Infinity)')).toBe(true);
    expect(Interval.validIntervalString('(-Infinity, Infinity)')).toBe(true);
  });

  it('should return true for equal endpoints if both are closed', () => {
    expect(Interval.validIntervalString('[5, 5]')).toBe(true);
    expect(Interval.validIntervalString('[0, 0]')).toBe(true);
    expect(Interval.validIntervalString('[-Infinity, -Infinity]')).toBe(true);
    expect(Interval.validIntervalString('[Infinity, Infinity]')).toBe(true);
    expect(Interval.validIntervalString('[-5, -5]')).toBe(true);
  });

  it('should return false for equal endpoints if both open', () => {
    expect(Interval.validIntervalString('(5, 5]')).toBe(false);
    expect(Interval.validIntervalString('[5, 5)')).toBe(false);
    expect(Interval.validIntervalString('(5, 5)')).toBe(false);
    expect(Interval.validIntervalString('(-Infinity, -Infinity)')).toBe(false);
    expect(Interval.validIntervalString('(-Infinity, -Infinity]')).toBe(false);
    expect(Interval.validIntervalString('(-Infinity, -Infinity)')).toBe(false);
    expect(Interval.validIntervalString('(-5, -5)')).toBe(false);
    expect(Interval.validIntervalString('(-5, -5]')).toBe(false);
  });

  it('should return false for malformed or missing brackets', () => {
    expect(Interval.validIntervalString('1, 5]')).toBe(false);
    expect(Interval.validIntervalString('[1, 5')).toBe(false);
    expect(Interval.validIntervalString('1, 5')).toBe(false);
    expect(Interval.validIntervalString('')).toBe(false);
  });

  it('should return false for non-numeric endpoints', () => {
    expect(Interval.validIntervalString('[a, b]')).toBe(false);
    expect(Interval.validIntervalString('[1, b]')).toBe(false);
    expect(Interval.validIntervalString('[a, 5]')).toBe(false);
  });

  it('should accept a number and convert it to IntervalNumber when setting a', () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, true),
    });

    interval.a = 3; // should use isClosed = true by default
    expect(interval.a.number).toBe(3);
    expect(interval.a.isClosed).toBe(true);
    expect(interval.toString()).toBe('[3, 5]');
    expect(interval.min.number).toBe(3);
  });

  it('should accept an IntervalNumber when setting a', () => {
    const interval = new Interval({
      a: new IntervalNumber(1, true),
      b: new IntervalNumber(5, true),
    });

    interval.a = new IntervalNumber(2, false);
    expect(interval.a.number).toBe(2);
    expect(interval.a.isClosed).toBe(false);
    expect(interval.toString()).toBe('(2, 5]');
    expect(interval.min.number).toBe(2);
  });
});