// src/components/UsageForm.jsx

function UsageForm({
    monthlyKwh,
    onUsageChange,
    weekendUsagePercent,
    onWeekendUsageChange,
}) {
    function handleChange(event) {
        const value = event.target.value;

        // Allow the field to be cleared without forcing it to 0
        if (value === "") {
            onUsageChange("");
            return;
        }

        const parsed = Number(value);

        // Ignore non-numeric input (typing letters, etc.) rather than
        // letting the field show garbage
        if (isNaN(parsed)) {
            return;
        }

        onUsageChange(parsed);
    }

    function handleWeekendChange(event) {
        onWeekendUsageChange(Number(event.target.value));
    }

    return (
        <div className="usage-form">
            <label htmlFor="monthly-kwh">
                Estimated monthly usage (kWh)
            </label>
            <input
                id="monthly-kwh"
                type="number"
                min="0"
                value={monthlyKwh}
                onChange={handleChange}
                placeholder="e.g. 500"
            />

            <label htmlFor="weekend-usage">
                Usage on weekends: {Math.round(weekendUsagePercent)}%
            </label>
            <input
                id="weekend-usage"
                type="range"
                min="0"
                max="100"
                step="1"
                value={weekendUsagePercent}
                onChange={handleWeekendChange}
            />
            <p className="weekend-usage-hint">
                Matters most for plans with weekday-only peak pricing (like
                E-TOU-D) — the more of your usage happens on weekends, the
                less of it lands in peak hours.
            </p>
        </div>
    );
}

export default UsageForm;