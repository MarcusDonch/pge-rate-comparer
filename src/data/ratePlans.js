// src/data/ratePlans.js

// Source: PG&E Residential Rate Plan Pricing, effective March 1, 2026
// https://www.pge.com/assets/pge/docs/account/rate-plans/residential-electric-rate-plan-pricing.pdf.coredownload.pdf
//
// NOTE: Real PG&E billing also factors in your specific "baseline allowance"
// (which varies by climate zone, heating type, and season) and a separate
// Base Services Charge. This model simplifies that into flat rates per plan
// so it's approachable for a quick comparison tool. 

export const ratePlans = [
    {
        id: "e1",
        name: "E-1 (Tiered)",
        type: "tiered",
        description: "Same price all day, price increases after your baseline allowance.",
        tiers: [
            { limit: 300, rate: 0.33 },   // Tier 1: up to ~baseline allowance
            { limit: Infinity, rate: 0.41 }, // Tier 2: everything above it
        ],
    },
    {
        id: "e-tou-c",
        name: "E-TOU-C (Time-of-Use)",
        type: "timeOfUse",
        description: "Peak pricing 4pm-9pm every day, cheaper the rest of the time.",
        peakHoursLabel: "4pm - 9pm daily",
        rates: {
            peak: 0.44,
            offPeak: 0.32,
        },
        // Rough assumption for the calculator: 5 of 24 hours are "peak"
        peakHourFraction: 5 / 24,
    },
    {
        id: "e-tou-d",
        name: "E-TOU-D (Time-of-Use)",
        type: "timeOfUse",
        description: "Shorter peak window, weekdays only, cheaper off-peak overall.",
        peakHoursLabel: "5pm - 8pm weekdays",
        rates: {
            peak: 0.48,
            offPeak: 0.34,
        },
        // 3 peak hours, weekdays only (~5/7 days) -> rough weekly fraction
        peakHourFraction: (3 / 24) * (5 / 7),
    },
];