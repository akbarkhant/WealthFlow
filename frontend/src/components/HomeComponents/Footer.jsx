import '../../styles/components/footer.css';

export default function Footer() {
  return (
    <footer className="footer-root">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand-info">
            <span className="footer-logo">WealthFlow</span>
            <p className="footer-desc">
              Empowering global professionals with adaptive financial infrastructure tools for micro and macro assets management.
            </p>
          </div>
          
          <div className="footer-links-grid">
            <a href="/legal/privacy">Privacy Policy</a>
            <a href="/legal/terms">Terms of Service</a>
            <a href="/legal/security">Security Core</a>
            <a href="/legal/cookies">Cookie Preferences</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} WealthFlow Financial Technologies Inc. All institutional rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}