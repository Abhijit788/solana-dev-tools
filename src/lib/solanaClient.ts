import { Connection, clusterApiUrl, Commitment } from '@solana/web3.js';
import { SolanaConnectionConfig } from '@/types';

// Alternative devnet endpoints for better reliability
const DEVNET_ENDPOINTS = [
  clusterApiUrl('devnet'),
  'https://api.devnet.solana.com',
  'https://devnet.helius-rpc.com/?api-key=demo', // Demo key for testing
];

// Default configuration for Solana connection
const DEFAULT_CONFIG: SolanaConnectionConfig = {
  endpoint: DEVNET_ENDPOINTS[0], // Primary endpoint
  commitment: 'confirmed',
};

/**
 * Create a Solana connection with configurable options
 */
export function createSolanaConnection(config?: Partial<SolanaConnectionConfig>): Connection {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return new Connection(finalConfig.endpoint, {
    commitment: finalConfig.commitment,
    wsEndpoint: finalConfig.wsEndpoint,
  });
}

/**
 * Get the default Solana connection instance
 */
export const solanaConnection = createSolanaConnection();

/**
 * Get connection for different clusters
 */
export const getClusterConnection = (cluster: 'devnet' | 'testnet' | 'mainnet-beta', commitment?: 'processed' | 'confirmed' | 'finalized') => {
  return createSolanaConnection({
    endpoint: clusterApiUrl(cluster),
    commitment: commitment || 'confirmed',
  });
};

/**
 * Check if connection is healthy
 */
export async function checkConnectionHealth(connection: Connection): Promise<boolean> {
  try {
    const slot = await connection.getSlot();
    return slot > 0;
  } catch (error) {
    console.error('Connection health check failed:', error);
    return false;
  }
}

/**
 * Get current network information
 */
export async function getNetworkInfo(connection: Connection) {
  try {
    const [slot, blockHeight, version] = await Promise.all([
      connection.getSlot(),
      connection.getBlockHeight(),
      connection.getVersion(),
    ]);

    return {
      slot,
      blockHeight,
      version,
      commitment: connection.commitment,
      rpcEndpoint: connection.rpcEndpoint,
    };
  } catch (error) {
    console.error('Failed to get network info:', error);
    throw error;
  }
}

/**
 * Format commitment level for display
 */
export function formatCommitment(commitment: Commitment): string {
  return commitment.charAt(0).toUpperCase() + commitment.slice(1);
}

/**
 * Get recommended commitment for different use cases
 */
export function getRecommendedCommitment(useCase: 'trading' | 'general' | 'monitoring'): 'processed' | 'confirmed' | 'finalized' {
  switch (useCase) {
    case 'trading':
      return 'confirmed';
    case 'general':
      return 'confirmed';
    case 'monitoring':
      return 'finalized';
    default:
      return 'confirmed';
  }
}