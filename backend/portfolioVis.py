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

def get_stock_data(symbol="AAPL", days=365):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    request_params = StockBarsRequest(
        symbol_or_symbols=[symbol],
        timeframe=TimeFrame.Day,
        start=start_date,
        end=end_date
    )

    bars = client.get_stock_bars(request_params)
    df = bars.df

    print("DEBUG: DataFrame index type:", type(df.index))
    print("DEBUG: DataFrame head:\n", df.head())

    if df.empty:
        raise ValueError(f"No data returned for symbol: {symbol}")

    # Use level=0 to slice by symbol
    if isinstance(df.index, pd.MultiIndex):
        try:
            df = df.xs(symbol, level=0)
        except KeyError:
            raise ValueError(f"Symbol '{symbol}' not found in MultiIndex.")

    df = df.reset_index()
    df = df[["timestamp", "close"]].rename(columns={"timestamp": "Date", "close": "Close"})
    return df



def run_model(data):
    symbol = data.get("symbol", "AAPL")
    df = get_stock_data(symbol)

    # Dummy model — return close prices for now
    result = {
        "dates": df["Date"].astype(str).tolist(),
        "close": df["Close"].round(2).tolist()
    }
    return result

def get_portfolio_data(days=30):
    myAssets = ["AMZN", "META", "GOOGL", "AMD", "NKE", "UBER", "COST", "JPM", "CRM", "TXRH"]
    shareCount = [15, 4.73, 14.43, 25.21, 30.16, 20, 1.25, 4.84, 4.36, 5.68]

    end_date = datetime.today()
    start_date = end_date - timedelta(days=days)  # 1 year of daily prices

    request = StockBarsRequest(
        symbol_or_symbols=myAssets,
        timeframe=TimeFrame.Day,
        start=start_date,
        end=end_date
    )

    bars = client.get_stock_bars(request).df

    # Get the last row (most recent date) per asset
    latest_closes = bars['close'].groupby(level=0).last()
    prices = latest_closes.to_dict()

    # Calculate the value of each position
    position_values = [shareCount[i] * prices[symbol] for i, symbol in enumerate(myAssets)]

    # Create a DataFrame for visualization
    Assetsdf = pd.DataFrame({
        "Symbol": myAssets,
        "Shares": shareCount,
        "Price": [prices[symbol] for symbol in myAssets],
        "Value": position_values
    })
    
    return Assetsdf
