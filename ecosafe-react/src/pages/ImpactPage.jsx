import { useMemo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Impact from "../components/Impact";
import { motion } from "framer-motion";

const CO2_KG_PER_TREE_PER_YEAR = 21;
const STATS_KEY = "impact_stats_v1";
const LAST_COUNTED_KEY = "impact_last_counted_v1";

const clamp01 = (x) => Math.max(0, Math.min(1, x));

const fmtKg = (n) => `${Number(n || 0).toFixed(2)} kg`;
const fmtInt = (n) => `${Math.round(Number(n || 0))}`;

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw
        ? JSON.parse(raw)
        : {
          journeys: 0,
          totalKcal: 0,
          totalCo2SavedKg: 0,
          streak: 0,
          lastSustainableDate: null,
        };
  } catch {
    return {
      journeys: 0,
      totalKcal: 0,
      totalCo2SavedKg: 0,
      streak: 0,
      lastSustainableDate: null,
    };
  }
}

function saveStats(next) {
  localStorage.setItem(STATS_KEY, JSON.stringify(next));
}

function sustainabilityScore({ co2SavedKg, tripsPerWeek, kcalActive }) {
  const co2Norm = clamp01(co2SavedKg / 2.0);
  const freqNorm = clamp01(tripsPerWeek / 10);
  const kcalNorm = clamp01((kcalActive ?? 0) / 300);

  return Math.round(100 * (0.5 * co2Norm + 0.3 * freqNorm + 0.2 * kcalNorm));
}

function Badge({ title, desc, earned }) {
  return (
      <div
          className="card"
          style={{
            padding: 14,
            border: earned
                ? "1px solid rgba(34,197,94,.35)"
                : "1px solid rgba(148,163,184,.35)",
            background: earned ? "rgba(34,197,94,.06)" : "rgba(2,6,23,.02)",
            opacity: earned ? 1 : 0.75,
          }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontWeight: 700 }}>{title}</div>
          <div
              className="pillMini"
              style={{ background: earned ? "" : "rgba(148,163,184,.2)" }}
          >
            {earned ? "Unlocked" : "Locked"}
          </div>
        </div>
        <div className="sub" style={{ marginTop: 6 }}>
          {desc}
        </div>
      </div>
  );
}

