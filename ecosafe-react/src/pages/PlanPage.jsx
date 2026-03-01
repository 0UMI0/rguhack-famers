import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import JourneyForm from "../components/JourneyForm";
import { motion } from "framer-motion";
import ReadyToCompareTree from "../components/ReadyToCompareTree";

export default function PlanPage({
  origin,
  setOrigin,
  destination,
  setDestination,
  computeResults,
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
    localStorage.removeItem("isAuthenticated");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    document.title = "Plan | EcoSafe ";
  }, []);

  return (
    <>
      <Hero />

      <section className="grid">
        <JourneyForm
          start={origin}
          setStart={setOrigin}
          end={destination}
          setEnd={setDestination}
          onCompare={onCompare}
          error={error}
        />

        <motion.div
          className="card resultsHint"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.06 }}
        >
          <ReadyToCompareTree />
        </motion.div>
      </section>

      {/* Logout button bottom-left */}
      <button onClick={handleLogout} style={logoutStyles}>
        Logout
      </button>
    </>
  );
}

const logoutStyles = {
  position: "fixed",
  bottom: "18px",
  left: "18px",
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.12)",
  background: "white",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
};