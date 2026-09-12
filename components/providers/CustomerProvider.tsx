'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CustomerUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  tier?: string;
  created_at?: string;
}

interface CustomerContextType {
  customer: CustomerUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { full_name: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { full_name: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshCustomer: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCustomer = async () => {
    try {
      const res = await fetch('/api/auth/customer/me');
      if (res.ok) {
        const data = await res.json();
        setCustomer(data.customer || null);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCustomer();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setCustomer(data.customer);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network or server error' };
    }
  };

  const register = async (formData: { full_name: string; email: string; password: string; phone?: string }) => {
    try {
      const res = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setCustomer(data.customer);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network or server error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/customer/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setCustomer(null);
  };

  const updateProfile = async (formData: { full_name: string; phone?: string }) => {
    try {
      const res = await fetch('/api/auth/customer/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Update failed' };
      }
      setCustomer(data.customer);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error updating profile' };
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
