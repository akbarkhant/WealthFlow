import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../api/userApi';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const finishOAuthFlow = async () => {
      try {
        // ✅ Backend has already set HttpOnly cookies during redirect
        // Now fetch user data to verify authentication and populate context
        const userData = await getMe();
        
        const user = userData?.user || userData?.data?.user || userData;

        if (user && user.id) {
          // ✅ Pass only user object (tokens are in HttpOnly cookies)
          login(user);
          navigate('/dashboard', { replace: true });
        } else {
          throw new Error('OAuth succeeded but user data is missing');
        }
      } catch (error) {
        console.error('OAuth callback failed:', error);
        navigate('/login?error=oauth_failed', { replace: true });
      }
    };

    finishOAuthFlow();
  }, [login, navigate]);

  return (
    <div className="auth-loading-screen">
      <div className="auth-loading-spinner" />
      <p>Completing sign in...</p>
    </div>
  );
};

export default OAuthCallback;
