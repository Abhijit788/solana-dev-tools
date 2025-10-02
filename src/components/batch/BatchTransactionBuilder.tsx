'use client';

import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from '../../hooks/use-toast';
import { 
  createBatchInstruction,
  simulateBatchTransaction,
  optimizeBatchInstructions,
  exportBatchConfig,
  type BatchInstruction,
  type BatchSimulationResult,
  type BatchOptimization
} from '@/lib/batchTransactionBuilder';
import { 
  Plus, 
  Trash2, 
  Play, 
  Download, 
  Loader2, 
  AlertTriangle, 
  CheckCircle,
  Layers,
  Zap,
  Target,
  Info
} from 'lucide-react';

export default function BatchTransactionBuilder() {
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();
  const [instructions, setInstructions] = useState<BatchInstruction[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<BatchSimulationResult | null>(null);
  const [optimizations, setOptimizations] = useState<BatchOptimization[]>([]);
  const [selectedOptimization, setSelectedOptimization] = useState<number>(-1);

  // Add a new instruction to the batch
  const addInstruction = useCallback((type: BatchInstruction['type']) => {
    const baseInstruction = createBatchInstruction(type);
    const newInstruction: BatchInstruction = {
      ...baseInstruction,
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setInstructions(prev => [...prev, newInstruction]);
    toast({
      title: "Instruction Added",
      description: `Added ${type} instruction to batch`,
      variant: "success",
    });
  }, [toast]);

  // Remove an instruction from the batch
  const removeInstruction = useCallback((id: string) => {
    const instruction = instructions.find(instr => instr.id === id);
    setInstructions(prev => prev.filter(instr => instr.id !== id));
    setSimulationResult(null);
    setOptimizations([]);
    toast({
      title: "Instruction Removed",
      description: instruction ? `Removed ${instruction.type} instruction` : "Instruction removed from batch",
      variant: "success",
    });
  }, [instructions, toast]);

  // Update instruction details
  const updateInstruction = useCallback((id: string, updates: Partial<BatchInstruction>) => {
    setInstructions(prev => prev.map(instr => 
      instr.id === id ? { ...instr, ...updates } : instr
    ));
    setSimulationResult(null);
  }, []);

  // Simulate the batch transaction
  const simulateBatch = useCallback(async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }
    
    if (instructions.length === 0) {
      toast({
        title: "No Instructions",
        description: "Add at least one instruction to simulate",
        variant: "destructive",
      });
      return;
    }

    setIsSimulating(true);
    
    try {
      const result = await simulateBatchTransaction(instructions, publicKey);
      setSimulationResult(result);
      
      // Generate optimizations
      const opts = optimizeBatchInstructions(instructions);
      setOptimizations(opts);
      setSelectedOptimization(opts.length > 0 ? 0 : -1);
      
      toast({
        title: "Batch Simulation Complete",
        description: `Simulated ${instructions.length} instruction${instructions.length > 1 ? 's' : ''}`,
        variant: "success",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch simulation failed';
      console.error('Batch simulation failed:', error);
      toast({
        title: "Simulation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  }, [connected, publicKey, instructions, toast]);

  // Export batch configuration
  const exportConfig = useCallback(() => {
    if (!simulationResult) {
      toast({
        title: "No Simulation Data",
        description: "Run a simulation first to export configuration",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const config = exportBatchConfig(instructions, simulationResult, optimizations);
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch-transaction-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Config Exported",
        description: "Batch configuration downloaded successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export batch configuration",
        variant: "destructive",
      });
    }
  }, [instructions, simulationResult, optimizations, toast]);

  const formatComputeUnits = (units: number) => units.toLocaleString();
  const formatFee = (fee: number) => `${fee.toLocaleString()} lamports`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Batch Transaction Builder
        </CardTitle>
        <CardDescription>
          Combine multiple instructions into optimized batch transactions to reduce costs and improve efficiency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Instructions Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="font-medium">Add Instructions</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { type: 'transfer' as const, label: 'SOL Transfer', icon: '💰' },
              { type: 'memo' as const, label: 'Memo', icon: '📝' },
              { type: 'token' as const, label: 'Token Transfer', icon: '🪙' },
              { type: 'custom' as const, label: 'Custom', icon: '⚙️' },
            ].map((option) => (
              <Button
                key={option.type}
                variant="outline"
                size="sm"
                onClick={() => addInstruction(option.type)}
                className="flex flex-col h-auto p-3"
                aria-label={`Add ${option.label} instruction to batch`}
              >
                <span className="text-lg mb-1">{option.icon}</span>
                <span className="text-xs">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Instructions List */}
        {instructions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Instructions ({instructions.length})</span>
              <span className="text-sm text-gray-500">
                Est. Total: {formatComputeUnits(instructions.reduce((sum, instr) => sum + instr.estimatedComputeUnits, 0))} CU
              </span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {instructions.map((instr, index) => (
                <div key={instr.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-mono text-gray-500 w-6">#{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={instr.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        updateInstruction(instr.id, { name: e.target.value })
                      }
                      className="font-medium bg-transparent border-none outline-none text-sm w-full"
                      placeholder="Instruction name"
                      aria-label={`Name for ${instr.type} instruction`}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {instr.type} • {formatComputeUnits(instr.estimatedComputeUnits)} CU
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInstruction(instr.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove ${instr.name || instr.type} instruction`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simulate Button */}
        <Button
          onClick={simulateBatch}
          disabled={isSimulating || !connected || instructions.length === 0}
          className="w-full"
          size="lg"
          aria-label={isSimulating ? "Running batch simulation" : "Start batch transaction simulation"}
        >
          {isSimulating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Simulating Batch...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Simulate Batch Transaction
            </>
          )}
        </Button>

        {!connected && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to simulate batch transactions
            </AlertDescription>
          </Alert>
        )}

        {instructions.length === 0 && connected && (
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              Add some instructions above to start building your batch transaction
            </AlertDescription>
          </Alert>
        )}

        {/* Simulation Results */}
        {simulationResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {simulationResult.canBatch ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <h3 className="text-lg font-semibold">
                Batch Simulation {simulationResult.canBatch ? 'Successful' : 'Warning'}
              </h3>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Compute Units</span>
                </div>
                <div className="text-xl font-bold text-blue-600">
                  {formatComputeUnits(simulationResult.totalComputeUnits)}
                </div>
                <div className="text-xs text-gray-500">
                  Recommended Limit: {formatComputeUnits(simulationResult.recommendedComputeLimit)}
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">💰 Total Fee</span>
                </div>
                <div className="text-xl font-bold text-green-600">
                  {formatFee(simulationResult.totalFee)}
                </div>
                <div className="text-xs text-gray-500">
                  vs {instructions.length} separate txns: {formatFee(instructions.length * 5000)}
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">💾 Efficiency</span>
                </div>
                <div className="text-xl font-bold text-purple-600">
                  {Math.round(((instructions.length - 1) / instructions.length) * 100)}%
                </div>
                <div className="text-xs text-gray-500">
                  Saved {instructions.length - 1} transaction{instructions.length > 2 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Warnings */}
            {simulationResult.warnings.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {simulationResult.warnings.map((warning, index) => (
                      <div key={index}>{warning}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Optimizations */}
            {simulationResult.optimizations.length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <strong>Optimizations:</strong>
                    {simulationResult.optimizations.map((opt, index) => (
                      <div key={index} className="text-sm">• {opt}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Optimization Strategies */}
            {optimizations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Optimization Strategies</h4>
                <div className="space-y-2">
                  {optimizations.map((opt, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border cursor-pointer ${
                        selectedOptimization === index 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => setSelectedOptimization(index)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">{opt.strategy} Strategy</span>
                        <span className="text-sm text-green-600">
                          Save {formatFee(opt.estimatedSavings)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{opt.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {opt.batches.length} batch{opt.batches.length > 1 ? 'es' : ''} • 
                        {formatComputeUnits(opt.totalComputeUnits)} total CU
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export Configuration */}
            <div className="pt-4 border-t">
              <Button
                onClick={exportConfig}
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Batch Configuration (JSON)
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}