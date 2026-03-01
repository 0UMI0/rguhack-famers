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

const LABEL = { driving: "Car", transit: "Transit", bicycling: "Bike", walking: "Walk" };
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
  const [origin, setOrigin] = useState("Robert Gordon University");
  const [destination, setDestination] = useState("Union Street, Aberdeen");

  const [mode, setMode] = useState("driving");
  const [results, setResults] = useState([]);

  // ✅ Needed for toggle buttons to work
  const [preference, setPreference] = useState("green"); // "fast" | "green" | "health"

  const selectMode = (m) => setMode(m);

  const UI_MODE = {
    driving: { label: "Car", emoji: "🚗", co2KgPerKm: 0.171, kcalPerMin: 0 },
    transit: { label: "Transit", emoji: "🚌", co2KgPerKm: 0.089, kcalPerMin: 0 },
    bicycling: { label: "Bike", emoji: "🚴", co2KgPerKm: 0, kcalPerMin: 8 },
    walking: { label: "Walk", emoji: "🚶", co2KgPerKm: 0, kcalPerMin: 5 },
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

  const computeResults = async () => {
    if (!origin.trim() || !destination.trim()) {
      return { ok: false, msg: "Please enter both start and end locations." };
    }

    const modes = ["driving", "transit", "bicycling", "walking"];

    try {
      const responses = await Promise.all(
        modes.map(async (m) => {
          const params = new URLSearchParams({ origin, destination, mode: m });

          // ✅ Keep as-is if you have Vite proxy.
          // If no proxy, change to: `http://localhost:3000/directions?...`
          const res = await fetch(`/directions?${params.toString()}`);
          const data = await res.json();

          if (!res.ok) {
            return { mode: m, ok: false, error: data?.error || "No route found" };
          }

          const km = parseKm(data.distanceText);
          const timeMin = parseMinutes(data.durationText);

          const meta = UI_MODE[m];
          const co2Kg = Number.isFinite(km) ? +(km * meta.co2KgPerKm).toFixed(2) : 0;
          const kcal = timeMin ? Math.round(timeMin * meta.kcalPerMin) : 0;

          return {
            mode: m,
            ok: true,
            label: meta.label,
            emoji: meta.emoji,
            distanceText: data.distanceText,
            durationText: data.durationText,
            startAddress: data.startAddress,
            endAddress: data.endAddress,
            timeMin,
            co2Kg,
            kcal,
          };
        })
      );

      const successful = responses.filter((r) => r.ok);
      if (successful.length === 0) {
        const firstErr = responses.find((r) => !r.ok);
        return { ok: false, msg: firstErr?.error || "No routes found." };
      }

      setResults(successful);
      return { ok: true };
    } catch {
      return { ok: false, msg: "Could not reach the server. Is Express running?" };
    }
  };

  // ✅ Car baseline
  const car = useMemo(() => results.find((r) => r.mode === "driving") || null, [results]);

  // ✅ Best option depends on preference (this powers the toggle buttons)
  const best = useMemo(() => {
    if (!results.length) return null;

    const byGreen = (a, b) => (a.co2Kg !== b.co2Kg ? a.co2Kg - b.co2Kg : b.kcal - a.kcal);
    const byFast = (a, b) => a.timeMin - b.timeMin;
    const byHealth = (a, b) => b.kcal - a.kcal;

    const sorter =
      preference === "fast" ? byFast : preference === "health" ? byHealth : byGreen;

    return [...results].sort(sorter)[0];
  }, [results, preference]);

  // ✅ Impact object for ImpactPage
  const impact = useMemo(() => {
    if (!results.length || !car) return null;

    const bestAlt = [...results].sort((a, b) => a.co2Kg - b.co2Kg)[0];
    const savedKg = Math.max(0, +(car.co2Kg - bestAlt.co2Kg).toFixed(2));
    const trees = savedKg > 0 ? Math.max(1, Math.round(savedKg / 2)) : 0;

    const totalKcal = results.reduce((s, r) => s + (r.kcal || 0), 0);

    const activeKcal = results
      .filter((r) => r.mode === "walking" || r.mode === "bicycling")
      .reduce((s, r) => s + (r.kcal || 0), 0);

    const nonDrivingCount = results.filter((r) => r.mode !== "driving").length;

    const score = clamp(
      Math.round(savedKg * 50 + activeKcal / 50 + nonDrivingCount * 5),
      0,
      100
    );

    const twiceWeekMonthlyTrips = 8;
    const monthlySaved = +(savedKg * twiceWeekMonthlyTrips).toFixed(2);

    const rec =
      bestAlt.mode !== "driving"
        ? `If you choose ${bestAlt.label || LABEL[bestAlt.mode]} instead of driving twice a week, you could save about ${monthlySaved}kg CO₂ per month.`
        : `Try switching at least 2 trips/week to Transit/Bike/Walk to reduce CO₂ and improve health.`;

    return { baseline: car, bestAlt, savedKg, trees, totalKcal, score, rec };
  }, [results, car]);

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

          <Route
            path="/results"
            element={
              <ResultsPage
                results={results}
                best={best}
                preference={preference}
                setPreference={setPreference}
              />
            }
          />

          {/* ✅ This fixes your blank impact page (route + prop) */}
          <Route path="/impact" element={<ImpactPage impact={impact} />} />

          <Route path="*" element={<Navigate to="/plan" replace />} />
        </Routes>
      </main>
    </>
  );
}