import React, { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import StockChart from "./components/StockChart"
import { StockSelect } from "./components/StockSelect"
import { PortfolioPie } from "./components/PortfolioPie"
import AvgPerformance from "./components/AvgPerformance"
import { PortfolioConfigurator } from "./components/PortfolioConfigurator"

import "@fortawesome/fontawesome-free/css/all.min.css"
import "./styles/globals.css"

//import { Analytics } from "@vercel/analytics/react"

function App() {
  const [activeSection, setActiveSection] = useState<string>("resume")
  const [data, setData] = useState<{ dates: string[]; series: { [key: string]: number[] } } | null>(null)
  const [selectedStocks, setSelectedStocks] = useState<string[]>([])
  const [portfolioWeights, setPortfolioWeights] = useState<number[]>([])
  const [hasError, setHasError] = useState<boolean>(false)
  
  console.log("✅ App component mounted!");

  useEffect(() => {
    // Add error boundary for the entire app
    const handleError = (error: ErrorEvent) => {
      console.error("App error caught:", error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleStockSelection = (selectedSymbols: string[]) => {
    console.log("StockSelect selection received:", selectedSymbols)
    setSelectedStocks(selectedSymbols)
    setPortfolioWeights([]);
  }

  const handlePortfolioUpdate = (newSymbols: string[], newWeights: number[]) => {
    console.log("PortfolioConfigurator update received:");
    console.log("Symbols:", newSymbols);
    console.log("Weights:", newWeights);
    
    // Update the selected stocks and weights
    setSelectedStocks(newSymbols);
    setPortfolioWeights(newWeights);
    
    // Log the current state after update
    console.log("Updated selectedStocks state:", newSymbols);
    console.log("Updated portfolioWeights state:", newWeights);
    console.log("App.tsx - selectedStocks passed to StockChart:", newSymbols);
  };

  console.log("App.tsx - Rendering StockChart with symbols:", selectedStocks);
  console.log("App.tsx - Rendering StockChart with weights:", portfolioWeights);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h1>
          <p className="text-red-600 mb-4">The app encountered an error. Please check the console for details.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <Navbar setActiveSection={setActiveSection} />
      
      {/* Main content area with 95% width */}
      <div className="w-[95%] mx-auto pt-[100px]">
        {/* Chart and Table container */}
        <div className="flex items-center gap-8">
          {/* StockChart - 2/3 width */}
          
            {/* Pass both symbols and weights to StockChart */}
            <StockChart symbols={selectedStocks} weights={portfolioWeights} />
          

          {/* StockSelect - 1/3 width */}
          <div className="flex-[1]">
            {/* <StockSelect 
              onStockSelection={handleStockSelection}
              selectedStocks={selectedStocks} 
            /> */}
          </div>
        </div>

        {/* PortfolioPie and AvgPerformance side by side */}
        {/*
        <div className="flex gap-8 items-center pt-[20px] max-w-[1600px] mx-auto">
          <div className="w-1/2">
            <PortfolioPie symbols={selectedStocks} weights={portfolioWeights} />
          </div>
          <div className="w-1/2">
            <AvgPerformance />
          </div>
        </div>
        */}

        
        <div className="w-1/2  items-center mx-auto" >
          <PortfolioConfigurator onUpdate={handlePortfolioUpdate} />
        </div>
      </div>
    </div>
  )
}

export default App
