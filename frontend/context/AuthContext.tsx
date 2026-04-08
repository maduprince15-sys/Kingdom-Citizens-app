import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://kingdom-citizens.preview.emergentagent.com/api';

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  group_ids: string[];
  profile_image?: string;
  bio?: string;
  created_at: string;
}

interface AuthContextType {
  member: Member | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateMember: (updated: Member) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadStoredAuth(); }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedMember = await AsyncStorage.getItem('auth_member');
      if (storedToken && storedMember) {
        setToken(storedToken);
        setMember(JSON.parse(storedMember));
        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          if (res.ok) {
            const fresh = await res.json();
            setMember(fresh);
            await AsyncStorage.setItem('auth_member', JSON.stringify(fresh));
          } else {
            await clearAuth();
          }
        } catch {
          await clearAuth();
        }
      }
    } catch (e) {
      console.error('Auth load error:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function clearAuth() {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_member');
    setToken(null);
    setMember(null);
  }

  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    await AsyncStorage.setItem('auth_token', data.token);
    await AsyncStorage.setItem('auth_member', JSON.stringify(data.member));
    setToken(data.token);
    setMember(data.member);
  }

  async function register(name: string, email: string, password: string, phone?: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    await AsyncStorage.setItem('auth_token', data.token);
    await AsyncStorage.setItem('auth_member', JSON.stringify(data.member));
    setToken(data.token);
    setMember(data.member);
  }

  async function logout() {
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch {}
    await clearAuth();
  }

  function updateMember(updated: Member) {
    setMember(updated);
    AsyncStorage.setItem('auth_member', JSON.stringify(updated));
  }

  const isAdmin = member?.role === 'admin' || member?.role === 'leader';

  return (
    <AuthContext.Provider value={{ member, token, isLoading, isAdmin, login, register, logout, updateMember }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
