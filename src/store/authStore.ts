import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, churchId: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  
  clearError: () => set({ error: null }),

  getUser: async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      
      if (!authUser) {
        set({ user: null, loading: false, error: null });
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (userError) {
        // Handle case where no user profile exists yet
        if (userError.code === 'PGRST116') {
          set({ user: null, loading: false, error: null });
          return;
        }
        throw userError;
      }

      // Handle case where query succeeded but no data was returned
      if (!userData) {
        set({ user: null, loading: false, error: null });
        return;
      }

      set({ 
        user: {
          id: userData.id,
          email: userData.email,
          firstname: userData.first_name,
          lastname: userData.last_name,
          churchId: userData.church_id,
          role: userData.role,
          avatarUrl: userData.avatar_url,
          createdAt: userData.created_at
        } as User,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error fetching user:', error);
      set({ 
        user: null, 
        loading: false,
        error: error.message || 'Failed to fetch user data'
      });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) throw signInError;
      if (!data.user) throw new Error('No user returned after sign in');

      await get().getUser();
    } catch (error: any) {
      set({ 
        user: null,
        loading: false,
        error: error.message || 'Failed to sign in'
      });
      throw error;
    }
  },

  signUp: async (email, password, firstName, lastName, churchId) => {
    try {
      set({ loading: true, error: null });
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned after sign up');

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          first_name: firstName,
          last_name: lastName,
          church_id: churchId,
          role: 'viewer',
        });
          
      if (profileError) throw profileError;

      await get().getUser();
    } catch (error: any) {
      set({ 
        user: null,
        loading: false,
        error: error.message || 'Failed to create account'
      });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ 
        user: null, 
        loading: false,
        error: null
      });
    } catch (error: any) {
      set({ 
        loading: false,
        error: error.message || 'Failed to sign out'
      });
      throw error;
    }
  },
}));

// Initialize auth state
supabase.auth.onAuthStateChange(async (event) => {
  if (event === 'SIGNED_IN') {
    useAuthStore.getState().getUser();
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ 
      user: null, 
      loading: false,
      error: null
    });
  }
});