import { http, HttpResponse } from 'msw';

// Mock Solana RPC responses for offline demo
export const handlers = [
  // Mock wallet balance endpoint
  http.post('https://api.mainnet-beta.solana.com', async ({ request }: { request: Request }) => {
    const body = await request.json() as { method: string; id: string | number; params?: unknown[] };
    
    if (body.method === 'getBalance') {
      return HttpResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
          context: { slot: 123456789 },
          value: 2500000000, // 2.5 SOL in lamports
        },
      });
    }

    if (body.method === 'simulateTransaction') {
      return HttpResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: {
          context: { slot: 123456789 },
          value: {
            err: null,
            logs: [
              'Program 11111111111111111111111111111111 invoke [1]',
              'Program 11111111111111111111111111111111 success',
            ],
            accounts: null,
            unitsConsumed: 1400,
            returnData: null,
          },
        },
      });
    }

    if (body.method === 'getRecentPrioritizationFees') {
      return HttpResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: [
          { slot: 123456789, prioritizationFee: 0 },
          { slot: 123456788, prioritizationFee: 1000 },
          { slot: 123456787, prioritizationFee: 2000 },
          { slot: 123456786, prioritizationFee: 1500 },
          { slot: 123456785, prioritizationFee: 3000 },
          { slot: 123456784, prioritizationFee: 2500 },
          { slot: 123456783, prioritizationFee: 1200 },
          { slot: 123456782, prioritizationFee: 800 },
          { slot: 123456781, prioritizationFee: 1800 },
          { slot: 123456780, prioritizationFee: 2200 },
        ],
      });
    }

    if (body.method === 'getSlot') {
      return HttpResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: 123456789,
      });
    }

    if (body.method === 'getBlockTime') {
      return HttpResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result: Math.floor(Date.now() / 1000),
      });
    }

    // Default response for unhandled methods
    return HttpResponse.json({
      jsonrpc: '2.0',
      id: body.id,
      error: {
        code: -32601,
        message: 'Method not found in mock server',
      },
    });
  }),

  // Mock Helius priority fee API
  http.get('https://api.helius.xyz/v0/addresses/priority-fee', () => {
    return HttpResponse.json({
      priorityFeeEstimate: {
        low: 1000,
        medium: 5000,
        high: 10000,
        veryHigh: 20000,
      },
      networkCongestion: 'medium',
      recentSlots: [
        { slot: 123456789, prioritizationFee: 2000 },
        { slot: 123456788, prioritizationFee: 1500 },
        { slot: 123456787, prioritizationFee: 3000 },
      ],
    });
  }),

  // Mock transaction cost calculation
  http.post('/api/calculate-cost', async ({ request }: { request: Request }) => {
    const { computeUnits, priorityFee } = await request.json() as { computeUnits: number; priorityFee?: number };
    
    const baseFee = 5000; // Base transaction fee in lamports
    const priorityFeeTotal = computeUnits * (priorityFee || 0);
    const totalCost = baseFee + priorityFeeTotal;
    
    return HttpResponse.json({
      baseFee,
      priorityFeeTotal,
      totalCost,
      computeUnits,
      priorityFee: priorityFee || 0,
    });
  }),

  // Mock batch transaction simulation
  http.post('/api/simulate-batch', async ({ request }: { request: Request }) => {
    const { instructions } = await request.json() as { instructions: Array<{ estimatedComputeUnits?: number }> };
    
    const totalComputeUnits = instructions.reduce(
      (sum: number, instr: { estimatedComputeUnits?: number }) => sum + (instr.estimatedComputeUnits || 1400),
      0
    );
    
    return HttpResponse.json({
      canBatch: totalComputeUnits <= 200000, // Mock limit
      totalComputeUnits,
      estimatedFee: 5000 + totalComputeUnits * 0.1,
      optimizations: [
        {
          type: 'reorder',
          description: 'Reorder instructions for better efficiency',
          savings: 500,
        },
        {
          type: 'merge',
          description: 'Merge similar operations',
          savings: 200,
        },
      ],
      warnings: totalComputeUnits > 150000 ? [
        'High compute unit usage detected. Consider splitting into multiple transactions.',
      ] : [],
    });
  }),
];

export default handlers;