'use client';

import React, { useMemo, useCallback } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter, CoinbaseWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletError, WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Import default styles (needed for wallet modal)
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: React.ReactNode;
}

export default function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  // Use devnet for development
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);

  // Initialize supported wallets with better configuration
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network: WalletAdapterNetwork.Devnet }),
      new CoinbaseWalletAdapter(),
    ],
    []
  );

  // Error handler for wallet connection issues
  const onError = useCallback((error: WalletError) => {
    console.error('Wallet error:', error);
    
    // Handle specific error types
    if (error.name === 'WalletNotReadyError') {
      console.warn('Wallet not ready. Make sure your wallet extension is installed and unlocked.');
    } else if (error.name === 'WalletConnectionError') {
      console.warn('Failed to connect to wallet. Please try again.');
    } else if (error.name === 'WalletDisconnectedError') {
      console.warn('Wallet disconnected.');
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        onError={onError}
        autoConnect={false}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}