import React, { useState } from "react";
import "../styles/globals.css";

function MobileNavbar({ setActiveSection }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    setMenuOpen(false);
  };

  return (
    <div className="flex md:hidden items-center relative">
      {/* Hamburger Button */}
      <button
        className="text-white text-3xl absolute right-5 top-1/2 transform -translate-y-1/2 z-[1001]"
        onClick={toggleMenu}
      >
        {menuOpen ? "✖" : "☰"}
      </button>

      {/* Mobile Nav Menu */}
      {menuOpen && (
        <nav className="absolute top-full left-0 w-full bg-[#6bc781] flex flex-col items-center py-4 shadow-md z-50">
          <button
            onClick={() => handleNavClick("resume")}
            className="w-full bg-transparent text-black text-base py-3 hover:bg-[#c0cfc3] rounded transition-all"
          >
            About Me
          </button>
          <button
            onClick={() => handleNavClick("engineering")}
            className="w-full bg-transparent text-black text-base py-3 hover:bg-[#c0cfc3] rounded transition-all"
          >
            Engineering Projects
          </button>
          {/* <button onClick={() => handleNavClick("finance")} className="...">Finance</button> */}
          <button
            onClick={() => handleNavClick("contact")}
            className="w-full bg-transparent text-black text-base py-3 hover:bg-[#c0cfc3] rounded transition-all"
          >
            Contact Me
          </button>
        </nav>
      )}
    </div>
  );
}

export default MobileNavbar;
