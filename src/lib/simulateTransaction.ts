import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  ComputeBudgetProgram,
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
 * Simulates a minimal transaction for wallets that don't exist or have no balance
 */
async function simulateMinimalTransaction(
  wallet: PublicKey,
  config: SimulationConfig,
  connection: Connection
): Promise<SimulationResult> {
  try {
    const transaction = new Transaction();
    
    // Add compute budget instruction
    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: config.computeUnitLimit,
      })
    );
    
    if (config.computeUnitPrice && config.computeUnitPrice > 0) {
      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: config.computeUnitPrice,
        })
      );
    }
    
    // Add only a memo instruction without requiring signatures
    const memoInstruction = new TransactionInstruction({
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from('Simulation test - no signature required', 'utf8'),
    });
    transaction.add(memoInstruction);
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet;
    
    // Simulate without signature verification
    const simulationResponse = await connection.simulateTransaction(transaction);
    
    if (simulationResponse.value.err) {
      return {
        success: false,
        error: `Simulation failed: ${JSON.stringify(simulationResponse.value.err)}`,
        logs: simulationResponse.value.logs || [],
      };
    }
    
    // Parse compute units from logs
    let unitsConsumed = 0;
    const logs = simulationResponse.value.logs || [];
    
    for (const log of logs) {
      const consumedMatch = log.match(/consumed (\d+) of (\d+) compute units/);
      if (consumedMatch) {
        unitsConsumed = parseInt(consumedMatch[1]);
        break;
      }
    }
    
    return {
      success: true,
      unitsConsumed,
      logs,
      fee: 5000, // Base fee estimate
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Minimal simulation failed',
    };
  }
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

  // Add a minimal memo instruction that doesn't require account balance
  // This is safer for simulation as it doesn't require the wallet to exist or have balance
  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: wallet, isSigner: true, isWritable: false }],
    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), // Memo program
    data: Buffer.from('Transaction simulation test', 'utf8'),
  });
  transaction.add(memoInstruction);

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
    
    // Check if wallet account exists and has balance
    try {
      const accountInfo = await conn.getAccountInfo(wallet);
      const balance = await conn.getBalance(wallet);
      
      if (!accountInfo || balance === 0) {
        // Account doesn't exist or has no balance, use minimal simulation
        console.log('Wallet has no balance, using minimal simulation');
        return await simulateMinimalTransaction(wallet, config, conn);
      }
    } catch (error) {
      console.warn('Could not check account info, trying minimal simulation:', error);
      return await simulateMinimalTransaction(wallet, config, conn);
    }
    
    // Build the transaction
    const transaction = await buildSimulationTransaction(wallet, config);
    
    // Get recent blockhash
    const { blockhash } = await conn.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet;

    // Simulate the transaction
    const simulationResponse = await conn.simulateTransaction(transaction);

    if (simulationResponse.value.err) {
      // If main simulation fails, try minimal simulation as fallback
      const errorString = JSON.stringify(simulationResponse.value.err);
      if (errorString.includes('AccountNotFound') || errorString.includes('InsufficientFunds')) {
        console.log('Main simulation failed with account issues, trying minimal simulation');
        return await simulateMinimalTransaction(wallet, config, conn);
      }
      
      return {
        success: false,
        error: `Simulation failed: ${errorString}`,
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown simulation error';
    const conn = connection || createSolanaConnection();
    
    // Try minimal simulation as final fallback
    if (errorMessage.includes('AccountNotFound') || errorMessage.includes('account not found')) {
      console.log('Caught AccountNotFound error, trying minimal simulation');
      try {
        return await simulateMinimalTransaction(wallet, config, conn);
      } catch (fallbackError) {
        return {
          success: false,
          error: `Both simulations failed. Original: ${errorMessage}, Fallback: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`,
        };
      }
    }
    
    return {
      success: false,
      error: errorMessage,
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