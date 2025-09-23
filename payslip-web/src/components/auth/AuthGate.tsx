import React, { useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../supabaseClient';

interface Profile {
  id: string;
  active?: boolean;
  status?: 'active' | 'inactive' | 'pending';
  // Add other profile fields as needed
}

interface AuthGateProps {
  children: ReactNode;
  fallbackPath?: string;
  requireActive?: boolean;
  showSpinner?: boolean;
  onRedirect?: () => void;
}

const AuthGate: React.FC<AuthGateProps> = ({
  children,
  fallbackPath = '/login',
  requireActive = true,
  showSpinner = true,
  onRedirect
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Check if user has valid session and profile
  const checkAuth = async (): Promise<boolean> => {
    try {
      console.log('🔍 AuthGate: Starting authentication check...');

      // Step 1: Check for existing session
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        return false;
      }

      // Step 2: If no session, try to refresh
      if (!session) {
        console.log('⚠️ No session found, attempting refresh...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError) {
          console.warn('⚠️ Session refresh failed:', refreshError.message);
          return false;
        }

        session = refreshData?.session;

        if (!session) {
          console.log('❌ No session after refresh attempt');
          return false;
        }

        console.log('✅ Session refreshed successfully');
      } else {
        console.log('✅ Valid session found');
      }

      const currentUser = session.user;
      setUser(currentUser);

      // Step 3: Check user profile in database
      console.log('🔍 Checking user profile...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('❌ Profile query error:', profileError);

        // If profile doesn't exist, sign out and redirect
        if (profileError.code === 'PGRST116') { // No rows returned
          console.log('❌ No profile found for user, signing out...');
          await signOutAndRedirect();
          return false;
        }

        // For other errors, also sign out for security
        console.log('❌ Profile error, signing out for security...');
        await signOutAndRedirect();
        return false;
      }

      if (!profileData) {
        console.log('❌ No profile data found, signing out...');
        await signOutAndRedirect();
        return false;
      }

      setProfile(profileData);

      // Step 4: Check if profile is active (if required)
      if (requireActive) {
        const isActive = profileData.active === true || profileData.status === 'active';

        if (!isActive) {
          console.log('❌ User profile is not active, signing out...');
          await signOutAndRedirect();
          return false;
        }
      }

      console.log('✅ Authentication successful:', {
        user: currentUser.email,
        profile: profileData.active || profileData.status || 'active'
      });

      return true;

    } catch (error) {
      console.error('❌ Auth check failed:', error);
      return false;
    }
  };

  // Sign out and redirect
  const signOutAndRedirect = async () => {
    try {
      await supabase.auth.signOut();
      console.log('🚪 User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      if (onRedirect) {
        onRedirect();
      }
    }
  };

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      const isValid = await checkAuth();
      setIsAuthenticated(isValid);

      if (!isValid && isAuthenticated !== false) {
        // Only redirect if this is the first failed check
        if (onRedirect) {
          onRedirect();
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, [fallbackPath, requireActive, onRedirect]);

  // Set up auth state change listener
  useEffect(() => {
    console.log('🔄 Setting up auth state listener...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);

        switch (event) {
          case 'SIGNED_OUT':
            console.log('🚪 User signed out, redirecting...');
            setIsAuthenticated(false);
            setUser(null);
            setProfile(null);
            if (onRedirect) {
              onRedirect();
            }
            break;

          case 'SIGNED_IN':
            console.log('🔑 User signed in, verifying...');
            setIsLoading(true);
            const isValid = await checkAuth();
            setIsAuthenticated(isValid);
            setIsLoading(false);

            if (!isValid) {
              if (onRedirect) {
                onRedirect();
              }
            }
            break;

          case 'TOKEN_REFRESHED':
            console.log('🔄 Token refreshed');
            // Session is still valid, just refreshed
            break;

          case 'INITIAL_SESSION':
            // Initial session is handled in the main useEffect
            console.log('📋 Initial session processed');
            break;

          default:
            console.log('🔄 Other auth event:', event);
        }
      }
    );

    return () => {
      console.log('🔄 Cleaning up auth listener...');
      subscription.unsubscribe();
    };
  }, [fallbackPath, requireActive, onRedirect]);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        borderTop: '4px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px'
      }} />
      <div style={{ fontSize: '18px', fontWeight: '600' }}>
        Authenticating...
      </div>
      <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>
        Please wait while we verify your credentials
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Show loading state
  if (isLoading) {
    return showSpinner ? <LoadingSpinner /> : null;
  }

  // Show children only if authenticated
  if (isAuthenticated === true) {
    return <>{children}</>;
  }

  // Show nothing while redirecting
  return null;
};

export default AuthGate;
export type { Profile };