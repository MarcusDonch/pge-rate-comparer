import { useState } from "react";
import "./App.css";
import UsageForm from "./components/UsageForm";
import RateComparison from "./components/RateComparison";
import { ratePlans } from "./data/ratePlans.js";
import { DEFAULT_WEEKEND_USAGE_PERCENT } from "./utils/calculateCost.js";

function App() {
  const [monthlyKwh, setMonthlyKwh] = useState("");
  const [weekendUsagePercent, setWeekendUsagePercent] = useState(
    DEFAULT_WEEKEND_USAGE_PERCENT
  );

  return (
    <div className="app">
      <h1>PG&E Rate Plan Comparer</h1>
      <UsageForm
        monthlyKwh={monthlyKwh}
        onUsageChange={setMonthlyKwh}
        weekendUsagePercent={weekendUsagePercent}
        onWeekendUsageChange={setWeekendUsagePercent}
      />
      <RateComparison
        monthlyKwh={monthlyKwh}
        ratePlans={ratePlans}
        weekendUsagePercent={weekendUsagePercent}
      />
    </div>
  );
}

export default App;