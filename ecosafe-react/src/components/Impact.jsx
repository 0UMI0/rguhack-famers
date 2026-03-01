import { motion } from "framer-motion";
import { useMemo } from "react";

export default function Impact({ impact }) {
  const ringStyle = useMemo(() => {
    const score = impact?.score ?? 0;
    const deg = score * 3.6;
    return {
      background: `conic-gradient(var(--green) 0deg ${deg}deg, rgba(255,255,255,.0) ${deg}deg 360deg)`,
    };
  }, [impact]);

  return (
    <motion.section
      className="card"
      id="impact"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
    >
      <h2>Your impact</h2>
      <div className="sub">Make sustainability visible and easy to understand.</div>

      <div className="impactGrid">
        <motion.div
          className="impactBox"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
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
        </motion.div>


        

        <div className="scoreCol">
          <motion.div
            className="ring"
            style={ringStyle}
            animate={{ scale: impact ? 1 : 0.98 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
          >
            <div className="ringInner">
              <div className="small">Score</div>
              <div className="big">{impact ? impact.score : "—"}</div>
              <div className="outof">/100</div>
            </div>
          </motion.div>
          <div className="sub center">Higher score = lower CO₂ + healthier choice</div>
        </div>
      </div>
    </motion.section>
  );
}