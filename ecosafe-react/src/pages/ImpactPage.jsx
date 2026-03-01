import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const fmtKg = (n) => `${Number(n || 0).toFixed(2)} kg`;
const fmtInt = (n) => `${Math.round(Number(n || 0))}`;

function Badge({ title, desc, earned }) {
  return (
    <div
      className="card"
      style={{
        padding: 14,
        border: earned ? "1px solid rgba(34,197,94,.35)" : "1px solid rgba(148,163,184,.35)",
        background: earned ? "rgba(34,197,94,.06)" : "rgba(2,6,23,.02)",
        opacity: earned ? 1 : 0.75,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div className="pillMini" style={{ background: earned ? "" : "rgba(148,163,184,.2)" }}>
          {earned ? "Unlocked" : "Locked"}
        </div>
      </div>
      <div className="sub" style={{ marginTop: 6 }}>
        {desc}
      </div>
    </div>
  );
}

function ProgressRow({ label, value }) {
  return (
    <div className="kpi">
      <span>{label}</span>
      <span style={{ fontWeight: 800 }}>{value}</span>
    </div>
  );
}

export default function ImpactPage({ impact, stats }) {
  const navigate = useNavigate();
  const [tripsPerWeek, setTripsPerWeek] = useState(2);

  // Safe defaults if stats not passed
  const safeStats = stats || {
    journeys: 0,
    totalKcal: 0,
    totalCo2SavedKg: 0,
    streak: 0,
    lastSustainableDate: null,
  };

  const achievements = useMemo(() => {
    const journeys = Number(safeStats.journeys || 0);
    const kcal = Number(safeStats.totalKcal || 0);
    const co2 = Number(safeStats.totalCo2SavedKg || 0);

    return [
      {
        id: "kcal1000",
        title: "🔥 1,000 Calories Burned",
        desc: `Burn 1,000 kcal through active travel (walking/cycling). Current: ${fmtInt(kcal)} kcal.`,
        earned: kcal >= 1000,
      },
      {
        id: "journeys5",
        title: "🧭 5 Journeys Logged",
        desc: `Complete 5 route comparisons. Current: ${fmtInt(journeys)} journeys.`,
        earned: journeys >= 5,
      },
      {
        id: "co220",
        title: "🌿 20kg CO₂ Saved",
        desc: `Save 20kg CO₂ vs driving over time. Current: ${fmtKg(co2)}.`,
        earned: co2 >= 20,
      },
    ];
  }, [safeStats]);

  const streakMilestones = useMemo(() => {
    const s = Number(safeStats.streak || 0);
    return [
      {
        id: "streak3",
        title: "✅ 3-Day Sustainable Streak",
        desc: "Log at least one low-carbon trip 3 days in a row.",
        earned: s >= 3,
      },
      {
        id: "streak7",
        title: "🏅 7-Day Low-Carbon Commuter",
        desc: "Keep it going for 7 days.",
        earned: s >= 7,
      },
      {
        id: "streak30",
        title: "🏆 30-Day Green Habit",
        desc: "Sustain your streak for 30 days.",
        earned: s >= 30,
      },
    ];
  }, [safeStats]);

  // Make a monthly habit recommendation based on this route’s bestAlt vs driving
  const habitText = useMemo(() => {
    if (!impact?.baseline || !impact?.bestAlt) return null;
    const baseline = impact.baseline;
    const alt = impact.bestAlt;

    // If bestAlt is driving, no savings
    const savedPerTrip = Math.max(0, Number(baseline.co2Kg || 0) - Number(alt.co2Kg || 0));
    const monthlyTrips = tripsPerWeek * 4;
    const monthlySaved = (savedPerTrip * monthlyTrips).toFixed(2);

    const altLabel = alt.label || alt.mode || "a greener option";
    return `If you switch ${tripsPerWeek} trips/week from driving to ${altLabel}, you could save about ${monthlySaved}kg CO₂/month.`;
  }, [impact, tripsPerWeek]);

  if (!impact) {
    return (
      <>
        <div className="pageHead">
          <h1>Impact</h1>
          <p className="sub">Run a comparison first to see your impact summary.</p>
        </div>

        <div className="card">
          <div className="empty">No impact data yet. Go to Plan → Compare options.</div>
        </div>

        <div className="footerRow">
          <button className="btn" onClick={() => navigate("/plan")}>
            ← Back to Plan
          </button>
        </div>
      </>
    );
  }

  const savedKg = Number(impact.savedKg || 0);
  const trees = Number(impact.trees || 0);
  const totalKcal = Number(impact.totalKcal || 0);
  const score = Number(impact.score || 0);

  return (
    <>
      <div className="pageHead">
        <h1>Impact Summary</h1>
        <p className="sub">Your sustainability impact compared to driving (based on this route).</p>
      </div>

      {/* Top grid: summary + recommendations */}
      <section className="grid">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>This route impact</h2>

          <div className="cards" style={{ gridTemplateColumns: "1fr", marginTop: 10 }}>
            <ProgressRow label="CO₂ saved vs Car" value={fmtKg(savedKg)} />
            <ProgressRow label="Equivalent to planting" value={trees ? `${trees} trees` : "—"} />
            <ProgressRow label="Calories burned (best alternative)" value={`${fmtInt(totalKcal)} kcal`} />
            <ProgressRow label="Sustainability score" value={`${fmtInt(score)}/100`} />
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Smart recommendation</h2>
          <div
            className="card"
            style={{
              marginTop: 10,
              border: "1px solid rgba(34,197,94,.35)",
              background: "rgba(34,197,94,.06)",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 18 }}>
              {impact.rec || "Try choosing a greener mode a few times a week to reduce CO₂."}
            </div>
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <div className="sub" style={{ marginBottom: 10 }}>
              Make it a habit (personalised monthly impact):
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div className="sub" style={{ margin: 0 }}>
                Trips/week:
              </div>
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

            <div className="sub" style={{ marginTop: 10, fontWeight: 700 }}>
              {habitText || "Complete a comparison to unlock personalised monthly savings."}
            </div>
          </div>
        </div>
      </section>

      <div className="divider" style={{ margin: "22px 0" }} />

      {/* Progress / achievements / streak */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Your progress</h2>
        <div className="sub">These build up over time and persist in this browser.</div>

        <div className="cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 800 }}>📌 Totals</div>
            <div style={{ marginTop: 10 }}>
              <ProgressRow label="Journeys logged" value={fmtInt(safeStats.journeys)} />
              <ProgressRow label="Total calories" value={`${fmtInt(safeStats.totalKcal)} kcal`} />
              <ProgressRow label="Total CO₂ saved" value={fmtKg(safeStats.totalCo2SavedKg)} />
              <ProgressRow label="Current streak" value={`${fmtInt(safeStats.streak)} days`} />
            </div>
          </div>

          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 800 }}>🏆 Achievements</div>
            <div className="sub">Unlock badges by hitting milestones.</div>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {achievements.map((a) => (
                <Badge key={a.id} title={a.title} desc={a.desc} earned={a.earned} />
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 800 }}>🔥 Streak System</div>
            <div className="sub">Consistency is king.</div>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {streakMilestones.map((s) => (
                <Badge key={s.id} title={s.title} desc={s.desc} earned={s.earned} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="divider" style={{ margin: "22px 0" }} />

      {/* Baseline recap */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Route baseline</h2>
        <div className="sub">
          Driving: <b>{impact.baseline?.timeMin} mins</b>,{" "}
          <b>{impact.baseline?.distanceText || "—"}</b>,{" "}
          <b>{fmtKg(impact.baseline?.co2Kg)}</b> CO₂
        </div>
        <div className="sub" style={{ marginTop: 8 }}>
          Best low-CO₂ option:{" "}
          <b>{impact.bestAlt?.label || impact.bestAlt?.mode}</b> —{" "}
          <b>{impact.bestAlt?.timeMin} mins</b>,{" "}
          <b>{fmtKg(impact.bestAlt?.co2Kg)}</b> CO₂
        </div>
      </div>

      <div className="footerRow">
        <button className="btn" onClick={() => navigate("/results")}>
          ← Back to Results
        </button>
        <button className="btn" onClick={() => navigate("/plan")}>
          Plan another route →
        </button>
      </div>
    </>
  );
}