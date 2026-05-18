import React, { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import "../styles/pages/Transactions.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data));

    fetch("http://localhost:5000/api/budgets")
      .then((res) => res.json())
      .then((data) => setBudgets(data));
  }, []);

  return (
    <DashboardLayout>
      <div className="transactions-page">

        {/* Budget Section */}
        <div className="budget-list">
          {budgets.map((budget) => (
            <div className="budget-item" key={budget.id}>
              <div className="budget-top">
                <div className="budget-info">

                  <div className={`budget-icon ${budget.color}`}>
                    <span className="material-symbols-outlined">
                      {budget.icon}
                    </span>
                  </div>

                  <div>
                    <p className="budget-name">
                      {budget.category}
                    </p>

                    <p className="budget-meta">
                      {budget.usedPercent}% of $
                      {budget.limit} used
                    </p>
                  </div>
                </div>

                <p className="budget-price">
                  ${budget.used}
                </p>
              </div>

              <div className="progress-bar">
                <div
                  className={`progress-fill ${budget.fillClass}`}
                  style={{
                    width: `${budget.usedPercent}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Transactions Table */}
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th className="right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>

                <td>
                  <div className="merchant">
                    <div className="merchant-logo">
                      {item.short}
                    </div>

                    <span>{item.description}</span>
                  </div>
                </td>

                <td>
                  <span className={`tag ${item.tagClass}`}>
                    {item.category}
                  </span>
                </td>

                <td
                  className={`right ${
                    item.type === "income"
                      ? "amount-positive"
                      : "amount-negative"
                  }`}
                >
                  {item.type === "income" ? "+" : "-"}$
                  {item.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;