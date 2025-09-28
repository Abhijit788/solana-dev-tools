// Common TypeScript interfaces and types

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Solana-specific types
export interface SolanaAccount {
  address: string;
  balance: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
}

export interface SolanaTransaction {
  signature: string;
  slot: number;
  blockTime?: number;
  confirmationStatus: 'processed' | 'confirmed' | 'finalized';
}

// Wallet connection types
export interface WalletContextState {
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  publicKey: string | null;
  wallet: object | null;
}