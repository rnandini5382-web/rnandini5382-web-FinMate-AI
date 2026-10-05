import { useState } from "react";
import "./App.css";

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://127.0.0.1:8000/analyze", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Upload failed");
        }

       console.log("FinMate Analysis:", data);
setAnalysisData(data);
alert("Transactions analyzed successfully! 🎉");
    } catch (error) {
        console.error(error);
        alert("Something went wrong while analyzing the transactions.");
    }
};
  const [activePage, setActivePage] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Transactions", icon: "▣" },
    { name: "AI Insights", icon: "✦" },
    { name: "Ask FinMate", icon: "◉" },
  ];

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">₹</div>
          <div>
            <h2>FinMate</h2>
            <span>AI Finance Copilot</span>
          </div>
        </div>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <span className="nav-icon">⚙</span>
            Settings
          </button>

          <div className="profile">
            <div className="avatar">N</div>
            <div>
              <strong>My Finance</strong>
              <span>Personal Account</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        <header className="topbar">
          <div>
            <p className="welcome">Good evening 👋</p>
            <h1>{activePage}</h1>
          </div>

          <label className="upload-btn">
    + Upload Transactions
    <input
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleFileUpload}
    />
</label>
        </header>

        {activePage === "Dashboard" && <Dashboard analysisData={analysisData} />}
       {activePage === "Transactions" && (
  <Transactions
    analysisData={analysisData}
    onFileUpload={handleFileUpload}
  />
)}
        {activePage === "AI Insights" && <Insights analysisData={analysisData} />}
       {activePage === "Ask FinMate" && (
  <AskFinMate analysisData={analysisData} />
)}
      </main>
    </div>
  );
}

function Dashboard({ analysisData })  {
  return (
    <>
      {/* Summary Cards */}
      <section className="stats">
        <div className="stat-card">
          <div className="stat-top">
            <span>Total Spending</span>
            <span className="stat-icon">₹</span>
          </div>
          <h2>
  ₹{analysisData?.summary?.total_spending?.toLocaleString("en-IN") || 0}
</h2>
          <p className="positive">
  Based on your uploaded transaction data
</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Top Category</span>
            <span className="stat-icon">🍔</span>
          </div>
          <h2>
  ₹{analysisData?.summary?.top_category_amount?.toLocaleString("en-IN") || 0}
</h2>
          <p>{analysisData?.summary?.top_category || "No data"}</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Subscriptions</span>
            <span className="stat-icon">↻</span>
          </div>
          <h2>
  ₹{analysisData?.subscriptions
    ?.reduce((total, sub) => total + Number(sub.amount || 0), 0)
    .toLocaleString("en-IN") || 0}
</h2>
          <p>Monthly recurring</p>
        </div>

        <div className="stat-card warning-card">
          <div className="stat-top">
            <span>Unusual Spending</span>
            <span className="stat-icon">!</span>
          </div>
          <h2>{analysisData?.unusual_transactions?.length || 0}</h2>
          <p>Transactions detected</p>
        </div>
      </section>

      {/* Content Grid */}
      <section className="content-grid">
        <div className="panel spending-panel">
          <div className="panel-header">
            <div>
              <h3>Spending Overview</h3>
              <p>Your spending over the last 6 months</p>
            </div>
            <select>
              <option>Last 6 months</option>
              <option>Last 30 days</option>
            </select>
          </div>

          <div className="chart">
            <div className="chart-labels">
              <span>₹20k</span>
              <span>₹15k</span>
              <span>₹10k</span>
              <span>₹5k</span>
              <span>₹0</span>
            </div>

            <div className="bars">
              {(analysisData?.monthly_spending || []).map((item, index, arr) => {
  const maxAmount = Math.max(
    ...arr.map((x) => Math.abs(Number(x.amount) || 0)),
    1
  );

  const amount = Math.abs(Number(item.amount) || 0);
  const height = (amount / maxAmount) * 100;

  return (
    <div className="bar-group" key={index}>
      <div
        className={`bar ${index === arr.length - 1 ? "current" : ""}`}
        style={{ height: `${height}%` }}
        title={`₹${amount.toLocaleString("en-IN")}`}
      ></div>

      <span>{item.month || item.label || ""}</span>
    </div>
  );
})}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Spending Categories</h3>
              <p>Where your money goes</p>
            </div>
          </div>

          <div className="category-list">
           {(analysisData?.categories || []).map((item, index) => (
  <Category
    key={index}
    name={item.category}
    amount={`₹${Number(item.amount || 0).toLocaleString("en-IN")}`}
    percent={`${Number(item.percentage || 0)}%`}
  />
))}
          </div>
        </div>
      </section>

      {/* AI Insights */}
      <section className="panel insights-panel">
        <div className="panel-header">
          <div>
            <h3>✦ AI Insights</h3>
            <p>Personalized observations from your transactions</p>
          </div>
          <button className="view-btn">View all →</button>
        </div>

        <div className="insight-grid">
          text={`Your highest spending category is ${analysisData?.summary?.top_category || "your top category"}.`}

          <Insight
  icon="🔄"
  title="Subscriptions detected"
  text={`You have ${
    analysisData?.subscriptions?.length || 0
  } recurring payments costing approximately ₹${
    (
      analysisData?.subscriptions?.reduce(
        (total, sub) => total + Number(sub.amount || 0),
        0
      ) || 0
    ).toLocaleString("en-IN")
  } based on your current transaction data.`}
/>

          <Insight
  icon="⚠️"
  title="Unusual transactions"
  text={`${analysisData?.unusual_transactions?.length || 0} transaction${
    (analysisData?.unusual_transactions?.length || 0) === 1 ? "" : "s"
  } detected as significantly higher than your typical spending pattern.`}
/>
        </div>
      </section>

      {/* Ask FinMate */}
      <section className="ask-card">
        <div className="ask-icon">✦</div>
        <div>
          <h3>Have a question about your money?</h3>
          <p>Ask FinMate in natural language and get instant insights.</p>
        </div>
        <button className="ask-btn">Ask FinMate →</button>
      </section>
    </>
  );
}

