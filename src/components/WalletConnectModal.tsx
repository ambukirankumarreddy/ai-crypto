import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  ShieldCheck, 
  Wallet, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Lock, 
  Copy, 
  ClipboardPaste, 
  Sparkles,
  Layers,
  ArrowRight,
  Globe
} from 'lucide-react';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Strict Wallet Address Format Validator
 * Checks Ethereum EVM (0x + 40 hex), ENS (.eth), or Solana Base58 public key.
 */
export const validateWalletAddressFormat = (address: string, network: string = 'Ethereum & Layer 2s'): {
  isValid: boolean;
  detectedType: 'EVM' | 'ENS' | 'SOLANA' | 'INVALID';
  errorMessage?: string;
  normalizedAddress: string;
} => {
  const clean = address.trim();

  if (!clean) {
    return {
      isValid: false,
      detectedType: 'INVALID',
      errorMessage: 'Wallet address cannot be empty.',
      normalizedAddress: clean
    };
  }

  // EVM Regex: 0x followed by exactly 40 hexadecimal characters (case-insensitive)
  const evmRegex = /^0x[a-fA-F0-9]{40}$/;
  // ENS Regex: at least 3 characters followed by .eth
  const ensRegex = /^[a-zA-Z0-9][-a-zA-Z0-9]{1,62}\.eth$/i;
  // Solana Base58 Regex: 32-44 base58 characters
  const solRegex = /^[1-9A-HJ-NP-za-km-z]{32,44}$/;

  if (evmRegex.test(clean)) {
    return {
      isValid: true,
      detectedType: 'EVM',
      normalizedAddress: clean
    };
  }

  if (ensRegex.test(clean)) {
    return {
      isValid: true,
      detectedType: 'ENS',
      normalizedAddress: clean.toLowerCase()
    };
  }

  if (solRegex.test(clean) && network.toLowerCase().includes('solana')) {
    return {
      isValid: true,
      detectedType: 'SOLANA',
      normalizedAddress: clean
    };
  }

  // Detailed validation error diagnostics
  let errorMsg = 'Invalid wallet address format.';
  if (clean.startsWith('0x') && clean.length !== 42) {
    errorMsg = `EVM address length mismatch: expected 42 characters (including "0x"), but received ${clean.length} characters.`;
  } else if (!clean.startsWith('0x') && /^[a-fA-F0-9]{40}$/.test(clean)) {
    errorMsg = 'Missing "0x" prefix for standard Ethereum/EVM address.';
  } else if (clean.startsWith('0x') && !/^0x[a-fA-F0-9]+$/.test(clean)) {
    errorMsg = 'Address contains invalid non-hexadecimal characters.';
  } else if (clean.includes('.eth') && !ensRegex.test(clean)) {
    errorMsg = 'Invalid ENS name format (e.g. valid format: vitalik.eth).';
  } else {
    errorMsg = 'Please enter a valid Ethereum/EVM address (0x...), ENS name (*.eth), or Solana public key.';
  }

  return {
    isValid: false,
    detectedType: 'INVALID',
    errorMessage: errorMsg,
    normalizedAddress: clean
  };
};

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
  const { wallet, connectWallet, setCustomWalletAddress, disconnectWallet } = useApp();
  const [customAddress, setCustomAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('Ethereum & Layer 2s');
  const [walletLabel, setWalletLabel] = useState('My MetaMask Wallet');
  const [copied, setCopied] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'custom' | 'providers'>('custom');

  if (!isOpen) return null;

  const handleCopyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setCustomAddress(text.trim());
          setInputError(null);
        }
      }
    } catch (e) {
      console.warn('[WalletConnectModal] Clipboard read permission not granted', e);
    }
  };

  /**
   * Primary Wallet Connection Handler with Comprehensive Tracing & Strict Verification
   */
  const handleWalletConnect = (
    rawAddress: string,
    network: string = 'Ethereum & Layer 2s',
    label: string = 'My Web3 Wallet'
  ): boolean => {
    const timestamp = new Date().toISOString();
    console.group(`[WalletConnectModal:handleWalletConnect] Trace at ${timestamp}`);
    console.log('[WalletConnectModal:handleWalletConnect] Input Address:', rawAddress);
    console.log('[WalletConnectModal:handleWalletConnect] Target Network:', network);
    console.log('[WalletConnectModal:handleWalletConnect] Wallet Label:', label);
    console.log('[WalletConnectModal:handleWalletConnect] Current App State Address:', wallet.address);
    console.log('[WalletConnectModal:handleWalletConnect] Current App State Connected:', wallet.isConnected);

    // 1. Strict Validation Check
    const validation = validateWalletAddressFormat(rawAddress, network);
    console.log('[WalletConnectModal:handleWalletConnect] Format Validation Result:', validation);

    if (!validation.isValid) {
      const errorMsg = validation.errorMessage || 'Invalid wallet address format.';
      console.error('[WalletConnectModal:handleWalletConnect] Validation FAILED:', {
        rawInput: rawAddress,
        detectedType: validation.detectedType,
        error: errorMsg
      });
      setInputError(errorMsg);
      console.groupEnd();
      return false;
    }

    // 2. Clear previous validation errors
    setInputError(null);
    console.log('[WalletConnectModal:handleWalletConnect] Validation PASSED. Verified Type:', validation.detectedType);

    // 3. Dispatch to App State
    try {
      console.log('[WalletConnectModal:handleWalletConnect] Calling setCustomWalletAddress with normalized address:', validation.normalizedAddress);
      const success = setCustomWalletAddress(
        validation.normalizedAddress,
        network,
        label || (validation.detectedType === 'EVM' ? 'MetaMask' : 'Custom Wallet')
      );

      console.log('[WalletConnectModal:handleWalletConnect] setCustomWalletAddress outcome:', success);
      if (success) {
        console.log('[WalletConnectModal:handleWalletConnect] State update successful. Resetting form and closing modal.');
        setCustomAddress('');
        console.groupEnd();
        onClose();
        return true;
      } else {
        console.warn('[WalletConnectModal:handleWalletConnect] setCustomWalletAddress returned false.');
        console.groupEnd();
        return false;
      }
    } catch (err: any) {
      console.error('[WalletConnectModal:handleWalletConnect] Exception occurred during state update:', err);
      setInputError(err?.message || 'Unexpected error updating wallet state.');
      console.groupEnd();
      return false;
    }
  };

  const handleSaveCustomWallet = (e: React.FormEvent) => {
    e.preventDefault();
    handleWalletConnect(customAddress, selectedNetwork, walletLabel || 'My Web3 Wallet');
  };

  const handleProviderConnect = async (providerName: 'MetaMask' | 'WalletConnect' | 'Phantom' | 'Demo Execution Sandbox') => {
    console.group(`[WalletConnectModal:handleProviderConnect] Provider: ${providerName}`);
    console.log('[WalletConnectModal:handleProviderConnect] Timestamp:', new Date().toISOString());
    try {
      await connectWallet(providerName);
      console.log(`[WalletConnectModal:handleProviderConnect] Provider ${providerName} connection triggered successfully.`);
      console.groupEnd();
      onClose();
    } catch (err: any) {
      console.error(`[WalletConnectModal:handleProviderConnect] Provider ${providerName} connection failed:`, err);
      console.groupEnd();
    }
  };

  const setSampleAddress = (addr: string, label: string, network: string = 'Ethereum & Layer 2s') => {
    console.log('[WalletConnectModal:setSampleAddress] Selecting sample preset:', { addr, label, network });
    setCustomAddress(addr);
    setWalletLabel(label);
    setSelectedNetwork(network);
    setInputError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-cyan-950/60 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Connect / Configure Wallet ID
            </h3>
            <p className="text-xs text-slate-400">Add your custom wallet address or connect Web3 provider</p>
          </div>
        </div>

        {/* Cryptographic Privacy Notice */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl mb-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
            <span>100% Non-Custodial & Read-Safe</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The platform only reads public on-chain balances and dispatches signed actions. Private keys and seed phrases are <strong>never</strong> requested or stored.
          </p>
        </div>

        {/* Current Active Wallet Banner */}
        {wallet.isConnected && wallet.address ? (
          <div className="p-3.5 bg-slate-950/90 border border-cyan-500/30 rounded-xl mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Wallet ID
              </span>
              <span className="text-cyan-400 font-mono text-[11px] bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20">
                {wallet.walletType}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 font-mono text-xs text-slate-200 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="break-all select-all">{wallet.address}</span>
              <button
                onClick={handleCopyAddress}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors shrink-0 cursor-pointer"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Network: <strong className="text-slate-200">{wallet.network}</strong></span>
              <span>Balance: <strong className="text-emerald-400 font-mono">${wallet.totalBalanceUSD.toFixed(2)} USD</strong></span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  disconnectWallet();
                }}
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-rose-400 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/50 transition-colors cursor-pointer text-center"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : null}

        {/* Tab Selection */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 mb-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 px-3 rounded-md transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Enter / Paste Wallet Address
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex-1 py-1.5 px-3 rounded-md transition-all cursor-pointer ${
              activeTab === 'providers'
                ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Web3 Providers & Sandbox
          </button>
        </div>

        {/* TAB 1: Enter / Paste Custom Wallet ID */}
        {activeTab === 'custom' && (
          <form onSubmit={handleSaveCustomWallet} className="space-y-3 mb-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <span>Wallet Address or ENS / Public Key</span>
                  <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>Paste from clipboard</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => {
                    setCustomAddress(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder="e.g. 0xe544B74E581d6e6b57a3CC5cDf5b80bDc084734E or vitalik.eth"
                  className={`w-full px-3 py-2.5 bg-slate-950 border rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors ${
                    inputError ? 'border-rose-500' : 'border-slate-800 hover:border-slate-700'
                  }`}
                />
              </div>
              {inputError && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1.5 mt-1.5 font-sans bg-rose-950/40 p-2 rounded-lg border border-rose-800/40">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{inputError}</span>
                </p>
              )}
            </div>

            {/* Custom Label & Network Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Wallet Label (Optional)
                </label>
                <input
                  type="text"
                  value={walletLabel}
                  onChange={(e) => setWalletLabel(e.target.value)}
                  placeholder="e.g. My MetaMask Wallet"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Primary Network
                </label>
                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Ethereum & Layer 2s">Ethereum & Layer 2s (Multi-Chain)</option>
                  <option value="Arbitrum One">Arbitrum One</option>
                  <option value="Optimism">Optimism</option>
                  <option value="Polygon POS">Polygon POS</option>
                  <option value="Base">Base L2</option>
                  <option value="Ethereum Mainnet">Ethereum Mainnet</option>
                  <option value="Solana">Solana</option>
                </select>
              </div>
            </div>

            {/* Quick Test / Demo Address Chips */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-500 font-mono block mb-1.5">
                Quick-fill sample address:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSampleAddress('0xe544B74E581d6e6b57a3CC5cDf5b80bDc084734E', 'My MetaMask Wallet', 'Ethereum & Layer 2s')}
                  className="text-[10px] font-mono px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 rounded text-cyan-300 transition-colors cursor-pointer"
                >
                  0xe544...734E (My MetaMask)
                </button>
                <button
                  type="button"
                  onClick={() => setSampleAddress('0x71C8A9e46a7821B27357A42718E1924619a9B801', 'Treasury Multi-Sig', 'Ethereum & Layer 2s')}
                  className="text-[10px] font-mono px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded text-slate-300 transition-colors cursor-pointer"
                >
                  0x71C8...B801 (Multi-Sig)
                </button>
                <button
                  type="button"
                  onClick={() => setSampleAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'vitalik.eth', 'Ethereum Mainnet')}
                  className="text-[10px] font-mono px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded text-slate-300 transition-colors cursor-pointer"
                >
                  vitalik.eth
                </button>
                <button
                  type="button"
                  onClick={() => setSampleAddress('0x1111111254fb6c44bac0bed2854e76f90643097d', '1inch Aggregator', 'Ethereum & Layer 2s')}
                  className="text-[10px] font-mono px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded text-slate-300 transition-colors cursor-pointer"
                >
                  0x1111...097d (Protocol)
                </button>
              </div>
            </div>

            {/* Save & Connect Button */}
            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Check className="w-4 h-4" />
              <span>Validate, Save & Connect Wallet Address</span>
            </button>
          </form>
        )}

        {/* TAB 2: Provider Buttons & Sandbox */}
        {activeTab === 'providers' && (
          <div className="space-y-2 mb-4">
            <button
              type="button"
              onClick={() => handleProviderConnect('MetaMask')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-950/60 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">
                  MM
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                    MetaMask / Browser Extension
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {typeof window !== 'undefined' && (window as any).ethereum ? 'Extension detected' : 'Direct EIP-1193 connector'}
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono group-hover:text-white flex items-center gap-1">
                Connect <ArrowRight className="w-3 h-3" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleProviderConnect('WalletConnect')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                  WC
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                    WalletConnect v2
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">Mobile & QR-code hardware wallets</div>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono group-hover:text-white flex items-center gap-1">
                Connect <ArrowRight className="w-3 h-3" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleProviderConnect('Phantom')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/50 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                  PH
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
                    Phantom / Solana Wallet
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">Solana & EVM multi-chain connector</div>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono group-hover:text-white flex items-center gap-1">
                Connect <ArrowRight className="w-3 h-3" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleProviderConnect('Demo Execution Sandbox')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                    Pre-Funded Execution Sandbox
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">Instant testnet simulator with $846.50 balance</div>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-mono group-hover:underline flex items-center gap-1">
                Activate <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>Supported: ETH, Polygon, ARB, Base, OP, SOL</span>
          </span>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
