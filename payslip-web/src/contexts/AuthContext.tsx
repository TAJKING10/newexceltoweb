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

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      // Add timeout to prevent hanging profile fetch
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
      });
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

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
    console.log('Local auth mode - creating mock session');
    
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Accept any email/password for development
    const mockUser = {
      id: 'local-user-123',
      email: email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Check if this is the admin email
    const isAdminEmail = email === 'toufic-jandah@hotmail.com';
    
    const mockProfile: Profile = {
      id: 'local-user-123',
      email: email,
      full_name: isAdminEmail ? 'Toufic Jandah (Admin)' : 'Regular User',
      role: isAdminEmail ? 'admin' : 'employee',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Set the user and profile immediately
    setUser(mockUser as any);
    setProfile(mockProfile);
    setSession({ user: mockUser } as any);
    
    return { error: null };
  };

  const signOut = async () => {
    console.log('Local auth mode - clearing session');
    
    // Clear local session immediately
    setUser(null);
    setProfile(null);
    setSession(null);
    
    return { error: null };
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

    const initializeAuth = async () => {
      console.log('Initializing local auth mode (Supabase disabled)');
      
      // Skip Supabase entirely for development
      if (mounted) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };

    initializeAuth();

    // Disable Supabase auth state listener for development
    return () => {
      mounted = false;
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