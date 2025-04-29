import React, { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import StockChart from "./components/StockChart"
import { StockSelect } from "./components/StockSelect"
import { PortfolioPie } from "./components/PortfolioPie"

import "@fortawesome/fontawesome-free/css/all.min.css"
import "./styles/globals.css"

//import { Analytics } from "@vercel/analytics/react"

function App() {
  const [activeSection, setActiveSection] = useState<string>("resume")
  const [data, setData] = useState<{ dates: string[]; series: { [key: string]: number[] } } | null>(null)
  const [selectedStocks, setSelectedStocks] = useState<string[]>([])

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
        // Initialize with all stocks selected
        const allStocks = Object.keys(result.series)
        setSelectedStocks(allStocks)
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleStockSelection = (selectedSymbols: string[]) => {
    console.log("Selected stocks:", selectedSymbols)
    setSelectedStocks(selectedSymbols)
  }

  // Filter the data to only include selected stocks
  const filteredData = data ? {
    ...data,
    series: selectedStocks.length > 0 
      ? Object.fromEntries(
          Object.entries(data.series).filter(([symbol]) => 
            selectedStocks.includes(symbol)
          )
        )
      : {} // Empty series when no stocks selected
  } : null;

  return (
    <div className="w-full overflow-x-hidden">
      <Navbar setActiveSection={setActiveSection} />
      
      {/* Main content area with 95% width */}
      <div className="w-[95%] mx-auto pt-[100px]">
        {/* Chart and Table container */}
        <div className="flex gap-4">
          {/* StockChart - 2/3 width */}
          <div className="w-2/3">
            {data && <StockChart data={filteredData || { dates: data.dates, series: {} }} />}
          </div>

          {/* StockSelect - 1/3 width */}
          <div className="w-1/3">
            <StockSelect 
              onStockSelection={handleStockSelection}
              selectedStocks={selectedStocks} 
            />
          </div>
        </div>

        {/* Portfolio Pie below */}
        <div className="pt-[20px]">
          <PortfolioPie />
        </div>
      </div>
    </div>
  )
}

export default App
