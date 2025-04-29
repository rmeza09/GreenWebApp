import React, { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import StockChart from "./components/StockChart"
import { StockSelect } from "./components/StockSelect"
import { PortfolioPie } from "./components/PortfolioPie";


import "@fortawesome/fontawesome-free/css/all.min.css"
import "./styles/globals.css"


//import { Analytics } from "@vercel/analytics/react"

function App() {
  const [activeSection, setActiveSection] = useState<string>("resume")
  const [data, setData] = useState<{ dates: string[]; close: number[] } | null>(null)

  useEffect(() => {
    console.log("Starting fetch call for portfolio timeseries...");
  
    fetch("http://localhost:5000/api/portfolio_timeseries")
      .then((res) => {
        console.log("Response status:", res.status)
        return res.json()
      })
      .then((result) => {
        console.log("Backend portfolio timeseries result:", result)
        setData(result)
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);
  

  return (
    <div className="w-full overflow-x-hidden">
      <Navbar setActiveSection={setActiveSection} />
      
      <div className="pt-[100px]">
        {data && <StockChart data={data} />}
      </div>

      <div className="pt-[20px]">
        <StockSelect />
      </div>

      <div className="pt-[20px]">
        <PortfolioPie />
      </div>
    </div>

  )
}

export default App
