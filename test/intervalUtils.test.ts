/// <reference types="jest" />
import {
  areTypesCompatible,
  compareNumeric,
  parseNumericString,
  parseIntervalString,
} from "../src/intervalUtils";

describe("intervalUtils", () => {
  it("areTypesCompatible allows Infinity with bigint and number", () => {
    expect(areTypesCompatible(5, Infinity)).toBe(true);
    expect(areTypesCompatible(5n, Infinity)).toBe(true);
  });

  it("compareNumeric throws when bigint compared with finite number", () => {
    expect(() => compareNumeric(5n, 10)).toThrow("Cannot compare bigint with finite number");
    expect(() => compareNumeric(10, 5n)).toThrow("Cannot compare finite number with bigint");
  });

  it("parseNumericString throws for malformed bigint and non-numeric strings", () => {
    expect(() => parseNumericString("12nabc")).toThrow("Invalid numeric string: 12nabc");
    expect(() => parseNumericString("foo")).toThrow("Invalid numeric string: foo");
  });

  it("parseIntervalString parses endpoints using provided factory", () => {
    const toEndpoint = (v: any, isClosed: boolean) => ({ number: v, isClosed });
    const alwaysValid = () => true;

    const parsed = parseIntervalString("[1, 2n]", toEndpoint as any, alwaysValid as any);
    expect(parsed.a.number).toBe(1);
    expect(parsed.a.isClosed).toBe(true);
    expect(parsed.b.number).toBe(2n);
    expect(parsed.b.isClosed).toBe(true);
  });
});
