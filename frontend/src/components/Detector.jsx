import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, AlertTriangle, CheckCircle, Loader2,
    Shield, ShieldAlert, Download, ExternalLink, Copy, Zap, Info,
    Sparkles, Terminal
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { scanAPI } from '../services/api';
import Explainer from './Explainer';

const Detector = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [error, setError] = useState(null);

    const handleDetect = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        setExplanation(null);

        try {
            // Parallel execution of heavy neural analysis (Production optimized)
            const [predRes, expRes] = await Promise.all([
                scanAPI.predict({ text }),
                scanAPI.explain({ text })
            ]);

            setResult(predRes.data);
            setExplanation(expRes.data);

            if (predRes.data) {
                scanAPI.save({
                    url: text.substring(0, 100),
                    result: predRes.data
                }).catch(e => console.error("Telemetry failed:", e));
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Neural engine unreachable. Protocol mismatch or logic layer failure.');
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const riskPercent = result?.all_probabilities?.phishing ? Math.round(result.all_probabilities.phishing * 100) : 0;
    const isPhishing = result?.prediction === 'Phishing';
    const gaugeData = result?.all_probabilities ? [
        { value: riskPercent },
        { value: 100 - riskPercent }
    ] : [];

    const handleCopyPaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setText(text);
        } catch (err) {
            console.error('Clipboard access denied');
        }
    };

    return (
        <div className="space-y-10 animate-slide-up pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Neural Threat Analyzer</h1>
                    <p className="text-slate-500 font-medium max-w-xl leading-relaxed">
                        Deep-scan email content, URLs, or messages with dual-core neural validation.
                        Powered by <span className="text-indigo-600 font-bold">BERT Architecture 2.4</span>.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Logic Layer Active</span>
                </div>
            </div>

            {/* Input Card */}
            <div className="premium-card overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-50 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <Search size={22} strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest">System Diagnostics</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 uppercase tracking-widest">SHA-256 Enabled</span>
                    </div>
                </div>
                <div className="p-10">
                    <textarea
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-[28px] p-8 text-slate-800 placeholder-slate-400 text-sm leading-relaxed outline-none min-h-[200px] focus:border-indigo-500/30 focus:bg-white focus:ring-[12px] focus:ring-indigo-500/5 transition-all shadow-inner"
                        placeholder="Paste suspicious content, URLs, or email headers here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-6">
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-800 tracking-tight">{text.length} Signals</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Input Vector</span>
                            </div>
                            <button
                                onClick={handleCopyPaste}
                                className="text-xs font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-2.5 transition-all group uppercase tracking-widest bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100/50"
                            >
                                <Copy size={14} className="group-hover:scale-110 transition-transform" /> Paste from Clipboard
                            </button>
                        </div>
                        <button
                            onClick={handleDetect}
                            disabled={loading || !text.trim()}
                            className={`btn-premium w-full sm:w-auto py-4 px-8 ${loading || !text.trim() ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> Deconstructing Patterns...</>
                            ) : (
                                <><Zap size={18} className="fill-current" /> Execute Deep Analysis</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-5 p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-bold shadow-sm"
                >
                    <div className="w-12 h-12 rounded-2xl bg-rose-100/50 flex items-center justify-center shrink-0 border border-rose-200">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest mb-0.5">Protocol Error</span>
                        <span className="text-sm font-extrabold tracking-tight">{error}</span>
                    </div>
                </motion.div>
            )}

            {/* Results Display */}
            <AnimatePresence mode="wait">
                {result && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-10"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Verdict Card */}
                            <div className="lg:col-span-5 premium-card p-12 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <div className={`absolute top-0 left-0 w-full h-2 ${isPhishing ? 'bg-rose-500' : 'bg-emerald-500'} group-hover:h-3 transition-all`} />
                                <div className="absolute top-8 left-8">
                                    <Shield size={16} className="text-slate-100" />
                                </div>

                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Diagnostic Verdict</p>

                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    className={`w-32 h-32 rounded-[40px] flex items-center justify-center mb-8 shadow-2xl transition-all ${isPhishing ? 'bg-rose-50 text-rose-600 shadow-rose-500/10 border border-rose-100' : 'bg-emerald-50 text-emerald-600 shadow-emerald-500/10 border border-emerald-100'}`}
                                >
                                    {isPhishing
                                        ? <ShieldAlert size={64} strokeWidth={1.2} />
                                        : <CheckCircle size={64} strokeWidth={1.2} />
                                    }
                                </motion.div>

                                <h3 className={`text-4xl font-black mb-3 tracking-tight ${isPhishing ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {isPhishing ? 'Phishing' : 'Verified Safe'}
                                </h3>
                                <p className="text-slate-500 font-semibold mb-8 max-w-[260px] leading-relaxed">
                                    {isPhishing ? 'Neural patterns indicate highly malicious signature.' : 'Verified as legitimate via neural heuristic cross-validation.'}
                                </p>

                                {explanation?.ai_explanation && (
                                    <div className="mb-10 p-5 bg-slate-50 rounded-2xl border border-slate-100/50 text-left relative overflow-hidden group/intel">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Sparkles size={14} className="text-indigo-600" />
                                            <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest">Neural Insight</span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 font-bold leading-relaxed line-clamp-3">
                                            {explanation.ai_explanation}
                                        </p>
                                        <button
                                            onClick={() => document.getElementById('ai-reasoning')?.scrollIntoView({ behavior: 'smooth' })}
                                            className="mt-3 text-[9px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors"
                                        >
                                            View Full Diagnostic →
                                        </button>
                                        <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover/intel:opacity-[0.07] transition-opacity">
                                            <Terminal size={40} />
                                        </div>
                                    </div>
                                )}

                                <div className="w-full flex flex-col gap-4 mt-auto">
                                    <button
                                        onClick={() => document.getElementById('ai-reasoning')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="btn-premium w-full py-5 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
                                    >
                                        <Zap size={16} /> Decipher Intelligence
                                    </button>
                                    <button
                                        onClick={() => document.getElementById('threat-heuristics')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="btn-secondary w-full py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 border-slate-200"
                                    >
                                        <ExternalLink size={14} /> Pattern Log
                                    </button>
                                </div>
                            </div>

                            {/* Risk Meter Card */}
                            <div className="lg:col-span-7 premium-card p-12">
                                <div className="flex items-center justify-between mb-16">
                                    <div>
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1.5">Neural Probability Metrics</h4>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Cross-vector validation active</p>
                                    </div>
                                    <div className="flex gap-8">
                                        <div className="flex flex-col items-center gap-2 group cursor-default">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Threat</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-400">MALICIOUS</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 group cursor-default">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Guard</span>
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-400">LEGITIMATE</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col xl:flex-row items-center gap-16">
                                    <div className="relative w-56 h-56 shrink-0 group">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={gaugeData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={75}
                                                    outerRadius={95}
                                                    paddingAngle={6}
                                                    dataKey="value"
                                                    stroke="none"
                                                    cornerRadius={40}
                                                    startAngle={180}
                                                    endAngle={-180}
                                                >
                                                    <Cell fill={isPhishing ? '#F43F5E' : '#10B981'} />
                                                    <Cell fill="#F8FAFC" />
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform group-hover:scale-110 duration-500">
                                            <span className={`text-5xl font-black tracking-tighter ${isPhishing ? 'text-rose-600' : 'text-emerald-600'}`}>{riskPercent}%</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Neural Conf.</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full space-y-10 pt-4">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1.5">Malicious correlation</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Pattern Match Score</span>
                                                </div>
                                                <span className="text-lg font-black text-rose-600 tracking-tight">{(result.all_probabilities.phishing * 100).toFixed(1)}</span>
                                            </div>
                                            <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100 shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${result.all_probabilities.phishing * 100}%` }}
                                                    transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                                                    className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full shadow-lg"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1.5">Integrity Verification</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Neural Consistency</span>
                                                </div>
                                                <span className="text-lg font-black text-emerald-600 tracking-tight">{(result.all_probabilities.legitimate * 100).toFixed(1)}</span>
                                            </div>
                                            <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100 shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${result.all_probabilities.legitimate * 100}%` }}
                                                    transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
                                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Heuristics */}
                        {result.heuristics && result.heuristics.length > 0 && (
                            <div id="threat-heuristics" className="space-y-6 scroll-mt-10">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Threat Heuristics Identified</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {result.heuristics.map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="px-8 py-5 bg-white border border-rose-100/50 rounded-2xl flex items-center gap-5 shadow-sm hover:shadow-xl hover:bg-rose-50/10 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100 group-hover:scale-110 transition-transform">
                                                <AlertTriangle size={18} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-0.5">Alert Flag {i + 1}</span>
                                                <p className="text-xs font-extrabold text-slate-800 leading-tight">
                                                    {h}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Explainer */}
                        {explanation && (
                            <div id="ai-reasoning" className="animate-slide-up space-y-8 pt-6 scroll-mt-10">
                                <div className="flex items-center gap-6 px-1">
                                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-indigo-500/20 border border-indigo-400/20">
                                        <Info size={28} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">AI Reasoning Core</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">BERT-SHAP Dual Logic Visualization</p>
                                    </div>
                                </div>
                                <div className="premium-card p-1 bg-slate-50/50 backdrop-blur-sm shadow-premium">
                                    <Explainer data={explanation} />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Detector;
