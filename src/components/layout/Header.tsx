'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { truncateAddress } from '@/lib/utils';
import { useWalletBalance } from '@/hooks';
import WalletDropdown from '@/components/ui/WalletDropdown';

export default function Header() {
  const { publicKey, connected } = useWallet();
  const { balance, loading } = useWalletBalance();

  return (
    <header className="bg-gray-800 shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">
              Solana Dev Tool
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {connected && publicKey && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">Address:</span>
                  <span className="text-sm font-mono bg-gray-700 px-2 py-1 rounded text-gray-200">
                    {truncateAddress(publicKey.toString(), 4)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">Balance:</span>
                  <span className="text-sm font-mono bg-blue-900 px-2 py-1 rounded text-blue-300">
                    {loading ? '...' : balance !== null ? `${balance.toFixed(4)} SOL` : '0 SOL'}
                  </span>
                </div>
              </div>
            )}
            
            <nav className="flex space-x-8">
              {/* Navigation items will be added here */}
            </nav>
            
            <div className="wallet-adapter-button-wrapper">
              <WalletDropdown />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}