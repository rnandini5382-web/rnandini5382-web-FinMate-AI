from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from collections import defaultdict
from sklearn.ensemble import IsolationForest

app = FastAPI(
    title="FinMate AI API",
    description="AI-powered personal finance assistant",
    version="1.0.0"
)

# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
        allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "FinMate AI API is running!",
        "status": "success"
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# --------------------------------------------------
# ANALYZE TRANSACTIONS
# --------------------------------------------------

@app.post("/analyze")
async def analyze_transactions(file: UploadFile = File(...)):

    try:
        # Read uploaded CSV
        contents = await file.read()

        df = pd.read_csv(io.BytesIO(contents))

        # Remove completely empty rows
        df = df.dropna(how="all")

        # ------------------------------------------
        # Find amount column
        # ------------------------------------------

        amount_column = None

        possible_amount_columns = [
            "amount",
            "Amount",
            "transaction_amount",
            "Transaction Amount",
            "debit",
            "Debit",
            "spent",
            "Spent",
            "price",
            "Price"
        ]

        for column in possible_amount_columns:
            if column in df.columns:
                amount_column = column
                break

        if amount_column is None:
            return {
                "status": "error",
                "message": "No amount column found in CSV."
            }

        # Convert amount to numbers
        df[amount_column] = (
            df[amount_column]
            .astype(str)
            .str.replace("₹", "", regex=False)
            .str.replace(",", "", regex=False)
            .str.replace("$", "", regex=False)
            .str.strip()
        )

        df[amount_column] = pd.to_numeric(
            df[amount_column],
            errors="coerce"
        )

        df = df.dropna(subset=[amount_column])

        # ------------------------------------------
        # Find category column
        # ------------------------------------------

        category_column = None

        possible_category_columns = [
            "category",
            "Category",
            "type",
            "Type",
            "expense_category",
            "Expense Category"
        ]

        for column in possible_category_columns:
            if column in df.columns:
                category_column = column
                break

        if category_column is None:
            df["category"] = "Other"
            category_column = "category"

        df[category_column] = (
            df[category_column]
            .fillna("Other")
            .astype(str)
        )

        # ------------------------------------------
        # Total spending
        # ------------------------------------------

        total_spending = float(df[amount_column].sum())

        # ------------------------------------------
        # Category analysis
        # ------------------------------------------

        category_totals = (
            df.groupby(category_column)[amount_column]
            .sum()
            .sort_values(ascending=False)
        )

        categories = []

        for category, amount in category_totals.items():

            percentage = (
                (float(amount) / total_spending * 100)
                if total_spending > 0
                else 0
            )

            categories.append({
                "category": str(category),
                "amount": round(float(amount), 2),
                "percentage": round(percentage, 1)
            })

        # ------------------------------------------
        # Top category
        # ------------------------------------------

        if len(category_totals) > 0:

            top_category = str(category_totals.index[0])
            top_category_amount = float(category_totals.iloc[0])

        else:

            top_category = "No data"
            top_category_amount = 0

        # ------------------------------------------
        # Date / monthly spending
        # ------------------------------------------

        date_column = None

        possible_date_columns = [
            "date",
            "Date",
            "transaction_date",
            "Transaction Date",
            "timestamp",
            "Timestamp"
        ]

        for column in possible_date_columns:
            if column in df.columns:
                date_column = column
                break

        monthly_spending = []

        if date_column is not None:

            df[date_column] = pd.to_datetime(
                df[date_column],
                errors="coerce"
            )

            dated_df = df.dropna(subset=[date_column]).copy()

            if not dated_df.empty:

                monthly = (
                    dated_df
                    .groupby(
                        dated_df[date_column].dt.to_period("M")
                    )[amount_column]
                    .sum()
                )

                for month, amount in monthly.items():

                    monthly_spending.append({
                        "month": str(month),
                        "amount": round(float(amount), 2)
                    })

        # ------------------------------------------
        # Subscription detection
        # ------------------------------------------

        subscription_keywords = [
            "netflix",
            "spotify",
            "prime",
            "amazon prime",
            "youtube premium",
            "hotstar",
            "disney",
            "subscription",
            "membership",
            "monthly"
        ]

        subscriptions = []

        # Find description/merchant column
        description_column = None

        possible_description_columns = [
            "description",
            "Description",
            "merchant",
            "Merchant",
            "name",
            "Name",
            "transaction",
            "Transaction"
        ]

        for column in possible_description_columns:
            if column in df.columns:
                description_column = column
                break

        if description_column is not None:

            for _, row in df.iterrows():

                description = str(
                    row[description_column]
                ).lower()

                for keyword in subscription_keywords:

                    if keyword in description:

                        subscriptions.append({
                            "name": str(row[description_column]),
                            "amount": round(
                                float(row[amount_column]), 2
                            )
                        })

                        break

        # ------------------------------------------
        # Unusual spending
        # ------------------------------------------

        unusual_transactions = []
            # ML-based unusual spending detection
        if len(df) >= 5 and amount_column:
            try:
                model = IsolationForest(
                    contamination=0.1,
                    random_state=42
                )

                df["ml_anomaly"] = model.fit_predict(
                    df[[amount_col]]
                )

                unusual_transactions = df[
                    df["ml_anomaly"] == -1
                ].drop(columns=["ml_anomaly"]).to_dict(
                    orient="records"
                )

            except Exception:
                unusual_transactions = []

        if len(df) > 0:

            average_amount = float(
                df[amount_column].mean()
            )

            # Transactions greater than 2x average
            threshold = average_amount * 2

            unusual_df = df[
                df[amount_column] > threshold
            ]

            for _, row in unusual_df.iterrows():

                transaction = {
                    "amount": round(
                        float(row[amount_column]), 2
                    ),
                    "category": str(
                        row[category_column]
                    )
                }

                if description_column is not None:
                    transaction["description"] = str(
                        row[description_column]
                    )

                unusual_transactions.append(transaction)

        # ------------------------------------------
        # Summary
        # ------------------------------------------

        summary = {
            "total_spending": round(total_spending, 2),
            "top_category": top_category,
            "top_category_amount": round(
                top_category_amount,
                2
            )
        }

        # ------------------------------------------
        # Final response
        # ------------------------------------------

        return {
    "status": "success",
    "summary": summary,
    "categories": categories,
    "monthly_spending": monthly_spending,
    "subscriptions": subscriptions,
    "unusual_transactions": unusual_transactions,
    "transactions": df.to_dict(orient="records")
}
    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }