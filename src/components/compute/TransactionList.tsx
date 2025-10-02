'use client';

import React from 'react';
import { TransactionDetails } from '@/types';

interface TransactionListProps {
  transactions: TransactionDetails[];
  isLoading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return timestamp.toLocaleDateString();
}

function formatComputeUnits(units: number): string {
  if (units < 1000) return `${units} CU`;
  if (units < 1000000) return `${(units / 1000).toFixed(1)}K CU`;
  return `${(units / 1000000).toFixed(1)}M CU`;
}

function formatFee(lamports: number): string {
  const sol = lamports / 1e9;
  if (sol < 0.001) return `${lamports} lamports`;
  return `${sol.toFixed(6)} SOL`;
}

function getStatusColor(status: 'success' | 'failed' | 'pending'): string {
  switch (status) {
    case 'success':
      return 'text-green-400 bg-green-900';
    case 'failed':
      return 'text-red-400 bg-red-900';
    case 'pending':
      return 'text-yellow-400 bg-yellow-900';
    default:
      return 'text-gray-400 bg-gray-700';
  }
}

function truncateSignature(signature: string): string {
  return `${signature.slice(0, 8)}...${signature.slice(-8)}`;
}

export default function TransactionList({ transactions, isLoading, error, onRefresh }: TransactionListProps) {
  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Retry
            </button>
          )}
        </div>
        <div className="text-red-400 text-center py-4">
          <p>
            {error.includes('timeout') || error.includes('slow') 
              ? '⏱️ Devnet connection is slow' 
              : '❌ Failed to load transactions'
            }
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {error.includes('timeout') || error.includes('slow')
              ? 'This is normal with devnet. Try refreshing in a moment.'
              : error
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-700 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  <div className="w-32 h-4 bg-gray-600 rounded"></div>
                </div>
                <div className="w-16 h-4 bg-gray-600 rounded"></div>
              </div>
              <div className="mt-2 flex justify-between">
                <div className="w-24 h-3 bg-gray-600 rounded"></div>
                <div className="w-20 h-3 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No recent transactions found</p>
          <p className="text-sm mt-1">Make some transactions to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.signature} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(tx.status).split(' ')[1]}`}></div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-gray-300">
                        {truncateSignature(tx.signature)}
                      </span>
                      <a
                        href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        ↗
                      </a>
                    </div>
                    <div className="text-xs text-gray-400">
                      Slot {tx.slot}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatTimestamp(tx.timestamp)}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex space-x-4">
                  <div>
                    <span className="text-gray-400">Compute Units: </span>
                    <span className="text-blue-400 font-medium">
                      {formatComputeUnits(tx.totalComputeUnits)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Instructions: </span>
                    <span className="text-white">
                      {tx.computeUnitUsage.length}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Fee: </span>
                  <span className="text-yellow-400 font-medium">
                    {formatFee(tx.fee)}
                  </span>
                </div>
              </div>
              
              {/* Instruction breakdown - expandable */}
              <details className="mt-3">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                  View instruction details
                </summary>
                <div className="mt-2 space-y-1">
                  {tx.computeUnitUsage.map((usage) => (
                    <div key={usage.instructionIndex} className="text-xs bg-gray-800 rounded p-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">
                          #{usage.instructionIndex}: {usage.instructionName}
                        </span>
                        <span className="text-blue-400">
                          {formatComputeUnits(usage.computeUnitsConsumed)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}