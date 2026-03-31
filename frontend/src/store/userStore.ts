import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Member } from '../types';
import { memberApi } from '../services/api';

interface UserState {
  currentUser: Member | null;
  isLoading: boolean;
  error: string | null;
  setCurrentUser: (user: Member | null) => void;
  login: (email: string, name: string) => Promise<Member>;
  logout: () => Promise<void>;
  loadStoredUser: () => Promise<void>;
  updateProfile: (data: Partial<Member>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  isLoading: false,
  error: null,

  setCurrentUser: (user) => set({ currentUser: user }),

  login: async (email: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      // Try to find existing user
      try {
        const response = await memberApi.getByEmail(email);
        const user = response.data;
        await AsyncStorage.setItem('userId', user.id);
        set({ currentUser: user, isLoading: false });
        return user;
      } catch {
        // User doesn't exist, create new one
        const response = await memberApi.create({ name, email });
        const user = response.data;
        await AsyncStorage.setItem('userId', user.id);
        set({ currentUser: user, isLoading: false });
        return user;
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('userId');
    set({ currentUser: null });
  },

  loadStoredUser: async () => {
    set({ isLoading: true });
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const response = await memberApi.getById(userId);
        set({ currentUser: response.data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await AsyncStorage.removeItem('userId');
      set({ currentUser: null, isLoading: false });
    }
  },

  updateProfile: async (data: Partial<Member>) => {
    const { currentUser } = get();
    if (!currentUser) return;

    set({ isLoading: true });
    try {
      const response = await memberApi.update(currentUser.id, data);
      set({ currentUser: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));
