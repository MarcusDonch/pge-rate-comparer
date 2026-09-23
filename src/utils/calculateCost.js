// src/utils/calculateCost.js

// If the caller doesn't specify how usage splits between weekdays and
// weekends, assume it's spread uniformly across every day of the week.
// 2 of 7 days are weekend days, so ~28.57% of usage falls on weekends.
// (This is also the value that reproduces the calculator's original
// flat-peakHourFraction behavior, before weekday/weekend modeling existed.)
export const DEFAULT_WEEKEND_USAGE_PERCENT = (2 / 7) * 100;

/**
 * Estimates a monthly electric bill for a given usage and rate plan.
 *
 * @param {number} monthlyKwh - Total estimated usage for the month, in kWh.
 * @param {object} plan - One of the plan objects from ratePlans.js.
 * @param {number} [weekendUsagePercent] - Percent (0-100) of monthly usage
 *   that happens on weekend days (Sat/Sun) rather than weekdays. Only
 *   affects time-of-use plans whose peak window doesn't apply on weekends
 *   (e.g. E-TOU-D). Defaults to a uniform-usage assumption.
 * @returns {number} Estimated cost in dollars, rounded to 2 decimal places.
 */
export function calculateCost(
    monthlyKwh,
    plan,
    weekendUsagePercent = DEFAULT_WEEKEND_USAGE_PERCENT
) {
    if (typeof monthlyKwh !== "number" || isNaN(monthlyKwh) || monthlyKwh < 0) {
        return 0;
    }

    if (plan.type === "tiered") {
        return roundToCents(calculateTieredCost(monthlyKwh, plan.tiers));
    }

    if (plan.type === "timeOfUse") {
        return roundToCents(
            calculateTimeOfUseCost(monthlyKwh, plan, weekendUsagePercent)
        );
    }

    throw new Error(`Unknown rate plan type: ${plan.type}`);
}

function calculateTieredCost(monthlyKwh, tiers) {
    let remainingKwh = monthlyKwh;
    let previousLimit = 0;
    let total = 0;

    for (const tier of tiers) {
        if (remainingKwh <= 0) break;

        const tierSize = tier.limit - previousLimit;
        const kwhInThisTier = Math.min(remainingKwh, tierSize);

        total += kwhInThisTier * tier.rate;
        remainingKwh -= kwhInThisTier;
        previousLimit = tier.limit;
    }

    return total;
}

function calculateTimeOfUseCost(monthlyKwh, plan, weekendUsagePercent) {
    const weekendFraction = clamp(weekendUsagePercent, 0, 100) / 100;
    const weekendKwh = monthlyKwh * weekendFraction;
    const weekdayKwh = monthlyKwh - weekendKwh;

    // Peak hours always apply on weekdays. They only apply on weekends
    // for plans whose peak window is every day (peakDays === "daily").
    const weekdayPeakKwh = weekdayKwh * plan.peakHourFraction;
    const weekendPeakKwh =
        plan.peakDays === "daily" ? weekendKwh * plan.peakHourFraction : 0;

    const peakKwh = weekdayPeakKwh + weekendPeakKwh;
    const offPeakKwh = monthlyKwh - peakKwh;

    return peakKwh * plan.rates.peak + offPeakKwh * plan.rates.offPeak;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function roundToCents(amount) {
    return Math.round(amount * 100) / 100;
}