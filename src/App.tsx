import React, { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import Portfolio from "./components/Portfolio"

import "@fortawesome/fontawesome-free/css/all.min.css"
import "./styles.css"

//import { Analytics } from "@vercel/analytics/react"

function App() {
  const [activeSection, setActiveSection] = useState<string>("resume")
  const [data, setData] = useState<{ dates: string[]; predictions: number[] } | null>(null)

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

      {data && <Portfolio data={data} />}  {/* ✅ Pass `data` into Portfolio properly */}
    </div>
  )
}

export default App
