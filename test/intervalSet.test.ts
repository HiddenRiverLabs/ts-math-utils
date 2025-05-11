import { IntervalSet } from '../src/intervalSet';
import { IntervalNumber } from '../src/interval';

describe('IntervalSet', () => {
  it('should add a single interval', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });

    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe('[1, 5]');
  });

  it('should merge overlapping intervals', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });
    intervalSet.addInterval({ a: new IntervalNumber(4), b: new IntervalNumber(10) });

    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe('[1, 10]');
  });

  it('should merge connected intervals when mergeAddedInterval is true', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe('[1, 10]');
  });

  it('should remove an interval by name', () => {
    const intervalSet = new IntervalSet({
      intervals: [
        { a: new IntervalNumber(1), b: new IntervalNumber(5), name: 'Interval 1' },
        { a: new IntervalNumber(10), b: new IntervalNumber(15), name: 'Interval 2' }
      ]
    });

    intervalSet.removeIntervalByName('Interval 1');
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].name).toBe('Interval 2');
  });

  it('should not remove an interval if the name does not exist', () => {
    const intervalSet = new IntervalSet({
      intervals: [
        { a: new IntervalNumber(1), b: new IntervalNumber(5), name: 'Interval 1' }
      ]
    });

    intervalSet.removeIntervalByName('Nonexistent');
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].name).toBe('Interval 1');
  });

  it('should not merge intervals when mergeAddedInterval is false', () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });
    intervalSet.addInterval({ a: new IntervalNumber(4), b: new IntervalNumber(10) });

    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe('[1, 5]');
    expect(intervalSet.intervals[1].toString()).toBe('[4, 10]');
  });

  it('should remove an interval', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });
    intervalSet.addInterval({ a: new IntervalNumber(10, false), b: new IntervalNumber(15) });
    intervalSet.removeInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });

    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe('(10, 15]');
    intervalSet.removeInterval({ a: new IntervalNumber(10), b: new IntervalNumber(15) });
    expect(intervalSet.intervals.length).toBe(1);
    intervalSet.removeInterval({ a: new IntervalNumber(10, false), b: new IntervalNumber(15) });
    expect(intervalSet.intervals.length).toBe(0);
  });

  it('should not remove an interval that does not exist', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });
    intervalSet.removeInterval({ a: new IntervalNumber(10), b: new IntervalNumber(15) });

    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe('[1, 5]');
  });

  it('should clear all intervals', () => {
    const intervalSet = new IntervalSet({
      intervals: [
        { a: new IntervalNumber(1), b: new IntervalNumber(5) },
        { a: new IntervalNumber(10), b: new IntervalNumber(15) }
      ]
    });

    intervalSet.clear();
    expect(intervalSet.intervals.length).toBe(0);
  });

  it('should return gaps between intervals', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(10), b: new IntervalNumber(15) });
    intervalSet.addInterval({ a: new IntervalNumber(20), b: new IntervalNumber(25) });

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(2);
    expect(gaps[0].toString()).toBe('[5, 10)');
    expect(gaps[1].toString()).toBe('(15, 20)');
  });

  it('should return no gaps when intervals are adjacent', () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(0);
  });

  it('should chain intervals to remove gaps', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(10), b: new IntervalNumber(15) });

    intervalSet.chainIntervals();
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe('[1, 5)');
    expect(intervalSet.intervals[1].toString()).toBe('[5, 15]');
  });

  it('should return intervals containing a specific number', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });

    const intervals = intervalSet.getIntervalsContaining(3);
    expect(intervals.length).toBe(1);
    expect(intervals[0].toString()).toBe('[1, 5]');
  });

  it('should return no intervals if the number is not contained', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });

    const intervals = intervalSet.getIntervalsContaining(10);
    expect(intervals.length).toBe(0);
  });

  it('should return intervals containing a specific IntervalNumber with open/closed boundaries', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1, false), b: new IntervalNumber(5, true) });

    // 1 is not included (open)
    expect(intervalSet.getIntervalsContaining(1).length).toBe(0);
    // 5 is included (closed)
    expect(intervalSet.getIntervalsContaining(5).length).toBe(1);
  });

  it('should create a gap in an existing interval', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10) });
    intervalSet.createIntervalGap({ a: new IntervalNumber(4), b: new IntervalNumber(6) });
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe('[1, 4)');
    expect(intervalSet.intervals[1].toString()).toBe('(6, 10]');
  });

  it('should not create a gap if the interval does not exist', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10) });
    intervalSet.createIntervalGap({ a: new IntervalNumber(20), b: new IntervalNumber(30) });
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe('[1, 10]');
  });

  it('should return the correct string representation', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });
    intervalSet.addInterval({ a: new IntervalNumber(10), b: new IntervalNumber(15) });

    expect(intervalSet.toString()).toBe('[1, 5], [10, 15]');
  });

  it('should return the correct string representation with gaps', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });
    intervalSet.addInterval({ a: new IntervalNumber(10), b: new IntervalNumber(15) });
    intervalSet.createIntervalGap({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    expect(intervalSet.toString()).toBe('[1, 5), (10, 15]');
  });

  it('should chain intervals when mergeAddedInterval is false', () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });
    intervalSet.addInterval({ a: new IntervalNumber(4), b: new IntervalNumber(10) });

    intervalSet.chainIntervals();
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe('[1, 5]');
    expect(intervalSet.intervals[1].toString()).toBe('(5, 10]');
  });
});