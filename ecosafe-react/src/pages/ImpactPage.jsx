import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Impact from "../components/Impact";

const CO2_KG_PER_TREE_PER_YEAR = 21;

const clamp01 = (x) => Math.max(0, Math.min(1, x));

function sustainabilityScore({ co2SavedKg, tripsPerWeek, kcalActive }) {
  // caps chosen to keep score stable across journeys
  const co2Norm = clamp01(co2SavedKg / 2.0);   // 2kg saved/trip = "excellent"
  const freqNorm = clamp01(tripsPerWeek / 10); // 10 trips/week = "excellent"
  const kcalNorm = clamp01((kcalActive ?? 0) / 300); // 300kcal/trip = "excellent"

  return Math.round(100 * (0.5 * co2Norm + 0.3 * freqNorm + 0.2 * kcalNorm));
}



export default function ImpactPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const selected = state?.selected || null;
  const baseline = state?.baseline || null;

  // Optional: you can pass this from Results via navigate state; default to 2
  const tripsPerWeek = state?.tripsPerWeek ?? 2;

  const impact = useMemo(() => {
    if (!selected) return null;

    const savedCo2Kg =
      baseline && selected.mode !== "driving"
        ? Math.max(0, (baseline.co2Kg ?? 0) - (selected.co2Kg ?? 0))
        : 0;

    const annualSaved = savedCo2Kg * tripsPerWeek * 52;
    const treesEquivalent =
        annualSaved > 0
            ? annualSaved / CO2_KG_PER_TREE_PER_YEAR
            : 0;
    // For "health", use active calories rather than total sitting calories.
    // If you currently set car/transit kcal to 0, then selected.kcal is fine.
    const kcalActive =
      selected.mode === "walking" || selected.mode === "bicycling" ? (selected.kcal ?? 0) : 0;

    const score = sustainabilityScore({ co2SavedKg: savedCo2Kg, tripsPerWeek, kcalActive });

    const treesText = `${treesEquivalent.toFixed(2)} trees`;

    const rec =
      selected.mode === "driving"
        ? "Try walking or cycling for short trips to reduce emissions and increase activity."
        : savedCo2Kg > 0
          ? "Nice choice — this option reduces CO₂ compared with driving."
          : "This option is already very low carbon.";


    return {
      saved: savedCo2Kg.toFixed(2),
      treesText,
      totalKcal: kcalActive,
      score,
      rec,
      mode: selected.mode,
      tripsPerWeek,
    };
  }, [selected, baseline, tripsPerWeek]);

  if (!selected) {
    return (
      <div className="card">
        <h2>Impact Summary</h2>
        <div className="sub">No journey selected. Go back and choose a route.</div>
        <button className="btn" onClick={() => navigate("/results")}>
          ← Back to results
        </button>
      </div>
    );
  }

  return (
    <>
      <Impact impact={impact} />

      <div className="footerRow" style={{ marginTop: 16 }}>
        <button className="btn" onClick={() => navigate("/results")}>
          ← Back to results
        </button>
      </div>
    </>
  );
}