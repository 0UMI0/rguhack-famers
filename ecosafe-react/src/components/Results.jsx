import { Bar } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";

const LABEL = { car: "Car", bus: "Bus", bike: "Bike", walk: "Walk" };
const EMOJI = { car: "🚗", bus: "🚌", bike: "🚴", walk: "🚶" };

// Helpers
const fmtSigned = (n, unit = "") => {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const abs = Math.abs(n);
  return `${sign}${abs}${unit}`;
};

export default function Results({ results, best, preference, setPreference }) {
  const car = results.find((r) => r.mode === "car");

  const bestReason =
    preference === "fast"
      ? "Fastest"
      : preference === "health"
      ? "Healthiest"
      : "Greenest";

  // -------------------------
  // FIX #4: Meaningful chart
  // -------------------------
  // If car exists, show "CO₂ saved vs Car" and focus on alternatives (no car bar)
  const chartTitle = car ? "CO₂ saved vs Car" : "CO₂ Comparison";
  const chartSub = car
    ? "Higher savings is better (compared to driving)."
    : "Lower is better.";

  const chartModes = car
    ? results.filter((r) => r.mode !== "car") // show only alternatives
    : results;

  const chartValues = chartModes.map((r) => {
    if (!car) return r.co2Kg;
    const saved = car.co2Kg - r.co2Kg;
    // savings can't be negative; clamp at 0 so the chart stays intuitive
    return +Math.max(0, saved).toFixed(1);
  });

  const chartData = {
    labels: chartModes.map((r) => LABEL[r.mode]),
    datasets: [
      {
        label: car ? "CO₂ saved (kg)" : "CO₂ (kg)",
        data: chartValues,
      },
    ],
  };

  return (
    <motion.div
      className="card"
      id="results"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
    >
      <h2>Results</h2>
      <div className="sub">
        Side-by-side comparison{car ? " (with driving baseline)" : ""}.
      </div>

      {/* Preference toggle */}
      <div className="toggleRow">
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

      <div className="cards">
        {results.length === 0 ? (
          <div className="empty">Click “Compare options” to generate results.</div>
        ) : (
          <AnimatePresence>
            {results.map((r, i) => {
              const deltaTime = car ? r.timeMin - car.timeMin : null;
              const deltaCo2Saved = car ? +(car.co2Kg - r.co2Kg).toFixed(1) : null;
              const deltaKcal = car ? r.kcal - car.kcal : null;

              return (
                <motion.div
                  key={r.mode}
                  className={`modeCard ${best?.mode === r.mode ? "highlight" : ""}`}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                >
                  <div className="modeTop">
                    <div className="modeName">
                      {EMOJI[r.mode]} {LABEL[r.mode]}
                    </div>

                    {best?.mode === r.mode ? (
                      <div className="pillMini">Best • {bestReason}</div>
                    ) : null}
                  </div>

                  <div className="kpi">
                    <span>Time</span>
                    <span>{r.timeMin} min</span>
                  </div>
                  <div className="kpi">
                    <span>CO₂</span>
                    <span>{r.co2Kg} kg</span>
                  </div>
                  <div className="kpi">
                    <span>Calories</span>
                    <span>{r.kcal} kcal</span>
                  </div>

                  {/* vs Driving baseline */}
                  {car && r.mode !== "car" && (
                    <div className="delta">
                      <div className="deltaRow">
                        <span>vs Car</span>
                        <span>
                          Saved {Math.max(0, deltaCo2Saved).toFixed(1)}kg CO₂ • Time{" "}
                          {fmtSigned(deltaTime, " min")} • Calories{" "}
                          {fmtSigned(deltaKcal, " kcal")}
                        </span>
                      </div>

                      <div className="deltaHint">
                        Saves <b>{Math.max(0, deltaCo2Saved).toFixed(1)}kg</b> CO₂ vs driving
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

      {/* Tip when Car isn't selected */}
      {!car && results.length > 0 && (
        <div className="sub" style={{ marginTop: 6 }}>
          Tip: enable <b>Car</b> to see “CO₂ saved vs driving”.
        </div>
      )}

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
                    label: (ctx) => {
                      const v = Number(ctx.parsed.y || 0).toFixed(1);
                      return car ? `Saved ${v} kg CO₂` : `CO₂: ${v} kg`;
                    },
                  },
                },
              },
              scales: {
                y: { beginAtZero: true },
              },
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