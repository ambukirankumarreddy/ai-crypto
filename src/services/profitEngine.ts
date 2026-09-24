import { Opportunity } from '../types';

export interface ProfitCalculationResult {
  expectedGrossReward: number;
  estimatedGasCost: number;
  estimatedInfraCost: number;
  estimatedAiCost: number;
  estimatedRpcCost: number;
  estimatedTxFees: number;
  totalCost: number;
  expectedNetProfit: number;
  meetsMinimumProfit: boolean;
  minConfiguredProfit: number;
  marginPercent: number;
  recommendation: 'EXECUTE' | 'REJECT_UNPROFITABLE' | 'MANUAL_REVIEW';
}

export class ProfitabilityEngine {
  /**
   * Expected Net Profit = Expected Reward - Gas Cost - Infrastructure Cost - AI Cost - RPC Cost - Transaction Fees - Other Costs
   */
  static calculate(
    opportunity: Opportunity,
    minConfiguredProfit: number = 1.00
  ): ProfitCalculationResult {
    const gross = opportunity.expectedGrossReward || 0;
    const gas = opportunity.estimatedGasCost || 0;
    const infra = opportunity.estimatedInfraCost || 0;
    const aiCost = opportunity.estimatedAiCost || 0;
    const rpcCost = 0.01; // $0.01 per RPC session
    const txFees = 0.00;

    const totalCost = gas + infra + aiCost + rpcCost + txFees;
    const netProfit = gross - totalCost;
    const roundedNet = Math.round(netProfit * 100) / 100;
    const marginPercent = gross > 0 ? Math.round((roundedNet / gross) * 100) : 0;

    const meetsMinimum = roundedNet >= minConfiguredProfit;

    let recommendation: 'EXECUTE' | 'REJECT_UNPROFITABLE' | 'MANUAL_REVIEW' = 'EXECUTE';
    if (!meetsMinimum) {
      recommendation = 'REJECT_UNPROFITABLE';
    } else if (opportunity.requiredCapital > 10.00) {
      recommendation = 'MANUAL_REVIEW';
    }

    return {
      expectedGrossReward: gross,
      estimatedGasCost: gas,
      estimatedInfraCost: infra,
      estimatedAiCost: aiCost,
      estimatedRpcCost: rpcCost,
      estimatedTxFees: txFees,
      totalCost: Math.round(totalCost * 100) / 100,
      expectedNetProfit: roundedNet,
      meetsMinimumProfit: meetsMinimum,
      minConfiguredProfit,
      marginPercent,
      recommendation
    };
  }
}
