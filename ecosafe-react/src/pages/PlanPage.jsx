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

  // ✅ NEW (passed from App.jsx)
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

  const handleLogout = () => {
    onLogout?.();
    // send user back to login page after logout
    navigate("/login", { replace: true });
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

      {/* ✅ Fixed Logout button (bottom-left) */}
      {user ? (
        <button
          type="button"
          onClick={handleLogout}
          className="logoutFab"
          title="Log out"
        >
          ⎋ Logout
        </button>
      ) : null}
    </>
  );
}