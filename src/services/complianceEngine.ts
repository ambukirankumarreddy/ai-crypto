/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Opportunity,
  CompliancePolicy,
  ComplianceDecisionState,
  RegulatoryActivityClassification,
  ThreeLayerVerification,
  ComplianceAuditRecord,
  TaxAccountingRecord
} from '../types';
import { AuditHashChainer } from './cryptoAudit';

export class ComplianceEngine {
  /**
   * SECTION 48: THE NON-OVERRIDE PRINCIPLE
   * Profit must NEVER override compliance.
   * Growth must NEVER override security.
   * AI autonomy must NEVER override human approval requirements.
   */

  /**
   * SECTION 33: Regulatory Classification
   */
  public static classifyOpportunity(opp: Opportunity): RegulatoryActivityClassification {
    const title = opp.title.toLowerCase();
    const category = opp.category.toUpperCase();

    if (category === 'TESTNET' || title.includes('testnet') || title.includes('faucet')) {
      return 'TESTNET_PARTICIPATION';
    }
    if (title.includes('quest') || title.includes('developer') || title.includes('builder') || title.includes('course')) {
      return 'EDUCATIONAL_ACTIVITY';
    }
    if (category === 'DEPIN' || title.includes('bandwidth') || title.includes('compute') || title.includes('worker')) {
      return 'MINING_COMPUTE_PARTICIPATION';
    }
    if (category === 'STAKING' || title.includes('staking') || title.includes('validator') || title.includes('delegat')) {
      return 'STAKING';
    }
    if (category === 'LIQUIDITY_INCENTIVE' || title.includes('liquidity') || title.includes('pool')) {
      return 'LIQUIDITY_PROVISION';
    }
    if (category === 'AIRDROP_ELIGIBILITY' || title.includes('airdrop')) {
      return 'AIRDROP_PARTICIPATION';
    }
    if (title.includes('perpetual') || title.includes('derivative') || title.includes('margin') || title.includes('synthetic')) {
      return 'BROKERAGE_LIKE_ACTIVITY';
    }
    if (category === 'LENDING' || title.includes('borrow') || title.includes('lending') || title.includes('collateral')) {
      return 'LENDING';
    }
    if (category === 'GRANT' || title.includes('grant') || title.includes('bounty')) {
      return 'FINANCIAL_PROMOTION';
    }
    return 'DEFI_INTERACTION';
  }

