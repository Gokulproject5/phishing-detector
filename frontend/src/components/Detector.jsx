import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, AlertTriangle, CheckCircle, Loader2,
    Shield, ShieldAlert, Clock, Trash2, ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Explainer from './Explainer';

const API_BASE = 'http://localhost:8000';

const Detector = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('scanner');

    useEffect(() => {
        const saved = localStorage.getItem('phish_history');
        if (saved) setHistory(JSON.parse(saved));
    }, []);

    const handleDetect = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        setExplanation(null);

        try {
            const [predRes, expRes] = await Promise.all([
                axios.post(`${API_BASE}/predict`, { text }),
                axios.post(`${API_BASE}/explain`, { text })
            ]);

            setResult(predRes.data);
            setExplanation(expRes.data);

            const item = {
                id: Date.now(),
                preview: text.substring(0, 60) + (text.length > 60 ? '...' : ''),
                prediction: predRes.data.prediction,
                score: predRes.data.probability,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            const updated = [item, ...history.slice(0, 9)];
            setHistory(updated);
            localStorage.setItem('phish_history', JSON.stringify(updated));
        } catch (err) {
            setError('Could not connect to the backend. Make sure the server is running on port 8000.');
        } finally {
            setLoading(false);
        }
    };

    const riskPercent = result ? Math.round(result.all_probabilities.phishing * 100) : 0;
    const isPhishing = result?.prediction === 'Phishing';
    const gaugeData = result ? [
        { value: riskPercent },
        { value: 100 - riskPercent }
    ] : [];

    return (
        <div className="space-y-6">
            {/* Tab Bar */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
                {['scanner', 'history'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {tab === 'history' ? `History (${history.length})` : tab}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'scanner' ? (
                    <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

                        {/* Input Card */}
                        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                                <Shield size={16} className="text-indigo-400" />
                                <span className="text-sm font-semibold">Security Scanner</span>
                            </div>
                            <div className="p-6">
                                <textarea
                                    className="w-full bg-transparent text-white placeholder-slate-600 text-sm leading-relaxed resize-none outline-none min-h-[160px]"
                                    placeholder="Paste suspicious email content, URLs, or messages here to analyze with BERT neural network..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                />
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                    <span className="text-xs text-slate-600">{text.length} characters</span>
                                    <button
                                        onClick={handleDetect}
                                        disabled={loading || !text.trim()}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${loading || !text.trim()
                                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                                : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {loading ? (
                                            <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                                        ) : (
                                            <><Search size={16} /> Analyze</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 p-4 bg-red-500/8 border border-red-500/20 rounded-xl text-red-400 text-sm"
                                style={{ background: 'rgba(239,68,68,0.06)' }}
                            >
                                <AlertTriangle size={16} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {/* Results */}
                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    {/* Main Result */}
                                    <div className={`rounded-2xl p-6 border ${isPhishing
                                            ? 'border-red-500/20'
                                            : 'border-emerald-500/20'
                                        }`} style={{
                                            background: isPhishing
                                                ? 'rgba(239,68,68,0.06)'
                                                : 'rgba(16,185,129,0.06)'
                                        }}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Verdict</p>
                                                <div className="flex items-center gap-2">
                                                    {isPhishing
                                                        ? <ShieldAlert size={22} className="text-red-400" />
                                                        : <CheckCircle size={22} className="text-emerald-400" />
                                                    }
                                                    <span className={`text-2xl font-black ${isPhishing ? 'text-red-400' : 'text-emerald-400'}`}>
                                                        {result.prediction}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isPhishing
                                                    ? 'bg-red-500/15 text-red-400'
                                                    : 'bg-emerald-500/15 text-emerald-400'
                                                }`}>
                                                {isPhishing ? 'THREAT' : 'SAFE'}
                                            </span>
                                        </div>

                                        {/* Gauge */}
                                        <div className="flex items-center gap-6">
                                            <div className="relative w-24 h-24 shrink-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={gaugeData} cx="50%" cy="50%" innerRadius={28} outerRadius={40} paddingAngle={4} dataKey="value" stroke="none">
                                                            <Cell fill={isPhishing ? '#ef4444' : '#10b981'} />
                                                            <Cell fill="rgba(255,255,255,0.04)" />
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-lg font-black">{riskPercent}%</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-slate-400">Phishing</span>
                                                        <span className="font-mono text-red-400">{(result.all_probabilities.phishing * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${result.all_probabilities.phishing * 100}%` }}
                                                            transition={{ duration: 1, ease: 'easeOut' }}
                                                            className="h-full bg-red-500 rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-slate-400">Legitimate</span>
                                                        <span className="font-mono text-emerald-400">{(result.all_probabilities.legitimate * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${result.all_probabilities.legitimate * 100}%` }}
                                                            transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                                                            className="h-full bg-emerald-500 rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Analysis Details */}
                                    <div className="rounded-2xl p-6 border border-white/7 space-y-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Analysis Details</p>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Model Confidence', value: `${(result.probability * 100).toFixed(1)}%` },
                                                { label: 'Linguistic Fingerprint', value: isPhishing ? 'Suspicious' : 'Clean' },
                                                { label: 'Contextual Intent', value: isPhishing ? 'Flagged' : 'Normal' },
                                                { label: 'Neural Pathway', value: 'BERT Layer 12' }
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                                    <span className="text-sm text-slate-400">{label}</span>
                                                    <span className="text-sm font-semibold text-white">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Explainer */}
                        <AnimatePresence>
                            {explanation && (
                                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                                    <Explainer data={explanation} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    /* History Tab */
                    <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="rounded-2xl border border-white/7 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-slate-500" />
                                    <span className="text-sm font-semibold">Scan History</span>
                                </div>
                                {history.length > 0 && (
                                    <button
                                        onClick={() => { setHistory([]); localStorage.removeItem('phish_history'); }}
                                        className="text-slate-600 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="divide-y divide-white/5">
                                {history.length === 0 ? (
                                    <div className="py-16 text-center text-slate-600">
                                        <Clock size={28} className="mx-auto mb-3 opacity-50" />
                                        <p className="text-sm">No scans yet</p>
                                    </div>
                                ) : (
                                    history.map(item => (
                                        <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors group" style={{ '--hover-bg': 'rgba(255,255,255,0.02)' }}>
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${item.prediction === 'Phishing' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-300 truncate">{item.preview}</p>
                                                <p className="text-xs text-slate-600 mt-0.5">{item.timestamp}</p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <span className={`text-xs font-bold ${item.prediction === 'Phishing' ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {item.prediction}
                                                </span>
                                                <p className="text-xs text-slate-600 mt-0.5">{(item.score * 100).toFixed(0)}%</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Detector;
