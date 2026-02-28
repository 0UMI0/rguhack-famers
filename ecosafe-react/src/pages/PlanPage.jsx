import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import JourneyForm from "../components/JourneyForm";

export default function PlanPage({ distance, setDistance, modes, toggleMode, computeResults }) {
  const navigate = useNavigate();

  const onCompare = () => {
    const res = computeResults();
    if (!res.ok) return alert(res.msg);
    navigate("/results");
  };

  return (
    <>
      <Hero />
      <section className="grid">
        <JourneyForm
          distance={distance}
          setDistance={setDistance}
          modes={modes}
          toggleMode={toggleMode}
          onCompare={onCompare}
        />
        <div className="card resultsHint">
          <h2>Ready to compare?</h2>
          <div className="sub">
            Enter distance, choose transport options, then click <b>Compare options</b>.
            You’ll be taken to the Results page.
          </div>
        </div>
      </section>
    </>
  );
}