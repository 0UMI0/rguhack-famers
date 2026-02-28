import { useMemo, useState } from "react";
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
import Hero from "./components/Hero";
import JourneyForm from "./components/JourneyForm";
import Results from "./components/Results";
import Impact from "./components/Impact";

const SPEED = { car: 40, bus: 30, bike: 15, walk: 5 }; // km/h
const CO2 = { car: 0.12, bus: 0.08, bike: 0.0, walk: 0.0 }; // kg/km
const KCAL = { car: 0, bus: 0, bike: 30, walk: 50 }; // kcal/km

const LABEL = { car: "Car", bus: "Bus", bike: "Bike", walk: "Walk" };
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function App() {
  const [distance, setDistance] = useState("5");
  const [modes, setModes] = useState({ car: true, bus: true, bike: true, walk: true });
  const [results, setResults] = useState([]);

  const selectedModes = useMemo(
    () => Object.entries(modes).filter(([, v]) => v).map(([k]) => k),
    [modes]
  );

  const toggleMode = (m) => setModes((p) => ({ ...p, [m]: !p[m] }));

  const onCompare = () => {
    const km = parseFloat(distance);
    if (!km || km <= 0) return alert("Enter a distance in km (e.g. 5).");
    if (selectedModes.length === 0) return alert("Select at least one option.");

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
      <main className="wrap">
        <Hero />
        <section className="grid">
          <JourneyForm
            distance={distance}
            setDistance={setDistance}
            modes={modes}
            toggleMode={toggleMode}
            onCompare={onCompare}
          />
          <Results results={results} best={best} />
        </section>
        <Impact impact={impact} />
      </main>
    </>
  );
}