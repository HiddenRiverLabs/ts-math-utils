import type { IInterval, IntervalNumber, NumericValue } from "./interval";

/**
 * Interval utility helpers.
 *
 * These functions support type-safe comparisons (number vs bigint) and parsing
 * of interval string notation. They are used internally by {@link Interval} and
 * related helpers.
 */

/**
 * Checks if two numeric values are type-compatible for interval operations.
 *
 * The library generally enforces a "same-type" rule (both endpoints must be
 * the same runtime type: number or bigint). The only allowed exception is when
 * one of the values is numeric Infinity/-Infinity (which can only be a number).
 *
 * @param a - First numeric value
 * @param b - Second numeric value
 * @returns true if types are compatible, false otherwise
 */
export function areTypesCompatible(a: NumericValue, b: NumericValue): boolean {
  const typeA = typeof a;
  const typeB = typeof b;
  const aIsInfinite = typeA === "number" && !isFinite(a as number);
  const bIsInfinite = typeB === "number" && !isFinite(b as number);
  return typeA === typeB || aIsInfinite || bIsInfinite;
}

/**
 * Safely compares two numeric values (number or bigint).
 *
 * Supports comparing bigint with numeric Infinity/-Infinity.
 * Prevents unsafe comparisons (e.g., finite number vs bigint).
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 * @throws Error if attempting to compare finite number with bigint (type mismatch)
 * @example
 * compareNumeric(5, 10)        // -1
 * compareNumeric(5n, 10n)      // -1
 * compareNumeric(5n, Infinity) // -1
 * compareNumeric(5n, 5)        // Throws: "Cannot compare bigint with finite number"
 */
export function compareNumeric(a: NumericValue, b: NumericValue): number {
  if (typeof a === "bigint" && typeof b === "bigint") {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  if (typeof a === "number" && typeof b === "number") {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }
  if (typeof a === "bigint" && typeof b === "number") {
    if (!isFinite(b)) {
      return b === Infinity ? -1 : 1;
    }
    throw new Error("Cannot compare bigint with finite number");
  }
  if (typeof a === "number" && typeof b === "bigint") {
    if (!isFinite(a)) {
      return a === Infinity ? 1 : -1;
    }
    throw new Error("Cannot compare finite number with bigint");
  }
  return 0;
}

/**
 * Parses a string into a {@link NumericValue}.
 *
 * Supports bigint values with an `n` suffix (e.g., "10n"), regular numbers
 * (including decimals), and special values like "Infinity" and "-Infinity".
 *
 * @param str - The string to parse
 * @returns The parsed numeric value
 * @throws Error if the string is not a valid number or bigint representation
 * @example
 * parseNumericString("5")       // 5
 * parseNumericString("5n")      // 5n
 * parseNumericString("Infinity") // Infinity
 */
export function parseNumericString(str: string): NumericValue {
  const trimmed = str.trim();

  if (trimmed.endsWith("n")) {
    try {
      return BigInt(trimmed.slice(0, -1));
    } catch {
      throw new Error(`Invalid bigint string: ${str}`);
    }
  }

  const num = Number(trimmed);
  if (isNaN(num)) {
    throw new Error(`Invalid numeric string: ${str}`);
  }

  return num;
}

/**
 * Parses mathematical interval string notation into an {@link IInterval}.
 *
 * The caller supplies construction/validation callbacks so this helper can be
 * reused from different modules without creating circular dependencies.
 *
 * Supported notation:
 * - Open/closed endpoints via parentheses/brackets: ( ] [ )
 * - bigint endpoints with `n` suffix (e.g., "5n")
 * - Infinity and -Infinity
 *
 * @param interval - Interval string (e.g., "[1, 10)")
 * @param createIntervalNumber - Factory for creating endpoints with closure
 * @param isValidInterval - Validator for the resulting interval structure
 * @returns Parsed interval object
 * @throws Error if the string format is invalid or the parsed interval is invalid
 */
export function parseIntervalString(
  interval: string,
  createIntervalNumber: (value: NumericValue, isClosed: boolean) => IntervalNumber,
  isValidInterval: (interval: IInterval) => boolean,
): IInterval {
  const intervalTrimmed = interval.trim();
  const startSymbol = intervalTrimmed[0];
  const endSymbol = intervalTrimmed[intervalTrimmed.length - 1];
  if ((startSymbol !== "(" && startSymbol !== "[") || (endSymbol !== ")" && endSymbol !== "]")) {
    throw new Error(`Invalid interval string: ${interval}`);
  }

  const commaIndex = intervalTrimmed.indexOf(",");
  if (commaIndex === -1) {
    throw new Error(`Invalid interval string: missing comma in ${interval}`);
  }

  const parsedInterval: IInterval = {
    a: createIntervalNumber(
      parseNumericString(intervalTrimmed.slice(1, commaIndex)),
      startSymbol === "[",
    ),
    b: createIntervalNumber(
      parseNumericString(intervalTrimmed.slice(commaIndex + 1, intervalTrimmed.length - 1)),
      endSymbol === "]",
    ),
  };

  if (!isValidInterval(parsedInterval)) {
    throw new Error(`Invalid interval string: ${interval}`);
  }

  return parsedInterval;
}
