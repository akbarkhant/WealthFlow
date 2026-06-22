import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '../hooks/useCurrency';

export default function AssetTimelineChart() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fmt } = useCurrency('USD');

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await fetch('/api/assets/history');
        const json = await res.json();
        if (json.success) {
          // Format date presentation tokens safely
          const formatted = json.data.map(item => ({
            day: new Date(item.valuation_day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            amount: parseFloat(item.total_net_worth_on_day)
          }));
          setHistoryData(formatted);
        } else {
          setError('Failed to fetch timeline logs');
        }
      } catch (err) {
        setError('Network error mapping timeline metrics');
      } finally {
        setLoading(false);
      }
    }
    fetchTimeline();
  }, []);

  if (loading) return <div className="wf-state-message">Loading wealth timeline...</div>;
  if (error) return <div className="wf-state-message error">{error}</div>;

  return (
    <div className="wf-card wf-timeline-card">
      <div className="wf-card-header-group">
        <h3 className="wf-card-title">Net Worth Growth Trajectory</h3>
        <p className="wf-card-subtitle">Historical aggregate value of portfolios converted to baseline USD</p>
      </div>
      
      <div className="wf-chart-wrapper" style={{ width: '100%', height: 320, marginTop: 'var(--space-4)' }}>
        {historyData.length === 0 ? (
          <div className="wf-state-message">Insufficient historical log points to populate tracking balances.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" opacity={0.4} />
              <XAxis dataKey="day" stroke="var(--color-secondary)" style={{ fontSize: 12 }} />
              <YAxis stroke="var(--color-secondary)" style={{ fontSize: 12 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value) => [fmt(value, 'USD'), 'Total Portfolio Net Worth']}
                contentStyle={{ backgroundColor: 'var(--color-surface-container-high)', borderRadius: 'var(--radius-md)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
              />
              <Area type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#netWorthGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}