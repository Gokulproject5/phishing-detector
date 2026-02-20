import React from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Activity, ShieldCheck, AlertTriangle, Info } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const val = payload[0].value;
        return (
            <div className="px-3 py-2 rounded-xl text-xs shadow-xl border border-white/10" style={{ background: 'rgba(10,15,30,0.95)' }}>
                <p className="text-slate-400 mb-0.5">{payload[0].payload.name}</p>
                <p className={`font-mono font-bold ${val > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {val > 0 ? '+' : ''}{val.toFixed(4)}
                </p>
                <p className="text-slate-600 mt-1">{val > 0 ? '↑ Phishing signal' : '↑ Legit signal'}</p>
            </div>
        );
    }
    return null;
};

const Explainer = ({ data }) => {
    if (!data || !data.shap_explanation) return null;

    const { top_features } = data.shap_explanation;
    const { ai_explanation } = data;

    const chartData = top_features
        .map(f => ({ name: f.token, value: f.score, abs: Math.abs(f.score) }))
        .sort((a, b) => b.abs - a.abs)
        .slice(0, 10);

    const topToken = chartData[0]?.name;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Activity size={16} className="text-indigo-400" />
                <h3 className="text-sm font-semibold">SHAP Feature Analysis</h3>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
                {/* Chart */}
                <div className="rounded-2xl p-6 border border-white/7" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Token Importance</p>
                        <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-red-500 inline-block" />Phishing</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />Legit</span>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                                    width={90}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={14}>
                                    {chartData.map((entry, i) => (
                                        <Cell key={i} fill={entry.value > 0 ? '#ef4444' : '#10b981'} opacity={0.85} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Explanation + Key Indicator */}
                <div className="space-y-4">
                    {/* AI Output */}
                    <div className="rounded-2xl p-5 border border-indigo-500/15 flex-1" style={{ background: 'rgba(99,102,241,0.05)' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck size={14} className="text-indigo-400" />
                            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">AI Reasoning</p>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{ai_explanation}</p>
                    </div>

                    {/* Key Indicator */}
                    {topToken && (
                        <div className="rounded-2xl p-5 border border-white/7" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <AlertTriangle size={14} className="text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Primary Trigger</p>
                                    <p className="text-sm text-slate-200">
                                        Token <code className="px-1.5 py-0.5 rounded bg-white/8 text-indigo-300 text-xs font-mono border border-white/10">"{topToken}"</code> is the strongest predictor.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2">
                                <Info size={12} className="text-slate-600 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    SHAP values show how much each token pushed the prediction towards phishing (red) or legitimate (green).
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Explainer;
