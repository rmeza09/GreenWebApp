from flask import Flask, request, jsonify
from portfolioVis import run_model

app = Flask(__name__)

@app.route('/api/predict', methods=['POST'])
def predict():
    input_data = request.get_json()
    print("Received input:", input_data)

    # Pass data to your model
    result = run_model(input_data)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
