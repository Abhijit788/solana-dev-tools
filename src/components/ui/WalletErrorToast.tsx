'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface Toast {
  id: string;
  message: string;
  type: 'error' | 'success' | 'warning';
}

export default function WalletErrorToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { wallet, connected, connecting } = useWallet();

  // Auto-remove toasts after 5 seconds
  useEffect(() => {
    toasts.forEach(toast => {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 5000);
    });
  }, [toasts]);

  const addToast = (message: string, type: Toast['type'] = 'error') => {
    const toast: Toast = {
      id: Date.now().toString(),
      message,
      type
    };
    setToasts(prev => [...prev, toast]);
  };

  // Listen for wallet connection changes
  useEffect(() => {
    if (wallet && !connected && !connecting) {
      // Wallet failed to connect
      addToast(`Failed to connect to ${wallet.adapter.name}. Make sure it's installed and unlocked.`, 'error');
    } else if (wallet && connected) {
      // Successfully connected
      addToast(`Successfully connected to ${wallet.adapter.name}!`, 'success');
    }
  }, [wallet, connected, connecting]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg max-w-sm ${
            toast.type === 'error' 
              ? 'bg-red-50 border border-red-200 text-red-800'
              : toast.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}