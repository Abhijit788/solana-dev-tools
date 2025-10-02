'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TransactionList from "@/components/compute/TransactionList";
import SimulateTransactionForm from "@/components/compute/SimulateTransactionForm";
import PriorityFeeEstimator from "@/components/compute/PriorityFeeEstimator";
import BatchTransactionBuilder from "@/components/batch/BatchTransactionBuilder";
import { useRecentTransactions } from "@/hooks/useRecentTransactions";
import Link from 'next/link';

export default function Home() {
  const { transactions, isLoading, error, refresh } = useRecentTransactions(5);
  const [currentComputeUnits, setCurrentComputeUnits] = useState(1400);
  const [currentPriorityFee, setCurrentPriorityFee] = useState(0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Solana Developer Tool
          </h1>
          <p className="text-xl text-gray-300">
            A comprehensive suite of tools for Solana blockchain development
          </p>
        </div>

        {/* Available Tools Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            🚀 Available Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <Card className="border-green-600/30 bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-green-400">Transaction History</CardTitle>
                <CardDescription>
                  View wallet transactions with compute unit analysis and fees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={() => document.getElementById('transaction-history')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View History
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-600/30 bg-blue-950/20">
              <CardHeader>
                <CardTitle className="text-blue-400">Transaction Simulator</CardTitle>
                <CardDescription>
                  Build and simulate Solana transactions with compute unit analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  onClick={() => document.getElementById('transaction-simulator')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Use Simulator
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-600/30 bg-purple-950/20">
              <CardHeader>
                <CardTitle className="text-purple-400">Priority Fee Calculator</CardTitle>
                <CardDescription>
                  Real-time transaction cost estimation with network fee data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700" 
                  onClick={() => document.getElementById('priority-fee-estimator')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Calculate Fees
                </Button>
              </CardContent>
            </Card>

            <Card className="border-orange-600/30 bg-orange-950/20">
              <CardHeader>
                <CardTitle className="text-orange-400">Batch Transaction Builder</CardTitle>
                <CardDescription>
                  Combine multiple instructions into optimized batches to reduce costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700" 
                  onClick={() => document.getElementById('batch-builder')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Build Batches
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            🔮 Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-gray-600/50 bg-gray-800/30 opacity-75">
              <CardHeader>
                <CardTitle className="text-gray-400">Account Explorer</CardTitle>
                <CardDescription>
                  Explore Solana accounts and their data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="secondary" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-600/50 bg-gray-800/30 opacity-75">
              <CardHeader>
                <CardTitle className="text-gray-400">Program Inspector</CardTitle>
                <CardDescription>
                  Analyze Solana programs and their instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="secondary" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-600/50 bg-gray-800/30 opacity-75">
              <CardHeader>
                <CardTitle className="text-gray-400">Network Statistics</CardTitle>
                <CardDescription>
                  View real-time Solana network metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="secondary" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-600/50 bg-gray-800/30 opacity-75">
              <CardHeader>
                <CardTitle className="text-gray-400">Token Inspector</CardTitle>
                <CardDescription>
                  Inspect SPL tokens and their metadata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="secondary" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-600/50 bg-gray-800/30 opacity-75">
              <CardHeader>
                <CardTitle className="text-gray-400">Validator Tools</CardTitle>
                <CardDescription>
                  Tools for Solana validators and staking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="secondary" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-600/50 bg-gray-800/30 opacity-75">
              <CardHeader>
                <CardTitle className="text-gray-400">RPC Health Monitor</CardTitle>
                <CardDescription>
                  Monitor Solana RPC endpoint performance and health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="secondary" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div id="transaction-history" className="mt-12">
          <TransactionList 
            transactions={transactions}
            isLoading={isLoading}
            error={error}
            onRefresh={refresh}
          />
        </div>

        {/* Transaction Simulator Section */}
        <div id="transaction-simulator" className="mt-8">
          <SimulateTransactionForm 
            onComputeUnitsChange={setCurrentComputeUnits}
            externalPriorityFee={currentPriorityFee > 0 ? currentPriorityFee : undefined}
          />
        </div>

        {/* Priority Fee Estimator Section */}
        <div id="priority-fee-estimator" className="mt-8">
          <PriorityFeeEstimator 
            computeUnits={currentComputeUnits}
            onPriorityFeeChange={(priorityFee) => {
              setCurrentPriorityFee(priorityFee);
            }}
          />
        </div>

        {/* Batch Transaction Builder Section */}
        <div id="batch-builder" className="mt-8">
          <BatchTransactionBuilder />
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-300 mb-4">
            Get started by exploring the tools above or check out our documentation.
          </p>
          <Link href="/docs">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              View Documentation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
