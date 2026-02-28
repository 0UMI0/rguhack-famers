export default function Navbar() {
    return (
      <header className="header">
        <div className="topbar">
          <div className="brand">
            <div className="leaf">🍃</div>
            <div className="brandName">EcoSafe</div>
            <div className="pill">Core29</div>
          </div>
          <nav className="nav">
            <a href="#plan">Plan</a>
            <a href="#results">Results</a>
            <a href="#impact">Impact</a>
          </nav>
        </div>
      </header>
    );
  }