import React, { useState, useEffect } from 'react';
import './AnalyticsPage.css';

export default function SmartAnalytics() {
  const [loading, setLoading] = useState(true);
  
  // Interactive Simulator States
  const [extraSavings, setExtraSavings] = useState(300);
  const [prunedSubs, setPrunedSubs] = useState(40);
  const [growthRate, setGrowthRate] = useState(0.06); // 6% Balanced Default

  // Base customer baseline profile details
  const BASE_NET_WORTH = 25000;
  const MONTHLY_INFLOW = 6000;
  const BASE_OUTFLOW = 4200;

  useEffect(() => {
    // Initial loading simulation for premium UX feel
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Compute dynamic metrics and monthly growth projections
  const monthlyNetInflow = MONTHLY_INFLOW - (BASE_OUTFLOW - prunedSubs) + extraSavings;
  
  const projections = Array.from({ length: 6 }).map((_, index) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May *', 'Jun *'];
    // Compound interest formula application: A = P(1 + r/n)^nt + contributions
    const monthlyGrowthRate = growthRate / 12;
    const compoundBase = BASE_NET_WORTH * Math.pow(1 + monthlyGrowthRate, index);
    const wealthFromContributions = monthlyNetInflow * index; // Linear representation over 6 months
    const totalProjectedWorth = compoundBase + wealthFromContributions;
    
    return {
      month: months[index],
      value: totalProjectedWorth,
      current: index === 3, // April as current benchmark
      projected: index > 3
    };
  });

  // Calculate highest projection point for rendering height ratios safely
  const maxWorthValue = Math.max(...projections.map(p => p.value));
  const totalWealthDelta = projections[5].value - BASE_NET_WORTH;
  const remainingCashRunway = Math.min(99, (BASE_NET_WORTH / (BASE_OUTFLOW - prunedSubs))).toFixed(1);

  return (
    <div className="page-wrapper">
      {/* ── Hero Header Unit ── */}
      <header className="page-hero">
        <span className="page-badge">Features / Intelligence</span>
        <h1>Smart Analytics</h1>
        <p>
          Stop parsing raw spreadsheets. WealthFlow converts your raw banking transactions into 
          predictive models, highlighting optimization options and future financial paths.
        </p>
      </header>

      {/* ── Interactive Optimization Controls ── */}
      <section className="data-card col-12" style={{ marginBottom: '32px', background: '#fafafa' }}>
        <h3 className="card-title" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🎛️</span> Interactive Forecast Optimization Simulator
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          {/* Input Variable 1 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#475569' }}>
              Extra Monthly Savings: <span style={{ color: '#4f46e5', fontWeight: 700 }}>${extraSavings}</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="2000" 
              step="50"
              value={extraSavings} 
              onChange={(e) => setExtraSavings(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#4f46e5' }}
            />
          </div>

          {/* Input Variable 2 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#475569' }}>
              Subscriptions to Prune: <span style={{ color: '#4f46e5', fontWeight: 700 }}>${prunedSubs}/mo</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="150" 
              step="10"
              value={prunedSubs} 
              onChange={(e) => setPrunedSubs(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#4f46e5' }}
            />
          </div>

          {/* Input Variable 3 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#475569' }}>
              Asset Optimization Tier
            </label>
            <select 
              value={growthRate} 
              onChange={(e) => setGrowthRate(Number(e.target.value))}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.9rem', fontWeight: 500 }}
            >
              <option value={0.03}>Conservative Plan (3% APY)</option>
              <option value={0.06}>Balanced Engine (6% APY)</option>
              <option value={0.09}>Aggressive Growth (9% APY)</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Main Dashboard Visualization Matrices ── */}
      <main className="dashboard-preview-grid">
        
        {/* Dynamic Forecast Chart */}
        <section className="data-card col-8">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">6-Month Net Worth Projection</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>Adjust sliders above to test your velocity baseline</p>
            </div>
            {loading ? (
              <div className="skeleton skeleton-status" />
            ) : (
              <span className="badge-status status-insight">AI Engine Dynamic</span>
            )}
          </div>

          <div className="mock-bar-chart">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="mock-bar-group">
                  <div className="skeleton skeleton-bar" style={{ height: `${35 + idx * 10}%`, width: '70%' }} />
                  <div className="skeleton skeleton-label" />
                </div>
              ))
            ) : (
              projections.map((bar, index) => {
                // Determine responsive programmatic scaling height against the peak valuation array ceiling
                const scaleHeightPercentage = (bar.value / maxWorthValue) * 100;
                
                return (
                  <div key={index} className="mock-bar-group">
                    <div 
                      className={`mock-bar ${bar.current ? 'active' : ''}`} 
                      style={{ 
                        height: `${scaleHeightPercentage}%`,
                        opacity: !bar.current && !bar.projected ? 0.6 : 1,
                        border: bar.projected ? '2px dashed #4f46e5' : 'none',
                        backgroundColor: bar.projected ? '#eef2ff' : undefined
                      }}
                      title={`$${Math.round(bar.value).toLocaleString()}`}
                    />
                    <span className="mock-bar-label" style={{ fontWeight: bar.current ? 700 : 400 }}>
                      {bar.month}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Real-time Insights Feed */}
        <section className="data-card col-4">
          <div className="card-header-flex">
            <h2 className="card-title">Real-Time Forecast Metrics</h2>
          </div>
          <div className="ui-list">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="ui-list-item">
                  <div className="item-left" style={{ width: '100%' }}>
                    <div style={{ width: '100%' }}>
                      <div className="skeleton skeleton-item-title" />
                      <div className="skeleton skeleton-item-sub" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="ui-list-item" style={{ borderLeft: '4px solid #4f46e5' }}>
                  <div className="item-left">
                    <div>
                      <span className="item-name" style={{ color: '#0f172a' }}>6-Mo Wealth Accrual</span>
                      <span className="item-meta" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4f46e5', marginTop: '4px' }}>
                        +${Math.round(totalWealthDelta).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ui-list-item" style={{ borderLeft: '4px solid #16a34a' }}>
                  <div className="item-left">
                    <div>
                      <span className="item-name" style={{ color: '#0f172a' }}>Emergency Fund Runway</span>
                      <span className="item-meta" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#16a34a', marginTop: '4px' }}>
                        {remainingCashRunway} Months
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ui-list-item" style={{ borderLeft: '4px solid #0284c7' }}>
                  <div className="item-left">
                    <div>
                      <span className="item-name" style={{ color: '#0f172a' }}>Recurring Monthly Outflow</span>
                      <span className="item-meta" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', marginTop: '4px' }}>
                        ${BASE_OUTFLOW - prunedSubs} / mo
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* ── Feature Detailed Value Row ── */}
      <section className="features-detailed-section">
        <h2>Engineered for Deep Financial Clarity</h2>
        <div className="detailed-grid">
          <article className="feature-detail-node">
            <h3>Automated Transaction Categorization</h3>
            <p>Our deep learning parser identifies merchants and assigns precise categories automatically, maintaining 99.2% labeling precision.</p>
          </article>
          <article className="feature-detail-node">
            <h3>Cash Flow Runway Estimations</h3>
            <p>Understand how long your liquid reserves would sustain your current standard of living under unanticipated dynamic market conditions.</p>
          </article>
          <article className="feature-detail-node">
            <h3>Adaptive Pattern Isolation</h3>
            <p>Spot hidden pricing creeps, duplicate processing, or unutilized services before they scale into systemic balance drains.</p>
          </article>
        </div>
      </section>
    </div>
  );
}