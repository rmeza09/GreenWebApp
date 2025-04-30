import "../styles/globals.css"

"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

interface ChartDataPoint {
  date: string;
  SPY?: number;
  Portfolio?: number;
}

export default function AvgPerformance() {
  const [data, setData] = useState<{ dates: string[]; series: { [key: string]: number[] } } | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching performance data...");
        const response = await fetch("http://localhost:5000/api/performance_timeseries");
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        console.log("Received data:", jsonData);

        if (!jsonData || !jsonData.dates || !jsonData.series) {
          throw new Error("Invalid data structure received");
        }

        setData(jsonData);

        // Process the data
        const processed = jsonData.dates.map((date: string, index: number) => {
          const entry: ChartDataPoint = {
            date: new Date(date).toISOString().slice(0, 10)
          };

          if (jsonData.series.SPY) {
            entry.SPY = (jsonData.series.SPY[index] - 1) * 100;
          }
          if (jsonData.series.Portfolio) {
            entry.Portfolio = (jsonData.series.Portfolio[index] - 1) * 100;
          }

          return entry;
        });

        console.log("Processed chart data:", processed);
        setChartData(processed);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching/processing data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const COLORS = {
    SPY: "#000000",
    Portfolio: "#fa8072"
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <p>Loading performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Card className="w-full shadow-md font-['Roboto']">
        <CardHeader className="border-b p-6 text-center">
          <CardTitle className="text-2xl font-semibold mb-2 font-['Roboto']">Portfolio Performance</CardTitle>
          <CardDescription className="text-base font-['Roboto']">Portfolio vs s&p500 Performance</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: 12, right: 24, top: 24, bottom: 12 }}>
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
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={['dataMin < 0 ? dataMin : 0', 'dataMax']}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                  className="font-['Roboto']"
                />
                <Tooltip
                  isAnimationActive={false}
                  shared={true}
                  cursor={false}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "10px",
                    fontFamily: "Roboto, sans-serif",
                    fontSize: "0.875rem",
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

                <Line
                  type="linear"
                  dataKey="SPY"
                  strokeWidth={3}
                  dot={false}
                  stroke={COLORS.SPY}
                  name="SPY"
                />
                <Line
                  type="linear"
                  dataKey="Portfolio"
                  strokeWidth={2}
                  dot={false}
                  stroke={COLORS.Portfolio}
                  name="Portfolio"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
