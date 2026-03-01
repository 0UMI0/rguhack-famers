import { useNavigate } from "react-router-dom";
import Results from "../components/Results";

export default function ResultsPage({ results, best, preference, setPreference }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="pageHead">
        <h1>Results</h1>
        <p className="sub">Estimated time, CO₂, calories, and comparison vs driving.</p>
      </div>

      <Results
        results={results}
        best={best}
        preference={preference}
        setPreference={setPreference}
      />

      <div className="footerRow">
        <button className="btn" onClick={() => navigate("/plan")}>
          ← Plan another route
        </button>
        <button className="btn" onClick={() => navigate("/impact")}>
          View impact →
        </button>
      </div>
    </>
  );
}