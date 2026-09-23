// src/components/RateComparison.jsx

import { calculateCost } from "../utils/calculateCost.js";

function RateComparison({ monthlyKwh, ratePlans, weekendUsagePercent }) {
    // Don't show anything until the user has entered a usable number
    if (monthlyKwh === "" || monthlyKwh <= 0) {
        return <p className="comparison-empty">Enter your monthly usage above to see estimates.</p>;
    }

    const results = ratePlans.map((plan) => ({
        plan,
        cost: calculateCost(monthlyKwh, plan, weekendUsagePercent),
    }));

    const cheapest = results.reduce((lowest, current) =>
        current.cost < lowest.cost ? current : lowest
    );

    return (
        <div className="rate-comparison">
            {results.map(({ plan, cost }) => (
                <div
                    key={plan.id}
                    className={`plan-card ${plan.id === cheapest.plan.id ? "plan-card--cheapest" : ""}`}
                >
                    <h3>{plan.name}</h3>
                    <p className="plan-description">{plan.description}</p>
                    <p className="plan-cost">${cost.toFixed(2)}</p>
                    {plan.id === cheapest.plan.id && (
                        <span className="badge">Cheapest option</span>
                    )}
                </div>
            ))}
        </div>
    );
}

export default RateComparison;