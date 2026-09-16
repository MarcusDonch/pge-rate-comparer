// src/utils/calculateCost.js

/**
 * Estimates a monthly electric bill for a given usage and rate plan.
 *
 * @param {number} monthlyKwh - Total estimated usage for the month, in kWh.
 * @param {object} plan - One of the plan objects from ratePlans.js.
 * @returns {number} Estimated cost in dollars, rounded to 2 decimal places.
 */
export function calculateCost(monthlyKwh, plan) {
    if (typeof monthlyKwh !== "number" || isNaN(monthlyKwh) || monthlyKwh < 0) {
        return 0;
    }

    if (plan.type === "tiered") {
        return roundToCents(calculateTieredCost(monthlyKwh, plan.tiers));
    }

    if (plan.type === "timeOfUse") {
        return roundToCents(calculateTimeOfUseCost(monthlyKwh, plan));
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

function calculateTimeOfUseCost(monthlyKwh, plan) {
    const peakKwh = monthlyKwh * plan.peakHourFraction;
    const offPeakKwh = monthlyKwh - peakKwh;

    return peakKwh * plan.rates.peak + offPeakKwh * plan.rates.offPeak;
}

function roundToCents(amount) {
    return Math.round(amount * 100) / 100;
}

// console.log(calculateCost(400, ratePlans[0])); // E-1: expect 300*0.33 + 100*0.41 = 140