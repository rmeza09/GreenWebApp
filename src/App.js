import React, { useState } from "react";
import Navbar from "./components/Navbar";
// import Section from "./components/Section";
// import Profile from "./components/Profile";
// import Engineering from "./components/Engineering";
// import Contact from "./components/Contact";
// import Finance from "./components/Finance";
// import PortfolioPie from "./components/PortfolioPie"

import '@fortawesome/fontawesome-free/css/all.min.css';
import "./styles.css";

import { Analytics } from "@vercel/analytics/react"

function App() {
  const [activeSection, setActiveSection] = useState("resume");

  return (
    <div>
      <Navbar setActiveSection={setActiveSection} />

      <div id="main-content">
        <Section id="resume" isActive={activeSection === "resume"}>
          <Profile />
        </Section>

        <Section id="engineering" isActive={activeSection === "engineering"}>
          <Engineering />
        </Section>
        
        <Section id="finance" title="Finance Research" isActive={activeSection === "finance"}>
          <Finance/>
          <PortfolioPie/>
        </Section>
        
        <Section id="contact" isActive={activeSection === "contact"}>
          <Contact />
        </Section>
      </div>
      
      <Analytics />

    </div>
  );
}

export default App;