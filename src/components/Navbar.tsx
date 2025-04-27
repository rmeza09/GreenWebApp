import React, { useEffect, useState } from "react";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import "../styles/globals.css";

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
    <header
      id="navbar"
      className="fixed top-0 left-0 w-full bg-[#44bf59] flex justify-between items-center px-5 py-2.5 h-[75px] z-[1000] transition-all duration-300"
    >
      <div className="flex items-center">
        <img src={Logo} alt="Green Machine Logo" className="h-[35px] w-auto" />
      </div>
      {isMobile ? (
        <MobileNavbar setActiveSection={setActiveSection} />
      ) : (
        <DesktopNavbar setActiveSection={setActiveSection} />
      )}
    </header>

  );
}

export default Navbar;
