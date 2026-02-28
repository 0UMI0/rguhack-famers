import {useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

import Navbar from "./components/Navbar";
import PlanPage from "./pages/PlanPage";
import ResultsPage from "./pages/ResultsPage";

const LABEL = { driving: "Car", transit: "Transit", bicycling: "Bike", walking: "Walk" };

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

export default function App() {
  // Shared app state
  const [origin, setOrigin] = useState("Robert Gordon University");
  const [destination, setDestination] = useState("Union Street, Aberdeen");

  const [mode, setMode] = useState("driving");

  const [results, setResults] = useState([]);
 // const [error, setError] = useState("");



  const selectMode = (m) => setMode(m);

  const computeResults = async () => {
    const params = new URLSearchParams({ origin, destination, mode });

    const res = await fetch(`/directions?${params.toString()}`);
    console.log("fetch status:", res.status, res.url);

    const data = await res.json();
    console.log("fetch data:", data);

    if (!res.ok) return { ok: false, msg: data?.error || "Backend error" };

    setResults([{ mode, ...data }]);
    return { ok: true };
  };
  return (
    <>
      <Navbar />
      <ScrollToTop />

      <main className="wrap">
        <Routes>
          <Route path="/" element={<Navigate to="/plan" replace />} />

          <Route
              path="/plan"
              element={
                <PlanPage
                    origin={origin}
                    setOrigin={setOrigin}
                    destination={destination}
                    setDestination={setDestination}
                    mode={mode}
                    selectMode={selectMode}
                    computeResults={computeResults}
                />
              }
          />

          <Route path="/results" element={<ResultsPage results={results} />} />

        </Routes>
      </main>
    </>
  );
}