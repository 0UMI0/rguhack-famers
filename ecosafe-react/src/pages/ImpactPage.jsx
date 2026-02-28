import Impact from "../components/Impact";

export default function ImpactPage({ impact }) {
  return (
    <>
      <div className="pageHead">
        <h1>Impact</h1>
        <p className="sub">Your CO₂ savings, health benefit, and score.</p>
      </div>

      <Impact impact={impact} />
    </>
  );
}