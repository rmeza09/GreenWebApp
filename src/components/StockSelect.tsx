"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const COLORS = [
  "#000000",  // SPY will be black
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1",
  "#a4de6c", "#d0ed57", "#fa8072", "#b0e0e6", "#ffbb28"
];

export type Stock = {
  symbol: string
  close: number
  percentGain: number
  color: string
}

export const columns: ColumnDef<Stock>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center w-full h-full">
        <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            aria-label="Select all"
            className="w-8 h-8 cursor-pointer accent-primary scale-150"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center w-full h-full">
          <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={(e) => row.toggleSelected(!!e.target.checked)}
              aria-label={`Select row ${row.index}`}
              className="w-8 h-8 cursor-pointer accent-primary scale-150"
          />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "symbol",
    header: "Symbol",
    cell: ({ row }) => <div className="uppercase">{row.getValue("symbol")}</div>,
  },
  {
    accessorKey: "close",
    header: "Close Price",
    cell: ({ row }) => {
      const close = parseFloat(row.getValue("close"))
      return `$${close.toFixed(2)}`
    },
  },
  {
    accessorKey: "percentGain",
    header: "Gain (%)",
    cell: ({ row }) => {
      const gain = parseFloat(row.getValue("percentGain"))
      return `${gain.toFixed(2)}%`
    },
  },
  {
    accessorKey: "color",
    header: "",
    cell: ({ row }) => {
      const color = row.original.color
      return (
        <div
          className="h-4 w-4 rounded-full mx-auto"
          style={{ backgroundColor: color }}
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]

interface StockSelectProps {
  onStockSelection: (selectedSymbols: string[]) => void;
  selectedStocks: string[];
}

export function StockSelect({ onStockSelection, selectedStocks }: StockSelectProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [stocks, setStocks] = React.useState<Stock[]>([])
  const [tempSelectedStocks, setTempSelectedStocks] = React.useState<string[]>([])

  // Convert selectedStocks to row selection state
  const rowSelection = React.useMemo(() => {
    return stocks.reduce((acc, stock, index) => {
      acc[index] = tempSelectedStocks.includes(stock.symbol)
      return acc
    }, {} as Record<string, boolean>)
  }, [stocks, tempSelectedStocks])

  React.useEffect(() => {
    fetch("http://localhost:5000/api/portfolio_timeseries")
      .then((res) => res.json())
      .then((data) => {
        const lastDateIndex = data.dates.length - 1;
        const stocksData: Stock[] = Object.keys(data.series).map((symbol) => {
          const series = data.series[symbol];
          const start = series[0];
          const end = series[lastDateIndex];
          const percentGain = ((end - start) / start) * 100;
          const close = end * 100;

          // SPY gets black (first color), other symbols get subsequent colors
          const colorIndex = symbol === "SPY" ? 0 : 
            (Object.keys(data.series).indexOf(symbol) % (COLORS.length - 1)) + 1;

          return {
            symbol,
            close: parseFloat(close.toFixed(2)),
            percentGain: parseFloat(percentGain.toFixed(2)),
            color: COLORS[colorIndex]
          }
        });

        setStocks(stocksData);
      })
      .catch((err) => console.error("Error fetching stock data:", err))
  }, [])

  const handleUpdate = () => {
    console.log("Update clicked with stocks:", tempSelectedStocks);
    onStockSelection(tempSelectedStocks);
  };

  const table = useReactTable({
    data: stocks,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
      const selectedSymbols = Object.entries(newSelection)
        .filter(([_, selected]) => selected)
        .map(([index]) => stocks[parseInt(index)].symbol)
      setTempSelectedStocks(selectedSymbols)
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility: {
        color: true,
        ...columnVisibility,
      },
      rowSelection,
      pagination: {
        pageSize: 20,
        pageIndex: 0,
      },
    },
  })
  

  return (
    <div className="w-full font-['Roboto']">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-30">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-30">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-[35px] border-b transition-colors hover:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      className={`h-30 ${
                        cell.column.id === 'select' ? 'w-24' :
                        cell.column.id === 'color' ? 'w-10' : ''
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
