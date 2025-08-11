from flask import Flask, request, jsonify
from portfolioVis import run_model, get_portfolio_data, get_portfolio_timeseries, get_performance_timeseries  # Make sure this exists

from flask_cors import CORS, cross_origin

app = Flask(__name__)

# Temporary: allow all on /api/* while we test
CORS(app,
     resources={r"/api/*": {"origins": "*"}},
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "OPTIONS"])


@app.route('/api/predict', methods=['POST'])  
def predict():
    input_data = request.get_json()
    result = run_model(input_data)
    return jsonify(result)

@app.route("/api/portfolio", methods=["POST"])
def portfolio():
    data = request.get_json()
    symbols = data.get("symbols")
    shares = data.get("shares")
    df = get_portfolio_data(symbols, shares)
    data = df.to_dict(orient="records")
    return jsonify(data)

@app.route("/api/portfolio_timeseries", methods=["GET", "POST"])
def portfolio_timeseries():
    data = request.get_json()
    symbols = data.get("symbols")
    shares = data.get("shares")
    result = get_portfolio_timeseries(symbols)
    return jsonify(result)

@app.route("/api/performance_timeseries", methods=["POST"])
def perfomance_timeseries():
    data = request.get_json()
    symbols = data.get("symbols")
    shares = data.get("shares")
    result = get_performance_timeseries(symbols, shares)
    return jsonify(result)

@app.route('/')  # Optional: just for sanity check
def home():
    return "Flask server running!"

@app.route('/api/custom_portfolio', methods=['POST', 'OPTIONS'])
def custom_portfolio():
    if request.method == 'OPTIONS':
        return ("", 204)  # preflight OK
    data = request.get_json()
    symbols = data.get("symbols")
    shares = data.get("shares")

    print(f"Backend received symbols: {symbols}")
    print(f"Backend received shares: {shares}")
    print(f"Lengths - symbols: {len(symbols) if symbols else 0}, shares: {len(shares) if shares else 0}")

    port_df = get_portfolio_data(symbols, shares)
    ts_data = get_portfolio_timeseries(symbols)
    perf_data = get_performance_timeseries(symbols, shares)
    
    return jsonify({
        "distribution": port_df.to_dict(orient="records"),
        "timeseries": ts_data,
        "performance": perf_data
    })


if __name__ == '__main__':
    app.run(debug=True)
