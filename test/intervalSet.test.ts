import { IntervalSet, IntervalSetOptions } from "../src/intervalSet";
import { Interval, IntervalNumber } from "../src/interval";

describe("IntervalSet", () => {
  it("should add a single interval", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });

    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5]");
  });

  it("should merge overlapping intervals", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });
    intervalSet.addInterval({ a: new IntervalNumber(4), b: new IntervalNumber(10) });

    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge connected intervals when mergeAddedInterval is true", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should remove an interval by name", () => {
    const intervalSet = new IntervalSet({
      intervals: [
        { a: new IntervalNumber(1), b: new IntervalNumber(5), name: "Interval 1" },
        { a: new IntervalNumber(10), b: new IntervalNumber(15), name: "Interval 2" },
      ],
    });

    intervalSet.removeIntervalByName("Interval 1");
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].name).toBe("Interval 2");
  });

  it("should not remove an interval if the name does not exist", () => {
    const intervalSet = new IntervalSet({
      intervals: [{ a: new IntervalNumber(1), b: new IntervalNumber(5), name: "Interval 1" }],
    });

    intervalSet.removeIntervalByName("Nonexistent");
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].name).toBe("Interval 1");
  });

  it("should not merge intervals when mergeAddedInterval is false", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });
    intervalSet.addInterval({ a: new IntervalNumber(4), b: new IntervalNumber(10) });

    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5]");
    expect(intervalSet.intervals[1].toString()).toBe("[4, 10]");
  });

  it("should remove an interval", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });
    intervalSet.addInterval({ a: new IntervalNumber(10, false), b: new IntervalNumber(15) });
    intervalSet.removeInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });

    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("(10, 15]");
    intervalSet.removeInterval({ a: new IntervalNumber(10), b: new IntervalNumber(15) });
    expect(intervalSet.intervals.length).toBe(1);
    intervalSet.removeInterval({ a: new IntervalNumber(10, false), b: new IntervalNumber(15) });
    expect(intervalSet.intervals.length).toBe(0);
  });

  it("should not remove an interval that does not exist", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });
    intervalSet.removeInterval({ a: new IntervalNumber(10), b: new IntervalNumber(15) });

    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5]");
  });

  it("should clear all intervals", () => {
    const intervalSet = new IntervalSet({
      intervals: [
        { a: new IntervalNumber(1), b: new IntervalNumber(5) },
        { a: new IntervalNumber(10), b: new IntervalNumber(15) },
      ],
    });

    intervalSet.clear();
    expect(intervalSet.intervals.length).toBe(0);
  });

  it("should return gaps between intervals", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(10), b: new IntervalNumber(15) });
    intervalSet.addInterval({ a: new IntervalNumber(20), b: new IntervalNumber(25) });

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(2);
    expect(gaps[0].toString()).toBe("[5, 10)");
    expect(gaps[1].toString()).toBe("(15, 20)");
  });

  it("should return no gaps when intervals are adjacent", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(0);
  });

  it("should chain intervals to remove gaps", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(10), b: new IntervalNumber(15) });

    intervalSet.chainIntervals();
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5)");
    expect(intervalSet.intervals[1].toString()).toBe("[5, 15]");
  });

  it("should return intervals containing a specific number", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });

    const intervals = intervalSet.getIntervalsContaining(3);
    expect(intervals.length).toBe(1);
    expect(intervals[0].toString()).toBe("[1, 5]");
  });

  it("should return no intervals if the number is not contained", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });

    const intervals = intervalSet.getIntervalsContaining(10);
    expect(intervals.length).toBe(0);
  });

  it("should return intervals containing a specific IntervalNumber with open/closed boundaries", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1, false), b: new IntervalNumber(5, true) });

    // 1 is not included (open)
    expect(intervalSet.getIntervalsContaining(1).length).toBe(0);
    // 5 is included (closed)
    expect(intervalSet.getIntervalsContaining(5).length).toBe(1);
  });

  it("should create a gap in an existing interval", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10) });
    intervalSet.createIntervalGap({ a: new IntervalNumber(4), b: new IntervalNumber(6) });
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 4)");
    expect(intervalSet.intervals[1].toString()).toBe("(6, 10]");
  });

  it("should create a gap without deleting non-overlapping intervals", () => {
    // Regression test for data loss bug where clear() deleted all intervals
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10) });
    intervalSet.addInterval({ a: new IntervalNumber(20), b: new IntervalNumber(30) });
    
    // Create a gap in the first interval
    intervalSet.createIntervalGap({ a: new IntervalNumber(4), b: new IntervalNumber(6) });
    
    // Should have 3 intervals: split first interval + untouched second interval
    expect(intervalSet.intervals.length).toBe(3);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 4)");
    expect(intervalSet.intervals[1].toString()).toBe("(6, 10]");
    expect(intervalSet.intervals[2].toString()).toBe("[20, 30]"); // This should still exist!
  });

  it("should not create a gap if the interval does not exist", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10) });
    intervalSet.createIntervalGap({ a: new IntervalNumber(20), b: new IntervalNumber(30) });
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should return the correct string representation", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });
    intervalSet.addInterval({ a: new IntervalNumber(10), b: new IntervalNumber(15) });

    expect(intervalSet.toString()).toBe("[1, 5], [10, 15]");
  });

  it("should return the correct string representation with gaps", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });
    intervalSet.addInterval({ a: new IntervalNumber(10), b: new IntervalNumber(15) });
    intervalSet.createIntervalGap({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    expect(intervalSet.toString()).toBe("[1, 5), (10, 15]");
  });

  it("should chain intervals when mergeAddedInterval is false", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });
    intervalSet.addInterval({ a: new IntervalNumber(4), b: new IntervalNumber(10) });

    intervalSet.chainIntervals();
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5]");
    expect(intervalSet.intervals[1].toString()).toBe("(5, 10]");
  });

  it("should sort intervals by minimum value", () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(5), b: new IntervalNumber(10) }),
      new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(3) }),
      new Interval({ a: new IntervalNumber(3), b: new IntervalNumber(4) }),
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].a.number).toBe(1);
    expect(intervals[1].a.number).toBe(3);
    expect(intervals[2].a.number).toBe(5);
  });

  it("should sort intervals with equal min so that closed comes before open", () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(1, false), b: new IntervalNumber(2) }), // (1, 2]
      new Interval({ a: new IntervalNumber(1, true), b: new IntervalNumber(2) }), // [1, 2]
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].a.isClosed).toBe(true); // [1, 2] comes before (1, 2]
    expect(intervals[1].a.isClosed).toBe(false);
  });

  it("should preserve order if min and isClosed are equal", () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(1, true), b: new IntervalNumber(2) }),
      new Interval({ a: new IntervalNumber(1, true), b: new IntervalNumber(3) }),
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].b.number).toBe(2);
    expect(intervals[1].b.number).toBe(3);
  });

  it("should sort intervals with the same min -Infinity so that closed comes before open", () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(-Infinity, false), b: new IntervalNumber(10) }), // (-Infinity, 10]
      new Interval({ a: new IntervalNumber(-Infinity, true), b: new IntervalNumber(20) }), // [-Infinity, 20]
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].a.isClosed).toBe(true); // [-Infinity, 20] comes before (-Infinity, 10]
    expect(intervals[1].a.isClosed).toBe(false);
  });

  it("should hit the a.min.isClosed && !b.min.isClosed branch in sort", () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(1, true), b: new IntervalNumber(2) }), // [1, 2]
      new Interval({ a: new IntervalNumber(1, false), b: new IntervalNumber(2) }), // (1, 2]
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].a.isClosed).toBe(true); // [1, 2] comes before (1, 2]
    expect(intervals[1].a.isClosed).toBe(false);
  });

  it("should return the gap before, between, and after intervals within a given interval", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(4) });
    intervalSet.addInterval({ a: new IntervalNumber(6), b: new IntervalNumber(8) });

    // The interval [1, 10] should have gaps: [1,2), (4,6), (8,10]
    const gaps = intervalSet.getIntervalGaps({
      a: new IntervalNumber(1),
      b: new IntervalNumber(10),
    });
    expect(gaps.length).toBe(3);
    expect(gaps[0].toString()).toBe("[1, 2)");
    expect(gaps[1].toString()).toBe("(4, 6)");
    expect(gaps[2].toString()).toBe("(8, 10]");
  });

  it("should return gaps when intervals overlap", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });

    // The interval [2, 6] should have gap: (5, 6]
    const gaps = intervalSet.getIntervalGaps({
      a: new IntervalNumber(2),
      b: new IntervalNumber(6),
    });
    expect(gaps.length).toBe(1);
    expect(gaps[0].toString()).toBe("(5, 6]");
    // The interval [-2, 3] should have gap: [-2, 1)
    const gaps2 = intervalSet.getIntervalGaps({
      a: new IntervalNumber(-2),
      b: new IntervalNumber(3),
    });
    expect(gaps2.length).toBe(1);
    expect(gaps2[0].toString()).toBe("[-2, 1)");
  });

  it("should return the whole interval as a gap if there is no overlap", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(20), b: new IntervalNumber(30) });

    // The interval [1, 10] does not overlap with [20, 30]
    const gaps = intervalSet.getIntervalGaps({
      a: new IntervalNumber(1),
      b: new IntervalNumber(10),
    });
    expect(gaps.length).toBe(1);
    expect(gaps[0].toString()).toBe("[1, 10]");
  });

  it("should return no gaps if the interval is fully covered", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10) });

    const gaps = intervalSet.getIntervalGaps({
      a: new IntervalNumber(1),
      b: new IntervalNumber(10),
    });
    expect(gaps.length).toBe(0);
    const gaps2 = intervalSet.getIntervalGaps({
      a: new IntervalNumber(5),
      b: new IntervalNumber(7),
    });
    expect(gaps2.length).toBe(0);
  });

  it("should return gaps when intervals are adjacent", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(0); // No gaps since they are adjacent
  });

  it("should return gaps when intervals are adjacent with mergeAddedInterval false", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(0); // No gaps since they are adjacent
  });

  it("should return gaps when intervals are adjacent with mergeAddedInterval true", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(0); // No gaps since they are adjacent
  });

  it("should remove intervals that are fully contained within another in chainIntervals (else branch)", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // Add an interval fully containing another
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10) }); // [1, 10]
    intervalSet.addInterval({ a: new IntervalNumber(3), b: new IntervalNumber(5) }); // [3, 5]

    // Before chaining, both intervals exist
    expect(intervalSet.intervals.length).toBe(2);

    intervalSet.chainIntervals();

    // After chaining, the contained interval should be removed
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should set intervals where next.max.number > current.max.number in chainIntervals (else branch)", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // Add intervals where the next's max is less than the current's max
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) }); // [1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(10) }); // [2, 10]

    intervalSet.chainIntervals();

    // The second interval should be removed
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5]");
    expect(intervalSet.intervals[1].toString()).toBe("(5, 10]");
  });

  it("should merge intervals and choose the closed min when min values are equal", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1, false), b: new IntervalNumber(5) }); // (1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(1, false), b: new IntervalNumber(10) }); // (1, 10]
    // After merge, min should be (1, ...]
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].a.isClosed).toBe(false);
    expect(intervalSet.intervals[0].a.number).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("(1, 10]");
    intervalSet.addInterval({ a: new IntervalNumber(1, true), b: new IntervalNumber(11) }); // [1, 11]
    // After merge, min should be [1, ...] (closed)
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].a.isClosed).toBe(true);
    expect(intervalSet.intervals[0].a.number).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 11]");
  });

  it("should merge intervals and choose the closed max when max values are equal", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(5, true) }); // [2, 5]
    // After merge, max should be ...5] (closed)
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].b.isClosed).toBe(true);
    expect(intervalSet.intervals[0].b.number).toBe(5);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5]");
  });

  it("should merge intervals and choose the smaller min and larger max", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(3), b: new IntervalNumber(7) }); // [3, 7]
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10) }); // [1, 10]
    // After merge, min should be 1, max should be 10
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].a.number).toBe(1);
    expect(intervalSet.intervals[0].b.number).toBe(10);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals and choose the next min when it is smaller", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) }); // [5, 10]
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(8) }); // [1, 8]
    // After merge, min should be 1 (from next)
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].a.number).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals and keep current min when it is smaller", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) }); // [1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(3), b: new IntervalNumber(10) }); // [3, 10]
    // After merge, min should be 1 (from current)
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].a.number).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals and choose the current mine when both mins are equal", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1, false), b: new IntervalNumber(5) }); // (1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(1, true), b: new IntervalNumber(10) }); // [1, 10]
    // After merge, min should be 1 (from current, since both are equal and current is not closed)
    expect(intervalSet.intervals.length).toBe(2);
    intervalSet.mergeAddedInterval = true; // Now merge them
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].a.number).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals when mergeAddedInterval is set to true after adding overlapping intervals", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) }); // [1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(4), b: new IntervalNumber(10) }); // [4, 10]
    // Should not be merged yet
    expect(intervalSet.intervals.length).toBe(2);

    // Now enable merging
    intervalSet.mergeAddedInterval = true;

    // Should now be merged
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals when mergeAddedInterval is set to true after adding adjacent intervals", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) }); // [5, 10]
    // Should not be merged yet
    expect(intervalSet.intervals.length).toBe(2);

    // Now enable merging
    intervalSet.mergeAddedInterval = true;

    // Should now be merged
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals and choose the current mine when both mins are equal", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1, true), b: new IntervalNumber(5) }); // [1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(1, true), b: new IntervalNumber(10) }); // [1, 10]
    // After merge, min should be [1, ...] (from current, since both are closed)
    expect(intervalSet.intervals.length).toBe(2);
    intervalSet.mergeAddedInterval = true; // Now merge them
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals and choose the next min when both mins are equal and current min is not closed", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1, false), b: new IntervalNumber(5) }); // (1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(1, true), b: new IntervalNumber(10) }); // [1, 10]
    // After merge, min should be 1 (from next)
    expect(intervalSet.intervals.length).toBe(2);
    intervalSet.mergeAddedInterval = true; // Now merge them
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].a.number).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals when they are adjacent", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) }); // [5, 10]
    // After merge, they should be combined into [1, 10]
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");

    const intervalSet2 = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet2.addInterval({ a: new IntervalNumber(5, false), b: new IntervalNumber(10) }); // (5, 10]
    intervalSet2.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) }); // [1, 5]
    // With mergeAddedInterval false, they should not merge
    expect(intervalSet2.intervals.length).toBe(2);
    expect(intervalSet2.intervals[0].toString()).toBe("(5, 10]");
    expect(intervalSet2.intervals[1].toString()).toBe("[1, 5]");
    intervalSet2.mergeAddedInterval = true; // Now merge them
    expect(intervalSet2.intervals.length).toBe(1);
    expect(intervalSet2.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should create a gap when intervals do not overlap and are not adjacent", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(3) }); // [1, 3]
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(7) }); // [5, 7]

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(1);
    expect(gaps[0].toString()).toBe("(3, 5)");
  });

  it("should create a gap when intervals are adjacent but both endpoints are open", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
    intervalSet.addInterval({ a: new IntervalNumber(5, false), b: new IntervalNumber(10) }); // (5, 10]

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(1);
    expect(gaps[0].toString()).toBe("[5, 5]");
  });

  it("should update the min of the next interval in chainIntervals when intervals are not adjacent", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
    intervalSet.addInterval({ a: new IntervalNumber(10), b: new IntervalNumber(15) }); // [10, 15]

    intervalSet.chainIntervals();

    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5)");
    expect(intervalSet.intervals[1].toString()).toBe("[5, 15]");
  });

  // BigInt Support Tests
  describe("bigint support", () => {
    it("should add and merge overlapping bigint intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(5n) });
      intervalSet.addInterval({ a: new IntervalNumber(4n), b: new IntervalNumber(10n) });

      expect(intervalSet.intervals.length).toBe(1);
      expect(intervalSet.intervals[0].toString()).toBe("[1n, 10n]");
    });

    it("should merge adjacent bigint intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(5n, false) });
      intervalSet.addInterval({ a: new IntervalNumber(5n), b: new IntervalNumber(10n) });

      expect(intervalSet.intervals.length).toBe(1);
      expect(intervalSet.intervals[0].toString()).toBe("[1n, 10n]");
    });

    it("should sort bigint intervals correctly", () => {
      const intervals = [
        new Interval({ a: new IntervalNumber(10n), b: new IntervalNumber(20n) }),
        new Interval({ a: new IntervalNumber(1n), b: new IntervalNumber(5n) }),
        new Interval({ a: new IntervalNumber(15n), b: new IntervalNumber(25n) }),
      ];

      IntervalSet.sort(intervals);

      expect(intervals[0].a.number).toBe(1n);
      expect(intervals[1].a.number).toBe(10n);
      expect(intervals[2].a.number).toBe(15n);
    });

    it("should detect gaps in bigint intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(5n) });
      intervalSet.addInterval({ a: new IntervalNumber(10n), b: new IntervalNumber(15n) });

      const gaps = intervalSet.getIntervalGaps();

      expect(gaps.length).toBe(1);
      expect(gaps[0].toString()).toBe("(5n, 10n)");
    });

    it("should create gap in bigint interval", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(10n) });
      intervalSet.createIntervalGap({ a: new IntervalNumber(4n), b: new IntervalNumber(6n) });

      expect(intervalSet.intervals.length).toBe(2);
      expect(intervalSet.intervals[0].toString()).toBe("[1n, 4n)");
      expect(intervalSet.intervals[1].toString()).toBe("(6n, 10n]");
    });

    it("should chain bigint intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(5n, false) });
      intervalSet.addInterval({ a: new IntervalNumber(10n), b: new IntervalNumber(15n) });

      intervalSet.chainIntervals();

      expect(intervalSet.intervals.length).toBe(2);
      expect(intervalSet.intervals[0].toString()).toBe("[1n, 5n)");
      expect(intervalSet.intervals[1].toString()).toBe("[5n, 15n]");
    });

    it("should handle containsNumber with bigint intervals using number parameter", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(10n) });
      intervalSet.addInterval({ a: new IntervalNumber(20n), b: new IntervalNumber(30n) });

      // Note: getIntervalsContaining takes number, but bigint intervals
      // will throw when comparing finite number with bigint
      expect(() => intervalSet.getIntervalsContaining(5)).toThrow();
    });

    it("should not merge bigint intervals when mergeAddedInterval is false", () => {
      const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
      intervalSet.addInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(5n) });
      intervalSet.addInterval({ a: new IntervalNumber(4n), b: new IntervalNumber(10n) });

      expect(intervalSet.intervals.length).toBe(2);
    });
  });

  // Infinity Boundary Tests
  describe("infinity boundaries", () => {
    it("should handle intervals with Infinity max", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(0), b: new IntervalNumber(Infinity, false) });
      intervalSet.addInterval({ a: new IntervalNumber(-100), b: new IntervalNumber(-50) });

      expect(intervalSet.intervals.length).toBe(2);
      expect(intervalSet.intervals[0].toString()).toBe("[-100, -50]");
      expect(intervalSet.intervals[1].toString()).toBe("[0, Infinity)");
    });

    it("should merge overlapping intervals with Infinity", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(0), b: new IntervalNumber(Infinity, false) });
      intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(100) });

      expect(intervalSet.intervals.length).toBe(1);
      expect(intervalSet.intervals[0].toString()).toBe("[0, Infinity)");
    });

    it("should create gap in infinite interval", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(-Infinity), b: new IntervalNumber(Infinity, false) });
      intervalSet.createIntervalGap({ a: new IntervalNumber(0), b: new IntervalNumber(10) });

      expect(intervalSet.intervals.length).toBe(2);
      expect(intervalSet.intervals[0].toString()).toBe("[-Infinity, 0)");
      expect(intervalSet.intervals[1].toString()).toBe("(10, Infinity)");
    });

    it("should chain intervals with Infinity boundaries", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(0), b: new IntervalNumber(10) });
      intervalSet.addInterval({ a: new IntervalNumber(20), b: new IntervalNumber(Infinity, false) });

      intervalSet.chainIntervals();

      expect(intervalSet.intervals.length).toBe(2);
      expect(intervalSet.intervals[0].toString()).toBe("[0, 10]");
      expect(intervalSet.intervals[1].toString()).toBe("(10, Infinity)");
    });

    it("should detect gaps with Infinity interval", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(10), b: new IntervalNumber(Infinity, false) });

      const gaps = intervalSet.getIntervalGaps({
        a: new IntervalNumber(-Infinity),
        b: new IntervalNumber(Infinity, false),
      });

      expect(gaps.length).toBe(1);
      expect(gaps[0].toString()).toBe("[-Infinity, 10)");
    });

    it("should handle both -Infinity and Infinity in same set", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(-Infinity), b: new IntervalNumber(0) });
      intervalSet.addInterval({ a: new IntervalNumber(0), b: new IntervalNumber(Infinity, false) });

      expect(intervalSet.intervals.length).toBe(1);
      expect(intervalSet.intervals[0].toString()).toBe("[-Infinity, Infinity)");
    });
  });

  // Error Handling Tests
  describe("error handling", () => {
    it("should throw for invalid interval string", () => {
      const intervalSet = new IntervalSet();
      expect(() => intervalSet.addInterval("invalid")).toThrow();
    });

    it("should throw for empty string interval", () => {
      const intervalSet = new IntervalSet();
      expect(() => intervalSet.addInterval("")).toThrow();
    });

    it("should throw for malformed interval string", () => {
      const intervalSet = new IntervalSet();
      expect(() => intervalSet.addInterval("[1, 2")).toThrow();
    });

    it("should handle operations on empty interval set", () => {
      const intervalSet = new IntervalSet();

      expect(intervalSet.toString()).toBe("");
      expect(intervalSet.getIntervalGaps()).toEqual([]);
      expect(intervalSet.getIntervalsContaining(5)).toEqual([]);

      intervalSet.chainIntervals(); // Should not throw
      expect(intervalSet.intervals.length).toBe(0);

      intervalSet.clear(); // Should not throw on empty set
      expect(intervalSet.intervals.length).toBe(0);
    });

    it("should handle removeInterval on empty set", () => {
      const intervalSet = new IntervalSet();
      intervalSet.removeInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });

      expect(intervalSet.intervals.length).toBe(0);
    });

    it("should handle removeIntervalByName on empty set", () => {
      const intervalSet = new IntervalSet();
      intervalSet.removeIntervalByName("Nonexistent");

      expect(intervalSet.intervals.length).toBe(0);
    });

    it("should handle getIntervalGaps with no matching intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(100), b: new IntervalNumber(200) });

      const gaps = intervalSet.getIntervalGaps({
        a: new IntervalNumber(1),
        b: new IntervalNumber(10),
      });

      expect(gaps.length).toBe(1);
      expect(gaps[0].toString()).toBe("[1, 10]");
    });
  });

  // Constructor Edge Cases
  describe("constructor edge cases", () => {
    it("should merge intervals in constructor when mergeAddedInterval is true", () => {
      const intervalSet = new IntervalSet({
        intervals: [
          { a: new IntervalNumber(1), b: new IntervalNumber(5) },
          { a: new IntervalNumber(4), b: new IntervalNumber(10) },
        ],
        options: { mergeAddedInterval: true },
      });

      expect(intervalSet.intervals.length).toBe(1);
      expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
    });

    it("should not merge intervals in constructor when mergeAddedInterval is false", () => {
      const intervalSet = new IntervalSet({
        intervals: [
          { a: new IntervalNumber(1), b: new IntervalNumber(5) },
          { a: new IntervalNumber(4), b: new IntervalNumber(10) },
        ],
        options: { mergeAddedInterval: false },
      });

      expect(intervalSet.intervals.length).toBe(2);
      expect(intervalSet.intervals[0].toString()).toBe("[1, 5]");
      expect(intervalSet.intervals[1].toString()).toBe("[4, 10]");
    });

    it("should handle constructor with empty intervals array", () => {
      const intervalSet = new IntervalSet({
        intervals: [],
        options: { mergeAddedInterval: true },
      });

      expect(intervalSet.intervals.length).toBe(0);
    });

    it("should handle constructor with only options", () => {
      const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });

      expect(intervalSet.intervals.length).toBe(0);
      expect(intervalSet.mergeAddedInterval).toBe(false);
    });
  });

  // Static Method Tests
  describe("static sort", () => {
    it("should sort array of overlapping intervals", () => {
      const intervals = [
        new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(5) }),
        new Interval({ a: new IntervalNumber(7), b: new IntervalNumber(10) }),
        new Interval({ a: new IntervalNumber(4), b: new IntervalNumber(8) }),
      ];

      IntervalSet.sort(intervals);

      expect(intervals[0].a.number).toBe(1);
      expect(intervals[1].a.number).toBe(4);
      expect(intervals[2].a.number).toBe(7);
    });

    it("should handle empty array", () => {
      const intervals: Interval[] = [];
      IntervalSet.sort(intervals);
      expect(intervals.length).toBe(0);
    });

    it("should handle single interval", () => {
      const intervals = [new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(5) })];

      IntervalSet.sort(intervals);

      expect(intervals.length).toBe(1);
      expect(intervals[0].toString()).toBe("[1, 5]");
    });
  });

  // Additional Edge Cases
  describe("additional edge cases", () => {
    it("should handle very large number of intervals", () => {
      const intervalSet = new IntervalSet();

      for (let i = 0; i < 100; i++) {
        intervalSet.addInterval({ a: new IntervalNumber(i * 10), b: new IntervalNumber(i * 10 + 5) });
      }

      expect(intervalSet.intervals.length).toBe(100);
    });

    it("should handle toString with many intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(2) });
      intervalSet.addInterval({ a: new IntervalNumber(3), b: new IntervalNumber(4) });
      intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(6) });

      const str = intervalSet.toString();

      expect(str).toBe("[1, 2], [3, 4], [5, 6]");
    });

    it("should handle single point intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(5) });

      expect(intervalSet.intervals.length).toBe(1);
      expect(intervalSet.intervals[0].toString()).toBe("[5, 5]");
    });

    it("should merge single point intervals with adjacent intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });
      intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(5) });

      expect(intervalSet.intervals.length).toBe(1);
      expect(intervalSet.intervals[0].toString()).toBe("[5, 10]");
    });
  });

  it("should update the min of the next interval in chainIntervals when adjacent and both endpoints have the same closed status", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
    intervalSet.addInterval({ a: new IntervalNumber(5, false), b: new IntervalNumber(10) }); // (5, 10]

    intervalSet.chainIntervals();

    // After chaining, the min of the second interval should be updated to (5, 10]
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5)");
    expect(intervalSet.intervals[1].toString()).toBe("[5, 10]");
  });

  it("should update the max of the current interval in chainIntervals (else branch)", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // Add intervals where the second's max is greater than the first's max and they overlap
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
    intervalSet.addInterval({ a: new IntervalNumber(3), b: new IntervalNumber(10, true) }); // [3, 10]

    intervalSet.chainIntervals();

    // After chaining, the second interval min should be updated to [5, 10]
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5)");
    expect(intervalSet.intervals[1].toString()).toBe("[5, 10]");
  });

  it("should keep current.max when it is greater than next.max", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // current: [1, 10], next: [2, 5]
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10, true) });
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(5, true) });

    intervalSet.chainIntervals();

    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].b.number).toBe(10);
    expect(intervalSet.intervals[0].b.isClosed).toBe(true);
  });

  it("should take next.max when it is greater than current.max", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // current: [1, 5], next: [2, 10]
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, true) });
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(10, false) });

    intervalSet.chainIntervals();

    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5]");
    expect(intervalSet.intervals[1].toString()).toBe("(5, 10)");
  });

  it("should set max as closed if either current.max or next.max is closed when numbers are equal", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // current: [1, 5), next: [2, 5]
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(5, true) });

    intervalSet.chainIntervals();
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5)");
    expect(intervalSet.intervals[1].toString()).toBe("[5, 5]");
  });

  it("should set max as open if both current.max and next.max are open when numbers are equal", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // current: [1, 5), next: [2, 5)
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(5, false) });

    intervalSet.chainIntervals();

    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].b.number).toBe(5);
    expect(intervalSet.intervals[0].b.isClosed).toBe(false);
  });
});

