import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";

const LABEL = { driving: "Car", transit: "Transit", bicycling: "Bike", walking: "Walk" };
const EMOJI = { driving: "🚗", transit: "🚌", bicycling: "🚴", walking: "🚶" };

const fmtSigned = (n, unit = "") => {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n)}${unit}`;
};

export default function Results({ results, best, preference, setPreference }) {
  const [tripsPerWeek, setTripsPerWeek] = useState(2);

  const car = useMemo(() => results.find((r) => r.mode === "driving") || null, [results]);

  // Best low-CO2 alternative (for habits recommendation)
  const bestGreen = useMemo(() => {
    if (!results.length) return null;
    return [...results].sort((a, b) => a.co2Kg - b.co2Kg)[0];
  }, [results]);

  const bestReason =
    preference === "fast" ? "Fastest" : preference === "health" ? "Healthiest" : "Greenest";

  // CO2 saved vs car chart (more meaningful)
  const chartData = useMemo(() => {
    const labels = results.map((r) => r.label || LABEL[r.mode] || r.mode);
    const data = results.map((r) => (car ? +(car.co2Kg - r.co2Kg).toFixed(2) : r.co2Kg));
    return {
      labels,
      datasets: [{ label: car ? "CO₂ saved vs Car (kg)" : "CO₂ (kg)", data }],
    };
  }, [results, car]);

  const chartTitle = car ? "CO₂ saved vs Car" : "CO₂ Comparison";
  const chartSub = car
    ? "Higher savings is better (compared to driving)."
    : "Lower is better.";

  // Smart recommendation (personalised) — safe label fallback to avoid "undefined"
  const smartTip = useMemo(() => {
    if (!car || !bestGreen || bestGreen.mode === "driving") return null;

    const bestLabel = bestGreen.label || LABEL[bestGreen.mode] || "a greener option";
    const savedPerTrip = Math.max(0, car.co2Kg - bestGreen.co2Kg);
    const monthlyTrips = tripsPerWeek * 4; // simple month
    const monthlySaved = +(savedPerTrip * monthlyTrips).toFixed(2);

    return `If you choose ${bestLabel} instead of driving ${tripsPerWeek}×/week, you could save about ${monthlySaved}kg CO₂ per month.`;
  }, [car, bestGreen, tripsPerWeek]);

  return (
    <motion.div
      className="card"
      id="results"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
    >
      {/* ✅ No "Results" title here.
          ResultsPage.jsx should own the page heading, so you don’t get duplicate sections. */}

      {/* Preference toggle */}
      <div className="toggleRow" style={{ marginTop: 2 }}>
        <button
          className={`toggleBtn ${preference === "fast" ? "active" : ""}`}
          onClick={() => setPreference("fast")}
        >
          Fastest
        </button>
        <button
          className={`toggleBtn ${preference === "green" ? "active" : ""}`}
          onClick={() => setPreference("green")}
        >
          Greenest
        </button>
        <button
          className={`toggleBtn ${preference === "health" ? "active" : ""}`}
          onClick={() => setPreference("health")}
        >
          Healthiest
        </button>
      </div>

      {/* Habit control (hackathon “product feel”) */}
      {smartTip && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="sub" style={{ marginBottom: 10 }}>
            Smart recommendation (set your weekly habit):
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <label className="sub" style={{ margin: 0 }}>
              Trips/week:
            </label>
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
            <b>{smartTip}</b>
          </div>
        </div>
      )}

      <div className="cards">
        {results.length === 0 ? (
          <div className="empty">Click “Compare options” to generate results.</div>
        ) : (
          <AnimatePresence>
            {results.map((r, i) => {
              const isBest = best?.mode === r.mode;
              const deltaTime = car ? r.timeMin - car.timeMin : null;
              const savedCo2 = car ? +(car.co2Kg - r.co2Kg).toFixed(2) : null;
              const deltaKcal = car ? (r.kcal || 0) - (car.kcal || 0) : null;

              const modeLabel = r.label || LABEL[r.mode] || r.mode;
              const modeEmoji = r.emoji || EMOJI[r.mode] || "•";

              return (
                <motion.div
                  key={r.mode}
                  className={`modeCard ${isBest ? "highlight" : ""}`}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                >
                  <div className="modeTop">
                    <div className="modeName">
                      {modeEmoji} {modeLabel}
                    </div>
                    {isBest ? <div className="pillMini">Best • {bestReason}</div> : null}
                  </div>

                  <div className="kpi">
                    <span>Time</span>
                    <span>{r.durationText || `${r.timeMin} min`}</span>
                  </div>
                  <div className="kpi">
                    <span>Distance</span>
                    <span>{r.distanceText || `${(r.distanceKm || 0).toFixed(1)} km`}</span>
                  </div>
                  <div className="kpi">
                    <span>CO₂</span>
                    <span>{r.co2Kg} kg</span>
                  </div>
                  <div className="kpi">
                    <span>Calories</span>
                    <span>{r.kcal || 0} kcal</span>
                  </div>

                  {/* Direct comparison vs driving */}
                  {car && r.mode !== "driving" && (
                    <div className="delta">
                      <div className="deltaRow">
                        <span>vs Car</span>
                        <span>
                          Saved {Math.max(0, savedCo2).toFixed(2)}kg CO₂ • Time{" "}
                          {fmtSigned(deltaTime, " min")} • Calories{" "}
                          {fmtSigned(deltaKcal, " kcal")}
                        </span>
                      </div>

                      <div className="deltaHint">
                        Saves <b>{Math.max(0, savedCo2).toFixed(2)}kg</b> CO₂ vs driving
                        {deltaTime > 0 ? (
                          <>
                            {" "}
                            for <b>{deltaTime} min</b> extra
                          </>
                        ) : deltaTime < 0 ? (
                          <>
                            {" "}
                            and is <b>{Math.abs(deltaTime)} min</b> faster
                          </>
                        ) : null}
                        .
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <div className="divider" />

      <h2 style={{ margin: "0 0 8px" }}>{chartTitle}</h2>
      <div className="sub">{chartSub}</div>

      <div className="chartWrap">
        {results.length ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) =>
                      `${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(2)} kg`,
                  },
                },
              },
              scales: { y: { beginAtZero: true } },
              animation: { duration: 650 },
            }}
          />
        ) : (
          <div className="emptyChart">Chart appears after comparison.</div>
        )}
      </div>
    </motion.div>
  );
}