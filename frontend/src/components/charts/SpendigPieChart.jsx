import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../../styles/components/charts/charts.css";

/**
 * SpendingPieChart
 *
 * Props:
 *  - data: Array<{ category: string, amount: number }>
 *    e.g. [{ category: "Food", amount: 800 }, ...]
 *  - title: string (optional)
 *  - currency: string (optional, default "$")
 *  - colors: string[] (optional) — palette for slices
 */

const DEFAULT_COLORS = [
  "#6ee7b7",
  "#34d399",
  "#a78bfa",
  "#f472b6",
  "#fb923c",
  "#60a5fa",
  "#facc15",
  "#e879f9",
];

const CustomTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="chart-tooltip">
        <span className="tooltip-label">{name}</span>
        <span className="tooltip-value">
          {currency}
          {value.toLocaleString()}
        </span>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ data, colors, activeIndex, onHover, currency }) => {
  const total = data.reduce((s, d) => s + d.amount, 0);
  return (
    <ul className="pie-legend">
      {data.map((entry, i) => (
        <li
          key={entry.category}
          className={`pie-legend-item ${activeIndex === i ? "active" : ""}`}
          onMouseEnter={() => onHover(i)}
          onMouseLeave={() => onHover(null)}
        >
          <span
            className="pie-legend-dot"
            style={{ background: colors[i % colors.length] }}
          />
          <span className="pie-legend-name">{entry.category}</span>
          <span className="pie-legend-pct">
            {((entry.amount / total) * 100).toFixed(1)}%
          </span>
          <span className="pie-legend-amt">
            {currency}
            {entry.amount.toLocaleString()}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default function SpendingPieChart({
  data = [],
  title = "Spending Breakdown",
  currency = "$",
  colors = DEFAULT_COLORS,
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!data.length) {
    return (
      <div className="chart-card empty-state">
        <p>No data provided.</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({ name: d.category, value: d.amount }));
  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h2 className="chart-title">{title}</h2>
        <span className="chart-badge">Categories</span>
      </div>

      <div className="pie-layout">
        <div className="pie-donut-wrap">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                strokeWidth={0}
              >
                {chartData.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={colors[i % colors.length]}
                    opacity={activeIndex === null || activeIndex === i ? 1 : 0.4}
                    style={{ transition: "opacity 0.2s ease", cursor: "pointer" }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip currency={currency} />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="pie-center-label">
            <span className="pie-center-total">
              {currency}
              {total.toLocaleString()}
            </span>
            <span className="pie-center-sub">Total</span>
          </div>
        </div>

        <CustomLegend
          data={data}
          colors={colors}
          activeIndex={activeIndex}
          onHover={setActiveIndex}
          currency={currency}
        />
      </div>
    </div>
  );
}
