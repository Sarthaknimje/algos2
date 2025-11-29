import React from 'react'
import { motion } from 'framer-motion'
import {
  Copy,
  ArrowRight,
  DollarSign,
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Clock,
  Shield,
  Bot,
  Activity,
  Star
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import PremiumBackground from '../components/PremiumBackground'
import { useWallet } from '../contexts/WalletContext'

const mockPnlData = [
  { day: 'Mon', pnl: 3.2 },
  { day: 'Tue', pnl: 5.8 },
  { day: 'Wed', pnl: 2.1 },
  { day: 'Thu', pnl: 7.4 },
  { day: 'Fri', pnl: 4.9 },
  { day: 'Sat', pnl: 8.2 },
  { day: 'Sun', pnl: 6.3 }
]

const topTraders = [
  {
    address: 'TUT5K...KFJA4M',
    name: 'Alpha Whale',
    winRate: 72,
    followers: 128,
    weeklyReturn: 18.4,
    riskLevel: 'Balanced',
    maxDrawdown: 6.2,
    avgTradeDuration: '3h 24m'
  },
  {
    address: 'QWER1...ZXCV9K',
    name: 'Momentum Pro',
    winRate: 65,
    followers: 94,
    weeklyReturn: 14.1,
    riskLevel: 'Aggressive',
    maxDrawdown: 9.8,
    avgTradeDuration: '1h 12m'
  },
  {
    address: 'ASDF3...LMNO8P',
    name: 'Safe Harbor',
    winRate: 81,
    followers: 76,
    weeklyReturn: 9.7,
    riskLevel: 'Conservative',
    maxDrawdown: 3.1,
    avgTradeDuration: '6h 05m'
  }
]

const CopyTradingDashboard: React.FC = () => {
  const { address, isConnected } = useWallet()

  return (
    <div className="min-h-screen bg-[#05030b] relative">
      <PremiumBackground variant="purple" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-10 space-y-10">
        {/* Header */}
        <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-violet-500/30 mb-4">
              <Copy className="w-4 h-4 text-violet-300" />
              <span className="text-xs font-semibold text-violet-200 tracking-wide">
                Smart Copy Trading · Experimental
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
              Mirror Top <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Creators</span> Automatically
            </h1>
            <p className="text-gray-400 max-w-2xl text-sm md:text-base">
              Follow on-chain creator wallets and automatically copy their trades on ContentVault tokens.
              Configure risk, allocation, and stop-loss. You stay in full control.
            </p>
          </div>

          <div className="w-full lg:w-80">
            <div className="rounded-3xl border border-violet-500/40 bg-gradient-to-br from-violet-900/40 via-slate-900/80 to-sky-900/40 px-5 py-4 shadow-lg shadow-violet-900/40">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-300" />
                  <p className="text-xs uppercase tracking-wide text-violet-200/90 font-semibold">
                    Copy Trading Overview
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[11px] font-medium border border-emerald-400/30">
                  Beta
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Connected Wallet</span>
                  <span className="text-right text-gray-200 font-mono truncate max-w-[160px]">
                    {isConnected ? address : 'Not connected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active Copy Profiles</span>
                  <span className="text-violet-200 font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Allocated</span>
                  <span className="text-violet-200 font-semibold">0.00 ALGO</span>
                </div>
              </div>
              <button
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold py-2.5 hover:from-violet-400 hover:to-fuchsia-400 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Risk Settings
              </button>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <section className="grid lg:grid-cols-3 gap-8">
          {/* Left: P&L Chart */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-slate-900/80 to-slate-950/90 p-6 md:p-8 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">Portfolio Performance</p>
                <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
                  Copy Trading P&amp;L
                  <span className="text-emerald-400 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/30">
                    Simulated
                  </span>
                </h2>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-emerald-300">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18.4% this week</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>Last 7 days</span>
                </div>
              </div>
            </div>

            <div className="h-60 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockPnlData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pnlLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderRadius: 12,
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      color: '#e5e7eb',
                      fontSize: 12
                    }}
                    formatter={(value: any) => [`${value}%`, 'P&L']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pnl"
                    stroke="url(#pnlLine)"
                    strokeWidth={2.5}
                    dot={{ r: 3, stroke: '#e5e7eb', strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                    name="Weekly P&L"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
              <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
                <p className="text-gray-400 mb-1">Best Day</p>
                <p className="text-white font-semibold">+7.4%</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
                <p className="text-gray-400 mb-1">Worst Day</p>
                <p className="text-white font-semibold">+2.1%</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
                <p className="text-gray-400 mb-1">Sharpe (Sim.)</p>
                <p className="text-white font-semibold">1.8</p>
              </div>
            </div>
          </div>

          {/* Right: Quick Settings */}
          <div className="space-y-5">
            <div className="rounded-3xl border border-violet-500/40 bg-gradient-to-b from-slate-900/90 via-violet-900/40 to-slate-950/90 p-5 shadow-lg shadow-violet-900/40">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-300" />
                <h3 className="text-sm font-semibold text-white">Start Copying</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Pick a top creator wallet to follow. All their trades on ContentVault tokens will be mirrored in your wallet based on your allocation.
              </p>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Allocation</span>
                  <span className="text-violet-200 font-semibold">10% of portfolio</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Max Single Trade</span>
                  <span className="text-violet-200 font-semibold">5.00 ALGO</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Copy Type</span>
                  <span className="text-violet-200 font-semibold">Proportional</span>
                </div>
              </div>
              <button
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold py-2.5 hover:from-violet-400 hover:to-fuchsia-400 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Configure Copy Rules
              </button>
            </div>

            <div className="rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-slate-900/90 via-cyan-900/40 to-slate-950/90 p-5 shadow-lg shadow-cyan-900/40">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-cyan-300" />
                <h3 className="text-sm font-semibold text-white">Engagement Bot (Auto Buy/Sell)</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Experimental bot that reacts to real-time likes, views, and comments. Automatically buys or sells creator tokens based on engagement spikes.
              </p>
              <ul className="text-xs text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Buy when likes increase &gt; 15% in 1 hour</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Reduce position when views stagnate for 24h</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Hard stop-loss at -20% from entry</span>
                </li>
              </ul>
              <button
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/50 text-cyan-200 text-sm font-semibold py-2.5 hover:bg-cyan-500/10 transition-colors"
              >
                <Activity className="w-4 h-4" />
                Manage Bot Strategies
              </button>
            </div>
          </div>
        </section>

        {/* Bottom: Top Traders & Strategies */}
        <section className="grid lg:grid-cols-3 gap-8">
          {/* Top Traders */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-6 md:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-300" />
                <h3 className="text-sm font-semibold text-white">Top Copy Trading Profiles</h3>
              </div>
              <button className="text-xs text-violet-300 hover:text-violet-100 flex items-center gap-1">
                View all
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {topTraders.map((trader, idx) => (
                <motion.div
                  key={trader.address}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 flex items-center justify-between gap-4 hover:border-violet-400/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                        {trader.name}
                        {idx === 0 && <Star className="w-3 h-3 text-yellow-300" />}
                      </p>
                      <p className="text-[11px] text-gray-400 font-mono">{trader.address}</p>
                      <p className="text-[11px] text-violet-300 mt-0.5">
                        {trader.riskLevel} · {trader.followers} followers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <p className="text-gray-400 mb-0.5">Weekly Return</p>
                      <p className="text-emerald-400 font-semibold">+{trader.weeklyReturn}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 mb-0.5">Win Rate</p>
                      <p className="text-emerald-300 font-semibold">{trader.winRate}%</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-[11px] text-white font-semibold hover:from-violet-400 hover:to-fuchsia-400 transition-colors">
                      Follow
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Strategy Summary */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-violet-900/30 to-slate-950 p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-violet-300" />
                <h3 className="text-sm font-semibold text-white">Strategy Summary</h3>
              </div>
              <ul className="text-xs text-gray-300 space-y-2">
                <li>• Copy-trade only verified ContentVault tokens.</li>
                <li>• Use proportional allocation based on your portfolio size.</li>
                <li>• Respect Algorand minimum balance rules for all assets.</li>
                <li>• Trades are simulated in UI; execution must be explicitly confirmed via Pera Wallet.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-slate-900 via-emerald-900/30 to-slate-950 p-5">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-emerald-300" />
                <h3 className="text-sm font-semibold text-white">Safety &amp; Control</h3>
              </div>
              <ul className="text-xs text-gray-300 space-y-2">
                <li>• You can pause or stop copy trading at any time.</li>
                <li>• No private keys ever leave your device – Pera Wallet signs all transactions.</li>
                <li>• Bot and copy-trade strategies are transparent and configurable.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default CopyTradingDashboard