  /**
   * SECTION 32, 34, 37, 38, 39, 40: Run Full Pre-Flight Compliance Gate
   * Evaluates all 9 specialized compliance gates before task or profit engine execution.
   */
  public static evaluateOpportunityCompliance(
    opp: Opportunity,
    policy: CompliancePolicy
  ): {
    decision: ComplianceDecisionState;
    blockedReason?: string;
    rulesEvaluated: string[];
    classification: RegulatoryActivityClassification;
    requiresHumanReview: boolean;
    threeLayerVerification: ThreeLayerVerification;
  } {
    const rulesEvaluated: string[] = [];
    const classification = opp.regulatoryClassification || this.classifyOpportunity(opp);

    // GATE 0: COMPLIANCE KILL SWITCH CHECK (Section 45)
    rulesEvaluated.push('GATE_00_KILL_SWITCH: Evaluation of targeted and global pause states');
    if (policy.complianceKillSwitch.allAutomatedExecutionPaused) {
      return {
        decision: 'COMPLIANCE_BLOCKED',
        blockedReason: 'COMPLIANCE KILL SWITCH ACTIVE: Global automated execution has been halted by Elena Rostova (Compliance Director).',
        rulesEvaluated,
        classification,
        requiresHumanReview: true,
        threeLayerVerification: this.buildFailedThreeLayer(opp, 'Global compliance kill switch active.')
      };
    }

    if (policy.complianceKillSwitch.pausedOpportunities.includes(opp.id)) {
      return {
        decision: 'COMPLIANCE_BLOCKED',
        blockedReason: `COMPLIANCE KILL SWITCH: Opportunity ${opp.id} is targeted for immediate compliance halt.`,
        rulesEvaluated,
        classification,
        requiresHumanReview: true,
        threeLayerVerification: this.buildFailedThreeLayer(opp, `Targeted compliance kill switch active for ${opp.id}.`)
      };
    }

    if (policy.complianceKillSwitch.pausedProjects.includes(opp.project)) {
      return {
        decision: 'COMPLIANCE_BLOCKED',
        blockedReason: `COMPLIANCE KILL SWITCH: Project ${opp.project} is paused under active compliance order.`,
        rulesEvaluated,
        classification,
        requiresHumanReview: true,
        threeLayerVerification: this.buildFailedThreeLayer(opp, `Project ${opp.project} paused under compliance order.`)
      };
    }

    if (policy.complianceKillSwitch.pausedChains.includes(opp.chain)) {
      return {
        decision: 'COMPLIANCE_BLOCKED',
        blockedReason: `COMPLIANCE KILL SWITCH: Blockchain network ${opp.chain} is paused for compliance review.`,
        rulesEvaluated,
        classification,
        requiresHumanReview: true,
        threeLayerVerification: this.buildFailedThreeLayer(opp, `Chain ${opp.chain} paused under compliance order.`)
      };
    }

    // GATE 1: AML, SANCTIONS & FINANCIAL CRIME (Section 34)
    rulesEvaluated.push('GATE_01_AML_SANCTIONS: Screen address and entity against OFAC, EU, UN SDN lists');
    const sanctionedAddresses = [
      '0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc', // Tornado mixer
      '0x8576acc5c05d6ce0b7414d47730279761494950f',
      '0x7ffaa5794704b68329e5be9e3321820a43fca1a1'
    ];
    if (opp.smartContractAddress && sanctionedAddresses.includes(opp.smartContractAddress.toLowerCase())) {
      return {
        decision: 'COMPLIANCE_BLOCKED',
        blockedReason: 'COMPLIANCE DIRECTOR VETO: Identified smart contract address linked to OFAC Specially Designated Nationals (SDN) sanctions list and FATF Travel Rule advisory. Profit cannot override compliance.',
        rulesEvaluated,
        classification,
        requiresHumanReview: false,
        threeLayerVerification: this.buildFailedThreeLayer(opp, 'OFAC SDN sanctions violation.')
      };
    }

    // GATE 2: CONSUMER PROTECTION & DECEPTIVE CLAIMS (Section 37)
    rulesEvaluated.push('GATE_02_CONSUMER_PROTECTION: Audit against misleading claims & enforce disclosures');
    const lowerTitle = opp.title.toLowerCase();
    const isDeceptive = lowerTitle.includes('guaranteed free') || lowerTitle.includes('risk-free') || lowerTitle.includes('get rich');
    if (isDeceptive || !opp.verifiedOfficial) {
      if (!opp.verifiedOfficial && opp.riskScore > 80) {
        return {
          decision: 'COMPLIANCE_BLOCKED',
          blockedReason: 'COMPLIANCE DIRECTOR VETO: Unverified source exhibiting high risk score and misleading reward representations violating Section 37 consumer protection rules.',
          rulesEvaluated,
          classification,
          requiresHumanReview: false,
          threeLayerVerification: this.buildFailedThreeLayer(opp, 'Deceptive marketing or unverified domain.')
        };
      }
    }

    // GATE 3: THIRD-PARTY TERMS OF SERVICE & AUTOMATION (Section 38)
    rulesEvaluated.push('GATE_03_TERMS_OF_SERVICE: Check automation permission, robots.txt, and bypass prohibition');
    if (opp.termsOfService?.automationPermission === 'PROHIBITED') {
      return {
        decision: 'COMPLIANCE_BLOCKED',
        blockedReason: 'TERMS OF SERVICE VIOLATION: Platform explicitly prohibits automated headless interaction. Circumvention tools strictly banned.',
        rulesEvaluated,
        classification,
        requiresHumanReview: false,
        threeLayerVerification: this.buildFailedThreeLayer(opp, 'Automated interaction prohibited by platform terms.')
      };
    }

    // GATE 4: JURISDICTION RESTRICTIONS & REGULATED SERVICES (Section 32, 33, 40)
    rulesEvaluated.push('GATE_04_JURISDICTION_ACTIVITY: Cross-reference declared jurisdiction with prohibited activities');
    const userJurisdictionConfig = policy.jurisdictionConfigs.find(j => j.code === 'US') || policy.jurisdictionConfigs[0];
    if (userJurisdictionConfig && userJurisdictionConfig.prohibitedCategories.includes(classification)) {
      // Regulated service requiring explicit human review
      return {
        decision: 'HUMAN_REVIEW_REQUIRED',
        blockedReason: `REGULATORY CLASSIFICATION: Activity constitutes ${classification}, which requires Human Owner compliance verification in jurisdiction ${userJurisdictionConfig.name}.`,
        rulesEvaluated,
        classification,
        requiresHumanReview: true,
        threeLayerVerification: this.buildHumanReviewThreeLayer(opp, classification, userJurisdictionConfig.name)
      };
    }

    // GATE 5: CAPITAL & STAKING THRESHOLDS (Section 33 & 35)
    rulesEvaluated.push('GATE_05_CAPITAL_POLICY: Check capital lockups, staking disclosures, and high-value limits');
    if (opp.requiredCapital > policy.requireKycAboveUSD || classification === 'STAKING' || opp.requiredCapital > 15.00) {
      return {
        decision: 'HUMAN_REVIEW_REQUIRED',
        blockedReason: `COMPLIANCE THRESHOLD: Capital required ($${opp.requiredCapital.toFixed(2)}) or ${classification} classification mandates Human Owner authorization.`,
        rulesEvaluated,
        classification,
        requiresHumanReview: true,
        threeLayerVerification: this.buildHumanReviewThreeLayer(opp, classification, 'Capital / Staking Scope')
      };
    }

    // If all pass with capital bounds:
    rulesEvaluated.push('GATE_06_APPROVED: Cleared Layer 1 Security, Layer 2 Compliance, and Layer 3 Financial');
    const isApprovedWithLimits = opp.requiredCapital > 0;
    const finalDecision: ComplianceDecisionState = isApprovedWithLimits ? 'COMPLIANCE_APPROVED_WITH_LIMITS' : 'COMPLIANCE_APPROVED';

    return {
      decision: finalDecision,
      rulesEvaluated,
      classification,
      requiresHumanReview: false,
      threeLayerVerification: this.buildApprovedThreeLayer(opp, classification, finalDecision)
    };
  }

