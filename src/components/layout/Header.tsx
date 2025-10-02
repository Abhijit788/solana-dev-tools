'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { truncateAddress } from '@/lib/utils';
import { useWalletBalance } from '@/hooks';
import WalletDropdown from '@/components/ui/WalletDropdown';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { publicKey, connected } = useWallet();
  const { balance, loading } = useWalletBalance();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gray-800 border-b border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Solana Dev Tool
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Desktop wallet info */}
            {connected && publicKey && (
              <div className="hidden lg:flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Address:</span>
                  <span className="text-sm font-mono bg-gray-700 px-2 py-1 rounded text-gray-300">
                    {truncateAddress(publicKey.toString(), 4)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Balance:</span>
                  <span className="text-sm font-mono bg-blue-900 px-2 py-1 rounded text-blue-300">
                    {loading ? '...' : balance !== null ? `${balance.toFixed(4)} SOL` : '0 SOL'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Desktop controls */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="wallet-adapter-button-wrapper">
                <WalletDropdown />
              </div>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 bg-gray-800/95 backdrop-blur">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile wallet info */}
              {connected && publicKey && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Address:</span>
                    <span className="text-sm font-mono bg-gray-700 px-2 py-1 rounded text-gray-300">
                      {truncateAddress(publicKey.toString(), 4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Balance:</span>
                    <span className="text-sm font-mono bg-blue-900 px-2 py-1 rounded text-blue-300">
                      {loading ? '...' : balance !== null ? `${balance.toFixed(4)} SOL` : '0 SOL'}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Mobile controls */}
              <div className="flex justify-center pt-2 border-t">
                <div className="wallet-adapter-button-wrapper">
                  <WalletDropdown />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}