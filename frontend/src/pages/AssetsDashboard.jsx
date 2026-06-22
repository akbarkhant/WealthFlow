import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useCurrency } from '../hooks/useCurrency'; // Adjust your relative path

const ALLOCATION_COLORS = {
  property: '#005ac2', // Maps conceptually to --tertiary
  currency: '#10b981', // Maps to --success
  digital: '#f59e0b',  // Maps to --warning
  valuable: '#8b5cf6'  // Accent purple
};

export default function AssetsDashboard() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { fmt } = useCurrency('USD');

  useEffect(() => {
    async function fetchAssetsSummary() {
      try {
        const response = await fetch('/api/assets/summary');
        const json = await response.json();
        if (json.success) {
          setAssets(json.data);
        } else {
          setError('Failed to load portfolio items');
        }
      } catch (err) {
        setError('Network error occurred fetching snapshot portfolio');
      } finally {
        setLoading(false);
      }
    }
    fetchAssetsSummary();
  }, []);

  const totalNetWorth = assets.reduce((sum, asset) => sum + parseFloat(asset.current_value_in_base_currency || 0), 0);

  const allocationData = assets.reduce((acc, asset) => {
    const value = parseFloat(asset.current_value_in_base_currency || 0);
    const existing = acc.find(item => item.name === asset.type);
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: asset.type, value });
    }
    return acc;
  }, []).filter(item => item.value > 0);

  if (loading) return <div className="wf-state-message">Loading WealthFlow Assets...</div>;
  if (error) return <div className="wf-state-message error">{error}</div>;

  return (
    <div className="wf-dashboard">
      
      {/* ── Net Worth Hero Banner ── */}
      <div className="wf-hero-banner">
        <div className="wf-hero-meta">
          <span className="wf-hero-label">CURRENT NET WORTH</span>
          <h1 className="wf-hero-amount">{fmt(totalNetWorth, 'USD')}</h1>
        </div>
        <div className="wf-hero-badge">Portfolio Active</div>
      </div>

      <div className="wf-dashboard-grid">
        
        {/* ── Asset Allocation Pie Chart ── */}
        <div className="wf-card wf-chart-card">
          <h3 className="wf-card-title">Asset Allocation Breakdown</h3>
          <div className="wf-chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[entry.name] || '#6B7280'} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [fmt(value, 'USD'), 'Allocation']} 
                  contentStyle={{ backgroundColor: 'var(--color-surface-container-high)', borderRadius: 'var(--radius-md)', borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
                />
                <Legend formatter={(value) => value.toUpperCase()} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── The Assets Data Table ── */}
        <div className="wf-card wf-table-card">
          <h3 className="wf-card-title">Assets Portfolio Ledger</h3>
          <div className="wf-table-responsive">
            <table className="wf-data-table">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Type</th>
                  <th>Institution / Location</th>
                  <th>Quantity Stored</th>
                  <th className="text-right">Current Market Value</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} className="wf-table-row">
                    <td>
                      <div className="wf-asset-identity">
                        <span className="wf-asset-name">{asset.name}</span>
                        <span className="wf-asset-currency-tag">{asset.currency}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`wf-type-badge ${asset.type}`}>
                        {asset.type}
                      </span>
                    </td>
                    <td>
                      <span className="wf-table-text-muted">
                        {asset.institution_or_location || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="wf-asset-qty">
                        {asset.type === 'property' ? '1.00' : parseFloat(asset.quantity).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </span>
                    </td>
                    <td className="text-right font-semibold">
                      {fmt(parseFloat(asset.current_value_in_base_currency || 0), 'USD')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}