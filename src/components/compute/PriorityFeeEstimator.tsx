'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  getRecentPrioritizationFees, 
  calculateTransactionCost,
  formatSol,
  lamportsToSol,
  getPriorityFeeRecommendation,
  estimateConfirmationTime,
  type PriorityFeeEstimate
} from '@/lib/priorityFeeUtils';
import { 
  Zap, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Info,
  Gauge,
  Timer
} from 'lucide-react';

interface PriorityFeeEstimatorProps {
  computeUnits?: number;
  onPriorityFeeChange?: (priorityFee: number, totalCost: number) => void;
  className?: string;
}

export default function PriorityFeeEstimator({ 
  computeUnits = 1400, 
  onPriorityFeeChange,
  className = ''
}: PriorityFeeEstimatorProps) {
  const [feeData, setFeeData] = useState<PriorityFeeEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedSpeed, setSelectedSpeed] = useState<'economy' | 'standard' | 'fast' | 'turbo'>('standard');
  const [customMultiplier, setCustomMultiplier] = useState(1.0);
  const [useCustom, setUseCustom] = useState(false);

  // Calculate current priority fee based on selection
  const getCurrentPriorityFee = useCallback((): number => {
    if (!feeData) return 0;
    
    if (useCustom) {
      return Math.round(feeData.stats.recommended * customMultiplier);
    }
    
    return getPriorityFeeRecommendation(feeData.stats, selectedSpeed);
  }, [feeData, selectedSpeed, customMultiplier, useCustom]);

  // Calculate total transaction cost
  const getTotalCost = useCallback((): number => {
    const priorityFee = getCurrentPriorityFee();
    return calculateTransactionCost(computeUnits, priorityFee);
  }, [computeUnits, getCurrentPriorityFee]);

  // Fetch priority fee data
  const fetchPriorityFees = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await getRecentPrioritizationFees();
      setFeeData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch priority fees');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // No automatic fetching - user must click to calculate

  // Notify parent of fee changes
  useEffect(() => {
    if (feeData && onPriorityFeeChange) {
      const priorityFee = getCurrentPriorityFee();
      const totalCost = getTotalCost();
      onPriorityFeeChange(priorityFee, totalCost);
    }
  }, [feeData, selectedSpeed, customMultiplier, useCustom, computeUnits, onPriorityFeeChange, getCurrentPriorityFee, getTotalCost]);

  const currentPriorityFee = getCurrentPriorityFee();
  const totalCostLamports = getTotalCost();
  const totalCostSol = lamportsToSol(totalCostLamports);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Priority Fee Estimator
        </CardTitle>
        <CardDescription>
          Optimize transaction costs with real-time network priority fee data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calculate Fees Button */}
        <Button
          onClick={fetchPriorityFees}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading Network Data...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Calculate Priority Fees
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {feeData && (
          <>
            {/* Network Fee Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {feeData.stats.median}
                </div>
                <div className="text-xs text-gray-500">Median Fee</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {feeData.stats.percentile75}
                </div>
                <div className="text-xs text-gray-500">75th Percentile</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {feeData.stats.percentile90}
                </div>
                <div className="text-xs text-gray-500">90th Percentile</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {feeData.stats.max}
                </div>
                <div className="text-xs text-gray-500">Max Fee</div>
              </div>
            </div>

            {/* Speed Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                <span className="font-medium">Transaction Speed</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { key: 'economy' as const, label: 'Economy', icon: '🐌', fee: getPriorityFeeRecommendation(feeData.stats, 'economy') },
                  { key: 'standard' as const, label: 'Standard', icon: '🚗', fee: getPriorityFeeRecommendation(feeData.stats, 'standard') },
                  { key: 'fast' as const, label: 'Fast', icon: '🚀', fee: getPriorityFeeRecommendation(feeData.stats, 'fast') },
                  { key: 'turbo' as const, label: 'Turbo', icon: '⚡', fee: getPriorityFeeRecommendation(feeData.stats, 'turbo') },
                ].map((option) => (
                  <Button
                    key={option.key}
                    variant={selectedSpeed === option.key && !useCustom ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedSpeed(option.key);
                      setUseCustom(false);
                    }}
                    className="flex flex-col h-auto p-3"
                  >
                    <span className="text-lg mb-1">{option.icon}</span>
                    <span className="text-xs font-medium">{option.label}</span>
                    <span className="text-xs text-gray-500">{option.fee} μL</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Multiplier */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Custom Multiplier</span>
                <Button
                  variant={useCustom ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUseCustom(!useCustom)}
                >
                  {useCustom ? 'Custom' : 'Use Preset'}
                </Button>
              </div>
              
              {useCustom && (
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value={customMultiplier}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomMultiplier(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0.1x (Ultra Low)</span>
                    <span className="font-medium">
                      {customMultiplier}x ({Math.round(feeData.stats.recommended * customMultiplier)} μL)
                    </span>
                    <span>5.0x (Ultra High)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Current Selection Summary */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium">Priority Fee</div>
                    <div className="text-lg font-bold text-blue-600">
                      {currentPriorityFee.toLocaleString()} μL
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-sm font-medium">Total Cost</div>
                    <div className="text-lg font-bold text-green-600">
                      {formatSol(totalCostSol)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="text-sm font-medium">Est. Time</div>
                    <div className="text-sm font-medium text-orange-600">
                      {estimateConfirmationTime(currentPriorityFee, feeData.stats)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <details className="space-y-2">
              <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
                <Info className="h-4 w-4" />
                Cost Breakdown
              </summary>
              <div className="pl-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Transaction Fee:</span>
                  <span>5,000 lamports</span>
                </div>
                <div className="flex justify-between">
                  <span>Compute Units:</span>
                  <span>{computeUnits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Priority Fee per Unit:</span>
                  <span>{currentPriorityFee} micro-lamports</span>
                </div>
                <div className="flex justify-between">
                  <span>Priority Fee Total:</span>
                  <span>{Math.round((computeUnits * currentPriorityFee) / 1_000_000).toLocaleString()} lamports</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total Cost:</span>
                  <span>{totalCostLamports.toLocaleString()} lamports ({formatSol(totalCostSol)})</span>
                </div>
              </div>
            </details>

            {/* Data Info and Refresh Button */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>
                  Data from {feeData.stats.count} recent transactions
                  • Updated {new Date(feeData.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchPriorityFees}
                disabled={isLoading}
                className="text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </>
        )}

        {!feeData && !isLoading && !error && (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-500 mb-4">
              Click &ldquo;Calculate Priority Fees&rdquo; to fetch real-time network data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}