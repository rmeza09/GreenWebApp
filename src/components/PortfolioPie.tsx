import "../styles/globals.css"

"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Pie, PieChart, Legend, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface PortfolioItem {
  Symbol: string;
  Value: number;
}

// Define your color palette and assets array to match StockChart
const COLORS = [
  "#000000",  // SPY will be black (though not used in pie)
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1",
  "#a4de6c", "#d0ed57", "#fa8072", "#b0e0e6", "#ffbb28"
];

const myAssets = ["SPY", "AMZN", "META", "GOOGL", "AMD", "NKE", "UBER", "COST", "JPM", "CRM", "TXRH"];

export function PortfolioPie() {
  const [portfolioData, setPortfolioData] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        // Filter out SPY from the portfolio data
        const filteredData = data.filter(item => item.Symbol !== "SPY");
        setPortfolioData(filteredData);
      })
      .catch((err) => console.error("Error fetching portfolio data:", err));
  }, []);

  const chartConfig = {
    value: {
      label: "Value",
    }
  };

  return (
    <div className="flex justify-center w-full">
      <Card className="flex flex-col w-[700px] font-['Roboto']">
        <CardHeader className="items-center pb-0">
          <CardTitle className="font-['Roboto']">Portfolio Distribution</CardTitle>
          <CardDescription className="font-['Roboto']">Based on Latest Closing Prices</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[500px] [&_.recharts-text]:fill-background"
          >
            <PieChart width={750} height={300}>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const totalValue = portfolioData.reduce((sum, item) => sum + item.Value, 0);
                    const percent = ((data.Value / totalValue) * 100).toFixed(1);

                    return (
                      <div className="bg-white p-2 rounded shadow-md text-black">
                        <div><strong>{data.Symbol}</strong></div>
                        {/* <div>Value: ${data.Value.toLocaleString()}</div> */}
                        <div>Share: {percent}%</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Pie 
                data={portfolioData} 
                dataKey="Value" 
                nameKey="Symbol" 
                outerRadius={150} 
                fill="#8884d8"
                cx="50%"
                cy="50%"
                label={({ name, cx, cy, midAngle, outerRadius, percent, index }) => {
                  // Calculate label position
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 20; // 20px outside the pie
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#222"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      fontWeight="bold"
                      fontFamily="Roboto, sans-serif"
                      fontSize={14}
                    >
                      {portfolioData[index].Symbol}
                    </text>
                  );
                }}
              >
                {portfolioData.map((entry) => {
                  // Get the index from myAssets to ensure consistent coloring
                  const assetIndex = myAssets.indexOf(entry.Symbol);
                  return (
                    <Cell 
                      key={`cell-${entry.Symbol}`} 
                      fill={COLORS[assetIndex]} 
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none font-['Roboto']">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground font-['Roboto']">
            Showing portfolio breakdown
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
