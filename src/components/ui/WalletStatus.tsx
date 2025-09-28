'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function WalletStatus() {
  const { wallet, connected, connecting } = useWallet();

  if (connecting) {
    return (
      <div className="flex items-center space-x-2 text-sm text-yellow-600">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>
        <span>Connecting...</span>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="text-sm text-gray-500">
        No wallet selected
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="text-sm text-red-500">
        {wallet.adapter.name} not connected
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-green-600">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span>{wallet.adapter.name} connected</span>
    </div>
  );
}