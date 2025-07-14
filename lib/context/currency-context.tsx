// lib/context/currency-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSettings } from '@/lib/data';

export type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    async function loadCurrency() {
      try {
        const settings = await getSettings();
        const currencySetting = settings.find((s: any) => s.setting_key === 'currency');
        if (currencySetting?.value) setCurrency(currencySetting.value.toUpperCase());
      } catch (e) {
        // fallback to INR
      }
    }
    loadCurrency();
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
} 