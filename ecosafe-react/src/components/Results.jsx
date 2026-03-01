import {motion, AnimatePresence} from "framer-motion";

const LABEL = {driving: "Car", transit: "Transit", bicycling: "Bike", walking: "Walk"};
const EMOJI = {driving: "🚗", transit: "🚌", bicycling: "🚴", walking: "🚶"};


export default function Results({results}) {
    return (<motion.div
            className="card"
            id="results"
            initial={{opacity: 0, y: 18}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5, ease: "easeOut", delay: 0.1}}
        >
            <h2>Results</h2>
            <div className="sub">Route options MET values</div>

            <div className="cards">
                {results.length === 0 ? (<div className="empty">Click “Compare options” to generate results.</div>) : (
                    <AnimatePresence>
                        {results.map((r, i) => (<motion.div
                                key={`${r.mode}-${i}`}
                                className="modeCard"
                                initial={{opacity: 0, y: 10, scale: 0.98}}
                                animate={{opacity: 1, y: 0, scale: 1}}
                                exit={{opacity: 0, y: 8}}
                                transition={{delay: i * 0.05, duration: 0.25}}
                            >
                                <div className="modeTop">
                                    <div className="modeName">
                                        {EMOJI[r.mode]} {LABEL[r.mode] || r.mode}
                                    </div>
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
                                    <span>{r.timeMin} min</span>
                                </div>

                                <div className="kpi">
                                    <span>CO₂</span>
                                    <span>{r.co2Kg} kg</span>
                                </div>

                                <div className="kpi">
                                    <span>Calories</span>
                                    <span>{r.kcal} kcal</span>
                                </div>

                                <div className="kpi">
                                    <span>From</span>
                                    <span style={{textAlign: "right"}}>{r.startAddress}</span>
                                </div>

                                <div className="kpi">
                                    <span>To</span>
                                    <span style={{textAlign: "right"}}>{r.endAddress}</span>
                                </div>
                            </motion.div>))}
                    </AnimatePresence>)}



            </div>
        </motion.div>);
}