import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'employee';
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isActive: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializationComplete, setInitializationComplete] = useState(false);

  // Clear all auth data - no persistence across browser sessions
  const clearAuthCache = () => {
    try {
      localStorage.removeItem('payslip_auth_cache');
      sessionStorage.removeItem('payslip_session_cache');
    } catch (error) {
      console.warn('Failed to clear auth cache:', error);
    }
  };

  // Save to sessionStorage only - clears when browser closes
  const saveSessionCache = (userData: User, profileData: Profile) => {
    try {
      const cache = {
        user: userData,
        profile: profileData,
        timestamp: Date.now(),
      };
      sessionStorage.setItem('payslip_session_cache', JSON.stringify(cache));
      console.log('💾 Session cache saved (browser session only)');
    } catch (error) {
      console.warn('Failed to save session cache:', error);
    }
  };

  const loadSessionCache = (): { user: User; profile: Profile } | null => {
    try {
      const cached = sessionStorage.getItem('payslip_session_cache');
      if (!cached) {
        console.log('📋 No session cache found - fresh start');
        return null;
      }

      const cache = JSON.parse(cached);
      console.log('📋 Session cache loaded (same browser session)');
      return { user: cache.user, profile: cache.profile };
    } catch (error) {
      console.warn('Failed to load session cache:', error);
      sessionStorage.removeItem('payslip_session_cache');
      return null;
    }
  };

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      clearAuthCache();
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      console.log('🔄 Initializing authentication...');

      // Emergency timeout - always resolve within 5 seconds maximum
      initTimeout = setTimeout(() => {
        if (mounted) {
          console.warn('⚠️ Auth initialization timed out - forcing completion');
          const cached = loadSessionCache();
          if (cached) {
            console.log('📋 Using session cached auth data due to timeout');
            setUser(cached.user);
            setProfile(cached.profile);
          } else {
            console.log('📋 No session cache available, continuing without user');
          }
          setLoading(false);
          setInitializationComplete(true);
        }
      }, 5000); // Reduced to 5 seconds to prevent infinite loading

      try {
        // Try session cached data first for instant loading (same browser session only)
        const cached = loadSessionCache();
        if (cached) {
          console.log('⚡ Using session cached auth data for instant load');
          setUser(cached.user);
          setProfile(cached.profile);
        }

        // Get current session with reduced timeout
        let session = null;
        try {
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Session fetch timeout')), 3000) // Reduced to 3 seconds
          );

          const { data: { session: fetchedSession } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
          session = fetchedSession;
        } catch (error) {
          console.warn('⚠️ Session fetch failed - no session available:', error);
          // Clear any cached data and force fresh login
          clearAuthCache();
          session = null;
        }

        if (!mounted) return;

        console.log('📱 Session status:', session ? 'Active' : 'None');

        setSession(session);

        if (session?.user) {
          setUser(session.user);
          console.log('👤 Loading user profile...');

          // Only fetch profile if we don't already have it or if the user ID changed
          const needsProfileFetch = !profile || profile.id !== session.user.id;

          if (needsProfileFetch) {
            try {
              const profileData = await Promise.race([
                fetchProfile(session.user.id),
                new Promise<null>((_, reject) =>
                  setTimeout(() => reject(new Error('Profile fetch timeout')), 1500) // Reduced timeout
                )
              ]);

              if (mounted && profileData) {
                setProfile(profileData);
                console.log('✅ Profile loaded:', profileData.role, profileData.status);

                // Save to session cache for this browser session only
                saveSessionCache(session.user, profileData);

                // Update last login in background (don't block)
                updateLastLogin(session.user.id).catch(console.warn);
              }
            } catch (profileError) {
              console.warn('⚠️ Profile fetch failed, using cached data:', profileError);
              // If we have cached profile for the same user, keep using it
              if (cached && cached.profile.id === session.user.id) {
                setProfile(cached.profile);
                console.log('📋 Using cached profile data');
              } else {
                console.error('❌ No valid profile data available');
                setUser(null);
                setProfile(null);
                clearAuthCache();
              }
            }
          } else {
            console.log('✅ Using existing profile data');
          }
        } else {
          // No session - clear everything
          setUser(null);
          setProfile(null);
          clearAuthCache();
          console.log('❌ No active session');
        }

      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        if (mounted) {
          // Clear all auth state on error - force fresh login
          setUser(null);
          setProfile(null);
          setSession(null);
          clearAuthCache();
        }
      } finally {
        if (mounted) {
          clearTimeout(initTimeout);
          setLoading(false);
          setInitializationComplete(true);
          console.log('✅ Auth initialization complete');
        }
      }
    };

    // Start initialization immediately
    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔄 Auth state changed:', event, session?.user?.email || 'no-user');

        // Handle different auth events
        if (event === 'INITIAL_SESSION') {
          // Process initial session to ensure proper state restoration
          console.log('📋 Processing initial session');

          if (session?.user && !user) {
            // Only process if we haven't already set the user
            console.log('👤 Setting user from initial session');
            setSession(session);
            setUser(session.user);

            // Load profile if not already loaded
            if (!profile) {
              try {
                const profileData = await fetchProfile(session.user.id);
                if (mounted && profileData) {
                  setProfile(profileData);
                  saveSessionCache(session.user, profileData);
                  updateLastLogin(session.user.id).catch(console.warn);
                }
              } catch (error) {
                console.error('Error loading profile from initial session:', error);
              }
            }
          }
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          // User actively signed in - show loading and fetch profile
          console.log('🔑 User signed in - loading profile');
          setLoading(true);
          setSession(session);
          setUser(session.user);

          if (session?.user) {
            try {
              const profileData = await fetchProfile(session.user.id);
              if (mounted && profileData) {
                setProfile(profileData);
                saveSessionCache(session.user, profileData);
                updateLastLogin(session.user.id).catch(console.warn);
              }
            } catch (error) {
              console.error('Error loading profile after sign in:', error);
              setProfile(null);
            } finally {
              if (mounted) {
                setLoading(false);
              }
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          console.log('👋 User signed out');
          setSession(null);
          setUser(null);
          setProfile(null);
          clearAuthCache();
        } else if (event === 'TOKEN_REFRESHED') {
          // Token refreshed - just update session, don't show loading
          console.log('🔄 Token refreshed');
          setSession(session);
          setUser(session?.user ?? null);
          // Profile should remain the same, no need to refetch
        } else {
          // Other events - just update session state
          console.log('📱 Auth state update:', event);
          setSession(session);
          setUser(session?.user ?? null);

          if (!session) {
            setProfile(null);
            clearAuthCache();
          }
        }
      }
    );

    return () => {
      mounted = false;
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = profile?.role === 'admin' && profile?.status === 'active';
  const isActive = profile?.status === 'active';

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isAdmin,
    isActive,
    signIn,
    signOut,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};