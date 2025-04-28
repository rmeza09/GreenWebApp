import React from "react";
import Logo from "../assets/GreenMachine.png";

function Navbar({ setActiveSection }) {
  return (
    <header className="fixed top-0 left-0 w-full bg-[#44bf59] flex justify-between items-center px-10 py-4 h-[75px] z-[1000] shadow-md">
      {/* LOGO on the left */}
      <div className="flex items-center">
        <img src={Logo} alt="Green Machine Logo" className="h-[35px] w-auto" />
      </div>

      {/* Right side dummy buttons */}
      <div className="flex space-x-6 pr-6">
        <button className="text-black">Home</button>
        <button className="text-black">Linear Modeling</button>
      </div>
    </header>
  );
}

export default Navbar;
