import { useState } from 'react';
import './BudgetingPage.css';

/* ── Inline SVG Icons ── */
const IconTarget = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
);
const IconBell = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);
const IconUsers = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const IconRefreshCw = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
);
const IconArrowRight = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);
const IconCheck = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

/* ── Data ── */
const categories = [
    { label: '🛒 Groceries', spent: 486, budget: 550, color: '#2e6b4a' },
    { label: '🍽 Dining out', spent: 210, budget: 300, color: '#c8a84b' },
    { label: '🚗 Transport', spent: 95, budget: 200, color: '#1a3a5c' },
    { label: '🎬 Entertainment', spent: 78, budget: 100, color: '#7c4fa0' },
    { label: '💡 Utilities', spent: 122, budget: 150, color: '#2e6b4a' },
];

const savingsGoals = [
    { emoji: '🏖', label: 'Holiday', saved: 3700, target: 5000, color: '#2e6b4a' },
    { emoji: '🚗', label: 'Car fund', saved: 2100, target: 5000, color: '#c8a84b' },
    { emoji: '🏥', label: 'Emergency', saved: 9000, target: 10000, color: '#1a3a5c' },
];

const features = [
    {
        icon: <IconRefreshCw />,
        title: 'Monthly rollover',
        desc: 'Unspent budget carries forward automatically, rewarding restraint without any penalty.',
        color: 'green',
    },
    {
        icon: <IconBell />,
        title: 'Overspend alerts',
        desc: 'Push notifications land when you hit 80% of a category budget — before it\'s too late.',
        color: 'gold',
    },
    {
        icon: <IconUsers />,
        title: 'Shared households',
        desc: 'Invite a partner or roommates, split bills fairly, and track shared expenses together.',
        color: 'blue',
    },
    {
        icon: <IconTarget />,
        title: 'Custom categories',
        desc: 'Build your own category tree — as granular or as broad as your lifestyle demands.',
        color: 'purple',
    },
];

const checklistItems = [
    'Auto-categorises 98% of transactions',
    'Custom categories and sub-buckets',
    'Recurring vs one-time split detection',
    'Merchant-level detail view',
];

/* ── Sub-components ── */

function CategoryBar({ label, spent, budget, color }) {
    const pct = Math.min(100, Math.round((spent / budget) * 100));
    const over = pct >= 90;
    return (
        <div className="budget-bar">
            <div className="budget-bar-header">
                <span className="budget-bar-label">{label}</span>
                <span className="budget-bar-amount" style={{ color: over ? '#c0392b' : undefined }}>
                    ${spent} <span className="budget-bar-of">/ ${budget}</span>
                </span>
            </div>
            <div className="budget-bar-track">
                <div
                    className="budget-bar-fill"
                    style={{ width: `${pct}%`, background: over ? '#e74c3c' : color }}
                />
            </div>
            {over && <span className="budget-bar-warning">Nearly over budget</span>}
        </div>
    );
}

function SavingsGoal({ emoji, label, saved, target, color }) {
    const pct = Math.round((saved / target) * 100);
    return (
        <div className="savings-goal">
            <div className="savings-goal-emoji">{emoji}</div>
            <div className="savings-goal-pct" style={{ color }}>{pct}%</div>
            <div className="savings-goal-label">{label}</div>
            <div className="savings-goal-track">
                <div className="savings-goal-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <div className="savings-goal-amounts">
                ${saved.toLocaleString()} <span>/ ${target.toLocaleString()}</span>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color }) {
    return (
        <div className="feature-card">
            <div className={`feature-card-icon feature-card-icon--${color}`}>{icon}</div>
            <h3 className="feature-card-title">{title}</h3>
            <p className="feature-card-desc">{desc}</p>
        </div>
    );
}

