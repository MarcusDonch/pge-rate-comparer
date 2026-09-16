# PG&E Rate Plan Comparer

A small React + Vite application that demonstrates an engineering approach to comparing residential PG&E rate plans using a simple, code-driven model of monthly electricity consumption.

## Overview

- What it does now: provides a lightweight calculation engine and a set of example PG&E rate plans. The app contains a comparison component that will render estimated monthly costs when a numeric monthly-usage value is provided to the component.
- Problem it addresses: helps explore how different rate structures (tiered vs time-of-use) affect monthly bills for a given amount of consumption.
- Why a simple per-kWh multiply is insufficient: many PG&E plans vary by time-of-use, tiers, and peak-hour fractions; billing depends on when electricity is consumed, not only how much.
- Primary input today: total estimated monthly kWh.
- Model scope: intentionally simplified — this project models plans at a summary level so results are easier to reason about and compare quickly.

## Current Features

- Calculation engine: `src/utils/calculateCost.js` contains the functions that translate a numeric monthly kWh into an estimated monthly cost for a given plan object.
- Rate plan definitions: `src/data/ratePlans.js` contains hard-coded example plans (tiered and time-of-use variants) used by the calculator.
- Comparison component: `src/components/RateComparison.jsx` implements rendering logic that consumes a `monthlyKwh` value and a `ratePlans` array and renders per-plan cost estimates and a cheapest-plan indicator (when a numeric monthly usage is provided).
- Application scaffold: `src/App.jsx` wires together state and components.

Note: The weekend-usage percentage slider and any weekday/weekend split logic are NOT implemented in this repository. The `UsageForm.jsx` file exists in `src/components/` but is currently empty/unimplemented in this copy of the repository; therefore there is no user-facing input control for monthly kWh unless you add one or manually set the initial state in `App.jsx`.

## How It Works (current implementation)

The core calculation lives in `src/utils/calculateCost.js`. The code implements two supported plan types: `tiered` and `timeOfUse`.

- Tiered plans
	- Function: `calculateTieredCost(monthlyKwh, tiers)`
	- Logic: iterates the configured tiers and charges the described rate for kWh that fall into each tier. Example: a first tier up to 300 kWh at one rate, then all remaining kWh at the second rate.
	- Equation (conceptual): cost = sum_over_tiers(min(remaining_kwh, tier_size) * tier_rate)

- Time-of-use plans
	- Function: `calculateTimeOfUseCost(monthlyKwh, plan)`
	- Logic: uses a plan-specific `peakHourFraction` to split monthly kWh into `peakKwh = monthlyKwh * peakHourFraction` and `offPeakKwh = monthlyKwh - peakKwh`, then multiplies each by the plan's `rates.peak` and `rates.offPeak`.
	- Equation: cost = peakKwh * peakRate + offPeakKwh * offPeakRate

The code rounds results to cents using a `roundToCents()` helper before returning values to the UI.

Rate definitions are stored in `src/data/ratePlans.js` and are currently hard-coded example values (with a source comment referencing PG&E pricing). The implementation intentionally simplifies real billing constructs such as baseline allowances and the base service charge.

## Why I Built This

This project is an engineering exercise in modeling and comparing electricity-rate structures. Building a concise, componentized calculator uncovered the important modeling limitation that total monthly kWh alone does not capture timing — which is crucial for time-of-use plans. That observation guided the planned next step (weekend usage modeling) and motivated a design that separates the rate definitions, the calculation engine, and the UI.

## Technical Stack

- React (JSX)
- Vite (dev server and build)
- JavaScript (ES modules)
- Plain CSS for styling
- Git for source control

These technologies are reflected in `package.json` and the project source files.

## Project Structure

src/
- components/
	- UsageForm.jsx         (present but currently empty / not implemented)
	- RateComparison.jsx    (renders estimates when a numeric `monthlyKwh` is provided)
- data/
	- ratePlans.js          (hard-coded plan definitions used by the calculator)
- utils/
	- calculateCost.js      (calculation engine: tiered and time-of-use logic)
- App.jsx                 (application entry component wiring state and components)
index.html                (Vite entry)
main.jsx                  (React bootstrap)

Purpose of important files:
- `src/data/ratePlans.js`: example plan objects and rates used by the calculator.
- `src/utils/calculateCost.js`: contains `calculateCost()` and helper functions for plan-specific math.
- `src/components/RateComparison.jsx`: UI component that displays per-plan costs and indicates the cheapest plan when `monthlyKwh` is set.

## Getting Started

Requirements: Node.js and npm installed.

Install and run the development server:

```bash
npm install
npm run dev
```

Open the address shown by Vite in your browser. Note: because `src/components/UsageForm.jsx` is currently empty, there may not be a UI input to set monthly usage. To quickly preview estimated costs locally, edit `src/App.jsx` and set the initial `monthlyKwh` value in the `useState()` call (for example, `useState(500)`) before starting the dev server.

## Example Usage (manual)

1. (Optional) Edit `src/App.jsx` and set `const [monthlyKwh, setMonthlyKwh] = useState(500);` to provide a numeric starting value.
2. Start the dev server with `npm run dev`.
3. Visit the app in the browser and inspect the per-plan estimates rendered by `RateComparison`.
4. To test different inputs, change the number you set in `App.jsx` and refresh (or rely on HMR).

## Modeling Assumptions and Limitations

- Estimates only: this is a simplified estimator, not an official PG&E bill calculator.
- Hard-coded rates: plan rates and tier thresholds are hard-coded in `src/data/ratePlans.js` and should be verified before relying on results.
- Single input dimension: the current model accepts only total monthly kWh and does not consider hourly or daily timing of usage.
- No weekday/weekend split: the current codebase does not implement a weekend-usage slider or per-day split; time-of-use handling is approximated by a single `peakHourFraction` for the plan.
- Simplifications omitted: baseline allowances, seasonal/zone adjustments, taxes, fees, and other billing specifics are not modeled.

These limitations are intentional for a compact, explainable prototype; see the Future Improvements section for planned enhancements.

## Future Improvements

### Weekend Usage Modeling

Planned: add a slider or input for “Percentage of electricity usage occurring on weekends.” Conceptually the feature would:

1. Split total monthly kWh into weekday and weekend consumption using the chosen percentage.
2. Estimate peak vs off-peak consumption from those buckets based on configurable plan peak windows.
3. Apply plan-specific peak/off-peak rates (and tier logic where applicable).
4. Recompute estimated monthly cost and update the plan comparison to show how consumption timing changes the relative cost of plans.

Other possible improvements:
- Use verified PG&E tariff files or an API for current rates
- Support per-hour or 15-minute usage traces for accurate TOU billing
- Add more plans and zone-specific baseline logic
- Visualize cost differences and break-even points
- Add unit tests for the calculation engine
- Improve validation and error handling
- Publish a public demo site

## Testing

There are no automated tests included in this repository. Manual test procedure:

1. Start the dev server: `npm run dev`.
2. If there is no usage input available, set an initial numeric `monthlyKwh` in `src/App.jsx` and refresh.
3. Verify that `RateComparison` lists costs for the plans in `src/data/ratePlans.js` and that the lowest-cost plan is highlighted.

## Disclaimer

This tool provides simplified, educational estimates for comparing rate structures. It is not a substitute for official PG&E billing statements or tariff analysis.

## Author

Marcus Donchuanchom
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
