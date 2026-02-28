import { useNavigate } from "react-router-dom";
import Results from "../components/Results";

export default function ResultsPage({ results, best, preference, setPreference }) {
  const navigate = useNavigate();

  return (
    <>
      <Results
        results={results}
        best={best}
        preference={preference}
        setPreference={setPreference}
      />

      <div className="footerRow">
        <button className="btn" onClick={() => navigate("/impact")}>
          View impact →
        </button>
      </div>
    </>
  );
}