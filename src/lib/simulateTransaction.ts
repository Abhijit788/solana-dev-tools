import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { createSolanaConnection } from './solanaClient';

export interface SimulationConfig {
  computeUnitLimit: number;
  computeUnitPrice?: number; // micro-lamports per compute unit
}

export interface SimulationResult {
  success: boolean;
  unitsConsumed?: number;
  error?: string;
  logs?: string[];
  fee?: number; // in lamports
  warnings?: string[];
}

/**
 * Builds a simple transaction with compute budget instructions for simulation
 */
export async function buildSimulationTransaction(
  wallet: PublicKey,
  config: SimulationConfig
): Promise<Transaction> {
  const transaction = new Transaction();

  // Add compute budget instruction to set compute unit limit
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: config.computeUnitLimit,
    })
  );

  // Add compute unit price instruction if specified
  if (config.computeUnitPrice && config.computeUnitPrice > 0) {
    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: config.computeUnitPrice,
      })
    );
  }

  // Add a minimal dummy instruction - a simple memo or system program instruction
  // Using a minimal system program instruction (transfer 0 lamports to self)
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: wallet,
      toPubkey: wallet,
      lamports: 0, // No actual transfer, just for simulation
    })
  );

  return transaction;
}

/**
 * Simulates a transaction with the specified compute unit limit
 */
export async function simulateTransaction(
  wallet: PublicKey,
  config: SimulationConfig,
  connection?: Connection
): Promise<SimulationResult> {
  try {
    const conn = connection || createSolanaConnection();
    
    // Build the transaction
    const transaction = await buildSimulationTransaction(wallet, config);
    
    // Get recent blockhash
    const { blockhash } = await conn.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet;

    // Simulate the transaction
    const simulationResponse = await conn.simulateTransaction(transaction);

    if (simulationResponse.value.err) {
      return {
        success: false,
        error: `Simulation failed: ${JSON.stringify(simulationResponse.value.err)}`,
        logs: simulationResponse.value.logs || [],
      };
    }

    // Parse compute units consumed from logs
    let unitsConsumed = 0;
    const logs = simulationResponse.value.logs || [];
    const warnings: string[] = [];

    // Look for compute unit consumption in logs
    for (const log of logs) {
      const consumedMatch = log.match(/consumed (\d+) of (\d+) compute units/);
      if (consumedMatch) {
        unitsConsumed = parseInt(consumedMatch[1]);
        const requested = parseInt(consumedMatch[2]);
        
        // Add warnings for compute unit usage
        if (unitsConsumed > config.computeUnitLimit * 0.9) {
          warnings.push(`High compute unit usage: ${unitsConsumed}/${config.computeUnitLimit} (${Math.round(unitsConsumed / config.computeUnitLimit * 100)}%)`);
        }
        
        if (unitsConsumed < config.computeUnitLimit * 0.1) {
          warnings.push(`Low compute unit usage: Consider reducing limit to ~${Math.ceil(unitsConsumed * 1.2)} units`);
        }
        break;
      }
    }

    // Calculate estimated fee
    const baseFee = 5000; // Base transaction fee in lamports
    const computeFee = config.computeUnitPrice 
      ? (unitsConsumed * config.computeUnitPrice) / 1_000_000 // Convert micro-lamports to lamports
      : 0;
    const totalFee = baseFee + computeFee;

    return {
      success: true,
      unitsConsumed,
      logs,
      fee: totalFee,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown simulation error',
    };
  }
}

/**
 * Gets recommended compute unit limits based on instruction type
 */
export function getRecommendedComputeUnits(instructionType: 'simple' | 'token' | 'defi' | 'nft' | 'custom'): number {
  switch (instructionType) {
    case 'simple':
      return 1_400; // Basic system program instructions
    case 'token':
      return 10_000; // SPL token operations
    case 'defi':
      return 50_000; // DeFi protocol interactions
    case 'nft':
      return 25_000; // NFT minting/trading
    case 'custom':
    default:
      return 200_000; // Conservative default
  }
}

/**
 * Validates compute unit limit input
 */
export function validateComputeUnitLimit(limit: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(limit) || limit <= 0) {
    return { valid: false, error: 'Compute unit limit must be a positive integer' };
  }
  
  if (limit < 200) {
    return { valid: false, error: 'Compute unit limit must be at least 200' };
  }
  
  if (limit > 1_400_000) {
    return { valid: false, error: 'Compute unit limit cannot exceed 1,400,000' };
  }
  
  return { valid: true };
}