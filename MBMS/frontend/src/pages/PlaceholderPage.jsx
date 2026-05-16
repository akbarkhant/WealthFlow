import React from 'react';
import PublicLayout from '../layouts/PublicLayout';

const PlaceholderPage = ({ title, description }) => {
  return (
    <PublicLayout>
      <div className="flex-grow flex flex-col items-center justify-center p-8 bg-surface-container-lowest">
        <div className="max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
            <span className="material-symbols-outlined text-[40px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>construction</span>
          </div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{title}</h1>
          <p className="font-body-lg text-secondary">{description}</p>
          <div className="pt-8">
            <div className="glass-card p-8 rounded-2xl border border-outline-variant/30 text-left">
              <h3 className="font-headline-sm text-on-surface mb-4">Coming Soon</h3>
              <p className="font-body-md text-on-surface-variant">
                We are currently building this section of WealthFlow. Please check back later for updates as we continue to expand our platform's capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PlaceholderPage;
