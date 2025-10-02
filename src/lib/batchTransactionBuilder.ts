import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import { createSolanaConnection } from './solanaClient';

export interface SimulationResult {
  success: boolean;
  unitsConsumed?: number;
  error?: string;
  logs?: string[];
  fee?: number;
  warnings?: string[];
}

export interface BatchInstruction {
  id: string;
  name: string;
  type: 'transfer' | 'memo' | 'token' | 'custom';
  description: string;
  estimatedComputeUnits: number;
  instruction?: TransactionInstruction;
}

export interface BatchSimulationResult {
  totalComputeUnits: number;
  totalFee: number;
  instructions: BatchInstruction[];
  optimizations: string[];
  warnings: string[];
  canBatch: boolean;
  recommendedComputeLimit: number;
  simulationResult?: SimulationResult;
}

export interface BatchOptimization {
  strategy: 'single' | 'split' | 'optimize';
  batches: BatchInstruction[][];
  totalComputeUnits: number;
  estimatedSavings: number;
  description: string;
}

// Maximum compute units per transaction
const MAX_COMPUTE_UNITS = 1_400_000;
const RECOMMENDED_BUFFER = 0.1; // 10% buffer for safety

/**
 * Creates dummy instructions for testing/simulation purposes
 */
export function createDummyInstruction(type: BatchInstruction['type'], wallet: PublicKey): TransactionInstruction {
  switch (type) {
    case 'transfer':
      return SystemProgram.transfer({
        fromPubkey: wallet,
        toPubkey: wallet,
        lamports: 0,
      });
    
    case 'memo':
      return new TransactionInstruction({
        keys: [{ pubkey: wallet, isSigner: true, isWritable: false }],
        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        data: Buffer.from('Batch transaction test', 'utf8'),
      });
    
    case 'token':
      // Simplified token instruction (would need actual token program in real usage)
      return new TransactionInstruction({
        keys: [
          { pubkey: wallet, isSigner: true, isWritable: true },
          { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
        ],
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        data: Buffer.from([7]), // Transfer instruction
      });
    
    case 'custom':
    default:
      return new TransactionInstruction({
        keys: [{ pubkey: wallet, isSigner: true, isWritable: false }],
        programId: new PublicKey('11111111111111111111111111111111'),
        data: Buffer.from('custom instruction', 'utf8'),
      });
  }
}

/**
 * Estimates compute units for different instruction types
 */
export function estimateComputeUnits(type: BatchInstruction['type']): number {
  switch (type) {
    case 'transfer':
      return 450; // System program transfer
    case 'memo':
      return 200; // Memo program
    case 'token':
      return 2_300; // SPL token transfer
    case 'custom':
      return 1_000; // Conservative estimate
    default:
      return 500;
  }
}

/**
 * Creates a batch instruction template
 */
export function createBatchInstruction(
  type: BatchInstruction['type'],
  name?: string,
  description?: string
): Omit<BatchInstruction, 'id' | 'instruction'> {
  const templates = {
    transfer: {
      name: name || 'SOL Transfer',
      description: description || 'Transfer SOL between accounts',
    },
    memo: {
      name: name || 'Memo Instruction',
      description: description || 'Add memo to transaction',
    },
    token: {
      name: name || 'Token Transfer',
      description: description || 'Transfer SPL tokens',
    },
    custom: {
      name: name || 'Custom Instruction',
      description: description || 'Custom program instruction',
    },
  };

  const template = templates[type];
  
  return {
    name: template.name,
    type,
    description: template.description,
    estimatedComputeUnits: estimateComputeUnits(type),
  };
}

/**
 * Builds a transaction from batch instructions
 */
export async function buildBatchTransaction(
  instructions: BatchInstruction[],
  wallet: PublicKey,
  computeUnitLimit?: number
): Promise<Transaction> {
  const transaction = new Transaction();
  
  // Add compute budget instruction if specified
  if (computeUnitLimit) {
    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: computeUnitLimit,
      })
    );
  }
  
  // Add all batch instructions
  for (const batchInstr of instructions) {
    if (batchInstr.instruction) {
      transaction.add(batchInstr.instruction);
    } else {
      // Create dummy instruction for simulation
      const dummyInstr = createDummyInstruction(batchInstr.type, wallet);
      transaction.add(dummyInstr);
    }
  }
  
  return transaction;
}

