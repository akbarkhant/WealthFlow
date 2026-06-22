import React, { useState, useRef } from 'react';
import AssetsDashboard from './AssetsDashboard';
import AssetTimelineChart from '../components/AssetChart';
import CreateAssetModal from '../components/AssetComponent';
import '../styles/pages/AssetsPage.css'; // Global styling rollup container imports

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'history'
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Create a tracking key counter to trigger seamless internal state updates upon modal actions
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAssetCreated = () => {
    setRefreshKey(prev => prev + 1); // Increments key trigger, instantly reloading API instances
  };

  return (
    <div className="wf-page-layout">
      
      {/* ── Page Header Controller ── */}
      <div className="wf-page-header">
        <div className="wf-page-title-block">
          <h1 className="wf-page-main-title">Assets Portfolio</h1>
          <p className="wf-page-subtitle">Centralize holdings, track alternative assets, and gauge real-time wealth generation metrics.</p>
        </div>
        <button className="wf-action-trigger-btn" onClick={() => setIsModalOpen(true)}>
          <span>+</span> Record New Asset
        </button>
      </div>

      {/* ── Tabbed View Selector Nav ── */}
      <div className="wf-tabs-container">
        <button 
          className={`wf-tab-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Portfolio Breakdown
        </button>
        <button 
          className={`wf-tab-nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historical Net Worth
        </button>
      </div>

      {/* ── Conditional Active Layout Content Injection Area ── */}
      <div className="wf-page-body-content">
        {activeTab === 'dashboard' ? (
          <AssetsDashboard key={`dash-${refreshKey}`} />
        ) : (
          <AssetTimelineChart key={`hist-${refreshKey}`} />
        )}
      </div>

      {/* ── Portal Modal Instance Overlay ── */}
      <CreateAssetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssetCreated={handleAssetCreated}
      />
    </div>
  );
}