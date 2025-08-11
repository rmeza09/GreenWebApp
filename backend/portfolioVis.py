import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame

# add this import near the top
from alpaca.data.enums import DataFeed

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
        end=end_date,
        feed=DataFeed.IEX 
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

def get_portfolio_data(symbols, shares, days=30):
    # Use the passed symbols and shares
    #global myAssets, shareCount # Removed

    end_date = datetime.today()
    start_date = end_date - timedelta(days=days)  # 1 year of daily prices

    request = StockBarsRequest(
        symbol_or_symbols=symbols, # Use passed symbols
        timeframe=TimeFrame.Day,
        start=start_date,
        end=end_date,
        feed=DataFeed.IEX
    )

    bars = client.get_stock_bars(request).df

    # Get the last row (most recent date) per asset
    latest_closes = bars['close'].groupby(level=0).last()
    prices = latest_closes.to_dict()

    # Calculate the value of each position using passed shares
    position_values = []
    for i, symbol in enumerate(symbols):
        # Ensure symbol exists in prices dictionary before accessing
        if symbol in prices:
            position_values.append(shares[i] * prices[symbol])
        else:
            # Handle case where data for a symbol was not retrieved
            print(f"Warning: Data for {symbol} not found when calculating portfolio data.")
            position_values.append(0) # Or some other appropriate default

    # Create a DataFrame for visualization
    Assetsdf = pd.DataFrame({
        "Symbol": symbols, # Use passed symbols
        "Shares": shares,  # Use passed shares
        "Price": [prices.get(symbol, 0) for symbol in symbols], # Use .get for safety
        "Value": position_values
    })
    
    return Assetsdf


def get_portfolio_timeseries(myAssets, days=365):
    # Use global myAssets
    #global myAssets
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    request = StockBarsRequest(
        symbol_or_symbols=myAssets,
        timeframe=TimeFrame.Day,
        start=start_date,
        end=end_date,
        feed=DataFeed.IEX
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

def get_performance_timeseries(symbols, shares, days=365):
    # Use the passed symbols and shares
    #global myAssets, shareCount # Removed

    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    # Ensure SPY is included if not already in symbols
    all_symbols = list(symbols)
    if "SPY" not in all_symbols:
        all_symbols.insert(0, "SPY")
        # We need a corresponding share count for SPY for consistency, even if it's 0 for portfolio value calculation.
        # The performance calculation normalizes, so the exact share count for SPY doesn't matter for the SPY line itself.
        # However, to align symbol and share lists, we should add a placeholder share count for SPY.
        # Assuming shares list corresponds to the *original* symbols list, we'll add a placeholder at the beginning.
        # A more robust approach might pass shares as a dictionary or have a clear mapping.
        # For now, let's add 0 as a placeholder share for SPY if it wasn't in the original selection.
        if len(all_symbols) > len(shares): # Check if SPY was added
             shares = [0] + shares


    request = StockBarsRequest(
        symbol_or_symbols=all_symbols, # Use all_symbols including SPY
        timeframe=TimeFrame.Day,
        start=start_date,
        end=end_date,
        feed=DataFeed.IEX
    )

    try:
        bars = client.get_stock_bars(request).df
        
        if bars.empty:
            raise ValueError("No stock data returned")

        dates = sorted(list(set(bars.index.get_level_values(1).date)))
        
        # Get SPY data first
        spy_normalized = []
        if "SPY" in all_symbols:
            try:
                spy_data = bars.xs("SPY", level=0).reset_index()
                spy_closes = spy_data["close"].tolist()
                if spy_closes:
                    spy_normalized = [price / spy_closes[0] for price in spy_closes]
                else:
                    print("Warning: SPY data is empty.")
            except KeyError:
                 print("Warning: SPY data not found in bars.")

        # Calculate portfolio performance using passed symbols and shares
        portfolio_symbols = symbols  # Use the original passed symbols for portfolio value calculation
        portfolio_shares = shares # Use the original passed shares
        
        # Get initial portfolio value
        initial_values = []
        for symbol, share_count in zip(portfolio_symbols, portfolio_shares):
            try:
                symbol_data = bars.xs(symbol, level=0).reset_index()
                if not symbol_data.empty:
                    initial_price = symbol_data["close"].iloc[0]
                    initial_values.append(initial_price * share_count)
                else:
                     print(f"Warning: Empty data for {symbol} when calculating initial value.")
                     initial_values.append(0)
            except KeyError:
                print(f"Warning: Data for {symbol} not found in bars when calculating initial value.")
                initial_values.append(0)
        
        initial_portfolio_value = sum(initial_values)
        
        # Calculate portfolio value over time
        portfolio_values = []
        for date_idx in range(len(dates)):
            daily_value = 0
            for symbol, share_count in zip(portfolio_symbols, portfolio_shares):
                try:
                    symbol_data = bars.xs(symbol, level=0).reset_index()
                    if not symbol_data.empty:
                         # Ensure date_idx is within bounds of symbol_data
                        if date_idx < len(symbol_data):
                            price = symbol_data["close"].iloc[date_idx]
                            daily_value += price * share_count
                        else:
                             print(f"Warning: date_idx {date_idx} out of bounds for {symbol} data (length {len(symbol_data)}). Skipping.")
                    else:
                        print(f"Warning: Empty data for {symbol} at date_idx {date_idx}. Skipping.")
                except (KeyError, IndexError) as e:
                    print(f"Error accessing data for {symbol} at date_idx {date_idx}: {e}. Skipping.")
                    continue # Continue to next symbol if data is missing
            portfolio_values.append(daily_value)
        
        print("Debug - Portfolio values before normalization:", portfolio_values)

        # Normalize portfolio values
        portfolio_normalized = []
        first_non_zero_index = next((i for i, value in enumerate(portfolio_values) if value != 0), None)

        if first_non_zero_index is not None:
            initial_val = portfolio_values[first_non_zero_index]
            print(f"Debug - Normalizing from index {first_non_zero_index} with initial value {initial_val}")
            portfolio_normalized = [value / initial_val for value in portfolio_values[first_non_zero_index:]]
            # Pad with initial value for dates before the first non-zero value
            portfolio_normalized = [1.0] * first_non_zero_index + portfolio_normalized
        elif portfolio_values:
             print("Warning: All portfolio values are zero.")
             portfolio_normalized = [0] * len(portfolio_values)

        print("Debug - Portfolio values after normalization:", portfolio_normalized)
        
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

