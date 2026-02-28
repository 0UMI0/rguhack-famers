import { motion } from "framer-motion";

export default function Hero() {
  return (
    <motion.section
      className="hero"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h1>
        Make your travel <span>eco-safe</span>
      </h1>
      <p>Compare. Save. Impact.</p>

      <div className="stepper">
        {[
          { n: 1, label: "Input" },
          { n: 2, label: "Compare" },
          { n: 3, label: "Impact" },
        ].map((s, i) => (
          <motion.div
            key={s.n}
            className="step"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
          >
            <div className="badge">{s.n}</div> {s.label}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}