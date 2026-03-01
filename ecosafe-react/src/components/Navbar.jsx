import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="header">
      <div className="topbar">
        <div className="brand">
          <div className="leaf">🍃</div>
          <div className="brandName">EcoSafe</div>
          <div className="brandName">| Core29</div>
        </div>

        <nav className="nav">
          <NavLink to="/plan" className={({ isActive }) => (isActive ? "active" : "")}>
            Plan
          </NavLink>
          <NavLink to="/results" className={({ isActive }) => (isActive ? "active" : "")}>
            Results
          </NavLink>
          <NavLink to="/impact" className={({ isActive }) => (isActive ? "active" : "")}>
            Impact
          </NavLink>
        </nav>
      </div>
    </header>
  );
}