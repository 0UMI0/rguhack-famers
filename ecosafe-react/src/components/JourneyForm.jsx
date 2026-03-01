import { motion } from "framer-motion";

const MODE_META = {
    driving: { label: "Car", emoji: "🚗" },
    transit: { label: "Transit", emoji: "🚌" },
    bicycling: { label: "Bike", emoji: "🚴‍♀️" },
    walking: { label: "Walk", emoji: "🚶‍♀️" },
};

export default function JourneyForm({
                                        start,
                                        setStart,
                                        end,
                                        setEnd,
                                        //mode,
                                        //selectMode,
                                        onCompare,
                                        loading = false,
                                        error = "",
                                    }) {
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
                placeholder="Robert Gordon University"
                value={start}
                onChange={(e) => setStart(e.target.value)}
            />

            <label className="lbl" htmlFor="end">
                End Location
            </label>
            <input
                id="end"
                className="input"
                placeholder="Union Street, Aberdeen"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
            />


            <div className="lbl" style={{ marginTop: 14 }}>
                Transport options
            </div>

            <div className="modes" aria-label="Transport modes (read-only)">
                {Object.keys(MODE_META).map((key) => (
                    <div key={key} className="chip active">
                        <span>{MODE_META[key].emoji}</span>
                        <span>{MODE_META[key].label}</span>
                    </div>
                ))}
            </div>

            <button type="button" className="btn" onClick={onCompare} disabled={loading}>
                {loading ? "Comparing..." : "Compare options"}
            </button>

            {error && (
                <div style={{ marginTop: 10, color: "crimson", fontWeight: 700 }}>
                    {error}
                </div>
            )}

            <div className="sub" style={{ marginTop: 12 }}>
                Tip: choose walking/cycling for <b>0 CO₂</b> and more calories burned.
            </div>
        </motion.section>
    );
}