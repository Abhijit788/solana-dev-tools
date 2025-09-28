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

// Enhanced Solana transaction and compute unit types
export interface ComputeUnitUsage {
  instructionIndex: number;
  instructionName: string;
  computeUnitsConsumed: number;
}

export interface TransactionDetails {
  signature: string;
  slot: number;
  blockTime: number | null;
  err: unknown;
  fee: number;
  totalComputeUnits: number;
  computeUnitUsage: ComputeUnitUsage[];
  status: 'success' | 'failed' | 'pending';
  timestamp: Date;
}

export interface WalletTransactionHistory {
  publicKey: string;
  transactions: TransactionDetails[];
  isLoading: boolean;
  error: string | null;
  refresh?: () => void;
}

export interface SolanaConnectionConfig {
  endpoint: string;
  commitment: 'processed' | 'confirmed' | 'finalized';
  wsEndpoint?: string;
}

export interface ComputeBudgetInstruction {
  programId: string;
  accounts: string[];
  data: string;
  computeUnitLimit?: number;
  computeUnitPrice?: number;
}

export interface TransactionFeeInfo {
  fee: number;
  feeCalculator?: {
    lamportsPerSignature: number;
  };
  priorityFee?: number;
  computeUnitPrice?: number;
}

export interface TransactionMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalComputeUnits: number;
  totalFees: number;
  averageComputeUnits: number;
  averageFee: number;
}