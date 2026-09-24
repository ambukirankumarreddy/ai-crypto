import { Opportunity, SecurityPolicy } from '../types';

export interface PolicyCheckResult {
  passed: boolean;
  requiresHumanApproval: boolean;
  reasons: string[];
  checks: {
    chainAllowed: boolean;
    riskScorePassed: boolean;
    transactionCapPassed: boolean;
    profitabilityPassed: boolean;
    domainAllowed: boolean;
    contractAllowlisted: boolean;
    emergencyStopCheck: boolean;
  };
}

export class PolicyEngine {
  static evaluateOpportunity(
    opportunity: Opportunity,
    policy: SecurityPolicy
  ): PolicyCheckResult {
    const reasons: string[] = [];
    const checks = {
      chainAllowed: policy.allowedChains.includes(opportunity.chain),
      riskScorePassed: opportunity.riskScore <= policy.maxRiskScoreAllowed,
      transactionCapPassed: (opportunity.estimatedGasCost + opportunity.requiredCapital) <= policy.maxTransactionValueUSD,
      profitabilityPassed: opportunity.expectedNetProfit >= policy.minExpectedNetProfitUSD,
      domainAllowed: true,
      contractAllowlisted: true,
      emergencyStopCheck: !policy.emergencyStopActive
    };

    if (policy.emergencyStopActive) {
      reasons.push('GLOBAL EMERGENCY STOP is active. All automated actions blocked.');
    }

    if (!checks.chainAllowed) {
      reasons.push(`Chain '${opportunity.chain}' is not on the active allowed chains list.`);
    }

    if (!checks.riskScorePassed) {
      reasons.push(`Risk score (${opportunity.riskScore}/100) exceeds maximum permitted threshold (${policy.maxRiskScoreAllowed}/100).`);
    }

    if (!checks.profitabilityPassed) {
      reasons.push(`Expected net profit ($${opportunity.expectedNetProfit.toFixed(2)}) is below configured minimum profit ($${policy.minExpectedNetProfitUSD.toFixed(2)}).`);
    }

    let requiresHumanApproval = false;

    // Check if required capital or gas exceeds zero-touch limit
    if (opportunity.requiredCapital > policy.maxTransactionValueUSD) {
      requiresHumanApproval = true;
      reasons.push(`Required capital ($${opportunity.requiredCapital.toFixed(2)}) exceeds autonomous threshold ($${policy.maxTransactionValueUSD.toFixed(2)}). Human Owner sign-off required.`);
    }

    // Check contract allowlist if address is present
    if (opportunity.smartContractAddress) {
      const match = policy.allowedContractAllowlist.some(
        c => c.address.toLowerCase() === opportunity.smartContractAddress?.toLowerCase()
      );
      if (!match) {
        checks.contractAllowlisted = false;
        requiresHumanApproval = true;
        reasons.push(`Contract address ${opportunity.smartContractAddress.slice(0, 10)}... is unindexed. Requires human verification before execution.`);
      }
    }

    // Extract domain from sourceUrl
    if (opportunity.sourceUrl) {
      try {
        const url = new URL(opportunity.sourceUrl);
        const host = url.hostname.replace('www.', '');
        const isDomainAllowed = policy.allowedDomains.some(d => host.endsWith(d) || d.endsWith(host));
        if (!isDomainAllowed) {
          checks.domainAllowed = false;
          requiresHumanApproval = true;
          reasons.push(`Domain ${host} is not yet on the approved domain allowlist.`);
        }
      } catch {
        checks.domainAllowed = false;
        reasons.push('Invalid or malformed source URL.');
      }
    }

    const passed = checks.chainAllowed && 
                   checks.riskScorePassed && 
                   checks.profitabilityPassed && 
                   checks.emergencyStopCheck && 
                   !requiresHumanApproval;

    return {
      passed,
      requiresHumanApproval,
      reasons,
      checks
    };
  }

  /**
   * Check if dynamic security should trip due to failed transactions
   */
  static checkDynamicSecurityTripwire(policy: SecurityPolicy): {
    tripped: boolean;
    actionTaken?: string;
  } {
    if (policy.currentFailedTxCount >= policy.autoHaltOnFailedTxCount) {
      return {
        tripped: true,
        actionTaken: `Automatically lowered agent permissions and paused automated execution after ${policy.currentFailedTxCount} failed transactions.`
      };
    }
    return { tripped: false };
  }
}
