import { motion } from "framer-motion";

const LABEL = { car: "Car", bus: "Bus", bike: "Bike", walk: "Walk" };
const EMOJI = { car: "🚗", bus: "🚌", bike: "🚴", walk: "🚶" };

export default function JourneyForm({ distance, setDistance, modes, toggleMode, onCompare }) {
  return (
    <motion.div
      className="card"
      id="plan"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
    >
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
          <motion.button
            key={m}
            type="button"
            className={`chip ${modes[m] ? "active" : ""}`}
            onClick={() => toggleMode(m)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <span className="ico">{EMOJI[m]}</span>
            {LABEL[m]}
          </motion.button>
        ))}
      </div>

      <motion.button
        className="btn"
        onClick={onCompare}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        Compare options
      </motion.button>
    </motion.div>
  );
}