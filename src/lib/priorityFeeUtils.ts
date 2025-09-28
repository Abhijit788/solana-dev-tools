import { Connection, PublicKey } from '@solana/web3.js';
import { createSolanaConnection } from './solanaClient';

export interface PrioritizationFee {
  slot: number;
  prioritizationFee: number;
}

export interface PriorityFeeStats {
  min: number;
  max: number;
  median: number;
  percentile75: number;
  percentile90: number;
  percentile95: number;
  average: number;
  count: number;
  recommended: number; // Our recommended fee based on 75th percentile
}

export interface PriorityFeeEstimate {
  stats: PriorityFeeStats;
  fees: PrioritizationFee[];
  timestamp: number;
}

/**
 * Fetches recent prioritization fees from the network
 */
export async function getRecentPrioritizationFees(
  connection?: Connection,
  accounts?: PublicKey[]
): Promise<PriorityFeeEstimate> {
  try {
    const conn = connection || createSolanaConnection();
    
    // Get recent prioritization fees
    // If accounts are provided, get fees for those accounts, otherwise get general fees
    const fees = accounts && accounts.length > 0 
      ? await conn.getRecentPrioritizationFees({ lockedWritableAccounts: accounts })
      : await conn.getRecentPrioritizationFees();

    if (!fees || fees.length === 0) {
      // Return default fees if none found
      return {
        stats: {
          min: 0,
          max: 1000,
          median: 100,
          percentile75: 250,
          percentile90: 500,
          percentile95: 750,
          average: 200,
          count: 0,
          recommended: 250,
        },
        fees: [],
        timestamp: Date.now(),
      };
    }

    // Extract prioritization fees and sort them
    const feeValues = fees.map(f => f.prioritizationFee).sort((a, b) => a - b);
    const count = feeValues.length;

    // Calculate statistics
    const min = feeValues[0] || 0;
    const max = feeValues[count - 1] || 0;
    const average = feeValues.reduce((sum, fee) => sum + fee, 0) / count;
    
    // Calculate percentiles
    const median = getPercentile(feeValues, 50);
    const percentile75 = getPercentile(feeValues, 75);
    const percentile90 = getPercentile(feeValues, 90);
    const percentile95 = getPercentile(feeValues, 95);
    
    // Use 75th percentile as recommended fee for good confirmation speed
    const recommended = Math.max(percentile75, 1); // At least 1 micro-lamport

    return {
      stats: {
        min,
        max,
        median,
        percentile75,
        percentile90,
        percentile95,
        average,
        count,
        recommended,
      },
      fees,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Failed to fetch prioritization fees:', error);
    
    // Return reasonable default values on error
    return {
      stats: {
        min: 0,
        max: 2000,
        median: 300,
        percentile75: 500,
        percentile90: 1000,
        percentile95: 1500,
        average: 400,
        count: 0,
        recommended: 500,
      },
      fees: [],
      timestamp: Date.now(),
    };
  }
}

/**
 * Calculate percentile from sorted array
 */
function getPercentile(sortedArray: number[], percentile: number): number {
  if (sortedArray.length === 0) return 0;
  
  const index = (percentile / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  
  if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
  if (lower < 0) return sortedArray[0];
  
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

/**
 * Calculate total transaction cost in lamports
 */
export function calculateTransactionCost(
  computeUnits: number,
  priorityFeePerUnit: number, // micro-lamports per compute unit
  baseFee: number = 5000 // base transaction fee in lamports
): number {
  const priorityFeeLamports = (computeUnits * priorityFeePerUnit) / 1_000_000;
  return baseFee + priorityFeeLamports;
}

/**
 * Convert lamports to SOL with proper formatting
 */
export function lamportsToSol(lamports: number): number {
  return lamports / 1_000_000_000;
}

/**
 * Format SOL amount for display
 */
export function formatSol(sol: number): string {
  if (sol < 0.000001) {
    return `${(sol * 1_000_000_000).toFixed(0)} lamports`;
  }
  return `${sol.toFixed(6)} SOL`;
}

/**
 * Get priority fee recommendation based on speed preference
 */
export function getPriorityFeeRecommendation(
  stats: PriorityFeeStats,
  speed: 'economy' | 'standard' | 'fast' | 'turbo'
): number {
  switch (speed) {
    case 'economy':
      return Math.max(stats.median, 1);
    case 'standard':
      return Math.max(stats.percentile75, 1);
    case 'fast':
      return Math.max(stats.percentile90, 1);
    case 'turbo':
      return Math.max(stats.percentile95, 1);
    default:
      return stats.recommended;
  }
}

/**
 * Estimate confirmation time based on priority fee
 */
export function estimateConfirmationTime(
  priorityFee: number,
  stats: PriorityFeeStats
): string {
  if (priorityFee >= stats.percentile95) {
    return '~1-2 slots (very fast)';
  } else if (priorityFee >= stats.percentile90) {
    return '~2-4 slots (fast)';
  } else if (priorityFee >= stats.percentile75) {
    return '~4-8 slots (standard)';
  } else if (priorityFee >= stats.median) {
    return '~8-16 slots (economy)';
  } else {
    return '>16 slots (slow)';
  }
}

/**
 * Check if priority fees data is stale (older than 1 minute)
 */
export function isPriorityFeeDataStale(timestamp: number): boolean {
  return Date.now() - timestamp > 60_000; // 1 minute
}