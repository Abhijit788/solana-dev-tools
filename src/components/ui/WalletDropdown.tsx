'use client';

import React, { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function WalletDropdown() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex space-x-2">
        <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md text-sm">
          Loading...
        </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !rounded-md !text-sm !px-4 !py-2" />
    </div>
  );
}