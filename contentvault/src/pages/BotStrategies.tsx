import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Activity, AlertTriangle, Target, TrendingUp, Heart, Eye, MessageCircle, Plus, Save } from 'lucide-react'
import PremiumBackground from '../components/PremiumBackground'
import { useWallet } from '../contexts/WalletContext'
import { API_BASE_URL } from '../services/config'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface BotStrategy {
  id?: number
  owner_address: string
  label: string
  asa_id?: number
  token_symbol?: string
  metric_type: 'likes' | 'views' | 'comments' | 'price_change' | 'pnl'
  condition: string
  action: string
  status: string
  created_at: string
}

const BotStrategies: React.FC = () => {
  const { address, isConnected } = useWallet()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    label: '',
    token_symbol: '',
    metric_type: 'likes' as BotStrategy['metric_type'],
    condition: 'likes_1h_change > 15',
    action: 'buy 5 ALGO',
  })

  const { data: strategies } = useQuery({
    queryKey: ['bot-strategies', address],
    enabled: isConnected && !!address,
    queryFn: async (): Promise<BotStrategy[]> => {
      const res = await fetch(`${API_BASE_URL}/api/bot-strategies?owner_address=${address}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to load bot strategies')
      return json.strategies || []
    }
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error('Wallet not connected')
      const body = {
        owner_address: address,
        label: form.label,
        token_symbol: form.token_symbol || undefined,
        metric_type: form.metric_type,
        condition: form.condition,
        action: form.action
      }
      const res = await fetch(`${API_BASE_URL}/api/bot-strategies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to save strategy')
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-strategies', address] })
      setForm({
        label: '',
        token_symbol: '',
        metric_type: 'likes',
        condition: 'likes_1h_change > 15',
        action: 'buy 5 ALGO',
      })
    }
  })

  return (
    <div className="min-h-screen bg-[#05030b] relative">
      <PremiumBackground variant="purple" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-10 space-y-10">
        <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-cyan-500/30 mb-4">
              <Bot className="w-4 h-4 text-cyan-300" />
              <span className="text-xs font-semibold text-cyan-200 tracking-wide">
                Engagement Bots · Experimental
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
              Automated <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Trading Bots</span>
            </h1>
            <p className="text-gray-400 max-w-2xl text-sm md:text-base">
              Define rules that react to real engagement metrics (likes, views, comments) and price changes.
              All executions still require Pera Wallet confirmation for safety.
            </p>
          </div>
        </section>

        {!isConnected && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-gray-300 text-sm">
              Connect your Pera Wallet to create and manage bot strategies.
            </p>
          </section>
        )}

        {isConnected && (
          <>
            {/* Create Strategy */}
            <section className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-6 md:p-7">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-violet-300" />
                  <h2 className="text-sm font-semibold text-white">Create Bot Strategy</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1">Strategy Name</label>
                    <input
                      value={form.label}
                      onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-gray-100 text-xs focus:outline-none focus:border-cyan-400"
                      placeholder="e.g. YouTube Like Spike Buyer"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Token Symbol (optional)</label>
                    <input
                      value={form.token_symbol}
                      onChange={(e) => setForm((f) => ({ ...f, token_symbol: e.target.value.toUpperCase() }))}
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-gray-100 text-xs focus:outline-none focus:border-cyan-400"
                      placeholder="e.g. SARU"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Metric Type</label>
                    <select
                      value={form.metric_type}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, metric_type: e.target.value as BotStrategy['metric_type'] }))
                      }
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-gray-100 text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="likes">Likes growth</option>
                      <option value="views">Views growth</option>
                      <option value="comments">Comments spike</option>
                      <option value="price_change">Token price change</option>
                      <option value="pnl">Trader P&amp;L</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Condition (expression)</label>
                    <input
                      value={form.condition}
                      onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-gray-100 text-xs focus:outline-none focus:border-cyan-400"
                      placeholder="e.g. likes_1h_change > 15"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-400 mb-1">Action (description)</label>
                    <input
                      value={form.action}
                      onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
                      className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-gray-100 text-xs focus:outline-none focus:border-cyan-400"
                      placeholder="e.g. buy 5 ALGO of token when condition is true"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 text-[11px] text-gray-400">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>
                      Bots will only propose trades. Final execution must still be confirmed in the UI via Pera Wallet.
                    </span>
                  </div>
                  <button
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending || !form.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold disabled:opacity-50"
                  >
                    {createMutation.isPending ? (
                      <Activity className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    <span>Save Strategy</span>
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-6 md:p-7">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-violet-300" />
                  <h2 className="text-sm font-semibold text-white">Examples</h2>
                </div>
                <ul className="text-xs text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <Heart className="w-3 h-3 text-rose-300 mt-0.5" />
                    <span>
                      <span className="font-semibold">Likes spike bot:</span> if <code>likes_1h_change &gt; 20</code> then
                      <code> buy 3 ALGO</code>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Eye className="w-3 h-3 text-cyan-300 mt-0.5" />
                    <span>
                      <span className="font-semibold">Views momentum bot:</span> if <code>views_24h_change &lt; 0</code> then
                      <code> sell 50% position</code>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageCircle className="w-3 h-3 text-emerald-300 mt-0.5" />
                    <span>
                      <span className="font-semibold">Comments hype bot:</span> if <code>comments_1h &gt; 100</code> then
                      <code> buy 10 ALGO</code>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="w-3 h-3 text-emerald-300 mt-0.5" />
                    <span>
                      <span className="font-semibold">Price momentum bot:</span> if{' '}
                      <code>price_24h_change &gt; 30</code> then <code> take profit 25%</code>
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Existing Strategies */}
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-6 md:p-7">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-300" />
                  <h2 className="text-sm font-semibold text-white">Your Bot Strategies</h2>
                </div>
              </div>
              {!strategies || strategies.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No strategies yet. Create your first engagement-based trading bot above.
                </p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                  <div className="max-h-72 overflow-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900">
                    <table className="min-w-full text-[11px]">
                      <thead className="bg-white/5 text-gray-300 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Name</th>
                          <th className="px-3 py-2 text-left font-medium">Token</th>
                          <th className="px-3 py-2 text-left font-medium">Metric</th>
                          <th className="px-3 py-2 text-left font-medium">Condition</th>
                          <th className="px-3 py-2 text-left font-medium">Action</th>
                          <th className="px-3 py-2 text-right font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {strategies.map((s) => (
                          <tr key={s.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-3 py-2 text-gray-200">{s.label}</td>
                            <td className="px-3 py-2 text-gray-200">{s.token_symbol || 'Any'}</td>
                            <td className="px-3 py-2 text-gray-200 capitalize">{s.metric_type}</td>
                            <td className="px-3 py-2 text-gray-300">{s.condition}</td>
                            <td className="px-3 py-2 text-gray-300">{s.action}</td>
                            <td className="px-3 py-2 text-right">
                              <span
                                className={`px-2 py-0.5 rounded-full ${
                                  s.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-300'
                                    : 'bg-slate-500/10 text-slate-300'
                                }`}
                              >
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default BotStrategies


