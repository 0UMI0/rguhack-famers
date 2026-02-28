import { useMemo, useState } from "react";
import "./App.css";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const LABEL = { car: "Car", bus: "Bus", bike: "Bike", walk: "Walk" };
const EMOJI = { car: "🚗", bus: "🚌", bike: "🚴", walk: "🚶" };

// Demo factors (swap later with backend)
const SPEED = { car: 40, bus: 30, bike: 15, walk: 5 }; // km/h
const CO2 = { car: 0.12, bus: 0.08, bike: 0.0, walk: 0.0 }; // kg/km
const KCAL = { car: 0, bus: 0, bike: 30, walk: 50 }; // kcal/km

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function App() {
  const [distance, setDistance] = useState("5");
  const [modes, setModes] = useState({
    car: true,
    bus: true,
    bike: true,
    walk: true,
  });
  const [results, setResults] = useState([]);

  const selectedModes = useMemo(
    () => Object.entries(modes).filter(([, v]) => v).map(([k]) => k),
    [modes]
  );

  const toggleMode = (m) => setModes((p) => ({ ...p, [m]: !p[m] }));

  const calculateMock = () => {
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

  const chartData = useMemo(
    () => ({
      labels: results.map((r) => LABEL[r.mode]),
      datasets: [{ label: "CO₂ (kg)", data: results.map((r) => r.co2Kg) }],
    }),
    [results]
  );

  const ringStyle = useMemo(() => {
    const score = impact?.score ?? 0;
    const deg = score * 3.6;
    return {
      background: `conic-gradient(var(--green) 0deg ${deg}deg, #E5E7EB ${deg}deg 360deg)`,
    };
  }, [impact]);

  return (
    <>
      <header className="header">
        <div className="topbar">
          <div className="brand">
            <div className="leaf">🍃</div>
            <div className="brandName">EcoSafe</div>
            <div className="pill">Core29</div>
          </div>
          <nav className="nav">
            <a href="#plan">Plan</a>
            <a href="#results">Results</a>
            <a href="#impact">Impact</a>
          </nav>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <h1>
            Make your travel <span>eco-safe</span>
          </h1>
          <p>Compare. Save. Impact.</p>

          <div className="stepper">
            <div className="step">
              <div className="badge">1</div> Input
            </div>
            <div className="step">
              <div className="badge">2</div> Compare
            </div>
            <div className="step">
              <div className="badge">3</div> Impact
            </div>
          </div>
        </section>

        <section className="grid" id="plan">
          <div className="card">
            <h2>Plan your journey</h2>
            <div className="sub">Mock calculations for now (backend can plug in later).</div>

            <label className="lbl">Distance (km)</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="e.g. 5"
            />

            <label className="lbl">Transport options</label>
            <div className="modes">
              {["car", "bus", "bike", "walk"].map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`chip ${modes[m] ? "active" : ""}`}
                  onClick={() => toggleMode(m)}
                >
                  <span className="ico">{EMOJI[m]}</span>
                  {LABEL[m]}
                </button>
              ))}
            </div>

            <button className="btn" onClick={calculateMock}>
              Compare options
            </button>
          </div>

          <div className="card" id="results">
            <h2>Results</h2>
            <div className="sub">Side-by-side comparison.</div>

            <div className="cards">
              {results.length === 0 ? (
                <div className="empty">Click “Compare options” to generate results.</div>
              ) : (
                results.map((r) => (
                  <div key={r.mode} className={`modeCard ${best?.mode === r.mode ? "highlight" : ""}`}>
                    <div className="modeTop">
                      <div className="modeName">
                        {EMOJI[r.mode]} {LABEL[r.mode]}
                      </div>
                      {best?.mode === r.mode ? <div className="pillMini">Best</div> : null}
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
                  </div>
                ))
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
                  }}
                />
              ) : (
                <div className="emptyChart">Chart appears after comparison.</div>
              )}
            </div>
          </div>
        </section>

        <section className="card" id="impact">
          <h2>Your impact</h2>
          <div className="sub">Make sustainability visible and easy to understand.</div>

          <div className="impactGrid">
            <div className="impactBox">
              <div className="impactRow">
                <span>CO₂ saved vs car</span>
                <b>{impact ? `${impact.saved} kg` : "—"}</b>
              </div>
              <div className="impactRow">
                <span>Equivalent trees</span>
                <b>{impact ? impact.treesText : "—"}</b>
              </div>
              <div className="impactRow">
                <span>Calories burned</span>
                <b>{impact ? `${impact.totalKcal} kcal` : "—"}</b>
              </div>

              <div className="rec">
                {impact ? impact.rec : "Run a comparison to get a recommendation."}
              </div>
            </div>

            <div className="scoreCol">
              <div className="ring" style={ringStyle}>
                <div className="ringInner">
                  <div className="small">Score</div>
                  <div className="big">{impact ? impact.score : "—"}</div>
                  <div className="outof">/100</div>
                </div>
              </div>
              <div className="sub center">Higher score = lower CO₂ + healthier choice</div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}