'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { truncateAddress } from '@/lib/utils';
import { useWalletBalance } from '@/hooks';
import WalletConnectButton from '@/components/ui/WalletConnectButton';

export default function Header() {
  const { publicKey, connected } = useWallet();
  const { balance, loading } = useWalletBalance();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Solana Dev Tool
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {connected && publicKey && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {truncateAddress(publicKey.toString(), 4)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Balance:</span>
                  <span className="text-sm font-mono bg-blue-50 px-2 py-1 rounded text-blue-700">
                    {loading ? '...' : balance !== null ? `${balance.toFixed(4)} SOL` : '0 SOL'}
                  </span>
                </div>
              </div>
            )}
            
            <nav className="flex space-x-8">
              {/* Navigation items will be added here */}
            </nav>
            
            <div className="wallet-adapter-button-wrapper">
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}