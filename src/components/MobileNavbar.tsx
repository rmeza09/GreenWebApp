
import React, { useState } from "react";
import "./styles/globals.css"


function MobileNavbar({ setActiveSection }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);

    // Toggle "open" class on navbar
    const navbar = document.getElementById("navbar");
    if (navbar) {
      if (!menuOpen) {
        navbar.classList.add("open");
      } else {
        navbar.classList.remove("open");
      }
    }
  };

  const handleNavClick = (section) => {
    setActiveSection(section);
    setMenuOpen(false);

    // Remove "open" class when a button is clicked
    const navbar = document.getElementById("navbar");
    if (navbar) {
      navbar.classList.remove("open");
    }
  };

  return (
    <div className="mobile-navbar-container">
      <button className="menu-btn" onClick={toggleMenu}>
        {menuOpen ? "✖" : "☰"}
      </button>

      <nav className={`mobile-nav ${menuOpen ? "open" : ""}`}>
        <button onClick={() => handleNavClick("resume")}>About Me</button>
        <button onClick={() => handleNavClick("engineering")}>Engineering Projects</button>
        {/*<button onClick={() => handleNavClick("finance")}>Finance</button>*/}
        <button onClick={() => handleNavClick("contact")}>Contact Me</button>
      </nav>
    </div>
  );
}

export default MobileNavbar;