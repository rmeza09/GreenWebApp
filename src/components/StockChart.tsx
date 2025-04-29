import "../styles/globals.css"

"use client"

import React from "react"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";


export default function Portfolio({ data }) {
  const chartData = data?.dates?.map((date, index) => {
    const entry = { date: new Date(date).toISOString().slice(0, 10) };
  
    for (const symbol in data.series) {
      entry[symbol] = (data.series[symbol][index] - 1) * 100; // % change
    }
  
    return entry;
  }) || [];
  
  const COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1",
    "#a4de6c", "#d0ed57", "#fa8072", "#b0e0e6", "#ffbb28"
  ];
  
  const chartConfig = {
    price: {
      label: "Close Price",
      color: "#E16036",
    },
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 mt-36">
      <Card className="w-[80vw] max-w-5xl shadow-md font-['Roboto']">
        <CardHeader className="border-b p-6 text-center">
          <CardTitle className="text-2xl font-semibold mb-2 font-['Roboto']">Portfolio Prediction</CardTitle>
          <CardDescription className="text-base font-['Roboto']">Normalized asset movement compared to base date</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={chartConfig} className="items-center justify-center h-[300px] w-[80vw]">
            <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
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


              {data?.series && Object.keys(data.series).map((symbol, idx) => (
                <Line
                  key={symbol}
                  type="linear"
                  dataKey={symbol}
                  strokeWidth={symbol === "SPY" ? 4 : 2}
                  dot={false}
                  stroke={COLORS[idx % COLORS.length]}
                />
              ))}

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
