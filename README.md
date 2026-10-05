# 💰 FinMate AI

## AI-Powered Personal Finance Assistant

FinMate AI is a personal finance analysis platform that helps users understand their spending habits through transaction data.

Users can upload a CSV file and instantly view spending summaries, categories, recurring subscriptions, unusual transactions, financial insights, and an interactive dashboard.

---

## 🎯 Problem Statement

Managing personal expenses can become difficult when transactions are spread across different apps, bank accounts, and payment platforms.

Most users can see their transaction history, but they don't always get a clear answer to questions such as:

- Where am I spending the most?
- Which category consumes most of my money?
- How much am I spending on subscriptions?
- Are there any unusual transactions?
- What areas of my spending can I reduce?
- How does my spending change over time?

FinMate AI converts raw transaction data into simple, understandable financial insights.

---

## ✨ Key Features

### 📊 Interactive Financial Dashboard

Get a quick overview of your financial activity through:

- Total spending
- Highest spending category
- Category-wise spending
- Subscription expenses
- Unusual transactions
- Monthly spending trends

### 📁 CSV Transaction Upload

Upload your transaction history as a CSV file.

FinMate AI processes the uploaded data and dynamically updates the dashboard.

### 🧾 Transaction History

View uploaded transactions in a clean table containing:

- Date
- Merchant
- Category
- Amount

### 🔍 Spending Analysis

The application automatically analyzes transaction data to identify:

- Major spending categories
- Spending distribution
- Monthly trends
- Recurring payments
- Unusual spending patterns

### 💡 Financial Insights

FinMate AI converts transaction analysis into easy-to-understand financial observations and recommendations.

For example:

> Your highest spending category is Shopping.

Instead of manually calculating expenses, users can directly view important information from their transaction data.

### 🤖 Ask FinMate

Users can ask questions about their uploaded transaction data, such as:

- Where did I spend the most?
- How much did I spend overall?
- Find my subscriptions.
- How much did I spend on Shopping?
- What is my highest spending category?

FinMate responds using the analyzed transaction data.

---

## 🧠 How FinMate AI Works

FinMate AI follows a simple transaction-analysis workflow:

### 1. Upload Transaction Data

The user uploads a CSV file containing transaction information.

### 2. Process the Data

The FastAPI backend receives the uploaded file and processes it using Pandas.

### 3. Analyze Spending

The system analyzes important transaction fields such as:

- Date
- Merchant
- Category
- Amount

It calculates spending totals, category distributions, monthly spending, recurring subscriptions, and unusual transactions.

### 4. Generate Insights

The analyzed information is converted into useful financial observations.

### 5. Display Results

The React frontend displays the results through:

- Dashboard cards
- Spending charts
- Transaction tables
- Financial insights
- Subscription information

### 6. Ask FinMate

Users can interact with Ask FinMate to ask questions about their uploaded financial data.

---

## 🏗️ System Architecture

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React + Vite | User interface and dashboard |
| Backend | FastAPI | API and transaction processing |
| Data Processing | Pandas | CSV processing and financial analysis |
| Styling | CSS | User interface design |
| Input | CSV | Transaction data |
| Version Control | Git + GitHub | Source code management |

### Application Flow

```text
User
  ↓
Upload CSV
  ↓
React Frontend
  ↓
FastAPI Backend
  ↓
Pandas Data Processing
  ↓
Spending Analysis
  ↓
Financial Insights
  ↓
Interactive Dashboard
  ↓
Ask FinMate