/**
 * Simulates a batch transaction and returns detailed results
 */
export async function simulateBatchTransaction(
  instructions: BatchInstruction[],
  wallet: PublicKey,
  connection?: Connection
): Promise<BatchSimulationResult> {
  const conn = connection || createSolanaConnection();
  
  // Calculate estimated total compute units
  const estimatedTotalComputeUnits = instructions.reduce(
    (total, instr) => total + instr.estimatedComputeUnits,
    0
  );
  
  // Add base transaction overhead (signature verification, etc.)
  const baseOverhead = 200;
  const totalEstimated = estimatedTotalComputeUnits + baseOverhead;
  
  // Calculate recommended compute limit with buffer
  const recommendedComputeLimit = Math.ceil(totalEstimated * (1 + RECOMMENDED_BUFFER));
  
  // Check if batching is possible
  const canBatch = recommendedComputeLimit <= MAX_COMPUTE_UNITS;
  
  // Generate optimizations and warnings
  const optimizations: string[] = [];
  const warnings: string[] = [];
  
  if (!canBatch) {
    warnings.push(`Total compute units (${recommendedComputeLimit.toLocaleString()}) exceeds maximum (${MAX_COMPUTE_UNITS.toLocaleString()})`);
    optimizations.push('Consider splitting into multiple transactions');
  } else if (recommendedComputeLimit > MAX_COMPUTE_UNITS * 0.8) {
    warnings.push('High compute usage - consider optimization');
    optimizations.push('Monitor actual usage and adjust limits accordingly');
  }
  
  if (instructions.length > 10) {
    optimizations.push('Large batch - consider grouping related instructions');
  }
  
  if (instructions.filter(i => i.type === 'token').length > 5) {
    optimizations.push('Multiple token operations detected - consider using token batch instructions');
  }
  
  // Perform actual simulation if possible
  let simulationResult: SimulationResult | undefined;
  if (canBatch) {
    try {
      const transaction = await buildBatchTransaction(instructions, wallet, recommendedComputeLimit);
      const { blockhash } = await conn.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet;
      
      const simResponse = await conn.simulateTransaction(transaction);
      
      if (simResponse.value.err) {
        simulationResult = {
          success: false,
          error: `Simulation failed: ${JSON.stringify(simResponse.value.err)}`,
          logs: simResponse.value.logs || [],
        };
      } else {
        // Parse actual compute units from logs
        let actualComputeUnits = 0;
        const logs = simResponse.value.logs || [];
        
        for (const log of logs) {
          const consumedMatch = log.match(/consumed (\d+) of (\d+) compute units/);
          if (consumedMatch) {
            actualComputeUnits = parseInt(consumedMatch[1]);
            break;
          }
        }
        
        simulationResult = {
          success: true,
          unitsConsumed: actualComputeUnits,
          logs,
          fee: 5000, // Base fee
        };
        
        // Update optimizations based on actual usage
        if (actualComputeUnits > 0 && actualComputeUnits < totalEstimated * 0.5) {
          optimizations.push(`Actual usage (${actualComputeUnits}) much lower than estimated - consider reducing compute limit`);
        }
      }
    } catch (error) {
      simulationResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Simulation failed',
      };
    }
  }
  
  return {
    totalComputeUnits: simulationResult?.unitsConsumed || totalEstimated,
    totalFee: 5000, // Base fee for now
    instructions,
    optimizations,
    warnings,
    canBatch,
    recommendedComputeLimit,
    simulationResult,
  };
}

/**
 * Optimizes batch instructions by splitting them into optimal groups
 */
