import { Bar } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";

const LABEL = { car: "Car", bus: "Bus", bike: "Bike", walk: "Walk" };
const EMOJI = { car: "🚗", bus: "🚌", bike: "🚴", walk: "🚶" };

export default function Results({ results, best }) {
  const chartData = {
    labels: results.map((r) => LABEL[r.mode]),
    datasets: [{ label: "CO₂ (kg)", data: results.map((r) => r.co2Kg) }],
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
      <div className="sub">Side-by-side comparison.</div>

      <div className="cards">
        {results.length === 0 ? (
          <div className="empty">Click “Compare options” to generate results.</div>
        ) : (
          <AnimatePresence>
            {results.map((r, i) => (
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
                  {best?.mode === r.mode ? <div className="pillMini">Best</div> : null}
                </div>
                <div className="kpi"><span>Time</span><span>{r.timeMin} min</span></div>
                <div className="kpi"><span>CO₂</span><span>{r.co2Kg} kg</span></div>
                <div className="kpi"><span>Calories</span><span>{r.kcal} kcal</span></div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="divider" />

      <h2 style={{ margin: "0 0 8px" }}>CO₂ Comparison</h2>
      <div className="sub">Lower is better.</div>

      <div className="chartWrap">
        {results.length ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
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