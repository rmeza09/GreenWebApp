import React, { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import Portfolio from "./components/StockChart"

import "@fortawesome/fontawesome-free/css/all.min.css"
import "./styles/globals.css"


//import { Analytics } from "@vercel/analytics/react"

function App() {
  const [activeSection, setActiveSection] = useState<string>("resume")
  const [data, setData] = useState<{ dates: string[]; close: number[] } | null>(null)

  useEffect(() => {
    console.log("Starting fetch call...")

    fetch("http://localhost:5000/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: "AAPL" }),
    })
      .then((res) => {
        console.log("Response status:", res.status)
        return res.json()
      })
      .then((result) => {
        console.log("Backend result:", result)
        setData(result)
      })
      .catch((err) => console.error("Fetch error:", err))
  }, [])

  return (
    <div className="w-full overflow-x-hidden">
      <Navbar setActiveSection={setActiveSection} />
      
      <div className="pt-[100px]">
        {data && <Portfolio data={data} />}
      </div>
    </div>

  )
}

export default App