export function optimizeBatchInstructions(instructions: BatchInstruction[]): BatchOptimization[] {
  const optimizations: BatchOptimization[] = [];
  
  // Strategy 1: Single batch (if possible)
  const totalComputeUnits = instructions.reduce((sum, instr) => sum + instr.estimatedComputeUnits, 0);
  const singleBatchLimit = Math.ceil(totalComputeUnits * (1 + RECOMMENDED_BUFFER));
  
  if (singleBatchLimit <= MAX_COMPUTE_UNITS) {
    optimizations.push({
      strategy: 'single',
      batches: [instructions],
      totalComputeUnits,
      estimatedSavings: 0,
      description: 'Execute all instructions in a single transaction',
    });
  }
  
  // Strategy 2: Split by compute limit
  if (instructions.length > 1) {
    const batches: BatchInstruction[][] = [];
    let currentBatch: BatchInstruction[] = [];
    let currentComputeUnits = 0;
    
    for (const instr of instructions) {
      const batchLimit = Math.ceil((currentComputeUnits + instr.estimatedComputeUnits) * (1 + RECOMMENDED_BUFFER));
      
      if (batchLimit <= MAX_COMPUTE_UNITS && currentBatch.length < 20) {
        currentBatch.push(instr);
        currentComputeUnits += instr.estimatedComputeUnits;
      } else {
        if (currentBatch.length > 0) {
          batches.push([...currentBatch]);
        }
        currentBatch = [instr];
        currentComputeUnits = instr.estimatedComputeUnits;
      }
    }
    
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }
    
    const savedTransactions = Math.max(0, instructions.length - batches.length);
    
    optimizations.push({
      strategy: 'split',
      batches,
      totalComputeUnits,
      estimatedSavings: savedTransactions * 5000, // Saved base fees
      description: `Split into ${batches.length} optimized batches, saving ${savedTransactions} transaction fees`,
    });
  }
  
  // Strategy 3: Group by instruction type for optimization
  const groupedByType = instructions.reduce((groups, instr) => {
    if (!groups[instr.type]) {
      groups[instr.type] = [];
    }
    groups[instr.type].push(instr);
    return groups;
  }, {} as Record<string, BatchInstruction[]>);
  
  if (Object.keys(groupedByType).length > 1) {
    const typeBatches = Object.values(groupedByType).filter(group => group.length > 0);
    const typeBasedSavings = instructions.length - typeBatches.length;
    
    optimizations.push({
      strategy: 'optimize',
      batches: typeBatches,
      totalComputeUnits,
      estimatedSavings: typeBasedSavings * 5000,
      description: `Group by instruction type into ${typeBatches.length} batches for better optimization`,
    });
  }
  
  return optimizations.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
}

/**
 * Exports batch configuration as JSON for developers
 */
export function exportBatchConfig(
  instructions: BatchInstruction[],
  simulationResult: BatchSimulationResult,
  optimizations: BatchOptimization[]
): string {
  const config = {
    timestamp: new Date().toISOString(),
    instructions: instructions.map(instr => ({
      name: instr.name,
      type: instr.type,
      description: instr.description,
      estimatedComputeUnits: instr.estimatedComputeUnits,
    })),
    simulation: {
      totalComputeUnits: simulationResult.totalComputeUnits,
      recommendedComputeLimit: simulationResult.recommendedComputeLimit,
      canBatch: simulationResult.canBatch,
      actualUnitsConsumed: simulationResult.simulationResult?.unitsConsumed,
    },
    optimizations: optimizations.map(opt => ({
      strategy: opt.strategy,
      batchCount: opt.batches.length,
      estimatedSavings: opt.estimatedSavings,
      description: opt.description,
      batches: opt.batches.map(batch => ({
        instructionCount: batch.length,
        types: [...new Set(batch.map(b => b.type))],
        estimatedComputeUnits: batch.reduce((sum, b) => sum + b.estimatedComputeUnits, 0),
      })),
    })),
    recommendations: simulationResult.optimizations,
    warnings: simulationResult.warnings,
  };
  
  return JSON.stringify(config, null, 2);
}