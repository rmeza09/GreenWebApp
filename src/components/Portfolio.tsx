
import "../styles/globals.css"

"use client"

import React from "react"
import { LineChart, Line, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle , CardDescription} from "../components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "../components/ui/chart";


export default function Portfolio({ data }) {
  // Handle case where data isn't loaded yet
  const chartData = data?.dates?.map((date, index) => ({
    date: new Date(date).toISOString().slice(0, 10), 
    price: data.predictions[index],
  })) || []

  const chartConfig = {

    price: {
      label: "Predicted Price",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Portfolio Prediction</CardTitle>
          <CardDescription>Model output for AAPL</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
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
              type="monotone"
              stroke="var(--color-price)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
