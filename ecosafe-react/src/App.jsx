import {useState, useEffect} from "react";
import {Routes, Route, Navigate, useLocation} from "react-router-dom";
import "./App.css";

import {
    Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

import Navbar from "./components/Navbar";
import PlanPage from "./pages/PlanPage";
import ResultsPage from "./pages/ResultsPage";
import ImpactPage from "./pages/ImpactPage.jsx";
import Impact from "./components/Impact.jsx";

const LABEL = {driving: "Car", transit: "Transit", bicycling: "Bike", walking: "Walk"};


const AVERAGE_WEIGHT_KG = 75;

const EMISSION_FACTORS = {
    driving: 0.171,   // kg CO2 per km (average car)
    transit: 0.089,   // kg CO2 per km (average bus/transit)
    bicycling: 0, walking: 0,
};


//https://media.hypersites.com/clients/1235/filemanager/MHC/METs.pdf
const MET_VALUES = {
    driving: 1.3, transit: 1.3, bicycling: 8.0, walking: 3.3,
};

// "12.3 km" -> 12.3, "800 m" -> 0.8
function parseKm(distanceText) {
    const t = (distanceText || "").toLowerCase().trim();
    if (t.endsWith("km")) return Number.parseFloat(t);
    if (t.endsWith("m")) return Number.parseFloat(t) / 1000;
    return NaN;

}

// "1 hour 10 mins" -> 70, "15 mins" -> 15
function parseMinutes(durationText) {
    const t = (durationText || "").toLowerCase();
    let mins = 0;
    const h = t.match(/(\d+)\s*hour/);
    const m = t.match(/(\d+)\s*min/);
    if (h) mins += Number.parseInt(h[1], 10) * 60;
    if (m) mins += Number.parseInt(m[1], 10);
    return mins;
}

function ScrollToTop() {
    const {pathname} = useLocation();
    useEffect(() => {
        window.scrollTo({top: 0, behavior: "smooth"});
    }, [pathname]);
    return null;
}

export default function App() {
    // Shared app state
    const [origin, setOrigin] = useState("Robert Gordon University");
    const [destination, setDestination] = useState("Union Street, Aberdeen");


    const [results, setResults] = useState([]);
    // const [error, setError] = useState("");


    const UI_MODE = {
        driving: {label: "Car", emoji: "🚗"},
        transit: {label: "Transit", emoji: "🚌"},
        bicycling: {label: "Bike", emoji: "🚴"},
        walking: {label: "Walk", emoji: "🚶"},
    };


    const computeResults = async () => {
        if (!origin.trim() || !destination.trim()) {
            return {ok: false, msg: "Please enter both start and end locations."};
        }

        const modes = ["driving", "transit", "bicycling", "walking"];

        try {
            const responses = await Promise.all(modes.map(async (m) => {
                const params = new URLSearchParams({origin, destination, mode: m});
                const res = await fetch(`/directions?${params.toString()}`);
                const data = await res.json();

                // If one mode fails (e.g., transit not available), return a structured failure for that mode
                if (!res.ok) {
                    return {mode: m, ok: false, error: data?.error || "No route found"};
                }

                const km = parseKm(data.distanceText);
                const timeMin = parseMinutes(data.durationText);

                const co2Kg = Number.isFinite(km) ? +(km * (EMISSION_FACTORS[m] ?? 0)).toFixed(2) : 0;

                const met = MET_VALUES[m] ?? 1;
                const kcal = timeMin ? Math.round(met * AVERAGE_WEIGHT_KG * (timeMin / 60)) : 0;

                return {
                    mode: m,
                    ok: true,
                    distanceText: data.distanceText,
                    durationText: data.durationText,
                    startAddress: data.startAddress,
                    endAddress: data.endAddress,
                    timeMin,
                    co2Kg,
                    kcal,

                };
            }));

            const successful = responses.filter((r) => r.ok);
            if (successful.length === 0) {
                // show first failure message
                const firstErr = responses.find((r) => !r.ok);
                return {ok: false, msg: firstErr?.error || "No routes found."};
            }

            setResults(successful);

            return {ok: true};
        } catch {
            return {ok: false, msg: "Could not reach the server. Is Express running?"};
        }
    };
    return (

        <>
            <Navbar/>
            <ScrollToTop/>

            <main className="wrap">
                <Routes>
                    <Route path="/" element={<Navigate to="/plan" replace/>}/>

                    <Route
                        path="/plan"
                        element={<PlanPage
                            origin={origin}
                            setOrigin={setOrigin}
                            destination={destination}
                            setDestination={setDestination}
                            computeResults={computeResults}
                        />}
                    />

                    <Route path="/results" element={<ResultsPage results={results}/>}/>
                    <Route path="/impact" element={<ImpactPage />} />
                </Routes>
            </main>
        </>);
}