import { useNavigate } from "react-router-dom";
import Results from "../components/Results";

export default function ResultsPage({ results, best }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="pageHead">
        <h1>Results</h1>
        <p className="sub">Side-by-side comparison and CO₂ chart.</p>
      </div>

      <Results results={results} best={best} />

      <div className="footerRow">
        <button className="btn" onClick={() => navigate("/impact")}>
          View impact →
        </button>
      </div>
    </>
  );
}