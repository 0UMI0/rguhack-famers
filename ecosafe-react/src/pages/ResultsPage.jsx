import { useNavigate } from "react-router-dom";
import Results from "../components/Results";

export default function ResultsPage({ results }) {
    const navigate = useNavigate();

    return (
        <>
            <div className="pageHead">
                <h1>Results</h1>
                <p className="sub">Route details from the backend.</p>
            </div>

            <Results results={results} />

            <div className="footerRow">
                <button className="btn" onClick={() => navigate("/plan")}>
                    ← Plan another route
                </button>
            </div>
        </>
    );
}