function Category({ name, amount, percent }) {
  return (
    <div className="category">
      <div className="category-info">
        <span>{name}</span>
        <strong>{amount}</strong>
      </div>

      <div className="progress">
        <div style={{ width: percent }}></div>
      </div>

      <span className="percent">{percent}</span>
    </div>
  );
}

function Insight({ icon, title, text }) {
  return (
    <div className="insight">
      <div className="insight-icon">{icon}</div>
      <div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  );
}
function Transactions({ analysisData, onFileUpload }) {
  const transactions = (analysisData?.transactions || []).map((item) => [
  item.date
    ? new Date(item.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })
    : "",
  item.merchant || "",
  item.category || "",
  `₹${Number(item.amount || 0).toLocaleString("en-IN")}`,
]);

  return (
    <div className="panel page-panel">
      <div className="panel-header">
        <div>
          <h3>Transactions</h3>
          <p>Your recent transaction history</p>
        </div>
        <label className="upload-btn">
  Upload CSV
  <input
    type="file"
    accept=".csv"
    style={{ display: "none" }}
    onChange={onFileUpload}
  />
</label>
      </div>

      <div className="transaction-table">
        <div className="table-row table-head">
          <span>Date</span>
          <span>Merchant</span>
          <span>Category</span>
          <span>Amount</span>
        </div>

        {transactions.length > 0 ? (
  transactions.map((transaction, index) => (
    <div className="table-row" key={index}>
      <span>{transaction[0]}</span>
      <strong>{transaction[1]}</strong>
      <span>{transaction[2]}</span>
      <strong>{transaction[3]}</strong>
    </div>
  ))
) : (
  <div
    style={{
      padding: "50px 20px",
      textAlign: "center",
      color: "#777",
    }}
  >
    <h3>No transactions uploaded yet</h3>
    <p>Upload a CSV file to see your transaction history here.</p>
  </div>
)}
      </div>
    </div>
  );
}