/* ── Page ── */
export default function BudgetingPage() {
    const [activeTab, setActiveTab] = useState('overview');

    const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
    const totalBudget = categories.reduce((s, c) => s + c.budget, 0);

    return (
        <div className="bp-root">

            {/* ── Hero ── */}
            <section className="bp-hero">
                <div className="bp-hero-inner">
                    <div className="bp-eyebrow">
                        <span className="bp-eyebrow-icon">💼</span>
                        Feature — Budget Management
                    </div>

                    <h1 className="bp-hero-title">
                        Track every dollar <em>effortlessly</em>
                    </h1>

                    <p className="bp-hero-sub">
                        WealthFlow's budgeting engine categorises transactions automatically,
                        visualises spending trends, and nudges you before you overspend.
                    </p>

                    <div className="bp-hero-actions">
                        <button className="bp-btn-primary">
                            Start budgeting free
                            <span className="bp-btn-arrow"><IconArrowRight /></span>
                        </button>
                        <button className="bp-btn-outline">Watch demo</button>
                    </div>

                    <div className="bp-hero-stats">
                        <div className="bp-stat">
                            <span className="bp-stat-value">98%</span>
                            <span className="bp-stat-label">Auto-categorisation accuracy</span>
                        </div>
                        <div className="bp-stat-divider" />
                        <div className="bp-stat">
                            <span className="bp-stat-value">$430</span>
                            <span className="bp-stat-label">Average monthly savings found</span>
                        </div>
                        <div className="bp-stat-divider" />
                        <div className="bp-stat">
                            <span className="bp-stat-value">2 min</span>
                            <span className="bp-stat-label">Setup time</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Main content ── */}
            <div className="bp-container">

                {/* ── Tabs ── */}
                <div className="bp-tabs">
                    {['overview', 'goals', 'insights'].map(tab => (
                        <button
                            key={tab}
                            className={`bp-tab ${activeTab === tab ? 'bp-tab--active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* ── Split layout ── */}
                <div className="bp-split">

                    {/* Left — live dashboard */}
                    <div className="bp-dashboard">
                        {activeTab === 'overview' && (
                            <>
                                <div className="bp-dashboard-header">
                                    <h2 className="bp-dashboard-title">May 2026 spending</h2>
                                    <span className="bp-dashboard-badge">Live</span>
                                </div>

                                <div className="bp-summary-row">
                                    <div className="bp-summary-card">
                                        <span className="bp-summary-label">Spent</span>
                                        <span className="bp-summary-value">${totalSpent.toLocaleString()}</span>
                                    </div>
                                    <div className="bp-summary-card">
                                        <span className="bp-summary-label">Remaining</span>
                                        <span className="bp-summary-value bp-summary-value--green">
                                            ${(totalBudget - totalSpent).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="bp-summary-card">
                                        <span className="bp-summary-label">Budget</span>
                                        <span className="bp-summary-value">${totalBudget.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="bp-bars">
                                    {categories.map(c => <CategoryBar key={c.label} {...c} />)}
                                </div>

                                <div className="bp-total-bar">
                                    <span>Total used</span>
                                    <div className="bp-total-track">
                                        <div
                                            className="bp-total-fill"
                                            style={{ width: `${Math.round((totalSpent / totalBudget) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="bp-total-pct">
                                        {Math.round((totalSpent / totalBudget) * 100)}%
                                    </span>
                                </div>
                            </>
                        )}

                        {activeTab === 'goals' && (
                            <>
                                <div className="bp-dashboard-header">
                                    <h2 className="bp-dashboard-title">Savings pockets</h2>
                                    <button className="bp-add-btn">+ Add goal</button>
                                </div>
                                <div className="bp-goals-grid">
                                    {savingsGoals.map(g => <SavingsGoal key={g.label} {...g} />)}
                                </div>
                                <div className="bp-goals-tip">
                                    💡 Add £300/mo to reach your Holiday goal by August 2026
                                </div>
                            </>
                        )}

                        {activeTab === 'insights' && (
                            <div className="bp-insights">
                                <div className="bp-dashboard-header">
                                    <h2 className="bp-dashboard-title">This month's insights</h2>
                                </div>
                                <div className="bp-insight-card bp-insight-card--warn">
                                    <span className="bp-insight-icon">⚠️</span>
                                    <div>
                                        <strong>Dining is up 34%</strong>
                                        <p>You've spent $210 on dining — $42 more than your April average.</p>
                                    </div>
                                </div>
                                <div className="bp-insight-card bp-insight-card--good">
                                    <span className="bp-insight-icon">🎉</span>
                                    <div>
                                        <strong>Transport on track</strong>
                                        <p>Only $95 of your $200 transport budget used — great job!</p>
                                    </div>
                                </div>
                                <div className="bp-insight-card bp-insight-card--info">
                                    <span className="bp-insight-icon">📊</span>
                                    <div>
                                        <strong>Projected surplus: $281</strong>
                                        <p>Based on your current pace, you'll end May with money left over.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right — feature details */}
                    <div className="bp-details">
                        <h2 className="bp-details-title">Smart category detection</h2>
                        <p className="bp-details-body">
                            Our ML model learns your habits within the first week. It automatically tags groceries,
                            dining, transport, utilities — and gets smarter every time you correct it.
                        </p>

                        <ul className="bp-checklist">
                            {checklistItems.map(item => (
                                <li key={item} className="bp-checklist-item">
                                    <span className="bp-checklist-icon"><IconCheck /></span>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="bp-details-divider" />

                        <h2 className="bp-details-title">Goal-based savings pockets</h2>
                        <p className="bp-details-body">
                            Create savings pockets for any goal — a holiday, emergency fund, new car.
                            WealthFlow calculates exactly how much to set aside each month and
                            automatically round-ups spare change.
                        </p>

                        <div className="bp-cta-block">
                            <button className="bp-btn-primary">
                                Start budgeting free
                                <span className="bp-btn-arrow"><IconArrowRight /></span>
                            </button>
                            <p className="bp-cta-note">No credit card. Free for 30 days.</p>
                        </div>
                    </div>
                </div>

                {/* ── Feature cards ── */}
                <section className="bp-features-section">
                    <h2 className="bp-section-title">Everything you need to budget smarter</h2>
                    <p className="bp-section-sub">All the tools. None of the spreadsheets.</p>
                    <div className="bp-features-grid">
                        {features.map(f => <FeatureCard key={f.title} {...f} />)}
                    </div>
                </section>

                {/* ── CTA banner ── */}
                <section className="bp-banner">
                    <div className="bp-banner-inner">
                        <h2 className="bp-banner-title">Ready to take control?</h2>
                        <p className="bp-banner-sub">
                            Join 2 million people who've transformed their finances with WealthFlow.
                        </p>
                        <button className="bp-btn-white">
                                Get started — it's free
                            <span className="bp-btn-arrow"><IconArrowRight /></span>
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
}