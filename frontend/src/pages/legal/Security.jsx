// src/pages/legal/Terms.jsx
import React from 'react';
import '../../styles/legal.css';

const Security = () => {
  return (
    <div className="legal-page">
      <nav className="legal-nav">
        <Link to="/login">← Back</Link>
      </nav>
      <article className="legal-article">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: May 29, 2026</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>[Template Placeholder: By accessing WealthFlow, you agree to these terms...]</p>
        
        <h2>2. Service Usage</h2>
        <p>[Template Placeholder: You are responsible for maintaining your account security...]</p>
        
        <h2>3. Financial Disclaimer</h2>
        <p>[Template Placeholder: WealthFlow provides data tracking and analytics. We are not financial advisors...]</p>
      </article>
    </div>
  );
};

export default Security;