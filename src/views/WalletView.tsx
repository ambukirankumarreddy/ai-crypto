import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wallet, 
  ShieldCheck, 
  ExternalLink, 
  Layers, 
  Lock, 
  Activity, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw,
  CheckCircle2,
  Copy,
  Check,
  ClipboardPaste,
  Edit3,
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { validateWalletAddressFormat } from '../components/WalletConnectModal';

interface WalletViewProps {
  onOpenWalletModal: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ onOpenWalletModal }) => {
  const { wallet, blockchainAdapters, setCustomWalletAddress, connectWallet, disconnectWallet } = useApp();
  const [copied, setCopied] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customNetwork, setCustomNetwork] = useState('Ethereum & Layer 2s');
  const [customLabel, setCustomLabel] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCopy = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setCustomInput(text.trim());
          setErrorMsg(null);
        }
      }
    } catch (e) {
      console.warn('Clipboard read permission not granted', e);
    }
  };

  const handleSaveWalletId = (e: React.FormEvent) => {
    e.preventDefault();
    console.group('[WalletView:handleSaveWalletId] Submitting Wallet Form from Wallet Page');
    console.log('[WalletView] Address entered:', customInput);
    console.log('[WalletView] Network selected:', customNetwork);
    console.log('[WalletView] Custom label:', customLabel);

    const validation = validateWalletAddressFormat(customInput, customNetwork);
    console.log('[WalletView] Validation result:', validation);

    if (!validation.isValid) {
      const errorMsg = validation.errorMessage || 'Invalid wallet address format.';
      console.error('[WalletView] Address validation FAILED:', errorMsg);
      setErrorMsg(errorMsg);
      console.groupEnd();
      return;
    }

    console.log('[WalletView] Address validated. Normalized address:', validation.normalizedAddress);
    const success = setCustomWalletAddress(
      validation.normalizedAddress,
      customNetwork,
      customLabel || (validation.detectedType === 'EVM' ? 'MetaMask' : 'Custom Wallet')
    );
    console.log('[WalletView] setCustomWalletAddress returned:', success);
    if (success) {
      setErrorMsg(null);
      setSuccessMsg(`Wallet ID (${validation.normalizedAddress.slice(0, 6)}...${validation.normalizedAddress.slice(-4)}) successfully saved!`);
      setCustomInput('');
      console.groupEnd();
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      console.groupEnd();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Wallet & Blockchain Adapters</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Non-custodial connection with modular multi-chain execution adapters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWalletModal}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md shadow-cyan-950/30 transition-all cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-white" />
            <span>Connect / Change Wallet ID</span>
          </button>
        </div>
      </div>

      {/* Non-Custodial Zero-Key Architecture Guarantee */}
      <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-semibold text-emerald-300 font-mono">
            NON-CUSTODIAL ISOLATION GUARANTEE ACTIVE
          </div>
          <p className="text-slate-300 leading-relaxed">
            The platform operates without ever asking for, reading, or retaining private keys or seed phrases.
            All autonomous executions occur either through user-signed sessions or an isolated, strictly funded execution sandbox wallet with micro-budgets (capped at $5/tx).
          </p>
        </div>
      </div>

      {/* Direct In-Page Wallet ID Configuration Form */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950/60 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Configure / Add Your Wallet ID</h2>
              <p className="text-xs text-slate-400">Enter your Ethereum, Polygon, Arbitrum, Base, Optimism or Solana address</p>
            </div>
          </div>
          {wallet.isConnected && wallet.address && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveWalletId} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-300">Wallet Public Address / ENS</label>
                <button
                  type="button"
                  onClick={handlePaste}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <ClipboardPaste className="w-3 h-3" /> Paste
                </button>
              </div>
              <input
                type="text"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="0x... or name.eth or Solana address"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-[11px] font-medium text-slate-300 block mb-1">Network</label>
              <select
                value={customNetwork}
                onChange={(e) => setCustomNetwork(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="Ethereum & Layer 2s">Ethereum & L2s</option>
                <option value="Arbitrum One">Arbitrum One</option>
                <option value="Polygon POS">Polygon</option>
                <option value="Base">Base</option>
                <option value="Optimism">Optimism</option>
                <option value="Solana">Solana</option>
              </select>
            </div>

            <div className="md:col-span-3 flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-cyan-950/40"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Wallet ID</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 flex items-center gap-1 font-sans">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-xs text-emerald-400 flex items-center gap-1 font-sans">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {successMsg}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
            <span className="text-slate-500">Quick connect presets:</span>
            <button
              type="button"
              onClick={() => {
                setCustomWalletAddress('0xe544B74E581d6e6b57a3CC5cDf5b80bDc084734E', 'Ethereum & Layer 2s', 'MetaMask');
                setSuccessMsg('Loaded MetaMask Wallet (0xe544...734E)!');
                setTimeout(() => setSuccessMsg(null), 3000);
              }}
              className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-mono text-[10px] cursor-pointer"
            >
              My MetaMask (0xe544...734E)
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomWalletAddress('0x71C8A9e46a7821B27357A42718E1924619a9B801', 'Ethereum & Layer 2s', 'Demo Multi-Sig');
                setSuccessMsg('Loaded Demo Multi-Sig Wallet!');
                setTimeout(() => setSuccessMsg(null), 3000);
              }}
              className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[10px] cursor-pointer"
            >
              Demo Multi-Sig (0x71C8...B801)
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomWalletAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'Ethereum Mainnet', 'vitalik.eth');
                setSuccessMsg('Loaded vitalik.eth address!');
                setTimeout(() => setSuccessMsg(null), 3000);
              }}
              className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-mono text-[10px] cursor-pointer"
            >
              vitalik.eth
            </button>
          </div>
        </form>
      </div>

      {/* Wallet State Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Connected Primary Wallet */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Primary Active Wallet</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
              {wallet.walletType || 'Connected'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 font-mono text-xs text-white bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="break-all select-all">{wallet.address || 'Not Connected'}</span>
            {wallet.address && (
              <button
                onClick={handleCopy}
                className="p-1 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shrink-0 cursor-pointer"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Network: {wallet.network}</span>
            {wallet.isConnected && (
              <button
                onClick={disconnectWallet}
                className="text-rose-400 hover:underline cursor-pointer"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {/* Execution Sandbox Wallet */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Isolated Execution Wallet</span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded">
              SANDBOXED
            </span>
          </div>
          <div className="font-mono text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800 break-all select-all">
            {wallet.executionWalletAddress}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Hard budget limit: $25.00 daily
          </div>
        </div>

        {/* Total Liquid Portfolio */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="text-xs text-slate-400">Total Liquid Holdings</div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            ${wallet.totalBalanceUSD.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            Multi-chain verified balance
          </div>
        </div>
      </div>

      {/* Multi-Chain Native & Token Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Native Balances */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-200 font-mono">
            <span>NATIVE CHAIN RESERVES</span>
            <span className="text-slate-500">5 Active Chains</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {Object.entries(wallet.nativeBalances).map(([chain, bal]) => (
              <div key={chain} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-slate-300 font-sans font-medium">{chain}</span>
                <span className="text-white font-bold">{bal} {chain === 'Polygon' ? 'POL' : 'ETH'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Token Holdings */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-200 font-mono">
            <span>EARNED & LIQUID TOKENS</span>
            <span className="text-slate-500">ERC-20 Holdings</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {wallet.tokenBalances.map((tok, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-white font-bold">{tok.symbol}</span>
                  <span className="text-slate-500 text-[10px] ml-1.5 font-sans">({tok.chain})</span>
                </div>
                <div className="text-right">
                  <div className="text-slate-200">{tok.balance} {tok.symbol}</div>
                  <div className="text-[10px] text-slate-500">${(tok.balance * tok.priceUSD).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modular Blockchain Adapter System */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">Modular Blockchain Adapter Registry</h2>
          <p className="text-xs text-slate-400">
            Pluggable RPC bridges routing simulation, gas estimation, and contract call executions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {blockchainAdapters.map(adapter => (
            <div key={adapter.chain} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-sans">{adapter.chain}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                  {adapter.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                RPC: {adapter.rpcUrl}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                <span>Gas: {adapter.gasPriceGwei} Gwei</span>
                <span>Block: ~{adapter.blockTimeSec}s</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
