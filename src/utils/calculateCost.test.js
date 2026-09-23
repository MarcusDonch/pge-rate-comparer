// src/utils/calculateCost.test.js
//
// Run with: npm test

import { describe, it, expect } from "vitest";
import { calculateCost, DEFAULT_WEEKEND_USAGE_PERCENT } from "./calculateCost.js";
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

describe("calculateCost — weekday/weekend usage split", () => {
    it("matches the old flat-peakHourFraction behavior at the default weekend percentage", () => {
        // The default (2/7 of usage on weekends) is designed to reproduce the
        // calculator's original behavior, before weekday/weekend modeling.
        const oldTouCExpected =
            500 * (5 / 24) * 0.44 + 500 * (1 - 5 / 24) * 0.32;
        const oldTouDExpected =
            500 * (3 / 24) * (5 / 7) * 0.48 +
            (500 - 500 * (3 / 24) * (5 / 7)) * 0.34;

        expect(calculateCost(500, touC)).toBeCloseTo(oldTouCExpected, 2);
        expect(calculateCost(500, touD)).toBeCloseTo(oldTouDExpected, 2);
        expect(calculateCost(500, touC, DEFAULT_WEEKEND_USAGE_PERCENT)).toBe(
            calculateCost(500, touC)
        );
    });

    it("is unaffected by weekend percentage for E-TOU-C (peak applies daily)", () => {
        const allWeekday = calculateCost(500, touC, 0);
        const allWeekend = calculateCost(500, touC, 100);
        const halfAndHalf = calculateCost(500, touC, 50);

        expect(allWeekday).toBeCloseTo(allWeekend, 2);
        expect(allWeekday).toBeCloseTo(halfAndHalf, 2);
    });

    it("gets cheaper for E-TOU-D as more usage shifts to weekends (peak is weekdays only)", () => {
        const allWeekday = calculateCost(500, touD, 0); // worst case: no weekend relief
        const halfWeekend = calculateCost(500, touD, 50);
        const allWeekend = calculateCost(500, touD, 100); // best case: no peak exposure at all

        expect(allWeekday).toBeGreaterThan(halfWeekend);
        expect(halfWeekend).toBeGreaterThan(allWeekend);
    });

    it("charges only the off-peak rate for E-TOU-D when 100% of usage is on weekends", () => {
        // No weekday usage -> no exposure to the weekday-only peak window
        expect(calculateCost(500, touD, 100)).toBeCloseTo(500 * 0.34, 2);
    });

    it("clamps out-of-range weekend percentages instead of producing invalid costs", () => {
        expect(calculateCost(500, touD, -20)).toBeCloseTo(
            calculateCost(500, touD, 0),
            2
        );
        expect(calculateCost(500, touD, 150)).toBeCloseTo(
            calculateCost(500, touD, 100),
            2
        );
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
        expect(calculateCost(10000, e1)).toBeCloseTo(4076.0, 2);
    });
});