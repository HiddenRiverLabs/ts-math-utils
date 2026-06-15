/// <reference types="jest" />
import { rangeBigInt, range } from "../src/range";
import { Interval } from "../src/interval";
import { compareNumeric } from "../src/intervalUtils";

describe("internal range and utilities coverage", () => {
  it("compareNumeric handles Infinity vs bigint", () => {
    expect(compareNumeric(Infinity as any, 5n as any)).toBe(1);
    expect(compareNumeric(-Infinity as any, 5n as any)).toBe(-1);
  });

  it("isEmpty returns true when min > max via direct properties", () => {
    const obj = Object.create(Interval.prototype);
    Object.defineProperty(obj, "min", {
      value: { number: 10, isClosed: true },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(obj, "max", {
      value: { number: 5, isClosed: true },
      writable: true,
      configurable: true,
    });

    expect(obj.isEmpty()).toBe(true);
  });

  it("rangeBigInt yields a non-bigint start (Infinity) once and stops (else branch)", () => {
    const out = Array.from(rangeBigInt(Infinity as any, 10n as any, true, true, 1n as any));
    expect(out).toEqual([Infinity]);
  });

  it("rangeBigInt accepts numeric step and converts to bigint", () => {
    const out = Array.from(range("[0n, 6n]", 2 as any));
    expect(out).toEqual([0n, 2n, 4n, 6n]);
  });
});
