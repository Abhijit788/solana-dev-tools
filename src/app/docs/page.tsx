'use client';

import { ArrowLeft, BookOpen, Code, Zap, Shield, Users, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

export default function Documentation() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <BookOpen className="inline-block w-8 h-8 mr-3 text-blue-400" />
              Documentation
            </h1>
            <p className="text-xl text-gray-300">
              Complete guide to using Solana Developer Tools
            </p>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>
              Get up and running with Solana Developer Tools in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-white">1. Connect Your Wallet</h3>
                <p className="text-gray-300 text-sm">
                  Click "Connect Wallet" in the top right corner and select your preferred wallet (Phantom, Solflare, or Coinbase).
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-white">2. Explore Tools</h3>
                <p className="text-gray-300 text-sm">
                  Use the tool cards on the homepage to navigate to different features like transaction simulation and fee calculation.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-white">3. View Transaction History</h3>
                <p className="text-gray-300 text-sm">
                  Once connected, view your recent transactions with detailed compute unit analysis and fee breakdowns.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-white">4. Simulate Transactions</h3>
                <p className="text-gray-300 text-sm">
                  Test transactions before sending them with our simulation tools to estimate costs and avoid failures.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Tools */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-green-400" />
              Available Tools
            </CardTitle>
            <CardDescription>
              Comprehensive overview of all development tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-white">🔍 Transaction History</h3>
                <p className="text-gray-300 text-sm">
                  View your wallet's recent transactions with detailed analysis including:
                </p>
                <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 ml-4">
                  <li>Compute units used vs allocated</li>
                  <li>Priority fees and total costs</li>
                  <li>Transaction status and timestamps</li>
                  <li>Signature links to Solscan explorer</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-white">⚡ Transaction Simulator</h3>
                <p className="text-gray-300 text-sm">
                  Simulate transactions before sending to:
                </p>
                <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 ml-4">
                  <li>Estimate compute unit requirements</li>
                  <li>Calculate transaction costs</li>
                  <li>Validate transaction structure</li>
                  <li>Preview expected outcomes</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-white">💰 Priority Fee Calculator</h3>
                <p className="text-gray-300 text-sm">
                  Real-time fee estimation with:
                </p>
                <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 ml-4">
                  <li>Current network congestion data</li>
                  <li>Recommended priority fees</li>
                  <li>Cost optimization suggestions</li>
                  <li>Historical fee trends</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-white">📦 Batch Transaction Builder</h3>
                <p className="text-gray-300 text-sm">
                  Combine multiple operations to:
                </p>
                <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 ml-4">
                  <li>Reduce overall transaction costs</li>
                  <li>Optimize compute unit usage</li>
                  <li>Simplify complex workflows</li>
                  <li>Improve transaction throughput</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Technical Information
            </CardTitle>
            <CardDescription>
              Understanding the technology behind the tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Network Configuration</h3>
                <p className="text-gray-300 text-sm">
                  Currently configured for Solana Devnet for safe testing and development. All transactions and data are from the development network.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Supported Wallets</h3>
                <p className="text-gray-300 text-sm">
                  Compatible with Phantom, Solflare, and Coinbase Wallet through the Solana Wallet Adapter standard.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Data Sources</h3>
                <p className="text-gray-300 text-sm">
                  Transaction data is fetched directly from Solana RPC endpoints with fallback mechanisms for reliability.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Privacy & Security</h3>
                <p className="text-gray-300 text-sm">
                  Your wallet data never leaves your browser. All operations are performed client-side for maximum security.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* External Resources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              External Resources
            </CardTitle>
            <CardDescription>
              Additional learning materials and references
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="https://docs.solana.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-white">Solana Documentation</h3>
                  <p className="text-gray-300 text-sm">Official Solana developer docs</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>

              <a 
                href="https://solscan.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-white">Solscan Explorer</h3>
                  <p className="text-gray-300 text-sm">Blockchain explorer for Solana</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>

              <a 
                href="https://phantom.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-white">Phantom Wallet</h3>
                  <p className="text-gray-300 text-sm">Popular Solana wallet extension</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>

              <a 
                href="https://github.com/Abhijit788/solana-dev-tools" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-white">Source Code</h3>
                  <p className="text-gray-300 text-sm">View project on GitHub</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Common questions and troubleshooting tips
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Why can't I see my transactions?</h3>
                <p className="text-gray-300 text-sm">
                  Make sure your wallet is connected and you're using the devnet. The tool currently works with Solana Devnet for development and testing purposes.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">What does "Request timeout" mean?</h3>
                <p className="text-gray-300 text-sm">
                  This typically occurs when the Solana devnet is experiencing high load or network issues. The tool will automatically retry, or you can refresh manually.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">How accurate are the fee estimates?</h3>
                <p className="text-gray-300 text-sm">
                  Fee estimates are based on current network conditions and historical data. Actual costs may vary slightly depending on network congestion at transaction time.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2">Can I use this with mainnet?</h3>
                <p className="text-gray-300 text-sm">
                  Currently, the tool is configured for devnet only for safety. Future versions may include mainnet support with appropriate warnings and confirmations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}