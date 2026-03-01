import { useNavigate } from "react-router-dom";
import Results from "../components/Results";
import {useEffect} from "react";

export default function ResultsPage({ results }) {
    const navigate = useNavigate();


    useEffect(() => {
        document.title = "Results | EcoSafe ";
    }, []);

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