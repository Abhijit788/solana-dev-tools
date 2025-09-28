// Solana network configuration
export type SolanaNetwork = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';

export const SOLANA_NETWORKS = {
  'mainnet-beta': {
    name: 'Mainnet Beta',
    url: 'https://api.mainnet-beta.solana.com',
    wsUrl: 'wss://api.mainnet-beta.solana.com',
  },
  'testnet': {
    name: 'Testnet',
    url: 'https://api.testnet.solana.com',
    wsUrl: 'wss://api.testnet.solana.com',
  },
  'devnet': {
    name: 'Devnet',
    url: 'https://api.devnet.solana.com',
    wsUrl: 'wss://api.devnet.solana.com',
  },
  'localnet': {
    name: 'Localnet',
    url: 'http://127.0.0.1:8899',
    wsUrl: 'ws://127.0.0.1:8900',
  },
} as const;

export const DEFAULT_NETWORK: SolanaNetwork = 'devnet';