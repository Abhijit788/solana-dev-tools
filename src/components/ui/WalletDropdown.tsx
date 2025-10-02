'use client';

import React, { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '../../hooks/use-toast';

export default function WalletDropdown() {
  const [mounted, setMounted] = useState(false);
  const { connected, publicKey, connecting, disconnecting } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (connected && publicKey && mounted) {
      toast({
        title: "Wallet Connected",
        description: `Connected to ${publicKey.toString().slice(0, 8)}...`,
        variant: "success",
      });
    }
  }, [connected, publicKey, mounted, toast]);

  if (!mounted) {
    return (
      <div className="flex space-x-2">
        <button 
          className="px-4 py-2 bg-muted text-muted-foreground rounded-md text-sm"
          aria-label="Loading wallet"
          disabled
        >
          Loading...
        </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      <WalletMultiButton 
        className="!bg-primary hover:!bg-primary/90 !rounded-md !text-sm !px-4 !py-2 !text-primary-foreground !transition-colors"
        aria-label={connected ? `Wallet connected: ${publicKey?.toString().slice(0, 8)}...` : "Connect wallet"}  
      />
    </div>
  );
}