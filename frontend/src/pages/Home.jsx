import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/HomeComponents/Navbar';
import Sections from '../components/HomeComponents/Section';
import Footer from '../components/HomeComponents/Footer';
import { checkAuthSession } from '../api/authApi'; // 💡 Create or import this endpoint wrapper

export default function Home() {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {

        const response = await checkAuthSession();
        if (response && response.authenticated) {

          navigate('/dashboard', { replace: true });
          return;
        }
      } catch (err) {
        // Safe to ignore: user just doesn't have a valid token or session expired
        console.log('No active session found, staying on landing page.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [navigate]);

  // 💡 Optional: Prevent layout flashing while checking authentication state
  if (isVerifying) {
    return (
      <div className="landing-loading-screen" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="detail-spinner" /> {/* Uses the spinner style we created earlier */}
      </div>
    );
  }

  return (
    <div className="landing-page-root">
      <Navbar />
      <Sections />
      <Footer />
    </div>
  );
}