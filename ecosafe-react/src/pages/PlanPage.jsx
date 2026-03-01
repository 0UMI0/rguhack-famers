import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import JourneyForm from "../components/JourneyForm";

export default function PlanPage({
  origin,
  setOrigin,
  destination,
  setDestination,
  mode,
  selectMode,
  computeResults,

  // ✅ NEW (from App.jsx)
  user,
  onLogout,
}) {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const onCompare = async () => {
    setError("");
    const r = await computeResults();

    if (!r.ok) {
      setError(r.msg);
      return;
    }

    navigate("/results");
  };

  return (
    <>
      <Hero />

      <section className="grid">
        <JourneyForm
          start={origin}
          setStart={setOrigin}
          end={destination}
          setEnd={setDestination}
          mode={mode}
          selectMode={selectMode}
          onCompare={onCompare}
          error={error}
        />

        <div className="card resultsHint">
          <h2>Ready to compare?</h2>
          <div className="sub">
            Enter start and end locations, choose a travel mode, then click{" "}
            <b>Compare options</b>.
          </div>
        </div>
      </section>

      {/* ✅ Logout button fixed bottom-left */}
      {user && (
        <button
          onClick={() => {
            onLogout?.();
            navigate("/plan"); // stays on plan; safe
          }}
          style={{
            position: "fixed",
            left: 18,
            bottom: 18,
            zIndex: 9999,
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "white",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            cursor: "pointer",
            fontWeight: 600,
          }}
          title="Log out"
        >
          ⎋ Logout
        </button>
      )}
    </>
  );
}