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
        .filter(f => f.token !== 'Diagnostic Error')
        .map(f => ({ name: f.token, value: f.score, abs: Math.abs(f.score) }))
        .sort((a, b) => b.abs - a.abs)
        .slice(0, 10);

    const topToken = chartData[0]?.name;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Activity size={16} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800 poppins">SHAP Feature Analysis</h3>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
                {/* Chart */}
                <div className="rounded-2xl p-6 border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Distribution</p>
                        <div className="flex items-center gap-4 text-[10px] font-bold">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />Phishing</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Safe</span>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16}>
                                    {chartData.map((entry, i) => (
                                        <Cell key={i} fill={entry.value > 0 ? '#ef4444' : '#10b981'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Explanation + Key Indicator */}
                <div className="space-y-6">
                    {/* AI Output */}
                    <div className="rounded-2xl p-6 border border-indigo-100 bg-indigo-50/30 flex-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <ShieldCheck size={80} className="text-indigo-600" />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck size={16} className="text-indigo-600" />
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">AI Security Insights</p>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium relative z-10">{ai_explanation}</p>
                    </div>

                    {/* Key Indicator */}
                    {topToken && (
                        <div className="rounded-2xl p-6 border border-slate-100 bg-slate-50 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-5">
                                <AlertTriangle size={64} className="text-amber-500" />
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <AlertTriangle size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Pattern</p>
                                    <p className="text-sm text-slate-800 font-bold">
                                        Token <code className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-indigo-600 text-xs font-mono shadow-sm">"{topToken}"</code> is the primary trigger.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 flex items-start gap-2">
                                <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                    Our Neural Engine weighted this specific token as the most influential factor in the current security diagnostic.
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
