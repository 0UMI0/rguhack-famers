import {useMemo, useState} from "react";
import {Bar} from "react-chartjs-2";
import {motion, AnimatePresence} from "framer-motion";
import { useNavigate } from "react-router-dom";

const LABEL = {driving: "Car", transit: "Bus", bicycling: "Bike", walking: "Walk"};
const EMOJI = {driving: "🚗", transit: "🚌", bicycling: "🚴", walking: "🚶"};

export default function Results({results}) {
    // local preference state (keeps changes only inside this component)
    const [preference, setPreference] = useState("green"); // "fast" | "green" | "health"

    const navigate = useNavigate();
    const car = results.find((r) => r.mode === "driving") || null;

    const goImpact = (selected) => {
        navigate("/impact", {
            state: {
                selected,
                baseline: car, // used for "saved vs car"
            },
        });
    };

    const bestReason = preference === "fast" ? "Fastest" : preference === "health" ? "Healthiest" : "Greenest";

    const best = useMemo(() => {
        if (!results.length) return null;

        if (preference === "fast") {
            return [...results].sort((a, b) => (a.timeMin ?? Infinity) - (b.timeMin ?? Infinity))[0];
        }

        if (preference === "health") {
            return [...results].sort((a, b) => (b.kcal ?? 0) - (a.kcal ?? 0))[0];
        }

        // green
        return [...results].sort((a, b) => (a.co2Kg ?? Infinity) - (b.co2Kg ?? Infinity))[0];
    }, [results, preference]);


    // chart: CO2 saved vs car (positive = better)

    const chartData = useMemo(() => {
        const filtered = results.filter((r) => r.mode !== "driving");

        const labels = filtered.map((r) => LABEL[r.mode] || r.mode);

        const data = filtered.map((r) => car ? +(Math.max(0, (car.co2Kg ?? 0) - (r.co2Kg ?? 0))).toFixed(2) : (r.co2Kg ?? 0));

        return {
            labels, datasets: [{
                label: car ? "CO₂ saved vs Car (kg)" : "CO₂ (kg)",
                data,
                backgroundColor: '#2E7D32',
                borderWidth: 1,
                hoverBackgroundColor: '#4bd152',
            },],
        };
    }, [results, car]);

    const chartTitle = "CO₂ saved vs Car"
    const chartSub = "Higher savings is better. " +
        "Bike and walking will always save the maximum" ;

    return (<motion.div
            className="card"
            id="results"
            initial={{opacity: 0, y: 18}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5, ease: "easeOut", delay: 0.1}}
        >
            <h2>Results</h2>
            <div className="sub">Route options | MET values</div>

            {/* Toggle */}
            <div className="toggleRow" style={{marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap"}}>
                <button
                    className={`pill ${preference === "fast" ? "active" : ""}`}
                    onClick={() => setPreference("fast")}
                    type="button"
                >
                    Fastest
                </button>
                <button
                    className={`pill ${preference === "green" ? "active" : ""}`}
                    onClick={() => setPreference("green")}
                    type="button"
                >
                    Greenest
                </button>
                <button
                    className={`pill ${preference === "health" ? "active" : ""}`}
                    onClick={() => setPreference("health")}
                    type="button"
                >
                    Healthiest
                </button>
            </div>

            <div className="cards">
                {results.length === 0 ? (<div className="empty">Click “Compare options” to generate results.</div>) : (
                    <AnimatePresence>
                        {results.map((r, i) => {
                            const isBest = best?.mode === r.mode;

                            return (<motion.div
                                    key={`${r.mode}-${i}`}
                                    className={`modeCard ${isBest ? "highlight" : ""}`}
                                    onClick={() => goImpact(r)}
                                    initial={{opacity: 0, y: 10, scale: 0.98}}
                                    animate={{opacity: 1, y: 0, scale: 1}}
                                    exit={{opacity: 0, y: 8}}
                                    transition={{delay: i * 0.05, duration: 0.25}}
                                >
                                    <div className="modeTop"
                                         style={{display: "flex", justifyContent: "space-between", gap: 10}}>
                                        <div className="modeName">
                                            {EMOJI[r.mode]} {LABEL[r.mode] || r.mode}
                                        </div>
                                        {isBest ? <div className="pillMini">Best • {bestReason}</div> : null}
                                    </div>

                                    <div className="kpi">
                                        <span>Duration</span>
                                        <span>{r.durationText}</span>
                                    </div>

                                    <div className="kpi">
                                        <span>Distance</span>
                                        <span>{r.distanceText}</span>
                                    </div>

                                    <div className="kpi">
                                        <span>Time</span>
                                        <span>{r.timeMin ?? "-"} min</span>
                                    </div>

                                    <div className="kpi">
                                        <span>CO₂</span>
                                        <span>{r.co2Kg ?? "-"} kg</span>
                                    </div>

                                    <div className="kpi">
                                        <span>Calories</span>
                                        <span>{r.kcal ?? 0} kcal</span>
                                    </div>

                                    <div className="kpi">
                                        <span>From</span>
                                        <span style={{textAlign: "right"}}>{r.startAddress}</span>
                                    </div>

                                    <div className="kpi">
                                        <span>To</span>
                                        <span style={{textAlign: "right"}}>{r.endAddress}</span>
                                    </div>
                                </motion.div>);
                        })}
                    </AnimatePresence>)}
            </div>

            {/* Graph under cards */}
            <div className="divider" style={{margin: "18px 0"}}/>

            <h3 style={{margin: "0 0 8px"}}>{chartTitle}</h3>
            <div className="sub" style={{marginBottom: 10}}>
                {chartSub}
            </div>

            <div className="chartWrap" style={{height: 320}}>
                {results.length ? (<Bar
                        data={chartData}
                        options={{
                            responsive: true, maintainAspectRatio: false, plugins: {
                                legend: {display: false}, tooltip: {
                                    callbacks: {
                                        label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(2)} kg`,
                                    },
                                },
                            }, scales: {y: {beginAtZero: true}}, animation: {duration: 650},
                        }}
                    />) : (<div className="emptyChart">Chart appears after comparison.</div>)}
            </div>
        </motion.div>);
}