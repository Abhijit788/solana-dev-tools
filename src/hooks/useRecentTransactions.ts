import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ParsedTransactionWithMeta } from '@solana/web3.js';
import { solanaConnection } from '@/lib/solanaClient';
import { TransactionDetails, WalletTransactionHistory } from '@/types';
import { useToast } from './use-toast';

/**
 * Parse compute units from transaction meta
 */
function parseComputeUnits(transaction: ParsedTransactionWithMeta): number {
  if (!transaction.meta) return 0;
  
  // Look for compute unit consumption in the transaction logs
  const logs = transaction.meta.logMessages || [];
  let totalComputeUnits = 0;
  
  for (const log of logs) {
    // Pattern: "Program <program_id> consumed <number> of <total> compute units"
    const computeMatch = log.match(/consumed (\d+) of \d+ compute units/);
    if (computeMatch) {
      totalComputeUnits += parseInt(computeMatch[1], 10);
    }
  }
  
  // Fallback: if no specific compute units found, estimate based on instructions
  if (totalComputeUnits === 0 && transaction.transaction.message.instructions) {
    totalComputeUnits = transaction.transaction.message.instructions.length * 5000; // rough estimate
  }
  
  return totalComputeUnits;
}

/**
 * Parse compute unit usage per instruction
 */
function parseComputeUnitUsage(transaction: ParsedTransactionWithMeta) {
  const computeUnitUsage: Array<{
    instructionIndex: number;
    instructionName: string;
    computeUnitsConsumed: number;
  }> = [];
  const logs = transaction.meta?.logMessages || [];
  
  transaction.transaction.message.instructions.forEach((instruction, index) => {
    let computeUnits = 0;
    let instructionName = 'Unknown';
    
    // Try to get instruction name from parsed instruction
    if ('parsed' in instruction) {
      instructionName = instruction.parsed?.type || 'Parsed Instruction';
    } else if ('data' in instruction) {
      instructionName = 'System Instruction';
    }
    
    // Look for compute unit consumption specific to this instruction
    const instructionLogs = logs.filter(log => 
      log.includes(`Instruction #${index}`) || 
      log.includes(`consumed`) && index < 10 // rough matching for single digit indices
    );
    
    for (const log of instructionLogs) {
      const computeMatch = log.match(/consumed (\d+) of \d+ compute units/);
      if (computeMatch) {
        computeUnits = parseInt(computeMatch[1], 10);
        break;
      }
    }
    
    // Default estimate if no specific data found
    if (computeUnits === 0) {
      computeUnits = 5000; // default estimate per instruction
    }
    
    computeUnitUsage.push({
      instructionIndex: index,
      instructionName,
      computeUnitsConsumed: computeUnits,
    });
  });
  
  return computeUnitUsage;
}

/**
 * Convert parsed transaction to TransactionDetails
 */
function mapToTransactionDetails(transaction: ParsedTransactionWithMeta): TransactionDetails {
  const totalComputeUnits = parseComputeUnits(transaction);
  const computeUnitUsage = parseComputeUnitUsage(transaction);
  
  return {
    signature: transaction.transaction.signatures[0],
    slot: transaction.slot,
    blockTime: transaction.blockTime || null,
    err: transaction.meta?.err,
    fee: transaction.meta?.fee || 0,
    totalComputeUnits,
    computeUnitUsage,
    status: transaction.meta?.err ? 'failed' : 'success',
    timestamp: transaction.blockTime ? new Date(transaction.blockTime * 1000) : new Date(),
  };
}

/**
 * Hook to fetch recent transactions for connected wallet
 */
export function useRecentTransactions(limit: number = 5): WalletTransactionHistory {
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();
  const [state, setState] = useState<WalletTransactionHistory>({
    publicKey: publicKey?.toString() || '',
    transactions: [],
    isLoading: false,
    error: null,
  });

  const fetchTransactions = useCallback(async () => {
    if (!publicKey || !connected) {
      setState(prev => ({
        ...prev,
        transactions: [],
        isLoading: false,
        error: null,
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('Fetching recent transactions for:', publicKey.toString());
      
      // Add timeout to prevent infinite loading - increased to 30 seconds for devnet
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - devnet connection may be slow')), 30000);
      });
      
      // Get recent signatures with timeout
      const signatures = await Promise.race([
        solanaConnection.getSignaturesForAddress(publicKey, { limit }),
        timeoutPromise
      ]) as any[];

      if (signatures.length === 0) {
        console.log('No transaction signatures found for this wallet');
        setState(prev => ({
          ...prev,
          transactions: [],
          isLoading: false,
          error: null,
        }));
        
        // Show helpful toast for new users (only once)
        if (!sessionStorage.getItem('shownNoTransactionsToast')) {
          toast({
            title: "No Transactions Found",
            description: "This wallet has no transaction history on devnet. Try using the transaction simulator above!",
            variant: "default",
          });
          sessionStorage.setItem('shownNoTransactionsToast', 'true');
        }
        return;
      }

      console.log(`Found ${signatures.length} signatures`);

      // Get parsed transactions
      const transactionSignatures = signatures.map(sig => sig.signature);
      const transactions = await solanaConnection.getParsedTransactions(
        transactionSignatures,
        { commitment: 'confirmed', maxSupportedTransactionVersion: 0 }
      );

      const validTransactions = transactions
        .filter((tx): tx is ParsedTransactionWithMeta => tx !== null)
        .map(mapToTransactionDetails);

      console.log(`Processed ${validTransactions.length} transactions`);

      setState(prev => ({
        ...prev,
        publicKey: publicKey.toString(),
        transactions: validTransactions,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      const errorMessage = error instanceof Error 
        ? error.message.includes('Request timeout') 
          ? 'Devnet connection is slow. This is normal - try again in a moment.'
          : error.message.includes('fetch')
          ? 'Network connection issue. Please check your internet connection.'
          : error.message
        : 'Failed to fetch transactions';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      // Only show error toast for non-timeout errors to avoid spam
      if (!(error instanceof Error && error.message.includes('timeout'))) {
        toast({
          title: "Transaction Fetch Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  }, [publicKey, connected, limit]);

  useEffect(() => {
    // Small delay to prevent flickering on fast connections
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  // Refresh function for manual updates
  const refresh = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    ...state,
    refresh,
  };
}