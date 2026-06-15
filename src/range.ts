import { Interval, IInterval, NumericValue } from "./interval";

/**
 * Returns an iterable generator for numbers or bigints in the interval, stepping by `step`.
 * Uses integer math for decimals, and native bigint math for bigints.
 */
function getDecimalPlaces(x: number): number {
  if (typeof x !== "number" || !isFinite(x)) return 0;
  const s = x.toString();
  if (!s.includes(".")) return 0;
  return s.split(".")[1].length;
}

/**
 * Generates an iterable sequence of numbers or bigints within a specified interval, stepping by a given value.
 * @param interval The interval to iterate over, can be an `IInterval` object or a string like "[1, 10]".
 * @param step The step size to increment by, defaults to 1. Can be a number or bigint.
 * @returns An iterable generator that yields numbers or bigints within the specified interval.
 * @throws Error if the interval starts at Infinity or -Infinity because iteration cannot begin there.
 */
export function range(
  interval: IInterval | string,
  step: NumericValue = 1,
): Iterable<NumericValue> {
  return (function* () {
    try {
      // Validate step is non-zero
      if (step === 0 || step === 0n) {
        throw new Error("Step cannot be zero");
      }

      const intvl = new Interval(interval);
      const start = intvl.a.number;
      const end = intvl.b.number;
      const startClosed = intvl.a.isClosed;
      const endClosed = intvl.b.isClosed;
      const startIsInfinite = typeof start === "number" && !isFinite(start);

      if (startIsInfinite) {
        throw new Error(
          startClosed
            ? `Cannot iterate from non-finite start endpoint: ${start}`
            : `Cannot iterate from open non-finite start endpoint: ${start}`,
        );
      }

      if (typeof start === "bigint" || typeof end === "bigint" || typeof step === "bigint") {
        yield* rangeBigInt(start, end, startClosed, endClosed, step);
        return;
      }

      yield* rangeNumber(start, end, startClosed, endClosed, step);
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        throw new Error(`Invalid interval: ${error.message}`);
      }
      throw new Error(`Invalid interval: ${String(error)}`);
    }
  })();
}

export function* rangeBigInt(
  start: NumericValue,
  end: NumericValue,
  startClosed: boolean,
  endClosed: boolean,
  step: NumericValue,
): Iterable<NumericValue> {
  if (typeof start === "number" && isFinite(start) && !Number.isInteger(start)) {
    throw new Error(`Cannot convert non-integer start value ${start} to bigint`);
  }
  if (typeof end === "number" && isFinite(end) && !Number.isInteger(end)) {
    throw new Error(`Cannot convert non-integer end value ${end} to bigint`);
  }
  if (typeof step === "number" && !Number.isInteger(step)) {
    throw new Error(`Cannot convert non-integer step value ${step} to bigint`);
  }

  const startBig = start === Infinity || start === -Infinity ? start : BigInt(start);
  const endBig = end === Infinity || end === -Infinity ? end : BigInt(end);
  const absStepBig = typeof step === "bigint" ? (step < 0n ? -step : step) : BigInt(Math.abs(step));
  const ascending = Interval.compareNumeric(startBig, endBig) < 0;
  const actualStep = ascending ? absStepBig : -absStepBig;

  let current = startBig;
  if (!startClosed && typeof current === "bigint") {
    current += actualStep;
  }

  while (true) {
    try {
      const cmp = Interval.compareNumeric(current, endBig);
      if (ascending && cmp > 0) break;
      if (!ascending && cmp < 0) break;
      if (cmp === 0 && !endClosed) break;

      yield current;

      if (typeof current === "bigint") {
        current += actualStep;
      } else {
        break;
      }
    } catch {
      break;
    }
  }
}

function* rangeNumber(
  start: number,
  end: number,
  startClosed: boolean,
  endClosed: boolean,
  step: number,
): Iterable<number> {
  const decimals = Math.max(getDecimalPlaces(start), getDecimalPlaces(end), getDecimalPlaces(step));
  const factor = Math.pow(10, decimals);

  let current = Math.round(start * factor);
  const endInt = Math.round(end * factor);
  const stepInt = Math.round(Math.abs(step) * factor);
  const ascending = end > start;
  const actualStep = ascending ? stepInt : -stepInt;

  if (!startClosed) current += actualStep;

  while (
    (ascending && (current < endInt || (endClosed && current === endInt))) ||
    (!ascending && (current > endInt || (endClosed && current === endInt)))
  ) {
    yield current / factor;
    current += actualStep;
  }
}
