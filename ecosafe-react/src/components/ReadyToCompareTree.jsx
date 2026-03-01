import {useEffect, useMemo, useState} from "react";
import {motion} from "framer-motion";

const STATS_KEY = "impact_stats_v1";

function readJourneys() {
    try {
        const raw = localStorage.getItem(STATS_KEY);
        if (!raw) return 0;
        const stats = JSON.parse(raw);
        return Number(stats?.journeys || 0);
    } catch {
        return 0;
    }
}

function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
}

export default function ReadyToCompareTree() {

    const onReset = () => {
        localStorage.removeItem("impact_stats_v1");
        localStorage.removeItem("impact_last_counted_v1");
        setJourneys(0);
        window.dispatchEvent(new Event("impact:statsUpdated"));
    };

    const [journeys, setJourneys] = useState(readJourneys);

    // update if localStorage changes (other tabs) + custom event (same tab)
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === STATS_KEY) setJourneys(readJourneys());
        };
        const onCustom = () => setJourneys(readJourneys());

        window.addEventListener("storage", onStorage);
        window.addEventListener("impact:statsUpdated", onCustom);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("impact:statsUpdated", onCustom);
        };
    }, []);

    const maxLeaves = 30;
    const leafCount = clamp(journeys, 0, maxLeaves);

    const stage = useMemo(() => {
        if (journeys >= 30) return {label: "Flourishing", hint: "You’re building a strong habit."};
        if (journeys >= 10) return {label: "Growing", hint: "Keep comparing routes to unlock more leaves."};
        if (journeys >= 1) return {label: "Sprouting", hint: "Nice start — each journey grows the tree."};
        return {label: "Seedling", hint: "Compare a route to start growing your tree."};
    }, [journeys]);

    const leaves = useMemo(() => {
        const positions = [
            [58, 22, -12], [66, 26, 8], [50, 28, -4], [72, 34, 14], [44, 34, -18],
            [60, 38, 6], [52, 40, -10], [70, 44, 16], [40, 44, -16], [58, 48, 10],
            [48, 50, -8], [68, 52, 18], [38, 52, -14], [56, 56, 12], [46, 58, -6],
            [66, 60, 20], [36, 60, -12], [54, 64, 10], [44, 66, -4], [64, 68, 18],
            [34, 68, -10], [52, 72, 8], [42, 74, -2], [62, 76, 16], [32, 76, -8],
            [50, 80, 6], [40, 82, 0], [60, 84, 14], [30, 84, -6], [56, 88, 10],
        ];
        return positions.slice(0, leafCount).map(([x, y, r], i) => ({x, y, r, i}));
    }, [leafCount]);

    return (
        <>
            <div style={{display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline"}}>
                <div>
                    <h2 style={{marginTop: 0, marginBottom: 6}}>Ready to compare?</h2>
                    <div className="sub">Your eco tree grows as you your log journeys.</div>
                </div>

                <div style={{textAlign: "right"}}>
                    <div style={{fontWeight: 800}}>{stage.label}</div>
                    <div className="sub" style={{marginTop: 4}}>{journeys} journeys</div>
                </div>
            </div>

            <div style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: 14,
                alignItems: "center"
            }}>
                <motion.svg
                    width="120"
                    height="140"
                    viewBox="0 0 100 120"
                    initial={{opacity: 0, y: 8}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.35, ease: "easeOut"}}
                >
                    <path d="M10 112 C30 106, 70 106, 90 112" fill="none" stroke="rgba(148,163,184,.6)"
                          strokeWidth="3"/>
                    <path d="M50 108 C46 92, 48 78, 50 64 C52 78, 54 92, 50 108 Z" fill="rgba(120, 78, 44, .85)"/>
                    <path d="M50 72 C40 62, 34 52, 30 42" fill="none" stroke="rgba(120, 78, 44, .85)" strokeWidth="4"
                          strokeLinecap="round"/>
                    <path d="M50 70 C62 60, 70 52, 76 42" fill="none" stroke="rgba(120, 78, 44, .85)" strokeWidth="4"
                          strokeLinecap="round"/>

                    {leaves.map((l) => (
                        <motion.ellipse
                            key={l.i}
                            cx={l.x}
                            cy={l.y}
                            rx="6"
                            ry="10"
                            transform={`rotate(${l.r} ${l.x} ${l.y})`}
                            fill="rgba(34,197,94,.85)"
                            initial={{scale: 0, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            transition={{type: "spring", stiffness: 420, damping: 26, delay: 0.02 * l.i}}
                        />
                    ))}
                </motion.svg>

                <div>
                    <div className="sub" style={{fontWeight: 700}}>{stage.hint}</div>

                    <div style={{marginTop: 10}}>
                        <div className="sub" style={{marginBottom: 6}}>
                            Leaves: {leafCount}/{maxLeaves}
                        </div>

                        <div style={{
                            height: 10,
                            borderRadius: 999,
                            background: "rgba(148,163,184,.25)",
                            overflow: "hidden"
                        }}>
                            <motion.div
                                style={{height: "100%", background: "rgba(34,197,94,.75)"}}
                                initial={{width: 0}}
                                animate={{width: `${(leafCount / maxLeaves) * 100}%`}}
                                transition={{duration: 0.5, ease: "easeOut"}}
                            />
                        </div>

                        <motion.div
                            style={{display: "flex", justifyContent: "center", marginTop: 12}}
                            initial={{opacity: 0, y: 6}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.25, ease: "easeOut"}}
                        >
                            <button
                                type="button"
                                className="btn"
                                onClick={() => {
                                    if (window.confirm("Reset your progress?")) onReset();
                                }}
                                style={{
                                padding: "10px 14px",
                                borderRadius: 12,
                                background: "rgba(148,163,184,.15)",
                                border: "1px solid rgba(148,163,184,.35)",
                                color: "inherit",
                            }}
                            >
                                Reset progress
                            </button>
                        </motion.div>

                        <div className="sub" style={{marginTop: 10}}>
                            Tip: even switching 1–2 trips/week builds impact fast.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}