# PG&E Rate Plan Comparer

A small React + Vite app for comparing residential PG&E rate plans using a simplified monthly electricity model. It helps estimate how different pricing structures affect a household bill based on total usage and, for time-of-use plans, how much of that usage happens on weekends.

## Overview

This project compares a few representative PG&E plans:

- E-1 (tiered)
- E-TOU-C (time-of-use, peak every day)
- E-TOU-D (time-of-use, weekday peak only)

The app lets the user enter a monthly estimated kWh value and adjust a weekend-usage slider. It then calculates the estimated monthly cost for each plan and highlights the least expensive option.

## Current Features

- Monthly usage input with validation for empty, invalid, and negative values
- Weekend-usage percentage slider to model weekday vs weekend electricity timing
- Instant comparison across plan options
- Cheapest-plan highlight in the UI
- Tiered pricing logic for E-1
- Time-of-use logic for E-TOU-C and E-TOU-D
- Defensive handling of invalid inputs and edge cases
- Automated tests for the cost calculator

## How the Calculator Works

The core logic is in `src/utils/calculateCost.js`.

### Tiered plans

For E-1, the calculator iterates through the configured tiers and charges each block of kWh at the correct step rate.

Conceptually:

- first 300 kWh at the lower tier rate
- all remaining kWh at the higher tier rate

### Time-of-use plans

For E-TOU-C and E-TOU-D, the app splits monthly usage into weekend and weekday portions:

- weekendKwh = monthlyKwh * weekendUsagePercent
- weekdayKwh = monthlyKwh - weekendKwh

Then it applies the relevant peak-hour fraction:

- E-TOU-C: peak pricing applies every day
- E-TOU-D: peak pricing applies only on weekdays

The code estimates how much of the monthly usage falls into the peak window and applies the corresponding peak/off-peak rates before rounding to cents.

## Default Weekend Assumption

The default weekend usage value is set to roughly 28.57%, which matches the assumption that usage is spread evenly across all days of the week. This keeps the calculator consistent with the original flat peak-hour model before weekday/weekend adjustments were introduced.

## Project Structure

```text
src/
  App.jsx
  components/
    UsageForm.jsx
    RateComparison.jsx
  data/
    ratePlans.js
  utils/
    calculateCost.js
    calculateCost.test.js
```

### Key files

- `src/App.jsx`: main app shell and state for usage + weekend percentage
- `src/components/UsageForm.jsx`: user input controls for monthly electricity use and weekend split
- `src/components/RateComparison.jsx`: renders per-plan cost cards and identifies the cheapest option
- `src/data/ratePlans.js`: plan definitions and example PG&E pricing inputs
- `src/utils/calculateCost.js`: calculations for tiered and TOU rate models
- `src/utils/calculateCost.test.js`: automated validation for the pricing logic

## Getting Started

Requirements:

- Node.js
- npm

Install deps and run the app:

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

## Example Usage

1. Enter your estimated monthly usage in kWh.
2. Adjust the weekend-usage slider to reflect how much of your electricity typically happens on Saturdays and Sundays.
3. Review the monthly cost for each plan.
4. Compare the highlighted "Cheapest option" card to see which plan is likely best for your usage pattern.

## Modeling Assumptions and Limitations

This tool is intentionally a simplified estimator, not an official PG&E billing calculator.

Current limitations include:

- Rates and tier thresholds are hard-coded in `src/data/ratePlans.js`
- Seasonal and climate-zone baseline allowances are not modeled
- Base service charges and taxes are excluded
- The app does not model detailed hourly usage traces or real-time interval data
- It is designed for quick comparison rather than bill-precision forecasting

## Testing

The project includes Vitest-based tests for the calculation engine.

Run them with:

```bash
npm test
```

## Disclaimer

This tool provides educational estimates for comparing electricity rate structures. It is not a substitute for an official PG&E tariff calculation or actual billing statement.

## Source and Notes

The example rate inputs are based on publicly documented PG&E residential rate plan pricing, simplified for a lightweight comparison tool.
