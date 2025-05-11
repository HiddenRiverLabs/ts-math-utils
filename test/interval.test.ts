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
});