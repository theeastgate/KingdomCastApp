import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Content, Platform, ContentType } from '../types';

interface ContentState {
  contents: Content[];
  loading: boolean;
  error: string | null;
  getContents: (churchId: string) => Promise<void>;
  createContent: (content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContent: (id: string, content: Partial<Content>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  scheduleContent: (id: string, scheduledFor: string) => Promise<void>;
}

export const useContentStore = create<ContentState>((set, get) => ({
  contents: [],
  loading: false,
  error: null,

  getContents: async (churchId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('church_id', churchId)
        .order('scheduled_for', { ascending: true });
        
      if (error) throw error;
      
      set({ contents: data as Content[], loading: false });
    } catch (error: any) {
      console.error('Error fetching contents:', error);
      set({ error: error.message, loading: false });
    }
  },

  createContent: async (content) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('contents')
        .insert({
          title: content.title,
          description: content.description,
          content_type: content.contentType,
          media_url: content.mediaUrl,
          platforms: content.platforms,
          status: content.status,
          scheduled_for: content.scheduledFor,
          author_id: content.authorId,
          church_id: content.churchId,
          hashtags: content.hashtags,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
      if (error) throw error;
      
      // Refetch contents after creation
      await get().getContents(content.churchId);
    } catch (error: any) {
      console.error('Error creating content:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateContent: async (id, content) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('contents')
        .update({
          title: content.title,
          description: content.description,
          content_type: content.contentType,
          media_url: content.mediaUrl,
          platforms: content.platforms,
          status: content.status,
          scheduled_for: content.scheduledFor,
          hashtags: content.hashtags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedContents = get().contents.map(item => 
        item.id === id ? { ...item, ...content, updatedAt: new Date().toISOString() } : item
      );
      
      set({ contents: updatedContents, loading: false });
    } catch (error: any) {
      console.error('Error updating content:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteContent: async (id) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('contents')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedContents = get().contents.filter(item => item.id !== id);
      set({ contents: updatedContents, loading: false });
    } catch (error: any) {
      console.error('Error deleting content:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  scheduleContent: async (id, scheduledFor) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('contents')
        .update({
          scheduled_for: scheduledFor,
          status: 'scheduled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedContents = get().contents.map(item => 
        item.id === id 
          ? { ...item, scheduledFor, status: 'scheduled', updatedAt: new Date().toISOString() } 
          : item
      );
      
      set({ contents: updatedContents, loading: false });
    } catch (error: any) {
      console.error('Error scheduling content:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));