describe("IntervalSetOptions", () => {
  it("should default mergeAddedInterval to true", () => {
    const options = new IntervalSetOptions();
    expect(options.mergeAddedInterval).toBe(true);
  });

  it("should allow setting mergeAddedInterval to false", () => {
    const options = new IntervalSetOptions();
    options.mergeAddedInterval = false;
    expect(options.mergeAddedInterval).toBe(false);
  });
});

describe("IntervalSet construction with options", () => {
  it("should use mergeAddedInterval from options if provided", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    expect(intervalSet.mergeAddedInterval).toBe(false);
  });

  it("should default mergeAddedInterval to true if not provided", () => {
    const intervalSet = new IntervalSet();
    expect(intervalSet.mergeAddedInterval).toBe(true);
  });

  it('should sort intervals by minimum value', () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(5), b: new IntervalNumber(10) }),
      new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(3) }),
      new Interval({ a: new IntervalNumber(3), b: new IntervalNumber(4) }),
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].a.number).toBe(1);
    expect(intervals[1].a.number).toBe(3);
    expect(intervals[2].a.number).toBe(5);
  });

  it('should sort intervals with equal min so that closed comes before open', () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(1, false), b: new IntervalNumber(2) }), // (1, 2]
      new Interval({ a: new IntervalNumber(1, true), b: new IntervalNumber(2) }),  // [1, 2]
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].a.isClosed).toBe(true);  // [1, 2] comes before (1, 2]
    expect(intervals[1].a.isClosed).toBe(false);
  });

  it('should preserve order if min and isClosed are equal', () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(1, true), b: new IntervalNumber(2) }),
      new Interval({ a: new IntervalNumber(1, true), b: new IntervalNumber(3) }),
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].b.number).toBe(2);
    expect(intervals[1].b.number).toBe(3);
  });

  it('should sort intervals with the same min -Infinity so that closed comes before open', () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(-Infinity, false), b: new IntervalNumber(10) }), // (-Infinity, 10]
      new Interval({ a: new IntervalNumber(-Infinity, true), b: new IntervalNumber(20) }),  // [-Infinity, 20]
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].a.isClosed).toBe(true);  // [-Infinity, 20] comes before (-Infinity, 10]
    expect(intervals[1].a.isClosed).toBe(false);
  });

  it('should hit the a.min.isClosed && !b.min.isClosed branch in sort', () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(1, true), b: new IntervalNumber(2) }),  // [1, 2]
      new Interval({ a: new IntervalNumber(1, false), b: new IntervalNumber(2) }), // (1, 2]
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].a.isClosed).toBe(true);  // [1, 2] comes before (1, 2]
    expect(intervals[1].a.isClosed).toBe(false);
  });

  it('should return the gap before, between, and after intervals within a given interval', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(4) });
    intervalSet.addInterval({ a: new IntervalNumber(6), b: new IntervalNumber(8) });

    // The interval [1, 10] should have gaps: [1,2), (4,6), (8,10]
    const gaps = intervalSet.getIntervalGaps({ a: new IntervalNumber(1), b: new IntervalNumber(10) });
    expect(gaps.length).toBe(3);
    expect(gaps[0].toString()).toBe('[1, 2)');
    expect(gaps[1].toString()).toBe('(4, 6)');
    expect(gaps[2].toString()).toBe('(8, 10]');
  });

  it('should return gaps when intervals overlap', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });

    // The interval [2, 6] should have gap: (5, 6]
    const gaps = intervalSet.getIntervalGaps({ a: new IntervalNumber(2), b: new IntervalNumber(6) });
    expect(gaps.length).toBe(1);
    expect(gaps[0].toString()).toBe('(5, 6]');
    // The interval [-2, 3] should have gap: [-2, 1)
    const gaps2 = intervalSet.getIntervalGaps({ a: new IntervalNumber(-2), b: new IntervalNumber(3) });
    expect(gaps2.length).toBe(1);
    expect(gaps2[0].toString()).toBe('[-2, 1)');
  });

  it('should return the whole interval as a gap if there is no overlap', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(20), b: new IntervalNumber(30) });

    // The interval [1, 10] does not overlap with [20, 30]
    const gaps = intervalSet.getIntervalGaps({ a: new IntervalNumber(1), b: new IntervalNumber(10) });
    expect(gaps.length).toBe(1);
    expect(gaps[0].toString()).toBe('[1, 10]');
  });

  it('should return no gaps if the interval is fully covered', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10) });

    const gaps = intervalSet.getIntervalGaps({ a: new IntervalNumber(1), b: new IntervalNumber(10) });
    expect(gaps.length).toBe(0);
    const gaps2 = intervalSet.getIntervalGaps({ a: new IntervalNumber(5), b: new IntervalNumber(7) });
    expect(gaps2.length).toBe(0);
  });

  it('should return gaps when intervals are adjacent', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(0); // No gaps since they are adjacent
  });

  it('should return gaps when intervals are adjacent with mergeAddedInterval false', () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(0); // No gaps since they are adjacent
  });

  it('should return gaps when intervals are adjacent with mergeAddedInterval true', () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(0); // No gaps since they are adjacent
  });

  it('should remove intervals that are fully contained within another in chainIntervals (else branch)', () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // Add an interval fully containing another
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10) }); // [1, 10]
    intervalSet.addInterval({ a: new IntervalNumber(3), b: new IntervalNumber(5) });  // [3, 5]

    // Before chaining, both intervals exist
    expect(intervalSet.intervals.length).toBe(2);

    intervalSet.chainIntervals();

    // After chaining, the contained interval should be removed
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe('[1, 10]');
  });

  it('should set intervals where next.max.number > current.max.number in chainIntervals (else branch)', () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // Add intervals where the next's max is less than the current's max
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) }); // [1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(10) });  // [2, 10]

    intervalSet.chainIntervals();

    // The second interval should be removed
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5]");
    expect(intervalSet.intervals[1].toString()).toBe("(5, 10]");
  });

  it("should sort intervals by minimum value", () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(5), b: new IntervalNumber(10) }),
      new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(3) }),
      new Interval({ a: new IntervalNumber(3), b: new IntervalNumber(4) }),
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].a.number).toBe(1);
    expect(intervals[1].a.number).toBe(3);
    expect(intervals[2].a.number).toBe(5);
  });

  it("should sort intervals with equal min so that closed comes before open", () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(1, false), b: new IntervalNumber(2) }), // (1, 2]
      new Interval({ a: new IntervalNumber(1, true), b: new IntervalNumber(2) }), // [1, 2]
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].a.isClosed).toBe(true); // [1, 2] comes before (1, 2]
    expect(intervals[1].a.isClosed).toBe(false);
  });

  it("should preserve order if min and isClosed are equal", () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(1, true), b: new IntervalNumber(2) }),
      new Interval({ a: new IntervalNumber(1, true), b: new IntervalNumber(3) }),
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].b.number).toBe(2);
    expect(intervals[1].b.number).toBe(3);
  });

  it("should sort intervals with the same min -Infinity so that closed comes before open", () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(-Infinity, false), b: new IntervalNumber(10) }), // (-Infinity, 10]
      new Interval({ a: new IntervalNumber(-Infinity, true), b: new IntervalNumber(20) }), // [-Infinity, 20]
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].a.isClosed).toBe(true); // [-Infinity, 20] comes before (-Infinity, 10]
    expect(intervals[1].a.isClosed).toBe(false);
  });

  it("should hit the a.min.isClosed && !b.min.isClosed branch in sort", () => {
    const intervals = [
      new Interval({ a: new IntervalNumber(1, true), b: new IntervalNumber(2) }), // [1, 2]
      new Interval({ a: new IntervalNumber(1, false), b: new IntervalNumber(2) }), // (1, 2]
    ];
    IntervalSet.sort(intervals);
    expect(intervals[0].a.isClosed).toBe(true); // [1, 2] comes before (1, 2]
    expect(intervals[1].a.isClosed).toBe(false);
  });

  it("should return the gap before, between, and after intervals within a given interval", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(4) });
    intervalSet.addInterval({ a: new IntervalNumber(6), b: new IntervalNumber(8) });

    // The interval [1, 10] should have gaps: [1,2), (4,6), (8,10]
    const gaps = intervalSet.getIntervalGaps({
      a: new IntervalNumber(1),
      b: new IntervalNumber(10),
    });
    expect(gaps.length).toBe(3);
    expect(gaps[0].toString()).toBe("[1, 2)");
    expect(gaps[1].toString()).toBe("(4, 6)");
    expect(gaps[2].toString()).toBe("(8, 10]");
  });

  it("should return gaps when intervals overlap", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });

    // The interval [2, 6] should have gap: (5, 6]
    const gaps = intervalSet.getIntervalGaps({
      a: new IntervalNumber(2),
      b: new IntervalNumber(6),
    });
    expect(gaps.length).toBe(1);
    expect(gaps[0].toString()).toBe("(5, 6]");
    // The interval [-2, 3] should have gap: [-2, 1)
    const gaps2 = intervalSet.getIntervalGaps({
      a: new IntervalNumber(-2),
      b: new IntervalNumber(3),
    });
    expect(gaps2.length).toBe(1);
    expect(gaps2[0].toString()).toBe("[-2, 1)");
  });

  it("should return the whole interval as a gap if there is no overlap", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(20), b: new IntervalNumber(30) });

    // The interval [1, 10] does not overlap with [20, 30]
    const gaps = intervalSet.getIntervalGaps({
      a: new IntervalNumber(1),
      b: new IntervalNumber(10),
    });
    expect(gaps.length).toBe(1);
    expect(gaps[0].toString()).toBe("[1, 10]");
  });

  it("should return no gaps if the interval is fully covered", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10) });

    const gaps = intervalSet.getIntervalGaps({
      a: new IntervalNumber(1),
      b: new IntervalNumber(10),
    });
    expect(gaps.length).toBe(0);
    const gaps2 = intervalSet.getIntervalGaps({
      a: new IntervalNumber(5),
      b: new IntervalNumber(7),
    });
    expect(gaps2.length).toBe(0);
  });

  it("should return gaps when intervals are adjacent", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(0); // No gaps since they are adjacent
  });

  it("should return gaps when intervals are adjacent with mergeAddedInterval false", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(0); // No gaps since they are adjacent
  });

  it("should return gaps when intervals are adjacent with mergeAddedInterval true", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(0); // No gaps since they are adjacent
  });

  it("should remove intervals that are fully contained within another in chainIntervals (else branch)", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // Add an interval fully containing another
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10) }); // [1, 10]
    intervalSet.addInterval({ a: new IntervalNumber(3), b: new IntervalNumber(5) }); // [3, 5]

    // Before chaining, both intervals exist
    expect(intervalSet.intervals.length).toBe(2);

    intervalSet.chainIntervals();

    // After chaining, the contained interval should be removed
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should set intervals where next.max.number > current.max.number in chainIntervals (else branch)", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // Add intervals where the next's max is less than the current's max
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) }); // [1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(10) }); // [2, 10]

    intervalSet.chainIntervals();

    // The second interval should be removed
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5]");
    expect(intervalSet.intervals[1].toString()).toBe("(5, 10]");
  });

  it("should merge intervals and choose the closed min when min values are equal", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1, false), b: new IntervalNumber(5) }); // (1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(1, false), b: new IntervalNumber(10) }); // (1, 10]
    // After merge, min should be (1, ...]
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].a.isClosed).toBe(false);
    expect(intervalSet.intervals[0].a.number).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("(1, 10]");
    intervalSet.addInterval({ a: new IntervalNumber(1, true), b: new IntervalNumber(11) }); // [1, 11]
    // After merge, min should be [1, ...] (closed)
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].a.isClosed).toBe(true);
    expect(intervalSet.intervals[0].a.number).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 11]");
  });

  it("should merge intervals and choose the closed max when max values are equal", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(5, true) }); // [2, 5]
    // After merge, max should be ...5] (closed)
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].b.isClosed).toBe(true);
    expect(intervalSet.intervals[0].b.number).toBe(5);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5]");
  });

  it("should merge intervals and choose the smaller min and larger max", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(3), b: new IntervalNumber(7) }); // [3, 7]
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10) }); // [1, 10]
    // After merge, min should be 1, max should be 10
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].a.number).toBe(1);
    expect(intervalSet.intervals[0].b.number).toBe(10);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals and choose the next min when it is smaller", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) }); // [5, 10]
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(8) }); // [1, 8]
    // After merge, min should be 1 (from next)
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].a.number).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals and keep current min when it is smaller", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) }); // [1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(3), b: new IntervalNumber(10) }); // [3, 10]
    // After merge, min should be 1 (from current)
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].a.number).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals and choose the current mine when both mins are equal", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1, false), b: new IntervalNumber(5) }); // (1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(1, true), b: new IntervalNumber(10) }); // [1, 10]
    // After merge, min should be 1 (from current, since both are equal and current is not closed)
    expect(intervalSet.intervals.length).toBe(2);
    intervalSet.mergeAddedInterval = true; // Now merge them
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].a.number).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals when mergeAddedInterval is set to true after adding overlapping intervals", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) }); // [1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(4), b: new IntervalNumber(10) }); // [4, 10]
    // Should not be merged yet
    expect(intervalSet.intervals.length).toBe(2);

    // Now enable merging
    intervalSet.mergeAddedInterval = true;

    // Should now be merged
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals when mergeAddedInterval is set to true after adding adjacent intervals", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) }); // [5, 10]
    // Should not be merged yet
    expect(intervalSet.intervals.length).toBe(2);

    // Now enable merging
    intervalSet.mergeAddedInterval = true;

    // Should now be merged
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals and choose the current mine when both mins are equal", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1, true), b: new IntervalNumber(5) }); // [1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(1, true), b: new IntervalNumber(10) }); // [1, 10]
    // After merge, min should be [1, ...] (from current, since both are closed)
    expect(intervalSet.intervals.length).toBe(2);
    intervalSet.mergeAddedInterval = true; // Now merge them
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals and choose the next min when both mins are equal and current min is not closed", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1, false), b: new IntervalNumber(5) }); // (1, 5]
    intervalSet.addInterval({ a: new IntervalNumber(1, true), b: new IntervalNumber(10) }); // [1, 10]
    // After merge, min should be 1 (from next)
    expect(intervalSet.intervals.length).toBe(2);
    intervalSet.mergeAddedInterval = true; // Now merge them
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].a.number).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should merge intervals when they are adjacent", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) }); // [5, 10]
    // After merge, they should be combined into [1, 10]
    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");

    const intervalSet2 = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet2.addInterval({ a: new IntervalNumber(5, false), b: new IntervalNumber(10) }); // (5, 10]
    intervalSet2.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) }); // [1, 5]
    // With mergeAddedInterval false, they should not merge
    expect(intervalSet2.intervals.length).toBe(2);
    expect(intervalSet2.intervals[0].toString()).toBe("(5, 10]");
    expect(intervalSet2.intervals[1].toString()).toBe("[1, 5]");
    intervalSet2.mergeAddedInterval = true; // Now merge them
    expect(intervalSet2.intervals.length).toBe(1);
    expect(intervalSet2.intervals[0].toString()).toBe("[1, 10]");
  });

  it("should create a gap when intervals do not overlap and are not adjacent", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(3) }); // [1, 3]
    intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(7) }); // [5, 7]

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(1);
    expect(gaps[0].toString()).toBe("(3, 5)");
  });

  it("should create a gap when intervals are adjacent but both endpoints are open", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
    intervalSet.addInterval({ a: new IntervalNumber(5, false), b: new IntervalNumber(10) }); // (5, 10]

    const gaps = intervalSet.getIntervalGaps();
    expect(gaps.length).toBe(1);
    expect(gaps[0].toString()).toBe("[5, 5]");
  });

  it("should update the min of the next interval in chainIntervals when intervals are not adjacent", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
    intervalSet.addInterval({ a: new IntervalNumber(10), b: new IntervalNumber(15) }); // [10, 15]

    intervalSet.chainIntervals();

    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5)");
    expect(intervalSet.intervals[1].toString()).toBe("[5, 15]");
  });

  // BigInt Support Tests
  describe("bigint support", () => {
    it("should add and merge overlapping bigint intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(5n) });
      intervalSet.addInterval({ a: new IntervalNumber(4n), b: new IntervalNumber(10n) });

      expect(intervalSet.intervals.length).toBe(1);
      expect(intervalSet.intervals[0].toString()).toBe("[1n, 10n]");
    });

    it("should merge adjacent bigint intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(5n, false) });
      intervalSet.addInterval({ a: new IntervalNumber(5n), b: new IntervalNumber(10n) });

      expect(intervalSet.intervals.length).toBe(1);
      expect(intervalSet.intervals[0].toString()).toBe("[1n, 10n]");
    });

    it("should sort bigint intervals correctly", () => {
      const intervals = [
        new Interval({ a: new IntervalNumber(10n), b: new IntervalNumber(20n) }),
        new Interval({ a: new IntervalNumber(1n), b: new IntervalNumber(5n) }),
        new Interval({ a: new IntervalNumber(15n), b: new IntervalNumber(25n) }),
      ];

      IntervalSet.sort(intervals);

      expect(intervals[0].a.number).toBe(1n);
      expect(intervals[1].a.number).toBe(10n);
      expect(intervals[2].a.number).toBe(15n);
    });

    it("should detect gaps in bigint intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(5n) });
      intervalSet.addInterval({ a: new IntervalNumber(10n), b: new IntervalNumber(15n) });

      const gaps = intervalSet.getIntervalGaps();

      expect(gaps.length).toBe(1);
      expect(gaps[0].toString()).toBe("(5n, 10n)");
    });

    it("should create gap in bigint interval", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(10n) });
      intervalSet.createIntervalGap({ a: new IntervalNumber(4n), b: new IntervalNumber(6n) });

      expect(intervalSet.intervals.length).toBe(2);
      expect(intervalSet.intervals[0].toString()).toBe("[1n, 4n)");
      expect(intervalSet.intervals[1].toString()).toBe("(6n, 10n]");
    });

    it("should chain bigint intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(5n, false) });
      intervalSet.addInterval({ a: new IntervalNumber(10n), b: new IntervalNumber(15n) });

      intervalSet.chainIntervals();

      expect(intervalSet.intervals.length).toBe(2);
      expect(intervalSet.intervals[0].toString()).toBe("[1n, 5n)");
      expect(intervalSet.intervals[1].toString()).toBe("[5n, 15n]");
    });

    it("should handle containsNumber with bigint intervals using number parameter", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(10n) });
      intervalSet.addInterval({ a: new IntervalNumber(20n), b: new IntervalNumber(30n) });

      // Note: getIntervalsContaining takes number, but bigint intervals
      // will throw when comparing finite number with bigint
      expect(() => intervalSet.getIntervalsContaining(5)).toThrow();
    });

    it("should not merge bigint intervals when mergeAddedInterval is false", () => {
      const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
      intervalSet.addInterval({ a: new IntervalNumber(1n), b: new IntervalNumber(5n) });
      intervalSet.addInterval({ a: new IntervalNumber(4n), b: new IntervalNumber(10n) });

      expect(intervalSet.intervals.length).toBe(2);
    });
  });

  // Infinity Boundary Tests
  describe("infinity boundaries", () => {
    it("should handle intervals with Infinity max", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(0), b: new IntervalNumber(Infinity, false) });
      intervalSet.addInterval({ a: new IntervalNumber(-100), b: new IntervalNumber(-50) });

      expect(intervalSet.intervals.length).toBe(2);
      expect(intervalSet.intervals[0].toString()).toBe("[-100, -50]");
      expect(intervalSet.intervals[1].toString()).toBe("[0, Infinity)");
    });

    it("should merge overlapping intervals with Infinity", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(0), b: new IntervalNumber(Infinity, false) });
      intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(100) });

      expect(intervalSet.intervals.length).toBe(1);
      expect(intervalSet.intervals[0].toString()).toBe("[0, Infinity)");
    });

    it("should create gap in infinite interval", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(-Infinity), b: new IntervalNumber(Infinity, false) });
      intervalSet.createIntervalGap({ a: new IntervalNumber(0), b: new IntervalNumber(10) });

      expect(intervalSet.intervals.length).toBe(2);
      expect(intervalSet.intervals[0].toString()).toBe("[-Infinity, 0)");
      expect(intervalSet.intervals[1].toString()).toBe("(10, Infinity)");
    });

    it("should chain intervals with Infinity boundaries", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(0), b: new IntervalNumber(10) });
      intervalSet.addInterval({ a: new IntervalNumber(20), b: new IntervalNumber(Infinity, false) });

      intervalSet.chainIntervals();

      expect(intervalSet.intervals.length).toBe(2);
      expect(intervalSet.intervals[0].toString()).toBe("[0, 10]");
      expect(intervalSet.intervals[1].toString()).toBe("(10, Infinity)");
    });

    it("should detect gaps with Infinity interval", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(10), b: new IntervalNumber(Infinity, false) });

      const gaps = intervalSet.getIntervalGaps({
        a: new IntervalNumber(-Infinity),
        b: new IntervalNumber(Infinity, false),
      });

      expect(gaps.length).toBe(1);
      expect(gaps[0].toString()).toBe("[-Infinity, 10)");
    });

    it("should handle both -Infinity and Infinity in same set", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(-Infinity), b: new IntervalNumber(0) });
      intervalSet.addInterval({ a: new IntervalNumber(0), b: new IntervalNumber(Infinity, false) });

      expect(intervalSet.intervals.length).toBe(1);
      expect(intervalSet.intervals[0].toString()).toBe("[-Infinity, Infinity)");
    });
  });

  // Error Handling Tests
  describe("error handling", () => {
    it("should throw for invalid interval string", () => {
      const intervalSet = new IntervalSet();
      expect(() => intervalSet.addInterval("invalid")).toThrow();
    });

    it("should throw for empty string interval", () => {
      const intervalSet = new IntervalSet();
      expect(() => intervalSet.addInterval("")).toThrow();
    });

    it("should throw for malformed interval string", () => {
      const intervalSet = new IntervalSet();
      expect(() => intervalSet.addInterval("[1, 2")).toThrow();
    });

    it("should handle operations on empty interval set", () => {
      const intervalSet = new IntervalSet();

      expect(intervalSet.toString()).toBe("");
      expect(intervalSet.getIntervalGaps()).toEqual([]);
      expect(intervalSet.getIntervalsContaining(5)).toEqual([]);

      intervalSet.chainIntervals(); // Should not throw
      expect(intervalSet.intervals.length).toBe(0);

      intervalSet.clear(); // Should not throw on empty set
      expect(intervalSet.intervals.length).toBe(0);
    });

    it("should handle removeInterval on empty set", () => {
      const intervalSet = new IntervalSet();
      intervalSet.removeInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5) });

      expect(intervalSet.intervals.length).toBe(0);
    });

    it("should handle removeIntervalByName on empty set", () => {
      const intervalSet = new IntervalSet();
      intervalSet.removeIntervalByName("Nonexistent");

      expect(intervalSet.intervals.length).toBe(0);
    });

    it("should handle getIntervalGaps with no matching intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(100), b: new IntervalNumber(200) });

      const gaps = intervalSet.getIntervalGaps({
        a: new IntervalNumber(1),
        b: new IntervalNumber(10),
      });

      expect(gaps.length).toBe(1);
      expect(gaps[0].toString()).toBe("[1, 10]");
    });
  });

  // Constructor Edge Cases
  describe("constructor edge cases", () => {
    it("should merge intervals in constructor when mergeAddedInterval is true", () => {
      const intervalSet = new IntervalSet({
        intervals: [
          { a: new IntervalNumber(1), b: new IntervalNumber(5) },
          { a: new IntervalNumber(4), b: new IntervalNumber(10) },
        ],
        options: { mergeAddedInterval: true },
      });

      expect(intervalSet.intervals.length).toBe(1);
      expect(intervalSet.intervals[0].toString()).toBe("[1, 10]");
    });

    it("should not merge intervals in constructor when mergeAddedInterval is false", () => {
      const intervalSet = new IntervalSet({
        intervals: [
          { a: new IntervalNumber(1), b: new IntervalNumber(5) },
          { a: new IntervalNumber(4), b: new IntervalNumber(10) },
        ],
        options: { mergeAddedInterval: false },
      });

      expect(intervalSet.intervals.length).toBe(2);
      expect(intervalSet.intervals[0].toString()).toBe("[1, 5]");
      expect(intervalSet.intervals[1].toString()).toBe("[4, 10]");
    });

    it("should handle constructor with empty intervals array", () => {
      const intervalSet = new IntervalSet({
        intervals: [],
        options: { mergeAddedInterval: true },
      });

      expect(intervalSet.intervals.length).toBe(0);
    });

    it("should handle constructor with only options", () => {
      const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });

      expect(intervalSet.intervals.length).toBe(0);
      expect(intervalSet.mergeAddedInterval).toBe(false);
    });
  });

  // Static Method Tests
  describe("static sort", () => {
    it("should sort array of overlapping intervals", () => {
      const intervals = [
        new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(5) }),
        new Interval({ a: new IntervalNumber(7), b: new IntervalNumber(10) }),
        new Interval({ a: new IntervalNumber(4), b: new IntervalNumber(8) }),
      ];

      IntervalSet.sort(intervals);

      expect(intervals[0].a.number).toBe(1);
      expect(intervals[1].a.number).toBe(4);
      expect(intervals[2].a.number).toBe(7);
    });

    it("should handle empty array", () => {
      const intervals: Interval[] = [];
      IntervalSet.sort(intervals);
      expect(intervals.length).toBe(0);
    });

    it("should handle single interval", () => {
      const intervals = [new Interval({ a: new IntervalNumber(1), b: new IntervalNumber(5) })];

      IntervalSet.sort(intervals);

      expect(intervals.length).toBe(1);
      expect(intervals[0].toString()).toBe("[1, 5]");
    });
  });

  // Additional Edge Cases
  describe("additional edge cases", () => {
    it("should handle very large number of intervals", () => {
      const intervalSet = new IntervalSet();

      for (let i = 0; i < 100; i++) {
        intervalSet.addInterval({ a: new IntervalNumber(i * 10), b: new IntervalNumber(i * 10 + 5) });
      }

      expect(intervalSet.intervals.length).toBe(100);
    });

    it("should handle toString with many intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(2) });
      intervalSet.addInterval({ a: new IntervalNumber(3), b: new IntervalNumber(4) });
      intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(6) });

      const str = intervalSet.toString();

      expect(str).toBe("[1, 2], [3, 4], [5, 6]");
    });

    it("should handle single point intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(5) });

      expect(intervalSet.intervals.length).toBe(1);
      expect(intervalSet.intervals[0].toString()).toBe("[5, 5]");
    });

    it("should merge single point intervals with adjacent intervals", () => {
      const intervalSet = new IntervalSet();
      intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(10) });
      intervalSet.addInterval({ a: new IntervalNumber(5), b: new IntervalNumber(5) });

      expect(intervalSet.intervals.length).toBe(1);
      expect(intervalSet.intervals[0].toString()).toBe("[5, 10]");
    });
  });

  it("should update the min of the next interval in chainIntervals when adjacent and both endpoints have the same closed status", () => {
    const intervalSet = new IntervalSet();
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
    intervalSet.addInterval({ a: new IntervalNumber(5, false), b: new IntervalNumber(10) }); // (5, 10]

    intervalSet.chainIntervals();

    // After chaining, the min of the second interval should be updated to (5, 10]
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5)");
    expect(intervalSet.intervals[1].toString()).toBe("[5, 10]");
  });

  it("should update the max of the current interval in chainIntervals (else branch)", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // Add intervals where the second's max is greater than the first's max and they overlap
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) }); // [1, 5)
    intervalSet.addInterval({ a: new IntervalNumber(3), b: new IntervalNumber(10, true) }); // [3, 10]

    intervalSet.chainIntervals();

    // After chaining, the second interval min should be updated to [5, 10]
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5)");
    expect(intervalSet.intervals[1].toString()).toBe("[5, 10]");
  });

  it("should keep current.max when it is greater than next.max", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // current: [1, 10], next: [2, 5]
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(10, true) });
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(5, true) });

    intervalSet.chainIntervals();

    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].b.number).toBe(10);
    expect(intervalSet.intervals[0].b.isClosed).toBe(true);
  });

  it("should take next.max when it is greater than current.max", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // current: [1, 5], next: [2, 10]
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, true) });
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(10, false) });

    intervalSet.chainIntervals();

    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5]");
    expect(intervalSet.intervals[1].toString()).toBe("(5, 10)");
  });

  it("should set max as closed if either current.max or next.max is closed when numbers are equal", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // current: [1, 5), next: [2, 5]
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(5, true) });

    intervalSet.chainIntervals();
    expect(intervalSet.intervals.length).toBe(2);
    expect(intervalSet.intervals[0].toString()).toBe("[1, 5)");
    expect(intervalSet.intervals[1].toString()).toBe("[5, 5]");
  });

  it("should set max as open if both current.max and next.max are open when numbers are equal", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    // current: [1, 5), next: [2, 5)
    intervalSet.addInterval({ a: new IntervalNumber(1), b: new IntervalNumber(5, false) });
    intervalSet.addInterval({ a: new IntervalNumber(2), b: new IntervalNumber(5, false) });

    intervalSet.chainIntervals();

    expect(intervalSet.intervals.length).toBe(1);
    expect(intervalSet.intervals[0].b.number).toBe(5);
    expect(intervalSet.intervals[0].b.isClosed).toBe(false);
  });
});

describe("IntervalSetOptions", () => {
  it("should default mergeAddedInterval to true", () => {
    const options = new IntervalSetOptions();
    expect(options.mergeAddedInterval).toBe(true);
  });

  it("should allow setting mergeAddedInterval to false", () => {
    const options = new IntervalSetOptions();
    options.mergeAddedInterval = false;
    expect(options.mergeAddedInterval).toBe(false);
  });
});

describe("IntervalSet construction with options", () => {
  it("should use mergeAddedInterval from options if provided", () => {
    const intervalSet = new IntervalSet({ options: { mergeAddedInterval: false } });
    expect(intervalSet.mergeAddedInterval).toBe(false);
  });

  it("should default mergeAddedInterval to true if not provided", () => {
    const intervalSet = new IntervalSet();
    expect(intervalSet.mergeAddedInterval).toBe(true);
  });
});
