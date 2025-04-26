import React from "react";
import "./styles/globals.css"

function DesktopNavbar({ setActiveSection }) {
  return (
    <nav className="desktop-nav">
      <button onClick={() => setActiveSection("resume")}>Home</button>
      <button onClick={() => setActiveSection("engineering")}>Linear Modeling</button>
      {/*<button onClick={() => setActiveSection("finance")}>Finance</button>*/}
      {/* <button onClick={() => setActiveSection("contact")}>Contact Me</button> */}
    </nav>
  );
}

export default DesktopNavbar;