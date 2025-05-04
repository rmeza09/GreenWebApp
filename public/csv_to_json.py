import csv
import json

input_csv = "symbols.csv"
output_json = "public/stock_symbols.json"  # place this in your React public folder

symbols = []

with open(input_csv, mode='r', encoding='utf-8-sig') as file:
    reader = csv.DictReader(file)
    for row in reader:
        symbol = row.get("Symbol", "").strip()
        name = row.get("Name", "").strip()
        if symbol and name and "Note" not in name:
            symbols.append({"symbol": symbol, "name": name})

with open(output_json, mode='w', encoding='utf-8') as file:
    json.dump(symbols, file, indent=2)

print(f"✅ Exported {len(symbols)} symbols to {output_json}")
