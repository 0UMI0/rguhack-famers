import { useMemo, useState, useEffect } from "react";
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
import ImpactPage from "./pages/ImpactPage";

const LABEL = { car: "Car", transit: "Transit", bike: "Bike", walk: "Walk" };
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

export default function App() {
  // Shared app state
  const [distance, setDistance] = useState("5");
  const [modes, setModes] = useState({ car: true, bus: true, bike: true, walk: true });
  const [results, setResults] = useState([]);

  const selectedModes = useMemo(
    () => Object.entries(modes).filter(([, v]) => v).map(([k]) => k),
    [modes]
  );

  const toggleMode = (m) => setModes((p) => ({ ...p, [m]: !p[m] }));

  const computeResults = () => {
    const km = parseFloat(distance);
    if (!km || km <= 0) return { ok: false, msg: "Enter a distance in km (e.g. 5)." };
    if (selectedModes.length === 0) return { ok: false, msg: "Select at least one option." };

    const next = selectedModes.map((mode) => {
      const timeMin = (km / SPEED[mode]) * 60;
      return {
        mode,
        timeMin: Math.round(timeMin),
        co2Kg: +(km * CO2[mode]).toFixed(1),
        kcal: Math.round(km * KCAL[mode]),
      };
    });

    setResults(next);
    return { ok: true };
  };

  const best = useMemo(() => {
    if (!results.length) return null;
    return results.reduce((a, b) => {
      if (b.co2Kg < a.co2Kg) return b;
      if (b.co2Kg === a.co2Kg && b.kcal > a.kcal) return b;
      return a;
    }, results[0]);
  }, [results]);

  const impact = useMemo(() => {
    if (!results.length) return null;

    const car = results.find((r) => r.mode === "car");
    const bestAlt = results.reduce((a, b) => (b.co2Kg < a.co2Kg ? b : a), results[0]);

    const saved = car ? Math.max(0, car.co2Kg - bestAlt.co2Kg) : 0;
    const trees = saved > 0 ? Math.max(1, Math.round(saved / 2)) : 0;
    const totalKcal = results.reduce((s, r) => s + r.kcal, 0);

    const avgCo2 = results.reduce((s, r) => s + r.co2Kg, 0) / results.length;
    const score = clamp(Math.round(100 - avgCo2 * 18), 0, 100);

    return {
      saved: +saved.toFixed(1),
      treesText: trees ? `${trees} trees` : "—",
      totalKcal,
      score,
      rec:
        bestAlt.mode !== "car"
          ? `Choose ${LABEL[bestAlt.mode]} for this route to reduce CO₂ and improve health.`
          : `Try Bus/Bike/Walk where possible to reduce CO₂.`,
    };
  }, [results]);

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
                distance={distance}
                setDistance={setDistance}
                modes={modes}
                toggleMode={toggleMode}
                computeResults={computeResults}
              />
            }
          />

          <Route
            path="/results"
            element={
              <ResultsPage
                results={results}
                best={best}
              />
            }
          />

          <Route
            path="/impact"
            element={<ImpactPage impact={impact} />}
          />

          <Route path="*" element={<Navigate to="/plan" replace />} />
        </Routes>
      </main>
    </>
  );
}