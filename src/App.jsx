import { useState } from "react";
import "./App.css";
import UsageForm from "./components/UsageForm";
import RateComparison from "./components/RateComparison";
import { ratePlans } from "./data/ratePlans.js";

function App() {
  const [monthlyKwh, setMonthlyKwh] = useState("");

  return (
    <div className="app">
      <h1>PG&E Rate Plan Comparer</h1>
      <UsageForm monthlyKwh={monthlyKwh} onUsageChange={setMonthlyKwh} />
      <RateComparison monthlyKwh={monthlyKwh} ratePlans={ratePlans} />
    </div>
  );
}

export default App;