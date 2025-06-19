# Green Machine Web Application
Through this project my objective was to learn how to build out a backend database for communicating with the Alpaca API. Alpaca is a service which serves finnancial data including asset prices for equities and crypto on a variety of timescales. In this project I learned to use Flask as the backend framework and React with Typescript and Tailwind CSS for the frontend tech stack.

###🔗 Live Site: [https://green-web-app.vercel.app/](https://green-web-app.vercel.app/)

### Current Updates
- The Render backend is up and running.
- Locally the front end is up and running.
- Working on changing the fetch calls from the local server to the Render server.
- Frontend is not currently displaying from the production, main branch.
- Full project can be run from the testing branch locally.

## 🌱 Features
- Stock selector tool, the user can pick any stock listed on the NYSE, using the search bar and adding up to 10 individual stocks.
- Asset Visualizer, after confirming selections the normalized performance of each individual asset is plotted against the S&P 500 (SPY) baseline, 365 day view.
- Pi Chart, the percentage of the whole portfolio is visualized and the weight (shares) can be changed in the selector tool for each stock.
- Performance analysis, assuming a group of 2 - 10 stocks the weighted average performance of the holdings is plotted against the S&P 500 (SPY) reference. This is how well you would have done in the last 365 days if you had purchased the selected holdings a year prior, the percentage gain or loss is shown here.

## 🧰 Tech Stack

### Frontend
- [React](https://reactjs.org/) -Typescript, JavaScript
- [Tailwind](https://tailwindcss.com/) CSS & [ShadCN](https://ui.shadcn.com/) UI Components
- Recharts (for dynamic charting)
- Fetch API for backend communication
- Hosted on Vercel

### Backend
- Flask (Python)
- RESTful API with JSON response handling
- Hosted on [Render](https://render.com/)
- `.env` config for environment variables

### Detailed Dependencies
See `requirements.txt`

### Notes
- Update `.env` files for local testing with your own Alpaca API keys.
- CORS is enabled on the backend to allow Vercel requests.

## 📦 Installation & Setup

### Clone the Repository

```bash
cd your-directory
git clone https://github.com/rmeza09/GreenWebApp.git
```

### Frontend Setup
npm start will run your local webpack app at http://localhost:3000
```bash
npm install
npm start
```

### Backend Setup
Run this command once to create your virtual environment within your directory.
```bash
python -m venv .venv
```
To run the Flask backend start the venv and run the app.py, requirements only need to be installed once.
```bash
.venv\Scripts\activate.bat 
pip install -r requirements.txt
python app.py
```
Flask should run at http://localhost:5000
