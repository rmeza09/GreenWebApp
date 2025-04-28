import React from "react";
import Logo from "../assets/GreenMachine.png";

function Navbar({ setActiveSection }) {
  return (
    <header className="fixed top-0 left-0 w-full bg-[#44bf59] h-[75px] z-[1000] shadow-md">
      <div className="grid grid-cols-12 h-full">
        {/* LOGO on the left - using grid column */}
        <div className="col-start-2 col-span-3 flex items-center">
          <img src={Logo} alt="Green Machine Logo" style={{ height: '35px', width: 'auto' }} />
        </div>

        {/* Right side dummy buttons - using grid column */}
        <div className="col-start-9 col-span-3 flex justify-end items-center">
          <button 
            style={{ 
              fontFamily: 'Roboto, sans-serif',
              fontSize: '1.2rem',
              color: 'black',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'font-weight 0.2s ease',
              marginRight: '48px'
            }}
            onMouseOver={(e) => e.currentTarget.style.fontWeight = 'bold'}
            onMouseOut={(e) => e.currentTarget.style.fontWeight = 'normal'}
            onClick={() => setActiveSection("home")}
          >
            Home
          </button>
          <button 
            style={{ 
              fontFamily: 'Roboto, sans-serif',
              fontSize: '1.2rem',
              color: 'black',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'font-weight 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.fontWeight = 'bold'}
            onMouseOut={(e) => e.currentTarget.style.fontWeight = 'normal'}
            onClick={() => setActiveSection("linear modeling")}
          >
            Linear Modeling
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