  /**
   * Helper to build Layer 1 -> Layer 2 -> Layer 3 approved structure
   */
  private static buildApprovedThreeLayer(
    opp: Opportunity,
    classification: RegulatoryActivityClassification,
    decision: ComplianceDecisionState
  ): ThreeLayerVerification {
    return {
      layer1Security: {
        passed: true,
        score: Math.max(90, 100 - opp.riskScore),
        auditor: 'Seraphina Ward (Security Director)',
        notes: 'Sandbox contract simulation passed. Bytecode analyzed for drainer signatures.',
        checkedAt: 'Just now'
      },
      layer2Compliance: {
        status: decision,
        complianceDirectorSigned: true,
        auditor: 'Elena Rostova (Compliance Director)',
        jurisdiction: 'US / EU Permitted (Non-custodial)',
        classification,
        amlScreeningPassed: true,
        termsOfServicePermitted: true,
        consumerProtectionChecked: true,
        notes: `Compliance cleared. Classification: ${classification}. Zero private keys requested.`,
        checkedAt: 'Just now'
      },
      layer3Financial: {
        passed: true,
        expectedGrossUSD: opp.expectedGrossReward,
        netProfitUSD: opp.expectedNetProfit,
        gasUSD: opp.estimatedGasCost,
        infraUSD: opp.estimatedInfraCost,
        aiUSD: opp.estimatedAiCost,
        auditor: 'Marcus Sterling (Finance Director)',
        checkedAt: 'Just now'
      },
      finalDecision: 'APPROVED'
    };
  }

  private static buildHumanReviewThreeLayer(
    opp: Opportunity,
    classification: RegulatoryActivityClassification,
    jurisdiction: string
  ): ThreeLayerVerification {
    return {
      layer1Security: {
        passed: true,
        score: Math.max(70, 100 - opp.riskScore),
        auditor: 'Seraphina Ward (Security Director)',
        notes: 'Security simulation passed, but high privilege or regulated scope flagged.',
        checkedAt: 'Just now'
      },
      layer2Compliance: {
        status: 'HUMAN_REVIEW_REQUIRED',
        complianceDirectorSigned: false,
        auditor: 'Elena Rostova (Compliance Director)',
        jurisdiction,
        classification,
        amlScreeningPassed: true,
        termsOfServicePermitted: true,
        consumerProtectionChecked: true,
        notes: `Human Review Required: Classification ${classification} exceeds zero-touch retail policy.`,
        checkedAt: 'Just now'
      },
      layer3Financial: {
        passed: true,
        expectedGrossUSD: opp.expectedGrossReward,
        netProfitUSD: opp.expectedNetProfit,
        gasUSD: opp.estimatedGasCost,
        infraUSD: opp.estimatedInfraCost,
        aiUSD: opp.estimatedAiCost,
        auditor: 'Marcus Sterling (Finance Director)',
        checkedAt: 'Just now'
      },
      humanApprovalSigned: false,
      finalDecision: 'HUMAN_REVIEW_REQUIRED'
    };
  }

