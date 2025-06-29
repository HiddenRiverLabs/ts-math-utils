import { NumericValue } from '../src/interval';
import { range } from '../src/range';

describe('range', () => {
    it('iterates ascending closed interval [0, 3]', () => {
        const result: NumericValue[] = [];
        for (const n of range('[0, 3]', 1)) {
            result.push(n);
        }
        expect(result).toEqual([0, 1, 2, 3]);
    });

    it('uses default step of 1 for [0, 3]', () => {
        const result: NumericValue[] = [];
        for (const n of range('[0, 3]')) {
            result.push(n);
        }
        expect(result).toEqual([0, 1, 2, 3]);
    });

    it('iterates ascending open interval (0, 3)', () => {
        const result: NumericValue[] = [];
        for (const n of range('(0, 3)', 1)) {
            result.push(n);
        }
        expect(result).toEqual([1, 2]);
    });

    it('iterates ascending half-open interval [0, 3)', () => {
        const result: NumericValue[] = [];
        for (const n of range('[0, 3)', 1)) {
            result.push(n);
        }
        expect(result).toEqual([0, 1, 2]);
    });

    it('iterates ascending forever [0, Infinity)', () => {
        const result: NumericValue[] = [];
        for (const n of range('[0, Infinity)', 1)) {
            result.push(n);
            if (n >= 10) break; // Limit to first 10 for test
        }
        expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('iterates ascending forever bitint [0n, Infinity)', () => {
        const result: NumericValue[] = [];
        for (const n of range('[0n, Infinity)', 1n)) {
            result.push(n);
            if (n >= 10n) break; // Limit to first 10 for test
        }
        expect(result).toEqual([0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n]);
    });

    it('iterates ascending half-open interval of bigint [0n, 3n)', () => {
        const result: NumericValue[] = [];
        for (const n of range('[0n, 3n)', 1n)) {
            result.push(n);
        }
        expect(result).toEqual([0n, 1n, 2n]);
    });

    it('iterates descending half-open interval of bigint [3n, 0n)', () => {
        const result: NumericValue[] = [];
        for (const n of range('[3n, 0n)', -1n)) {
            result.push(n);
        }
        expect(result).toEqual([3n, 2n, 1n]);
    });

    it('iterates descending open interval of bigint (3n, 0n)', () => {
        const result: NumericValue[] = [];
        for (const n of range('(3n, 0n)', -1n)) {
            result.push(n);
        }
        expect(result).toEqual([2n, 1n]);
    });

    it('iterates ascending open interval of bigint (0n, 3n)', () => {
        const result: NumericValue[] = [];
        for (const n of range('(0n, 3n)', 1n)) {
            result.push(n);
        }
        expect(result).toEqual([1n, 2n]);
    });

    it('iterates ascending half open, end closed interval of bigint (0n, 3n]', () => {
        const result: NumericValue[] = [];
        for (const n of range('(0n, 3n]', 1n)) {
            result.push(n);
        }
        expect(result).toEqual([1n, 2n, 3n]);
    });

    it('iterates ascending closed interval of bigint [0n, 3n]', () => {
        const result: NumericValue[] = [];
        for (const n of range('[0n, 3n]', 1n)) {
            result.push(n);
        }
        expect(result).toEqual([0n, 1n, 2n, 3n]);
    });

    it('iterates descending closed interval bigint [3n, 0n]', () => {
        const result: NumericValue[] = [];
        for (const n of range('[3n, 0n]', -1n)) {
            result.push(n);
        }
        expect(result).toEqual([3n, 2n, 1n, 0n]);
    });

    it('iterates descending closed interval [3, 0]', () => {
        const result: NumericValue[] = [];
        for (const n of range('[3, 0]', 1)) {
            result.push(n);
        }
        expect(result).toEqual([3, 2, 1, 0]);
    });

    it('iterates descending open interval (3, 0)', () => {
        const result: NumericValue[] = [];
        for (const n of range('(3, 0)', 1)) {
            result.push(n);
        }
        expect(result).toEqual([2, 1]);
    });

    it('iterates descending half-open interval [3, 0)', () => {
        const result: NumericValue[] = [];
        for (const n of range('[3, 0)', 1)) {
            result.push(n);
        }
        expect(result).toEqual([3, 2, 1]);
    });

    it('iterates once on smallest interval [0, 0]', () => {
        const result: NumericValue[] = [];
        for (const n of range('[0, 0]', 1)) {
            result.push(n);
        }
        expect(result).toEqual([0]);
    });

    it('iterates on decimals [0, 1.5]', () => {
        const result: NumericValue[] = [];
        for (const n of range('[0, 1.5]', 0.5)) {
            result.push(n);
        }
        const result2: NumericValue[] = [];
        for (const n of range('[0, 0.5]', 0.1)) {
            result2.push(n);
        }
        expect(result).toEqual([0, 0.5, 1, 1.5]);
        expect(result2).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5]);
    });

    it('supports custom step', () => {
        const result: NumericValue[] = [];
        for (const n of range('[0, 10)', 2)) {
            result.push(n);
        }
        expect(result).toEqual([0, 2, 4, 6, 8]);
    });

    it('returns empty for empty interval', () => {
        expect(() => {
            const result: NumericValue[] = [];
            for (const n of range('(1, 1)', 1)) {
                result.push(n);
            }
        }).toThrow(
            'Invalid interval string: (1, 1)'
        );
    });
});