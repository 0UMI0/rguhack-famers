import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function ImpactPage({ impact }) {
  const navigate = useNavigate();
  const [tripsPerWeek, setTripsPerWeek] = useState(2);

  const smartMonthly = useMemo(() => {
    if (!impact?.baseline || !impact?.bestAlt) return null;
    if (impact.bestAlt.mode === "driving") return null;

    const savedPerTrip = Math.max(0, impact.baseline.co2Kg - impact.bestAlt.co2Kg);
    const monthlyTrips = tripsPerWeek * 4;
    const monthlySaved = +(savedPerTrip * monthlyTrips).toFixed(2);
    const monthlyTrees = monthlySaved > 0 ? Math.max(1, Math.round(monthlySaved / 2)) : 0;

    return { monthlySaved, monthlyTrees };
  }, [impact, tripsPerWeek]);

  if (!impact) {
    return (
      <div className="card">
        <h2>Impact</h2>
        <div className="sub">Run a comparison first to see your sustainability impact.</div>
        <div className="footerRow">
          <button className="btn" onClick={() => navigate("/plan")}>
            ← Back to Plan
          </button>
        </div>
      </div>
    );
  }

  const { baseline, bestAlt, savedKg, trees, totalKcal, score, rec } = impact;

  return (
    <motion.section
      className="card"
      id="impact"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2>Impact Summary</h2>
      <div className="sub">
        Your sustainability impact compared to driving (based on this route).
      </div>

      <div className="impactGrid">
        <div className="impactBox">
          <div className="impactRow">
            <span>CO₂ saved vs Car</span>
            <b>{savedKg} kg</b>
          </div>
          <div className="impactRow">
            <span>Equivalent to planting</span>
            <b>{trees ? `${trees} trees` : "—"}</b>
          </div>
          <div className="impactRow">
            <span>Calories burned (best alternative)</span>
            <b>{bestAlt?.kcal || 0} kcal</b>
          </div>
          <div className="impactRow">
            <span>Sustainability score</span>
            <b>{score}/100</b>
          </div>
        </div>

        <div className="impactBox">
          <div className="sub">
            <b>Smart recommendation</b>
          </div>
          <div className="rec" style={{ marginTop: 8 }}>
            {rec}
          </div>

          {smartMonthly && (
            <div className="card" style={{ marginTop: 12 }}>
              <div className="sub" style={{ marginBottom: 10 }}>
                Make it a habit (personalised monthly impact):
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span className="sub" style={{ margin: 0 }}>
                  Trips/week:
                </span>
                {[1, 2, 3, 5].map((n) => (
                  <button
                    key={n}
                    className={`toggleBtn ${tripsPerWeek === n ? "active" : ""}`}
                    onClick={() => setTripsPerWeek(n)}
                  >
                    {n}×
                  </button>
                ))}
              </div>

              <div className="sub" style={{ marginTop: 10 }}>
                If you switch <b>{tripsPerWeek} trips/week</b> from driving to{" "}
                <b>{bestAlt.label}</b>, you could save about{" "}
                <b>{smartMonthly.monthlySaved}kg CO₂/month</b>
                {smartMonthly.monthlyTrees ? (
                  <>
                    {" "}
                    (≈ <b>{smartMonthly.monthlyTrees} trees</b>)
                  </>
                ) : null}
                .
              </div>
            </div>
          )}

          <div className="divider" style={{ marginTop: 14 }} />

          <div className="sub">
            <b>Hackathon-ready add-ons</b>
          </div>
          <ul className="sub" style={{ marginTop: 8 }}>
            <li>“Weekly streak” (store in localStorage): sustainable trips this week</li>
            <li>Badge system: Green Commuter / Active Traveller / CO₂ Saver</li>
            <li>Share card: “I saved X kg CO₂ this month”</li>
          </ul>
        </div>
      </div>

      <div className="divider" />

      <h3>Route baseline</h3>
      <div className="sub">
        Driving: <b>{baseline?.durationText}</b>, <b>{baseline?.distanceText}</b>,{" "}
        <b>{baseline?.co2Kg}kg CO₂</b>
      </div>
      <div className="sub" style={{ marginTop: 6 }}>
        Best low-CO₂ option: <b>{bestAlt?.label}</b> — <b>{bestAlt?.durationText}</b>,{" "}
        <b>{bestAlt?.co2Kg}kg CO₂</b>
      </div>

      <div className="footerRow">
        <button className="btn" onClick={() => navigate("/results")}>
          ← Back to Results
        </button>
        <button className="btn" onClick={() => navigate("/plan")}>
          Plan another route →
        </button>
      </div>
    </motion.section>
  );
}