'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from '../../hooks/use-toast';
import { 
  simulateTransaction, 
  validateComputeUnitLimit, 
  getRecommendedComputeUnits,
  type SimulationResult 
} from '@/lib/simulateTransaction';
import { Loader2, Play, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface SimulateTransactionFormProps {
  onComputeUnitsChange?: (computeUnits: number) => void;
  externalPriorityFee?: number;
}

export default function SimulateTransactionForm({ 
  onComputeUnitsChange,
  externalPriorityFee
}: SimulateTransactionFormProps = {}) {
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();
  const [computeUnitLimit, setComputeUnitLimit] = useState<string>('1400');
  const [computeUnitPrice, setComputeUnitPrice] = useState<string>('0');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [inputError, setInputError] = useState<string>('');

  const handleComputeUnitLimitChange = (value: string) => {
    setComputeUnitLimit(value);
    setInputError('');
    
    const numValue = parseInt(value);
    if (value && !isNaN(numValue)) {
      const validation = validateComputeUnitLimit(numValue);
      if (!validation.valid) {
        setInputError(validation.error || '');
      } else {
        // Notify parent component of compute units change
        onComputeUnitsChange?.(numValue);
      }
    }
  };

  const handleSimulate = async () => {
    if (!connected || !publicKey) {
      const errorMessage = 'Please connect your wallet first';
      setSimulationResult({
        success: false,
        error: errorMessage
      });
      toast({
        title: "Wallet Required",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    const computeLimit = parseInt(computeUnitLimit);
    const computePrice = externalPriorityFee || parseInt(computeUnitPrice) || 0;

    const validation = validateComputeUnitLimit(computeLimit);
    if (!validation.valid) {
      setInputError(validation.error || '');
      toast({
        title: "Invalid Input",
        description: validation.error || 'Please check your compute unit limit',
        variant: "destructive",
      });
      return;
    }

    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const result = await simulateTransaction(publicKey, {
        computeUnitLimit: computeLimit,
        computeUnitPrice: computePrice > 0 ? computePrice : undefined,
      });
      
      setSimulationResult(result);
      
      if (result.success) {
        toast({
          title: "Simulation Successful",
          description: `Consumed ${result.unitsConsumed?.toLocaleString()} compute units`,
          variant: "success",
        });
      } else {
        toast({
          title: "Simulation Failed",
          description: result.error || 'Unknown error occurred',
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Simulation failed';
      setSimulationResult({
        success: false,
        error: errorMessage
      });
      toast({
        title: "Simulation Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePresetSelect = (preset: 'simple' | 'token' | 'defi' | 'nft' | 'custom') => {
    const recommendedUnits = getRecommendedComputeUnits(preset);
    setComputeUnitLimit(recommendedUnits.toString());
    setInputError('');
    onComputeUnitsChange?.(recommendedUnits);
  };

  const formatComputeUnits = (units: number) => {
    return units.toLocaleString();
  };

  const formatLamports = (lamports: number) => {
    const sol = lamports / 1_000_000_000;
    return `${lamports.toLocaleString()} lamports (${sol.toFixed(9)} SOL)`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Transaction Simulator
        </CardTitle>
        <CardDescription>
          Simulate transactions with adjustable compute unit limits to estimate costs and performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Buttons */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect('simple')}
              className="text-xs"
            >
              Simple (1,400)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect('token')}
              className="text-xs"
            >
              Token (10,000)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect('defi')}
              className="text-xs"
            >
              DeFi (50,000)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect('nft')}
              className="text-xs"
            >
              NFT (25,000)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelect('custom')}
              className="text-xs"
            >
              Custom (200,000)
            </Button>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="computeUnitLimit">Compute Unit Limit</Label>
            <Input
              id="computeUnitLimit"
              type="number"
              value={computeUnitLimit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleComputeUnitLimitChange(e.target.value)}
              placeholder="e.g. 1400"
              min="200"
              max="1400000"
              className={inputError ? 'border-red-500' : ''}
              aria-describedby={inputError ? "compute-limit-error" : undefined}
              aria-invalid={!!inputError}
            />
            {inputError && (
              <p id="compute-limit-error" className="text-sm text-red-500" role="alert">{inputError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="computeUnitPrice">
              Compute Unit Price (micro-lamports)
              <span className="text-xs text-gray-500 ml-1">(optional)</span>
            </Label>
            <Input
              id="computeUnitPrice"
              type="number"
              value={externalPriorityFee || computeUnitPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComputeUnitPrice(e.target.value)}
              placeholder="0"
              min="0"
              disabled={!!externalPriorityFee}
              aria-label="Compute unit price in micro-lamports"
            />
            {externalPriorityFee && (
              <p className="text-xs text-blue-600">
                Using priority fee from estimator below: {externalPriorityFee} μL
              </p>
            )}
          </div>
        </div>

        {/* Simulate Button */}
        <Button
          onClick={handleSimulate}
          disabled={isSimulating || !connected || !!inputError}
          className="w-full"
          aria-label={isSimulating ? "Running simulation" : "Start transaction simulation"}
        >
          {isSimulating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Simulating...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Simulate Transaction
            </>
          )}
        </Button>

        {!connected && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to simulate transactions
            </AlertDescription>
          </Alert>
        )}

        {/* Simulation Results */}
        {simulationResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {simulationResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <h3 className="text-lg font-semibold">
                Simulation {simulationResult.success ? 'Successful' : 'Failed'}
              </h3>
            </div>

            {simulationResult.success ? (
              <div className="space-y-3">
                {/* Compute Units Consumed */}
                {simulationResult.unitsConsumed !== undefined && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium">Compute Units Consumed:</span>
                    <Badge variant="secondary">
                      {formatComputeUnits(simulationResult.unitsConsumed)}
                    </Badge>
                  </div>
                )}

                {/* Estimated Fee */}
                {simulationResult.fee !== undefined && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium">Estimated Fee:</span>
                    <span className="text-sm font-mono">
                      {formatLamports(simulationResult.fee)}
                    </span>
                  </div>
                )}

                {/* Warnings */}
                {simulationResult.warnings && simulationResult.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {simulationResult.warnings.map((warning, index) => (
                          <div key={index} className="text-sm">{warning}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Logs */}
                {simulationResult.logs && simulationResult.logs.length > 0 && (
                  <details className="space-y-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      View Simulation Logs ({simulationResult.logs.length})
                    </summary>
                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono max-h-40 overflow-y-auto">
                      {simulationResult.logs.map((log, index) => (
                        <div key={index} className="mb-1">
                          {log}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {simulationResult.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}