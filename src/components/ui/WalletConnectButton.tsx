'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';

export default function WalletConnectButton() {
  const { wallet, connect, connecting, connected, disconnect, disconnecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleClick = async () => {
    try {
      setIsConnecting(true);
      
      if (connected) {
        await disconnect();
      } else if (wallet) {
        await connect();
      } else {
        setVisible(true);
      }
    } catch (error: unknown) {
      console.error('Wallet connection error:', error);
      
      // Handle specific errors
      const walletError = error as { name?: string; message?: string };
      if (walletError.name === 'WalletNotReadyError') {
        // Open wallet installation page if wallet not found
        if (walletError.message?.includes('Phantom')) {
          window.open('https://phantom.app/', '_blank');
        } else if (walletError.message?.includes('Solflare')) {
          window.open('https://solflare.com/', '_blank');
        } else {
          setVisible(true);
        }
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const getButtonText = () => {
    if (connecting || disconnecting || isConnecting) {
      return 'Connecting...';
    }
    if (connected) {
      return 'Disconnect';
    }
    if (wallet) {
      return `Connect ${wallet.adapter.name}`;
    }
    return 'Select Wallet';
  };

  return (
    <Button 
      onClick={handleClick}
      disabled={connecting || disconnecting || isConnecting}
      variant={connected ? "outline" : "default"}
      className="wallet-adapter-button"
    >
      {getButtonText()}
    </Button>
  );
}