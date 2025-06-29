import { Interval, IInterval, NumericValue } from './interval';

/**
 * Returns an iterable generator for numbers or bigints in the interval, stepping by `step`.
 * Uses integer math for decimals, and native bigint math for bigints.
 */
function getDecimalPlaces(x: number): number {
    if (typeof x !== 'number' || !isFinite(x)) return 0;
    const s = x.toString();
    if (!s.includes('.')) return 0;
    return s.split('.')[1].length;
}

/**
 * Generates an iterable sequence of numbers or bigints within a specified interval, stepping by a given value.
 * @param interval The interval to iterate over, can be an `IInterval` object or a string like "[1, 10]".
 * @param step The step size to increment by, defaults to 1. Can be a number or bigint.
 * @returns An iterable generator that yields numbers or bigints within the specified interval.
 */
export function range(interval: IInterval | string, step: NumericValue = 1): Iterable<NumericValue> {
    return (function* () {
        try {
            const intvl = new Interval(interval);
            const start = intvl.a.number;
            const end = intvl.b.number;
            const startClosed = intvl.a.isClosed;
            const endClosed = intvl.b.isClosed;

            // If any value is bigint, use bigint math
            if (typeof start === 'bigint' || typeof end === 'bigint' || typeof step === 'bigint') {
                const startBig = BigInt(start);
                const endBig = end !== Infinity ? BigInt(end) : end;
                const absStepBig = BigInt(step) < 0n ? -BigInt(step) : BigInt(step);
                const ascending = endBig > startBig;
                const actualStep = ascending ? absStepBig : -absStepBig;

                let current = startBig;
                if (!startClosed) current += actualStep;

                while (
                    (ascending && ((current < endBig) || (endClosed && current === endBig))) ||
                    (!ascending && ((current > endBig) || (endClosed && current === endBig)))
                ) {
                    yield current;
                    current += actualStep;
                }
                return;
            }

            // Otherwise, use number math with integer scaling for decimals
            const decimals = Math.max(
                getDecimalPlaces(Number(start)),
                getDecimalPlaces(Number(end)),
                getDecimalPlaces(Number(step))
            );
            const factor = Math.pow(10, decimals);

            let current = Math.round(Number(start) * factor);
            const endInt = Math.round(Number(end) * factor);
            const absStep = Math.abs(Number(step));
            const stepInt = Math.round(absStep * factor);
            const ascending = end > start;
            const actualStep = ascending ? stepInt : -stepInt;

            if (!startClosed) current += actualStep;

            while (
                (ascending && ((current < endInt) || (endClosed && current === endInt))) ||
                (!ascending && ((current > endInt) || (endClosed && current === endInt)))
            ) {
                yield current / factor;
                current += actualStep;
            }
        } catch (error: Error | unknown) {
            if (error instanceof Error) {
                throw new Error(`Invalid interval: ${error.message}`);
            }
        }
    })();
}