import React, { useState, useEffect } from 'react';
import '../styles/pages/UpcomingFeatures.css';

export default function UpcomingFeatures() {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                // 1. Detect if the app is running locally or in production
                const API_BASE = import.meta.env.DEV
                    ? 'http://localhost:5000'
                    : 'https://your-production-backend-url.com'; // Swap this with your live Render/Railway URL later

                // 2. Pass the absolute URL to your fetch sequence
                const res = await fetch(`${API_BASE}/api/features`);
                if (!res.ok) throw new Error('Failed to load project roadmap records.');
                const json = await res.json();
                setFeatures(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatures();
    }, []);

    return (
        <div className="uf-container">
            <header className="uf-header">
                <span className="uf-badge">Live System Roadmap</span>
                <h1 className="uf-title">Upcoming System Features</h1>
                <p className="uf-subtitle">
                    Track our modular application architecture pipeline real-time. Shifting continuously from system engineering to deployment.
                </p>
            </header>

            {loading && (
                <div className="uf-loader-container">
                    <div className="uf-spinner" />
                    <p>Syncing live system records...</p>
                </div>
            )}

            {error && <div className="uf-error-banner">⚠️ Error: {error}</div>}

            {!loading && !error && (
                <div className="uf-grid">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className={`uf-card glass-card ${hoveredCard === feature.id ? 'uf-card--active' : ''}`}
                            onMouseEnter={() => setHoveredCard(feature.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className="uf-card-top">
                                <div className="uf-icon-wrapper">
                                    <span>{feature.icon || '🛠️'}</span>
                                </div>
                                <span className="uf-card-category">{feature.category}</span>
                            </div>

                            <h3 className="uf-card-title">{feature.title}</h3>
                            <p className="uf-card-desc">{feature.description}</p>

                            <div className="uf-progress-container">
                                <div className="uf-progress-meta">
                                    <span className="uf-status-text">{feature.status}</span>
                                    <span className="uf-percentage">{feature.progress}%</span>
                                </div>
                                <div className="uf-progress-track">
                                    <div
                                        className="uf-progress-bar"
                                        style={{ width: `${feature.progress}%` }}
                                    />
                                </div>
                            </div>
                            <div className="uf-card-glow" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}