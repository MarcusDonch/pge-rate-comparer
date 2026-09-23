// src/utils/calculateCost.test.js
//
// Run with: npm test

import { describe, it, expect } from "vitest";
import { calculateCost } from "./calculateCost.js";
import { ratePlans } from "../data/ratePlans.js";

const e1 = ratePlans.find((p) => p.id === "e1");
const touC = ratePlans.find((p) => p.id === "e-tou-c");
const touD = ratePlans.find((p) => p.id === "e-tou-d");

describe("calculateCost — tiered plans (E-1)", () => {
    it("charges only tier 1 when usage is under the tier boundary", () => {
        // 200 kWh, all in tier 1 (rate 0.33) -> 200 * 0.33 = 66.00
        expect(calculateCost(200, e1)).toBeCloseTo(66.0, 2);
    });

    it("charges exactly the tier 1 rate at the boundary", () => {
        // 300 kWh is exactly the tier 1 limit -> all at 0.33
        expect(calculateCost(300, e1)).toBeCloseTo(99.0, 2);
    });

    it("splits usage across tier 1 and tier 2 once over the boundary", () => {
        // 400 kWh = 300 @ 0.33 + 100 @ 0.41 = 99 + 41 = 140.00
        expect(calculateCost(400, e1)).toBeCloseTo(140.0, 2);
    });

    it("returns 0 for zero usage", () => {
        expect(calculateCost(0, e1)).toBe(0);
    });
});

describe("calculateCost — time-of-use plans (E-TOU-C, E-TOU-D)", () => {
    it("splits usage by peakHourFraction and applies peak/off-peak rates (E-TOU-C)", () => {
        // 500 kWh, peakHourFraction = 5/24
        const peakKwh = 500 * (5 / 24);
        const offPeakKwh = 500 - peakKwh;
        const expected = peakKwh * 0.44 + offPeakKwh * 0.32;
        expect(calculateCost(500, touC)).toBeCloseTo(expected, 2);
    });

    it("applies E-TOU-D's weekday-only peak fraction correctly", () => {
        const peakKwh = 500 * ((3 / 24) * (5 / 7));
        const offPeakKwh = 500 - peakKwh;
        const expected = peakKwh * 0.48 + offPeakKwh * 0.34;
        expect(calculateCost(500, touD)).toBeCloseTo(expected, 2);
    });

    it("rounds to the nearest cent", () => {
        const result = calculateCost(333, touC);
        expect(result).toBe(Math.round(result * 100) / 100);
    });
});

describe("calculateCost — input validation / edge cases", () => {
    it("returns 0 for negative usage instead of throwing", () => {
        expect(calculateCost(-50, e1)).toBe(0);
    });

    it("returns 0 for non-numeric usage instead of throwing", () => {
        expect(calculateCost("not a number", e1)).toBe(0);
        expect(calculateCost(undefined, e1)).toBe(0);
        expect(calculateCost(NaN, e1)).toBe(0);
    });

    it("throws a clear error for an unrecognized plan type", () => {
        expect(() =>
            calculateCost(100, { id: "bogus", type: "flat-rate-typo" })
        ).toThrow(/Unknown rate plan type/);
    });

    it("handles very large usage without breaking tier math", () => {
// 10,000 kWh -> 300 @ 0.33 + 9700 @ 0.41 = 99 + 3977 = 4076.00