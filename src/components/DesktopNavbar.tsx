import React from "react";
import "../styles/globals.css";

function DesktopNavbar({ setActiveSection }) {
  return (
    <nav className="flex space-x-6 pr-6">
      <button
        onClick={() => setActiveSection("home")}
        className="bg-transparent text-black border-none text-[1.2rem] px-2 py-1 hover:font-bold transition-all"
      >
        Home
      </button>
      <button
        onClick={() => setActiveSection("linear modeling")}
        className="bg-transparent text-black border-none text-[1.2rem] px-2 py-1 hover:font-bold transition-all"
      >
        Linear Modeling
      </button>
    </nav>

  );
}

export default DesktopNavbar;
