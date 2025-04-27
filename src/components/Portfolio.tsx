import "../styles/globals.css"

"use client"

import React from "react"
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/ui/chart";

export default function Portfolio({ data }) {
  const chartData = data?.dates?.map((date, index) => ({
    date: new Date(date).toISOString().slice(0, 10),
    price: data.close[index],
  })) || [];

  const chartConfig = {
    price: {
      label: "Close Price",
      color: "#E16036",
    },
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 mt-36">
      <Card className="w-[80vw] max-w-5xl shadow-md">
        <CardHeader className="border-b p-6 text-center">
          <CardTitle className="text-2xl font-semibold mb-2">Portfolio Prediction</CardTitle>
          <CardDescription className="text-base">Model output for AAPL</CardDescription>
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
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="price"
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                  />
                }
              />
              <Line
                dataKey="price"
                type="linear"
                stroke="#E16036"
                strokeWidth={2}
                dot={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={['dataMin - 5', 'dataMax + 5']}
              />

            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
