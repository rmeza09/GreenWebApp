import React from "react";

function DesktopNavbar({ setActiveSection }) {
  return (
    <nav className="flex space-x-6 pr-6">
      <button
        onClick={() => setActiveSection("home")}
        className="text-black text-[1rem] hover:font-bold transition-all"
      >
        Home
      </button>
      {/* <button
        onClick={() => setActiveSection("linear modeling")}
        className="text-black text-[1rem] hover:font-bold transition-all"
      >
        Linear Modeling
      </button> */}
    </nav>
  );
}

export default DesktopNavbar;
