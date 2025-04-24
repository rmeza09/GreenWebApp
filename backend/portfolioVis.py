import pandas as pd
from datetime import datetime, timedelta
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame

import os
from dotenv import load_dotenv

# You can also load these from a .env or config
load_dotenv(dotenv_path="keys.env") 
API_KEY = os.getenv("ALPACA_API_KEY")
API_SECRET = os.getenv("ALPACA_SECRET_KEY")
client = StockHistoricalDataClient(API_KEY, API_SECRET)

def get_stock_data(symbol="AAPL", days=30):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    request_params = StockBarsRequest(
        symbol_or_symbols=[symbol],
        timeframe=TimeFrame.Day,
        start=start_date,
        end=end_date
    )

    bars = client.get_stock_bars(request_params)
    df = bars.df.xs(symbol, level=1)
    df.reset_index(inplace=True)
    df = df[["timestamp", "close"]].rename(columns={"timestamp": "Date", "close": "Close"})
    return df

def run_model(data):
    symbol = data.get("symbol", "AAPL")
    df = get_stock_data(symbol)

    # Dummy model — return close prices for now
    result = {
        "dates": df["Date"].astype(str).tolist(),
        "predictions": df["Close"].round(2).tolist()
    }
    return result
