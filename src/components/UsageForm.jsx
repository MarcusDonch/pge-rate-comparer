// src/components/UsageForm.jsx

function UsageForm({ monthlyKwh, onUsageChange }) {
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
        </div>
    );
}

export default UsageForm;