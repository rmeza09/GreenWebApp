import "../styles/globals.css"

"use client"

import React, { useEffect, useState } from "react"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

// Define assets list once at the top level (kept for default display and coloring reference)
const myAssets = ["SPY", "AMZN", "META", "GOOGL", "AMD", "NKE", "UBER", "COST", "JPM", "CRM", "TXRH"];
const COLORS = [
  "#000000",  // SPY will be black
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1",
  "#a4de6c", "#d0ed57", "fa8072", "b0e0e6", "ffbb28"
];

export default function StockChart({ symbols, weights }) {
  const [data, setData] = useState(null);
  // Removed state to manage the symbols currently being displayed: currentSymbols

  // Effect to fetch data whenever symbols or weights change
  useEffect(() => {
    console.log("StockChart useEffect triggered");
    console.log("--- useEffect start ---");
    console.log("Symbols prop received in useEffect:", symbols);
    console.log("Weights prop received in useEffect:", weights);
    console.log("-----------------------");
    
    let symbolsToFetch = symbols; // Use the symbols prop by default
    let weightsToFetch = weights; // Use the weights prop by default

    // Handle the case when symbols prop is empty (Clear button clicked)
    if (symbols && symbols.length === 0) {
        console.log("Symbols prop is empty. Fetching only SPY.");
        symbolsToFetch = ['SPY'];
        weightsToFetch = [1]; // Default weight for SPY
    } else if (!symbols) {
        // Handle initial render case where symbols prop might be undefined/null
        // Based on App.tsx, symbols is initialized to [], so this case might not be strictly necessary,
        // but it's good practice for robustness if initial state changes.
         console.log("Symbols prop is null/undefined on initial render. Fetching myAssets as default.");
         symbolsToFetch = myAssets;
         // Provide default weights for myAssets if not already done in App.tsx initial state
         // Assuming App.tsx initializes with empty weights, provide default weights here.
         weightsToFetch = Array(myAssets.length).fill(1);
    }

    console.log("Symbols to fetch:", symbolsToFetch);
    console.log("Weights to fetch:", weightsToFetch);

    // Build the request options
    let fetchOptions: RequestInit = {};
    let shouldFetch = false;

    // Use symbolsToFetch for the fetch request
    if (symbolsToFetch && symbolsToFetch.length > 0 && weightsToFetch && weightsToFetch.length === symbolsToFetch.length) {
      fetchOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols: symbolsToFetch, shares: weightsToFetch })
      };
      shouldFetch = true;
    } else if (symbolsToFetch && symbolsToFetch.length > 0) {
        console.log("Warning: Weights not provided or length mismatch for symbolsToFetch. Sending with default shares (1 for each symbol).");
         fetchOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbols: symbolsToFetch, shares: Array(symbolsToFetch.length).fill(1) })
        };
        shouldFetch = true;
    } else {
        console.log("StockChart fetch useEffect: No symbolsToFetch provided. Skipping fetch.");
        setData(null); // Clear data if no symbols
    }

    // Only fetch if we have symbols to fetch and the fetchOptions body was set
    if (shouldFetch && fetchOptions.body) {
        let url = "http://localhost:5000/api/custom_portfolio";
        fetch(url, fetchOptions)
        .then(res => res.json())
        .then(result => {
          console.log("StockChart received data:", result);
          // Use the timeseries data which contains individual stock performance
          setData(result?.timeseries);
        })
        .catch(err => console.error("Error fetching stock chart data:", err));
    } else if (symbolsToFetch && symbolsToFetch.length > 0) {
         console.log("StockChart fetch useEffect: Skipping fetch because fetchOptions.body was not set correctly.");
         setData(null);
    }

  }, [symbols, weights]); // Depend directly on symbols and weights props

  const chartData = data?.dates?.map((date, index) => {
    const entry = { date: new Date(date).toISOString().slice(0, 10) };
  
    // Ensure data.series exists before iterating
    if (data?.series) {
        for (const symbol in data.series) {
          // Access the value at the current index - data is already normalized
          entry[symbol] = (data.series[symbol][index] - 1) * 100; // Convert from normalized to percentage change
        }
    }
    return entry;
  }) || [];
  
  console.log("StockChart chartData:", chartData);
  
  const chartConfig = {
    price: {
      label: "Close Price",
      color: "#E16036",
    },
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Card className="w-full shadow-md font-['Roboto']">
        <CardHeader className="border-b p-6 text-center">
          <CardTitle className="text-2xl font-semibold mb-2 font-['Roboto']">Portfolio Components</CardTitle>
          <CardDescription className="text-base font-['Roboto']">Normalized asset movement compared to s&p500</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={chartConfig} className="items-center justify-center h-[400px] w-full">
            <LineChart data={chartData} margin={{ left: 12, right: 12 }} width={800} height={400}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                tickMargin={8}
                minTickGap={32}
                tickLine={false}
                axisLine={false}
                className="font-['Roboto']"
              />
              <Tooltip
                isAnimationActive={false}
                shared={false} 
                cursor={false}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "10px",
                  fontFamily: "Roboto, sans-serif",
                  fontSize: "0.875rem"
                }}
                formatter={(value: number | string) => [`${Number(value).toFixed(2)}%`, '']}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }
              />


              {data?.series && Object.keys(data.series).map((symbol) => {
                // Use the symbol directly for the key
                // Get the index from myAssets to ensure consistent coloring
                const assetIndex = myAssets.indexOf(symbol);
                // Use myAssets index for coloring, fallback if symbol not in myAssets list
                const lineColor = assetIndex !== -1 ? COLORS[assetIndex % COLORS.length] : "#cccccc"; // Use a default grey for symbols not in myAssets

                return (
                  <Line
                    key={symbol}
                    type="linear"
                    dataKey={symbol}
                    strokeWidth={2} // Default stroke width for individual stocks
                    dot={false}
                    stroke={lineColor}
                  />
                );
              })}

              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={['dataMin < 0 ? dataMin : 0', 'dataMax']}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                className="font-['Roboto']"
              />


            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
