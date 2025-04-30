import pandas as pd
import numpy as np
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

# Define assets list once at the top level
myAssets = ["SPY", "AMZN", "META", "GOOGL", "AMD", "NKE", "UBER", "COST", "JPM", "CRM", "TXRH"]
shareCount = [10, 15, 4.73, 14.43, 25.21, 30.16, 20, 1.25, 4.84, 4.36, 5.68]  # Added SPY shares

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
    # Use global myAssets and shareCount
    global myAssets, shareCount

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


def get_portfolio_timeseries(days=365):
    # Use global myAssets
    global myAssets
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    request = StockBarsRequest(
        symbol_or_symbols=myAssets,
        timeframe=TimeFrame.Day,
        start=start_date,
        end=end_date
    )

    bars = client.get_stock_bars(request).df

    if bars.empty:
        raise ValueError("No stock data returned")

    timeseries = {}
    dates = sorted(list(set(bars.index.get_level_values(1).date)))

    for symbol in myAssets:
        symbol_data = bars.xs(symbol, level=0)
        symbol_data = symbol_data.reset_index()
        closes = symbol_data["close"].tolist()

        # Normalize to 1.0
        normalized = [price / closes[0] for price in closes]

        timeseries[symbol] = normalized

    return {
        "dates": [str(date) for date in dates],
        "series": timeseries
    }

def get_performance_timeseries(days=365):
    global myAssets, shareCount

    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    request = StockBarsRequest(
        symbol_or_symbols=["SPY"] + myAssets[1:],  # Include SPY and all other assets
        timeframe=TimeFrame.Day,
        start=start_date,
        end=end_date
    )

    try:
        bars = client.get_stock_bars(request).df
        
        if bars.empty:
            raise ValueError("No stock data returned")

        dates = sorted(list(set(bars.index.get_level_values(1).date)))
        
        # Get SPY data first
        spy_data = bars.xs("SPY", level=0).reset_index()
        spy_closes = spy_data["close"].tolist()
        spy_normalized = [price / spy_closes[0] for price in spy_closes]
        
        # Calculate portfolio performance
        portfolio_symbols = myAssets[1:]  # Exclude SPY
        portfolio_shares = shareCount[1:]  # Exclude SPY shares
        
        # Get initial portfolio value
        initial_values = []
        for symbol, shares in zip(portfolio_symbols, portfolio_shares):
            try:
                symbol_data = bars.xs(symbol, level=0).reset_index()
                initial_price = symbol_data["close"].iloc[0]
                initial_values.append(initial_price * shares)
            except KeyError:
                print(f"Warning: No data found for {symbol}")
                continue
        
        initial_portfolio_value = sum(initial_values)
        
        # Calculate portfolio value over time
        portfolio_values = []
        for date_idx in range(len(dates)):
            daily_value = 0
            for symbol, shares in zip(portfolio_symbols, portfolio_shares):
                try:
                    symbol_data = bars.xs(symbol, level=0).reset_index()
                    price = symbol_data["close"].iloc[date_idx]
                    daily_value += price * shares
                except (KeyError, IndexError):
                    continue
            portfolio_values.append(daily_value)
        
        # Normalize portfolio values
        portfolio_normalized = [value / portfolio_values[0] for value in portfolio_values]
        
        print("Debug - Data structure:")
        print(f"Number of dates: {len(dates)}")
        print(f"SPY data points: {len(spy_normalized)}")
        print(f"Portfolio data points: {len(portfolio_normalized)}")
        
        return {
            "dates": [str(date) for date in dates],
            "series": {
                "SPY": spy_normalized,
                "Portfolio": portfolio_normalized
            }
        }
    except Exception as e:
        print(f"Error in get_performance_timeseries: {str(e)}")
        raise