export default function ImpactPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const selected = state?.selected || null;
  const baseline = state?.baseline || null;

  // User-controlled projection only (does NOT affect stats counting)
  const [tripsPerWeek, setTripsPerWeek] = useState(state?.tripsPerWeek ?? 1);

  // Persistent totals
  const [stats, setStats] = useState(loadStats);

  // ✅ Per-trip impact only (stable when trips/week changes)
  const impact = useMemo(() => {
    if (!selected) return null;

    const savedCo2Kg =
        baseline && selected.mode !== "driving"
            ? Math.max(0, (baseline.co2Kg ?? 0) - (selected.co2Kg ?? 0))
            : 0;

    // per-trip tree equivalent (keeps impact stable)
    const treesEquivalent =
        savedCo2Kg > 0 ? savedCo2Kg / CO2_KG_PER_TREE_PER_YEAR : 0;

    const kcalActive =
        selected.mode === "walking" || selected.mode === "bicycling"
            ? selected.kcal ?? 0
            : 0;

    // score per-trip (do not include trips/week)
    const score = sustainabilityScore({
      co2SavedKg: savedCo2Kg,
      tripsPerWeek: 1,
      kcalActive,
    });

    const rec =
        selected.mode === "driving"
            ? "Try walking or cycling for short trips to reduce emissions and increase activity."
            : savedCo2Kg > 0
                ? "Nice choice — this option reduces CO₂ compared with driving."
                : "This option is already very low carbon.";

    return {
      saved: savedCo2Kg.toFixed(2),
      treesText: `${treesEquivalent.toFixed(2)} trees`,
      totalKcal: kcalActive,
      score,
      rec,
      mode: selected.mode,
    };
  }, [selected, baseline]);

  // ✅ Stats should only increment when the actual selected route/mode changes (not trips/week)
  useEffect(() => {
    document.title = "Impact | EcoSafe ";

    if (!impact) return;

    // stable key (no trips/week)
    const selectedKey = `${impact.mode}|${impact.saved}|${impact.totalKcal}`;

    const lastCounted = localStorage.getItem(LAST_COUNTED_KEY);
    if (lastCounted === selectedKey) return;

    localStorage.setItem(LAST_COUNTED_KEY, selectedKey);

    const saved = Number(impact.saved || 0);
    const kcal = Number(impact.totalKcal || 0);
    const today = new Date().toISOString().slice(0, 10);

    setStats((prev) => {
      const next = { ...prev };

      next.journeys = Number(prev.journeys || 0) + 1;
      next.totalKcal = Number(prev.totalKcal || 0) + kcal;
      next.totalCo2SavedKg = Number(prev.totalCo2SavedKg || 0) + saved;

      const last = prev.lastSustainableDate;
      const isSustainable = saved > 0 || kcal > 0;

      if (isSustainable && last !== today) {
        const lastDate = last ? new Date(last) : null;
        const diffDays = lastDate
            ? Math.floor((new Date(today) - lastDate) / (1000 * 60 * 60 * 24))
            : null;

        next.streak = diffDays === 1 ? Number(prev.streak || 0) + 1 : 1;
        next.lastSustainableDate = today;
      }

      saveStats(next);

      // update tree panel on plan page
      window.dispatchEvent(new Event("impact:statsUpdated"));

      return next;
    });
  }, [impact]);

  // ✅ Monthly projection calculations (responds to trips/week)
  const monthlyTrips = tripsPerWeek * (52 / 12); // ~4.33 weeks/month
  const savedPerTrip = Number(impact?.saved ?? 0);
  const kcalPerTrip = Number(impact?.totalKcal ?? 0);

  const monthlyCo2Saved = savedPerTrip * monthlyTrips;
  const monthlyKcal = kcalPerTrip * monthlyTrips;
  const monthlyTrees = monthlyCo2Saved / CO2_KG_PER_TREE_PER_YEAR;

  // Achievements from totals
  const achievements = useMemo(() => {
    const journeys = Number(stats.journeys || 0);
    const kcal = Number(stats.totalKcal || 0);
    const co2 = Number(stats.totalCo2SavedKg || 0);
    const streak = Number(stats.streak || 0);

    return [
      {
        id: "journeys5",
        title: "🧭 5 Journeys Logged",
        desc: `Complete 5 route comparisons. Current: ${fmtInt(journeys)} journeys.`,
        earned: journeys >= 5,
      },
      {
        id: "kcal1000",
        title: "🔥 1,000 Calories Burned",
        desc: `Burn 1,000 kcal through active travel. Current: ${fmtInt(kcal)} kcal.`,
        earned: kcal >= 1000,
      },
      {
        id: "co220",
        title: "🌿 20kg CO₂ Saved",
        desc: `Save 20kg CO₂ vs driving over time. Current: ${fmtKg(co2)}.`,
        earned: co2 >= 20,
      },
      {
        id: "streak3",
        title: "✅ 3-Day Streak",
        desc: `Log at least one low-carbon trip 3 days in a row. Current: ${fmtInt(
            streak
        )} days.`,
        earned: streak >= 3,
      },
    ];
  }, [stats]);

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


        {/* Monthly projection */}
        <motion.div
            className="card"
            style={{ marginBottom: 16 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
        >
          <h2 style={{ marginTop: 0 }}>Monthly projection</h2>
          <div className="sub">
            Set how often you do this trip to estimate monthly impact.
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {[1, 2, 3, 5, 7].map((n) => (
                <button
                    key={n}
                    className={`pill ${tripsPerWeek === n ? "active" : ""}`}
                    onClick={() => setTripsPerWeek(n)}
                    type="button"
                >
                  {n}× / week
                </button>
            ))}
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <div className="impactRow">
              <span>Monthly trips</span>
              <b>{monthlyTrips.toFixed(1)}</b>
            </div>
            <div className="impactRow">
              <span>Monthly CO₂ saved</span>
              <b>{monthlyCo2Saved.toFixed(2)} kg</b>
            </div>
            <div className="impactRow">
              <span>Monthly calories</span>
              <b>{Math.round(monthlyKcal)} kcal</b>
            </div>
            <div className="impactRow">
              <span>Monthly trees equivalent</span>
              <b>{monthlyTrees.toFixed(2)} trees</b>
            </div>
          </div>

        </motion.div>

        {/* Achievements */}
        <motion.div
            className="card"
            style={{ marginTop: 16 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <h2 style={{ marginTop: 0 }}>Achievements</h2>
          <div className="sub">
            These unlock based on your totals (saved in this browser).
          </div>

          <motion.div
              style={{ marginTop: 10, display: "grid", gap: 10 }}
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                },
              }}
          >
            {achievements.map((a) => (
                <motion.div
                    key={a.id}
                    variants={{
                      hidden: { opacity: 0, y: 10, scale: 0.98 },
                      show: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { duration: 0.25, ease: "easeOut" },
                      },
                    }}
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                >
                  <Badge title={a.title} desc={a.desc} earned={a.earned} />
                </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Route baseline recap */}
        {baseline && (
            <motion.div
                className="card"
                style={{ marginTop: 16 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <h2 style={{ marginTop: 0 }}>Route baseline</h2>

              <div className="sub">
                This is the driving comparison used to calculate your impact.
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                <div className="impactRow">
                  <span>Time</span>
                  <b>{baseline.timeMin ?? "—"} mins</b>
                </div>

                <div className="impactRow">
                  <span>Distance</span>
                  <b>{baseline.distanceText ?? "—"}</b>
                </div>

                <div className="impactRow">
                  <span>CO₂ emissions</span>
                  <b>{Number(baseline.co2Kg ?? 0).toFixed(2)} kg</b>
                </div>
              </div>
            </motion.div>
        )}

        <div className="footerRow" style={{ marginTop: 16 }}>
          <button className="btn" onClick={() => navigate("/results")}>
            ← Back to results
          </button>
        </div>
      </>
  );
}