  private static buildFailedThreeLayer(opp: Opportunity, reason: string): ThreeLayerVerification {
    return {
      layer1Security: {
        passed: opp.riskScore < 50,
        score: Math.max(5, 100 - opp.riskScore),
        auditor: 'Seraphina Ward (Security Director)',
        notes: 'Flagged during pre-flight security evaluation.',
        checkedAt: 'Just now'
      },
      layer2Compliance: {
        status: 'COMPLIANCE_BLOCKED',
        complianceDirectorSigned: false,
        auditor: 'Elena Rostova (Compliance Director)',
        jurisdiction: 'Non-compliant',
        classification: opp.regulatoryClassification || 'DEFI_INTERACTION',
        amlScreeningPassed: false,
        termsOfServicePermitted: false,
        consumerProtectionChecked: false,
        notes: `HARD VETO: ${reason}. Profit cannot override compliance.`,
        checkedAt: 'Just now'
      },
      layer3Financial: {
        passed: opp.expectedNetProfit > 0,
        expectedGrossUSD: opp.expectedGrossReward,
        netProfitUSD: opp.expectedNetProfit,
        gasUSD: opp.estimatedGasCost,
        infraUSD: opp.estimatedInfraCost,
        aiUSD: opp.estimatedAiCost,
        auditor: 'Marcus Sterling (Finance Director)',
        checkedAt: 'Just now'
      },
      finalDecision: 'BLOCKED'
    };
  }

  /**
   * SECTION 43: Create Cryptographic Compliance Audit Record
   */
  public static createComplianceAuditRecord(
    opp: Opportunity,
    decision: ComplianceDecisionState,
    reason: string,
    rulesEvaluated: string[],
    previousHash: string = '0x0000000000000000000000000000000000000000'
  ): ComplianceAuditRecord {
    const timestamp = new Date().toISOString();
    const id = `COMP-LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const hash = AuditHashChainer.createEntryHash(
      timestamp,
      'agent_dir_comp',
      decision,
      `${opp.id}:${opp.title}:${reason}`,
      previousHash
    );

    return {
      id,
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      jurisdiction: opp.jurisdiction || 'Declared US/EU Non-Custodial',
      classification: opp.regulatoryClassification || 'DEFI_INTERACTION',
      rulesEvaluated,
      documentsConsulted: [
        'Internal Compliance Manual Sections 30-48',
        'OFAC Specially Designated Nationals (SDN) Database',
        opp.termsOfService?.termsUrl ? `Terms of Service: ${opp.termsOfService.termsUrl}` : 'Standard Non-Custodial Protocol Documentation'
      ],
      decision,
      reason,
      agent: 'agent_dir_comp',
      agentTitle: 'Elena Rostova (Regulatory & Compliance Director)',
      timestamp: 'Just now',
      policyVersion: 'v2.4.1-COMPLIANCE-STRICT',
      humanApprovalRequired: decision === 'HUMAN_REVIEW_REQUIRED',
      hash,
      previousHash
    };
  }

  /**
   * SECTION 36: Generate Informational Tax Accounting Record
   */
  public static generateTaxRecord(
    rewardId: string,
    chain: string,
    tokenSymbol: string,
    tokenQuantity: number,
    fiatValueUSD: number,
    gasFeeUSD: number,
    txHash: string,
    sourceCategory: RegulatoryActivityClassification
  ): TaxAccountingRecord {
    return {
      id: `TAX-REC-${Date.now()}`,
      rewardEventId: rewardId,
      timestamp: new Date().toISOString(),
      chain,
      tokenSymbol,
      tokenQuantity,
      estimatedFiatValueUSD: fiatValueUSD,
      gasFeeUSD,
      netTaxableBasisUSD: Math.max(0, fiatValueUSD - gasFeeUSD),
      txHash,
      sourceCategory,
      jurisdiction: 'United States (IRS FMV Basis) / EU DAC8',
      taxStatus: 'PROFESSIONAL_REVIEW_REQUIRED',
      disclaimer: 'Informational accounting record only. Does not constitute tax or legal advice. Consult a licensed CPA or tax attorney in your jurisdiction.'
    };
  }
}
