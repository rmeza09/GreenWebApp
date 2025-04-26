import React, { useEffect, useState } from "react";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import "../styles.css";
import Logo from "../assets/GreenMachine.png"; // Import the logo

function Navbar({ setActiveSection }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header id="navbar">
      {/* Logo on the left */}
      <div className="nav-logo">
        <img src={Logo} alt="R9 Logo" />
      </div>

      {/* Desktop or Mobile Navbar based on screen size */}
      {isMobile ? (
        <MobileNavbar setActiveSection={setActiveSection} />
      ) : (
        <DesktopNavbar setActiveSection={setActiveSection} />
      )}
    </header>
  );
}

export default Navbar;