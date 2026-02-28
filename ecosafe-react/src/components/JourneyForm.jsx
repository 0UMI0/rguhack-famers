import { motion } from "framer-motion";

const MODE_META = {
  car: { label: "Car", emoji: "🚗" },
  bus: { label: "Transit", emoji: "🚌" },
  bike: { label: "Bike", emoji: "🚴‍♀️" },
  walk: { label: "Walk", emoji: "🚶‍♀️" },
};

export default function JourneyForm({
  start,
  end,
  modes,
  toggleMode,
  onCompare,
}) {
  const selectedCount = Object.values(modes).filter(Boolean).length;



  return (
    <motion.section
      className="card planCard"
      id="plan"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <h2 style={{ margin: 0 }}>Plan your journey</h2>
      <div className="sub">Select two locations</div>

      <label className="lbl" htmlFor="start">
        Start Location
      </label>
      <input
        id="start"
        className="input"
        inputMode="text"
        placeholder="Aberdeen"
        value={start}
      />

      <label className="lbl" htmlFor="end">
        End Location
      </label>
      <input
          id="end"
          className="input"
          inputMode="text"
          placeholder="Edinburgh"
          value={end}
      />


      <div className="lbl" style={{ marginTop: 14 }}>
        Transport options{" "}
        <span style={{ color: "var(--muted)", fontWeight: 800 }}>
          ({selectedCount} selected)
        </span>
      </div>

      <div className="modes" role="group" aria-label="Transport modes">
        {Object.keys(MODE_META).map((key) => {
          const active = !!modes[key];
          return (
            <button
              key={key}
              type="button"
              className={`chip ${active ? "active" : ""}`}
              onClick={() => toggleMode(key)}
              aria-pressed={active}
              title={MODE_META[key].label}
            >
              <span aria-hidden="true">{MODE_META[key].emoji}</span>
              <span>{MODE_META[key].label}</span>
            </button>
          );
        })}
      </div>

      <button type="button" className="btn" onClick={onCompare}>
        Compare options
      </button>

      <div className="sub" style={{ marginTop: 12 }}>
        Tip: choose walking/cycling for <b>0 CO₂</b> and more calories burned.
      </div>
    </motion.section>
  );
}