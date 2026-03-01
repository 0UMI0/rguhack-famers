import { useNavigate } from "react-router-dom";
import Results from "../components/Results";

export default function ResultsPage({ results }) {
    const navigate = useNavigate();

    return (
        <>
            <Results results={results} />

            <div className="footerRow">
                <button className="btn" onClick={() => navigate("/plan")}>
                    ← Plan another route
                </button>
            </div>
        </>
    );
}