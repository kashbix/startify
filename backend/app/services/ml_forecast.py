import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
from typing import List, Dict

class RevenueForecaster:
    def __init__(self):
        self.model = LinearRegression()

    def predict_next_months(self, history: List[Dict], months_ahead: int = 6) -> List[Dict]:
        """
        Takes historical data [{'month': '2024-01', 'revenue': 5000}, ...]
        Returns predicted data [{'month': '2024-06', 'revenue': 5200}, ...]
        """
        if len(history) < 3:
            return [] # Not enough data to forecast

        # 1. Prepare Data
        df = pd.DataFrame(history)
        df['date'] = pd.to_datetime(df['month'])

        # Convert dates to ordinal (numbers) for regression
        df['date_ordinal'] = df['date'].map(datetime.toordinal)

        X = df[['date_ordinal']]
        y = df['revenue']

        # 2. Train Model (Simple Linear Trend)
        self.model.fit(X, y)

        # 3. Predict Future
        last_date = df['date'].max()
        predictions = []

        for i in range(1, months_ahead + 1):
            next_date = last_date + pd.DateOffset(months=i)
            next_ordinal = np.array([[next_date.toordinal()]])

            pred_revenue = self.model.predict(next_ordinal)[0]

            # Don't predict negative revenue
            pred_revenue = max(0, round(pred_revenue, 2))

            predictions.append({
                "month": next_date.strftime("%Y-%m"),
                "revenue": pred_revenue,
                "is_projected": True
            })

        return predictions

forecaster = RevenueForecaster()
