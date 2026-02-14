# Copilot Instructions for ts-math-utils

## Build, Test, and Lint

**Build:**

```bash
npm run build
```

Compiles TypeScript from `src/` to `dist/` using the ES2022 target.

**Test:**

```bash
npm test
```

Runs all tests in `test/` directory. Tests must match pattern `**/*.test.ts` and use Jest with ts-jest preset.

**Single Test File:**

```bash
npx jest test/interval.test.ts
```

**Lint:**

```bash
npm run lint
```

Uses oxlint for static analysis.

**Format:**

```bash
npm run format
```

Uses oxfmt for code formatting.

## Architecture Overview

This library provides mathematical interval and range utilities for TypeScript. The main components are:

### Core Types

- **`NumericValue`** - Union type for `number | bigint`, used throughout the library to support both types
- **`IntervalNumber`** - Wraps a `NumericValue` with an `isClosed` boolean flag indicating endpoint inclusivity
- **`IInterval`** - Interface with `a` and `b` endpoints (order-agnostic) and optional `name`

### Key Classes

**`Interval`**

- Represents a single mathematical interval with flexible endpoints
- Supports both `number` and `bigint` values, and `Infinity`/-`Infinity`
- Uses `a` and `b` (order-agnostic) internally but exposes `min`/`max` properties
- String notation: `[1, 5)` (square brackets = closed/inclusive, parentheses = open/exclusive)
- Key methods: `containsNumber()`, `contains()`, `overlaps()`, `isEmpty()`
- Static methods: `intersection()`, `union()`, `toInterval()`, `validInterval()`, `validIntervalString()`

**`IntervalSet`**

- Manages a collection of `Interval` objects
- `mergeAddedInterval` option (default true) auto-merges overlapping/adjacent intervals on add
- Key methods: `addInterval()`, `removeInterval()`, `getIntervalGaps()`, `chainIntervals()`
- `.chainIntervals()` removes gaps between intervals and disables auto-merging

**`range()`**

- Generator function for iterating over interval ranges with a step size
- Supports bigint and decimal steps
- Returns `Iterable<NumericValue>`

## Key Conventions

### Type Safety

- **Same-type rule**: Both endpoints of an Interval must be the same runtime type (number/bigint), unless one is numeric `Infinity`/-`Infinity`
- Never mix finite `number` with `bigint` in a single interval
- Use `typeof` checks and `isFinite()` to validate comparisons

### Endpoint Handling

- Intervals store endpoints as `a` and `b` (intentionally order-agnostic)
- Always use `min`/`max` properties to get ordered bounds
- `isClosed: true` = inclusive (bracket `[]`), `false` = exclusive (parenthesis `()`)
- Empty intervals (equal endpoints, both open) are invalid and throw on construction

### Numeric Comparison

- Use `Interval.compareNumeric()` (private utility) for safe cross-type comparisons
- Bigints cannot be directly compared with finite numbers — throws an error
- `Infinity` is allowed as a boundary value only as a `number` type

### Test Organization

- Test files co-locate with source files in `test/` directory using `.test.ts` extension
- Follow the pattern: `test/[className].test.ts`

### String Parsing

- `Interval.parseNumericString()` handles numeric strings with optional `n` suffix for bigint
- `Interval.toInterval()` parses mathematical notation like `"[1, 10)"` or `"(2, 10n]"`
