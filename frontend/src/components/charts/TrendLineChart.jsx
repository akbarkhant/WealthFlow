import { useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import "../../styles/components/charts/charts.css";

/**
 * TrendLineChart
 *
 * Props:
 *  - data: Array<{ label: string, value: number, [compare]?: number }>
 *    e.g. [{ label: "Week 1", value: 1200, compare: 1050 }, ...]
 *  - title: string (optional)
 *  - currency: string (optional, default "$")
 *  - lineColor: string (optional)
 *  - compareColor: string (optional) — color for second (comparison) line
 *  - compareKey: string (optional) — key name for compare values (default "compare")
 *  - compareLabel: string (optional) — legend label for compare line
 *  - showAverage: boolean (optional, default true)
 */

const CustomTooltip = ({ active, payload, label, currency, compareLabel }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip trend-tooltip">
        <span className="tooltip-label">{label}</span>
        {payload.map((p, i) => (
          <div key={i} className="tooltip-row">
            <span
              className="tooltip-dot"
              style={{ background: p.stroke || p.color }}
            />
            <span className="tooltip-series">
              {i === 0 ? "Current" : compareLabel || "Previous"}
            </span>
            <span className="tooltip-value">
              {currency}
              {p.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrendLineChart({
  data = [],
  title = "Spending Trend",
  currency = "$",
  lineColor = "#6ee7b7",
  compareColor = "#a78bfa",
  compareKey = "compare",
  compareLabel = "Previous Period",
  showAverage = true,
}) {
  const [showCompare, setShowCompare] = useState(true);

  if (!data.length) {
    return (
      <div className="chart-card empty-state">
        <p>No data provided.</p>
      </div>
    );
  }

  const hasCompare = data.some((d) => d[compareKey] != null);
  const values = data.map((d) => d.value);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const latest = values[values.length - 1];
  const prev = values[values.length - 2];
  const delta = prev != null ? ((latest - prev) / prev) * 100 : null;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h2 className="chart-title">{title}</h2>
        <span className="chart-badge">Trend</span>
      </div>

      <div className="chart-meta">
        <div className="meta-item">
          <span className="meta-label">Latest</span>
          <span className="meta-value">
            {currency}
            {latest.toLocaleString()}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Average</span>
          <span className="meta-value">
            {currency}
            {avg.toLocaleString()}
          </span>
        </div>
        {delta !== null && (
          <div className="meta-item">
            <span className="meta-label">Change</span>
            <span
              className={`meta-value trend-delta ${delta >= 0 ? "up" : "down"}`}
            >
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {hasCompare && (
        <div className="trend-toggle-row">
          <button
            className={`trend-toggle ${showCompare ? "active" : ""}`}
            onClick={() => setShowCompare((v) => !v)}
            style={{ "--toggle-color": compareColor }}
          >
            <span
              className="toggle-dot"
              style={{ background: compareColor }}
            />
            {compareLabel}
          </button>
        </div>
      )}

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.18} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="compareGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={compareColor} stopOpacity={0.12} />
              <stop offset="95%" stopColor={compareColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            dataKey="label"
            tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: "DM Sans, sans-serif" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: "DM Sans, sans-serif" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              `${currency}${v >= 1000 ? v / 1000 + "k" : v}`
            }
          />
          <Tooltip
            content={
              <CustomTooltip currency={currency} compareLabel={compareLabel} />
            }
          />
          {showAverage && (
            <ReferenceLine
              y={avg}
              stroke="rgba(255,255,255,0.2)"
              strokeDasharray="6 4"
              label={{
                value: "avg",
                fill: "#6b7280",
                fontSize: 11,
                fontFamily: "DM Sans, sans-serif",
                position: "insideTopRight",
              }}
            />
          )}
          {hasCompare && showCompare && (
            <Area
              type="monotone"
              dataKey={compareKey}
              stroke={compareColor}
              strokeWidth={2}
              strokeDasharray="5 4"
              fill="url(#compareGrad)"
              dot={false}
              activeDot={{ r: 5, fill: compareColor, strokeWidth: 0 }}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2.5}
            fill="url(#areaGrad)"
            dot={false}
            activeDot={{
              r: 6,
              fill: lineColor,
              stroke: "#0f172a",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
