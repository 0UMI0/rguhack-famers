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

// ✅ NEW: Login + route protection
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

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
  // ====== Auth session (persisted) ======
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("eco_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("eco_user", JSON.stringify(user));
    else localStorage.removeItem("eco_user");
  }, [user]);

  const logout = () => setUser(null);

  // ====== Route inputs ======
  const [origin, setOrigin] = useState("Robert Gordon University");
  const [destination, setDestination] = useState("Union Street, Aberdeen");

  // ====== Gamification Stats (persisted) ======
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("eco_stats");
    return saved
      ? JSON.parse(saved)
      : {
          journeys: 0,
          totalKcal: 0,
          totalCo2SavedKg: 0,
          streak: 0,
          lastSustainableDate: null,
        };
  });

  useEffect(() => {
    localStorage.setItem("eco_stats", JSON.stringify(stats));
  }, [stats]);

  const resetStats = () => {
    const fresh = {
      journeys: 0,
      totalKcal: 0,
      totalCo2SavedKg: 0,
      streak: 0,
      lastSustainableDate: null,
    };
    setStats(fresh);
  };

  // ====== Results & preference ======
  const [mode, setMode] = useState("driving");
  const [results, setResults] = useState([]);

  // ✅ Needed for toggle buttons to work (Fastest/Greenest/Healthiest)
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

  const todayKey = () => new Date().toISOString().slice(0, 10);

  const updateStreak = (prev, sustainable) => {
    if (!sustainable) return { ...prev, streak: 0 };

    const today = todayKey();
    if (prev.lastSustainableDate === today) return prev;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = prev.lastSustainableDate === yesterday ? prev.streak + 1 : 1;

    return {
      ...prev,
      streak: newStreak,
      lastSustainableDate: today,
    };
  };

  // ====== Main: call Express backend and build comparison set ======
  const computeResults = async () => {
    if (!origin.trim() || !destination.trim()) {
      return { ok: false, msg: "Please enter both start and end locations." };
    }

    const modes = ["driving", "transit", "bicycling", "walking"];

    try {
      const responses = await Promise.all(
        modes.map(async (m) => {
          const params = new URLSearchParams({ origin, destination, mode: m });

          // ✅ Works if you have Vite proxy OR if you serve frontend behind same origin
          // If you must call full URL: `http://localhost:3000/directions?...`
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

      // ✅ Update gamification stats on each compare
      const car = successful.find((r) => r.mode === "driving") || null;
      const bestAlt = [...successful].sort((a, b) => a.co2Kg - b.co2Kg)[0];
      const savedKg = car ? Math.max(0, car.co2Kg - bestAlt.co2Kg) : 0;

      const sustainable = bestAlt?.mode && bestAlt.mode !== "driving";
      const bestActiveKcal =
        sustainable ? (bestAlt.kcal || 0) : 0; // calories in the best alternative

      setStats((prev) => {
        const next = {
          ...prev,
          journeys: (prev.journeys || 0) + 1,
          totalKcal: +(Number(prev.totalKcal || 0) + Number(bestActiveKcal || 0)).toFixed(0),
          totalCo2SavedKg: +(
            Number(prev.totalCo2SavedKg || 0) + Number(savedKg || 0)
          ).toFixed(2),
        };
        return updateStreak(next, sustainable);
      });

      return { ok: true };
    } catch {
      return { ok: false, msg: "Could not reach the server. Is Express running?" };
    }
  };

  // ====== Baseline (car) ======
  const car = useMemo(() => results.find((r) => r.mode === "driving") || null, [results]);

  // ====== Best option depends on preference (toggle buttons) ======
  const best = useMemo(() => {
    if (!results.length) return null;

    const byGreen = (a, b) => (a.co2Kg !== b.co2Kg ? a.co2Kg - b.co2Kg : b.kcal - a.kcal);
    const byFast = (a, b) => a.timeMin - b.timeMin;
    const byHealth = (a, b) => b.kcal - a.kcal;

    const sorter =
      preference === "fast" ? byFast : preference === "health" ? byHealth : byGreen;

    return [...results].sort(sorter)[0];
  }, [results, preference]);

  // ====== Impact object for ImpactPage ======
  const impact = useMemo(() => {
    if (!results.length || !car) return null;

    const bestAlt = [...results].sort((a, b) => a.co2Kg - b.co2Kg)[0];
    const savedKg = Math.max(0, +(car.co2Kg - bestAlt.co2Kg).toFixed(2));
    const trees = savedKg > 0 ? Math.max(1, Math.round(savedKg / 2)) : 0;

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

    return { baseline: car, bestAlt, savedKg, trees, score, rec };
  }, [results, car]);

  return (
    <>
      {/* If your Navbar doesn't accept props, remove these props */}
      <Navbar user={user} onLogout={logout} />

      <ScrollToTop />

      <main className="wrap">
        <Routes>
          <Route path="/" element={<Navigate to={user ? "/plan" : "/login"} replace />} />

          {/* ✅ Login route */}
          <Route path="/login" element={<LoginPage onLogin={setUser} />} />

          {/* ✅ Protected routes */}
          <Route
            path="/plan"
            element={
              <ProtectedRoute user={user}>
                <PlanPage
                  origin={origin}
                  setOrigin={setOrigin}
                  destination={destination}
                  setDestination={setDestination}
                  mode={mode}
                  selectMode={selectMode}
                  computeResults={computeResults}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/results"
            element={
              <ProtectedRoute user={user}>
                <ResultsPage
                  results={results}
                  best={best}
                  preference={preference}
                  setPreference={setPreference}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/impact"
            element={
              <ProtectedRoute user={user}>
                <ImpactPage impact={impact} stats={stats} resetStats={resetStats} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to={user ? "/plan" : "/login"} replace />} />
        </Routes>
      </main>
    </>
  );
}