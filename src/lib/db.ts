import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface WeeklyProgram {
  id: string;
  title: string;
  day: string;
  time: string;
  description?: string;
  created_at?: string;
}

export interface GalleryMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  public_id: string;
  caption?: string;
  created_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  is_read: boolean;
  created_at?: string;
}

// Default Data for local storage fallback
const DEFAULT_WEEKLY_PROGRAMS: WeeklyProgram[] = [
  {
    id: 'wp-1',
    title: 'Sunday Worship Service',
    day: 'Sunday',
    time: '09:30 AM - 11:30 AM',
    description: 'Join us for a spirit-filled time of praise, worship, and the Word of God.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'wp-2',
    title: 'Wednesday Midweek Bible Study',
    day: 'Wednesday',
    time: '06:30 PM - 08:00 PM',
    description: 'Diving deep into the scriptures to strengthen our walk with God.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'wp-3',
    title: 'Friday Family Prayer Meeting',
    day: 'Friday',
    time: '07:00 PM - 08:30 PM',
    description: 'Gathering together to lift our families, church, and community in prayer.',
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_GALLERY: GalleryMedia[] = [];

const DEFAULT_MESSAGES: ContactMessage[] = [
  {
    id: 'm-1',
    name: 'Brother Thomas',
    email: 'thomas@example.com',
    phone: '+91 98765 43210',
    message: 'Hello, I would like to attend the Sunday service. Is there a Sunday school for kids?',
    is_read: false,
    created_at: new Date().toISOString(),
  },
];

// Helper to check if running in browser
const isBrowser = () => typeof window !== 'undefined';

// LocalStorage Helper
const getLocalData = <T>(key: string, defaultValue: T[]): T[] => {
  if (!isBrowser()) return defaultValue;
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
};

const setLocalData = <T>(key: string, data: T[]) => {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Database Service
export const db = {
  // --- Weekly Programs ---
  async getWeeklyPrograms(): Promise<WeeklyProgram[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('weekly_programs')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data) return data;
      console.error('Supabase getWeeklyPrograms error, falling back:', error);
    }
    return getLocalData<WeeklyProgram>('olive_weekly_programs', DEFAULT_WEEKLY_PROGRAMS);
  },

  async addWeeklyProgram(program: Omit<WeeklyProgram, 'id' | 'created_at'>): Promise<WeeklyProgram> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('weekly_programs')
        .insert([program])
        .select()
        .single();
      if (!error && data) return data;
      console.error('Supabase addWeeklyProgram error, falling back:', error);
    }
    
    const local = getLocalData<WeeklyProgram>('olive_weekly_programs', DEFAULT_WEEKLY_PROGRAMS);
    const newProgram: WeeklyProgram = {
      ...program,
      id: `wp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    local.push(newProgram);
    setLocalData('olive_weekly_programs', local);
    return newProgram;
  },

  async updateWeeklyProgram(id: string, program: Partial<Omit<WeeklyProgram, 'id' | 'created_at'>>): Promise<WeeklyProgram | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('weekly_programs')
        .update(program)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
      console.error('Supabase updateWeeklyProgram error, falling back:', error);
    }

    const local = getLocalData<WeeklyProgram>('olive_weekly_programs', DEFAULT_WEEKLY_PROGRAMS);
    const idx = local.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated = { ...local[idx], ...program };
    local[idx] = updated;
    setLocalData('olive_weekly_programs', local);
    return updated;
  },

  async deleteWeeklyProgram(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('weekly_programs')
        .delete()
        .eq('id', id);
      if (!error) return true;
      console.error('Supabase deleteWeeklyProgram error, falling back:', error);
    }

    const local = getLocalData<WeeklyProgram>('olive_weekly_programs', DEFAULT_WEEKLY_PROGRAMS);
    const filtered = local.filter(p => p.id !== id);
    setLocalData('olive_weekly_programs', filtered);
    return true;
  },

  // --- Gallery Media ---
  async getGalleryMedia(): Promise<GalleryMedia[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('gallery_media')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
      console.error('Supabase getGalleryMedia error, falling back:', error);
    }
    return getLocalData<GalleryMedia>('olive_gallery_media', DEFAULT_GALLERY);
  },

  async addGalleryMedia(media: Omit<GalleryMedia, 'id' | 'created_at'>): Promise<GalleryMedia> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('gallery_media')
        .insert([media])
        .select()
        .single();
      if (!error && data) return data;
      console.error('Supabase addGalleryMedia error, falling back:', error);
    }

    const local = getLocalData<GalleryMedia>('olive_gallery_media', DEFAULT_GALLERY);
    const newItem: GalleryMedia = {
      ...media,
      id: `g-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    local.unshift(newItem); // newest first
    setLocalData('olive_gallery_media', local);
    return newItem;
  },

  async deleteGalleryMedia(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('gallery_media')
        .delete()
        .eq('id', id);
      if (!error) return true;
      console.error('Supabase deleteGalleryMedia error, falling back:', error);
    }

    const local = getLocalData<GalleryMedia>('olive_gallery_media', DEFAULT_GALLERY);
    const filtered = local.filter(item => item.id !== id);
    setLocalData('olive_gallery_media', filtered);
    return true;
  },

  // --- Contact Messages ---
  async getContactMessages(): Promise<ContactMessage[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
      console.error('Supabase getContactMessages error, falling back:', error);
    }
    return getLocalData<ContactMessage>('olive_contact_messages', DEFAULT_MESSAGES);
  },

  async addContactMessage(message: Omit<ContactMessage, 'id' | 'is_read' | 'created_at'>): Promise<ContactMessage> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{ ...message, is_read: false }])
        .select()
        .single();
      if (!error && data) return data;
      console.error('Supabase addContactMessage error, falling back:', error);
    }

    const local = getLocalData<ContactMessage>('olive_contact_messages', DEFAULT_MESSAGES);
    const newMessage: ContactMessage = {
      ...message,
      id: `m-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    local.unshift(newMessage);
    setLocalData('olive_contact_messages', local);
    return newMessage;
  },

  async markMessageRead(id: string, is_read: boolean = true): Promise<ContactMessage | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('contact_messages')
        .update({ is_read })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
      console.error('Supabase markMessageRead error, falling back:', error);
    }

    const local = getLocalData<ContactMessage>('olive_contact_messages', DEFAULT_MESSAGES);
    const idx = local.findIndex(m => m.id === id);
    if (idx === -1) return null;
    const updated = { ...local[idx], is_read };
    local[idx] = updated;
    setLocalData('olive_contact_messages', local);
    return updated;
  },

  async deleteMessage(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);
      if (!error) return true;
      console.error('Supabase deleteMessage error, falling back:', error);
    }

    const local = getLocalData<ContactMessage>('olive_contact_messages', DEFAULT_MESSAGES);
    const filtered = local.filter(m => m.id !== id);
    setLocalData('olive_contact_messages', filtered);
    return true;
  },
};
