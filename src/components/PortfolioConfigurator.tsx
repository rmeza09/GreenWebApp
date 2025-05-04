import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
  } from "lucide-react"
  
  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
  } from "@/components/ui/command"
  
  import React, { useEffect, useState } from "react"


  type Stock = {
    symbol: string
    name: string
  }
  

  export function PortfolioConfigurator() {
    const [portfolio, setPortfolio] = useState<{ symbol: string; weight: number }[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [allSymbols, setAllSymbols] = useState<Stock[]>([])
  
    useEffect(() => {
      fetch("/stock_symbols.json")
        .then(res => res.json())
        .then(data => setAllSymbols(data))
    }, [])
  
    
    const handleAdd = (symbol: string) => {
      if (portfolio.length < 10 && !portfolio.find(item => item.symbol === symbol)) {
        setPortfolio([...portfolio, { symbol, weight: 1 }])
      }
    }
  
    const handleWeightChange = (index: number, newWeight: number) => {
      const updated = [...portfolio]
      updated[index].weight = newWeight
      setPortfolio(updated)
    }
  
    const handleSubmit = () => {
      fetch("/api/custom_portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbols: portfolio.map(p => p.symbol),
          shares: portfolio.map(p => p.weight)
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log("Updated Portfolio Charts:", data)
        // forward this data to your charting components
      })
    }
  
    return (
      <div className="p-4 border rounded-md shadow-md">
        <Command className="rounded-lg border shadow-md md:min-w-[450px]">
          <CommandInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search for a stock..."
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Stocks">
              {allSymbols
                .filter(s => s.symbol.includes(searchTerm.toUpperCase()))
                .map(s => (
                  <CommandItem key={s.symbol} onSelect={() => handleAdd(s.symbol)}>
                    <span>{s.symbol} - {s.name}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
  
        <div className="mt-4 space-y-2">
          {portfolio.map((item, idx) => (
            <div key={item.symbol} className="flex justify-between items-center">
              <span>{item.symbol}</span>
              <input
                type="number"
                className="border p-1 w-24 ml-2"
                value={item.weight}
                onChange={e => handleWeightChange(idx, parseFloat(e.target.value))}
              />
            </div>
          ))}
        </div>
  
        <button
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          Submit Portfolio
        </button>
      </div>
    )
  }
  