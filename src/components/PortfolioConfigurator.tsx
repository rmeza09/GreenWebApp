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
  
  import React, { useEffect, useState, useMemo } from "react"
  import stockSymbols from "../assets/stock_symbols.json"
  import { Button } from "@/components/ui/button"


  type Stock = {
    symbol: string
    name: string
  }
  

  export function PortfolioConfigurator({ onUpdate }: { onUpdate: (symbols: string[], weights: number[]) => void }) {
    const [portfolio, setPortfolio] = useState<{ symbol: string; weight: string | number }[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [allSymbols, setAllSymbols] = useState<Stock[]>([])
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
    useEffect(() => {
        setAllSymbols(stockSymbols);
      }, []);    
    
    // Debounce the search term
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
      }, 200); // 200ms debounce
      return () => {
        clearTimeout(handler);
      };
    }, [searchTerm]);
  
    // Memoize filtered results for performance
    const filteredSymbols = useMemo(() => {
      if (debouncedSearchTerm.length < 1) return [];
      const term = debouncedSearchTerm.toLowerCase().trim();
      let matches = allSymbols.filter(s =>
        s.symbol.toLowerCase().includes(term) ||
        s.name.toLowerCase().includes(term)
      );
      // Always include exact symbol match if present and not in the first 5
      const exactMatch = allSymbols.find(s => s.symbol.toLowerCase() === term);
      if (exactMatch && !matches.slice(0, 5).some(s => s.symbol === exactMatch.symbol)) {
        return [exactMatch, ...matches.slice(0, 4)];
      }
      return matches.slice(0, 5);
    }, [debouncedSearchTerm, allSymbols]);
    
    const handleAdd = (symbol: string) => {
      if (portfolio.length < 10 && !portfolio.find(item => item.symbol === symbol)) {
        setPortfolio([...portfolio, { symbol, weight: 1 }])
      }
    }
  
    const handleWeightChange = (index: number, newWeight: string | number) => {
      const updated = [...portfolio]
      updated[index].weight = newWeight
      setPortfolio(updated)
    }
  
    const handleSubmit = () => {
      console.log("PortfolioConfigurator handleSubmit called");
      console.log("Current portfolio state:", portfolio);
      
      let symbols = portfolio.map(p => p.symbol);
      let weights = portfolio.map(p => Number(p.weight) || 0);
      
      // Append SPY with a weight of 1 if not already present
      const spySymbol = "SPY";
      const spyWeight = 1;

      if (!symbols.includes(spySymbol)) {
          symbols = [...symbols, spySymbol];
          weights = [...weights, spyWeight];
      } else {
          // If SPY is already in the list, ensure its weight is handled (optional, based on desired behavior if user explicitly adds SPY)
          // For now, we'll just ensure it's there. If the user set a different weight, it will be used.
          console.log("SPY already in portfolio. Using user-defined weight if any.");
      }

      console.log("Sending update with:", { symbols, weights });
      
      fetch("https://greenwebapp-api-backend.onrender.com/api/custom_portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbols,
          shares: weights
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log("Backend response:", data);
        if (onUpdate) {
          console.log("PortfolioConfigurator: Calling onUpdate with symbols:", symbols, "and weights:", weights);
          onUpdate(symbols, weights);
        }
      })
      .catch(error => {
        console.error("Error updating portfolio:", error);
      });
    }
  
    const handleClear = () => {
      console.log("PortfolioConfigurator: Clear button clicked");
      setPortfolio([]);
      // Immediately call onUpdate with empty symbols and weights to clear the chart
      if (onUpdate) {
        console.log("PortfolioConfigurator: Calling onUpdate with empty symbols and weights on clear.");
        onUpdate([], []);
      }
    };
  
    console.log("searchTerm", searchTerm);
    console.log("debouncedSearchTerm", debouncedSearchTerm);
    console.log("filteredSymbols", filteredSymbols);
  
    return (
      <div
        className="p-4 border rounded-md shadow-md"
        style={{
          overflow: 'visible',
          paddingBottom: searchTerm ? 220 : 20,
          fontFamily: "'Roboto', sans-serif"
        }}
      >
        <div style={{ position: 'relative', paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search for a stock..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: 4,
              marginBottom: 4,
              fontSize: 18
            }}
          />
          {searchTerm && (
            <div style={{
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: 4,
              marginTop: 4,
              maxHeight: 200,
              overflowY: 'auto',
              position: 'absolute',
              zIndex: 1000,
              left: 0,
              right: 0,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {filteredSymbols.length === 0 ? (
                <div style={{ padding: 8, color: '#888' }}>No results found.</div>
              ) : (
                filteredSymbols.map(s => (
                  <div
                    key={s.symbol}
                    style={{ padding: 8, cursor: 'pointer' }}
                    onClick={() => {
                      handleAdd(s.symbol);
                      setSearchTerm(""); // Hide dropdown after selection
                    }}
                  >
                    {s.symbol} - {s.name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
  
        <div className="mt-4 space-y-2">
          {portfolio.map((item, idx) => (
            <div
              key={item.symbol}
              className="flex justify-center items-center"
              style={{ maxWidth: 350, margin: "0 auto", gap: 16, padding: "8px 0" }}
            >
              <span style={{ minWidth: 60, textAlign: "center", fontSize: 18 }}>{item.symbol}</span>
              <input
                type="number"
                className="border p-1 w-24 ml-2"
                style={{ height: 40, fontSize: 18 }}
                value={item.weight}
                onChange={e => {
                  const value = e.target.value;
                  handleWeightChange(idx, value === "" ? "" : parseFloat(value));
                }}
              />
            </div>
          ))}
        </div>
  
        <div className="flex justify-center mt-6 gap-8">
          <Button
            size="lg"
            style={{
              paddingLeft: 30,
              paddingRight: 30,
              paddingTop: 12,
              paddingBottom: 12,
              fontSize: 18,
              minWidth: 180
            }}
            onClick={handleSubmit}
          >
            Update
          </Button>
          <Button
            size="lg"
            variant="outline"
            style={{
              paddingLeft: 30,
              paddingRight: 30,
              paddingTop: 12,
              paddingBottom: 12,
              fontSize: 18,
              minWidth: 180
            }}
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
      </div>
    )
  }
  