function Insights({ analysisData }) {
  return (
    <div className="page-content">
      <div className="panel page-panel">
        <h3>✦ AI Financial Insights</h3>

        <p className="subtitle">
          FinMate analyzed your transactions and found these patterns.
        </p>

        <div className="big-insight">
          <span>📈</span>
          <div>
            <h3>
              Your top spending category is{" "}
              {analysisData?.summary?.top_category || "not available"}
            </h3>

            <p>
              You spent ₹
              {analysisData?.summary?.top_category_amount?.toLocaleString(
                "en-IN"
              ) || 0}{" "}
              in this category.
            </p>
          </div>
        </div>

        <div className="big-insight">
          <span>💰</span>
          <div>
            <h3>Potential savings opportunity</h3>

            <p>
              Reducing{" "}
              {analysisData?.categories?.find(
                (item) => item.category === "Food & Dining"
              )?.category || "Food & Dining"}{" "}
              spending by 20% could save approximately ₹
              {Math.round(
                (analysisData?.categories?.find(
                  (item) => item.category === "Food & Dining"
                )?.amount || 0) * 0.2
              ).toLocaleString("en-IN")}{" "}
              per month.
            </p>
          </div>
        </div>

        <div className="big-insight">
          <span>🤖</span>
          <div>
            <h3>
              {analysisData?.unusual_transactions?.length > 0
                ? "Unusual spending detected"
                : "No unusual spending detected"}
            </h3>

            <p>
              {analysisData?.unusual_transactions?.length > 0
                ? (() => {
                    const unusual =
                      analysisData.unusual_transactions[0];

                    return `${unusual.description ||
                      unusual.merchant ||
                      "A transaction"} — ₹${Number(
                      unusual.amount || 0
                    ).toLocaleString("en-IN")} in ${
                      unusual.category || "your spending"
                    } stands out from your normal spending pattern.`;
                  })()
                : "Your current transactions do not show any unusual spending patterns."}
            </p>
          </div>
        </div>

        <div className="big-insight">
          <span>🔄</span>
          <div>
            <h3>
              {analysisData?.subscriptions?.length || 0} recurring
              subscriptions detected
            </h3>

            <p>
              Your recurring payments total approximately ₹
              {(
                analysisData?.subscriptions?.reduce(
                  (total, sub) =>
                    total + Number(sub.amount || 0),
                  0
                ) || 0
              ).toLocaleString("en-IN")}{" "}
              based on your current transaction data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
 function AskFinMate({ analysisData }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm FinMate 🤖 Ask me anything about your spending.",
    },
  ]);

  const askQuestion = () => {
    if (!question.trim()) return;

    const userMessage = question;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
      {
        role: "ai",
        text: getDemoAnswer(userMessage, analysisData),
      },
    ]);

    setQuestion("");
  };

  return (
    <div className="chat-container">
      <div className="panel chat-panel">
        <div className="chat-header">
          <div className="chat-avatar">✦</div>
          <div>
            <h3>Ask FinMate</h3>
            <p>Your AI finance copilot</p>
          </div>
        </div>

        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role}`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="suggestions">
          <button onClick={() => setQuestion("Where did I spend the most?")}>
            Where did I spend the most?
          </button>

          <button onClick={() => setQuestion("Find my subscriptions")}>
            Find my subscriptions
          </button>

          <button onClick={() => setQuestion("Why did my spending increase?")}>
            Why did my spending increase?
          </button>
        </div>

        <div className="chat-input">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") askQuestion();
            }}
            placeholder="Ask FinMate about your money..."
          />

          <button onClick={askQuestion}>Send</button>
        </div>
      </div>
    </div>
  );
}

function getDemoAnswer(question, analysisData) {
  const q = question.toLowerCase();

  if (!analysisData) {
    return "Please upload your transaction CSV first so I can analyze your spending.";
  }

  const summary = analysisData.summary || {};
  const categories = analysisData.categories || [];

  // Total spending
  if (
    q.includes("total") ||
    q.includes("overall") ||
    q.includes("how much did i spend")
  ) {
    // If a specific category is mentioned, don't use total spending
    const specificCategory = categories.find((item) =>
      q.includes(item.category.toLowerCase())
    );

    if (!specificCategory) {
      return `Your total spending is ₹${summary.total_spending?.toLocaleString("en-IN") || 0} based on the uploaded transaction data.`;
    }
  }

  // Specific category spending
  const matchedCategory = categories.find((item) =>
    q.includes(item.category.toLowerCase())
  );

  if (matchedCategory) {
    return `You spent ₹${matchedCategory.amount.toLocaleString("en-IN")} on ${matchedCategory.category}.`;
  }

  // Highest spending category
  if (
    q.includes("most") ||
    q.includes("highest") ||
    q.includes("top category")
  ) {
    return `Your highest spending category is ${summary.top_category} at ₹${summary.top_category_amount?.toLocaleString("en-IN")}.`;
  }

  // Subscriptions
  if (q.includes("subscription")) {
    const subscriptions = analysisData.subscriptions || [];

    if (subscriptions.length > 0) {
      const total = subscriptions.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

      return `You have ${subscriptions.length} recurring subscriptions costing approximately ₹${total.toLocaleString("en-IN")} per month.`;
    }

    return "No recurring subscriptions were detected.";
  }

  // Transaction count
  // Transaction count
if (q.includes("transaction") && (q.includes("how many") || q.includes("count"))) {
  const transactionCount = analysisData?.transactions?.length || 0;

  return `You have ${transactionCount} transactions in the uploaded data.`;
}
  // Average transaction
  // Average transaction
if (q.includes("average")) {
  const transactions = analysisData?.transactions || [];

  const total = transactions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const average =
    transactions.length > 0 ? Math.round(total / transactions.length) : 0;

  return `Your average transaction is ₹${average.toLocaleString("en-IN")}.`;
}

  // Spending increase
  if (q.includes("increase") || q.includes("increased")) {
  return "I can analyze your spending patterns from the uploaded transaction data. A month-to-month increase comparison will be available when multiple months of transaction data are uploaded.";
}
return `Your highest spending category is ${summary.top_category || "not available"} at ₹${summary.top_category_amount?.toLocaleString("en-IN") || 0}.`;
  return `Based on your uploaded transaction data, your total spending is ₹${summary.total_spending?.toLocaleString("en-IN") || 0}. I can help you analyze categories, subscriptions, transactions, and spending patterns.`;
}
export default App;