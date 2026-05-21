import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "../../styles/components/charts/charts.css";

/**
 * MonthlyBarChart
 *
 * Props:
 *  - data: Array<{ month: string, amount: number }>
 *    e.g. [{ month: "Jan", amount: 3200 }, ...]
 *  - title: string (optional)
 *  - currency: string (optional, default "$")
 *  - accentColor: string (optional, default "#6ee7b7")
 *  - highlightColor: string (optional, default "#34d399")
 */
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <span className="tooltip-label">{label}</span>
        <span className="tooltip-value">
          {currency}
          {payload[0].value.toLocaleString()}
        </span>
      </div>
    );
  }
  return null;
};

export default function MonthlyBarChart({
  data = [],
  title = "Monthly Overview",
  currency = "$",
  accentColor = "#6ee7b7",
  highlightColor = "#34d399",
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!data.length) {
    return (
      <div className="chart-card empty-state">
        <p>No data provided.</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.amount));

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h2 className="chart-title">{title}</h2>
        <span className="chart-badge">Monthly</span>
      </div>

      <div className="chart-meta">
        <div className="meta-item">
          <span className="meta-label">Peak</span>
          <span className="meta-value">
            {currency}
            {max.toLocaleString()}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Total</span>
          <span className="meta-value">
            {currency}
            {data.reduce((s, d) => s + d.amount, 0).toLocaleString()}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Avg</span>
          <span className="meta-value">
            {currency}
            {Math.round(
              data.reduce((s, d) => s + d.amount, 0) / data.length
            ).toLocaleString()}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          barCategoryGap="30%"
          onMouseLeave={() => setActiveIndex(null)}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: "DM Sans, sans-serif" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: "DM Sans, sans-serif" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${currency}${v >= 1000 ? v / 1000 + "k" : v}`}
          />
          <Tooltip
            content={<CustomTooltip currency={currency} />}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  index === activeIndex
                    ? highlightColor
                    : index === data.findIndex((d) => d.amount === max)
                    ? accentColor
                    : "rgba(110, 231, 183, 0.35)"
                }
                onMouseEnter={() => setActiveIndex(index)}
                style={{ cursor: "pointer", transition: "fill 0.2s ease" }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}