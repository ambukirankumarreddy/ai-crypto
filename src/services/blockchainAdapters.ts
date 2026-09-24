export interface ChainSimulationResult {
  success: boolean;
  gasEstimatedUSD: number;
  gasUsedUnits: number;
  revertReason?: string;
  stateChanges: {
    target: string;
    action: string;
    tokenDelta: string;
  }[];
}

export abstract class BaseChainAdapter {
  abstract readonly chainName: string;
  abstract readonly chainId: number;
  abstract readonly nativeSymbol: string;
  abstract readonly rpcUrl: string;

  abstract estimateGasCost(action: string, gasPriceGwei: number): Promise<number>;
  abstract simulateTransaction(
    targetContract: string,
    data: string,
    valueWei: string
  ): Promise<ChainSimulationResult>;
}

export class EthereumAdapter extends BaseChainAdapter {
  readonly chainName = 'Ethereum';
  readonly chainId = 1;
  readonly nativeSymbol = 'ETH';
  readonly rpcUrl = 'https://eth.llamarpc.com';

  async estimateGasCost(action: string, gasPriceGwei: number = 14.2): Promise<number> {
    const gasUnits = action.includes('STAKE') ? 140000 : 65000;
    const ethCost = (gasUnits * gasPriceGwei * 1e-9);
    const ethPriceUSD = 2750;
    return Math.round(ethCost * ethPriceUSD * 100) / 100;
  }

  async simulateTransaction(
    targetContract: string,
    _data: string,
    _valueWei: string
  ): Promise<ChainSimulationResult> {
    // Tenderly / eth_call simulation
    return {
      success: true,
      gasEstimatedUSD: 1.85,
      gasUsedUnits: 72400,
      stateChanges: [
        {
          target: targetContract,
          action: 'DEPOSIT_OR_INTERACTION',
          tokenDelta: '+0.0085 stETH'
        }
      ]
    };
  }
}

export class PolygonAdapter extends BaseChainAdapter {
  readonly chainName = 'Polygon';
  readonly chainId = 137;
  readonly nativeSymbol = 'POL';
  readonly rpcUrl = 'https://polygon-rpc.com';

  async estimateGasCost(_action: string, gasPriceGwei: number = 32.5): Promise<number> {
    const gasUnits = 85000;
    const polCost = (gasUnits * gasPriceGwei * 1e-9);
    const polPriceUSD = 0.42;
    return Math.round(polCost * polPriceUSD * 100) / 100 || 0.04;
  }

  async simulateTransaction(
    targetContract: string,
    _data: string,
    _valueWei: string
  ): Promise<ChainSimulationResult> {
    return {
      success: true,
      gasEstimatedUSD: 0.04,
      gasUsedUnits: 68100,
      stateChanges: [
        {
          target: targetContract,
          action: 'BRIDGE_OR_CLAIM',
          tokenDelta: '+STG Reward Points'
        }
      ]
    };
  }
}

export class ArbitrumAdapter extends BaseChainAdapter {
  readonly chainName = 'Arbitrum';
  readonly chainId = 42161;
  readonly nativeSymbol = 'ETH';
  readonly rpcUrl = 'https://arb1.arbitrum.io/rpc';

  async estimateGasCost(_action: string, gasPriceGwei: number = 0.12): Promise<number> {
    const gasUnits = 120000;
    const ethCost = (gasUnits * gasPriceGwei * 1e-9);
    const ethPriceUSD = 2750;
    return Math.max(0.05, Math.round(ethCost * ethPriceUSD * 100) / 100);
  }

  async simulateTransaction(
    targetContract: string,
    _data: string,
    _valueWei: string
  ): Promise<ChainSimulationResult> {
    return {
      success: true,
      gasEstimatedUSD: 0.05,
      gasUsedUnits: 94200,
      stateChanges: [
        {
          target: targetContract,
          action: 'WASM_TESTNET_INVOKE',
          tokenDelta: '+3.25 ARB reward entitlement'
        }
      ]
    };
  }
}

export class BaseNetworkAdapter extends BaseChainAdapter {
  readonly chainName = 'Base';
  readonly chainId = 8453;
  readonly nativeSymbol = 'ETH';
  readonly rpcUrl = 'https://mainnet.base.org';

  async estimateGasCost(_action: string, gasPriceGwei: number = 0.08): Promise<number> {
    return 0.14;
  }

  async simulateTransaction(
    targetContract: string,
    _data: string,
    _valueWei: string
  ): Promise<ChainSimulationResult> {
    return {
      success: true,
      gasEstimatedUSD: 0.14,
      gasUsedUnits: 58000,
      stateChanges: [
        {
          target: targetContract,
          action: 'QUEST_VERIFICATION',
          tokenDelta: '+0.0018 ETH voucher'
        }
      ]
    };
  }
}

export class OptimismAdapter extends BaseChainAdapter {
  readonly chainName = 'Optimism';
  readonly chainId = 10;
  readonly nativeSymbol = 'ETH';
  readonly rpcUrl = 'https://mainnet.optimism.io';

  async estimateGasCost(_action: string, gasPriceGwei: number = 0.09): Promise<number> {
    return 0.08;
  }

  async simulateTransaction(
    targetContract: string,
    _data: string,
    _valueWei: string
  ): Promise<ChainSimulationResult> {
    return {
      success: true,
      gasEstimatedUSD: 0.08,
      gasUsedUnits: 51000,
      stateChanges: [
        {
          target: targetContract,
          action: 'EAS_ATTESTATION',
          tokenDelta: 'RetroPGF Milestone #2 Verified'
        }
      ]
    };
  }
}

export class BlockchainAdapterRegistry {
  private static adapters: Map<string, BaseChainAdapter> = new Map<string, BaseChainAdapter>([
    ['Ethereum', new EthereumAdapter()],
    ['Polygon', new PolygonAdapter()],
    ['Arbitrum', new ArbitrumAdapter()],
    ['Base', new BaseNetworkAdapter()],
    ['Optimism', new OptimismAdapter()]
  ]);

  static getAdapter(chain: string): BaseChainAdapter | undefined {
    return this.adapters.get(chain);
  }

  static getAllChains(): string[] {
    return Array.from(this.adapters.keys());
  }
}
