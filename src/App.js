import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
// import Section from "./components/Section";
// import Profile from "./components/Profile";
// import Engineering from "./components/Engineering";
// import Contact from "./components/Contact";
// import Finance from "./components/Finance";
// import PortfolioPie from "./components/PortfolioPie"

import '@fortawesome/fontawesome-free/css/all.min.css';
import "./styles.css";

//import { Analytics } from "@vercel/analytics/react"

function App() {
  const [activeSection, setActiveSection] = useState("resume");
  const [data, setData] = useState(null);

  useEffect(() => {
    console.log("Starting fetch call...");
  
    fetch("http://localhost:5000/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: "AAPL" })
    })
      .then(res => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then(result => {
        console.log("Backend result:", result);
        setData(result);
      })
      .catch(err => console.error("Fetch error:", err));
  }, []);
  
  return (
    <div>
      <Navbar setActiveSection={setActiveSection} />

      <div style={{ padding: "6rem" }}>
        <h2>Backend Test</h2>
        {data ? (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <p>Loading data from backend...</p>
        )}
      </div>
      {/* <div id="main-content">
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
      </div> */}
      
      {/* <Analytics /> */}

    </div>
  );
}

export default App;