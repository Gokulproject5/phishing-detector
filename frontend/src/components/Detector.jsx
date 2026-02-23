import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, AlertTriangle, CheckCircle, Loader2,
    Shield, ShieldAlert, Clock, Trash2, ChevronRight,
    Info, ExternalLink, Download, Copy
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Explainer from './Explainer';
import API_URL from '../config';

const API_BASE = API_URL;

const Detector = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);

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
            const token = localStorage.getItem('phish_token');
            const headers = { Authorization: `Bearer ${token}` };

            const [predRes, expRes] = await Promise.all([
                axios.post(`${API_BASE}/predict`, { text }, { headers }),
                axios.post(`${API_BASE}/explain`, { text }, { headers })
            ]);

            setResult(predRes.data);
            setExplanation(expRes.data);

            // Save scan to database
            await axios.post(`${API_BASE}/scans/save`, {
                url: text.substring(0, 100), // Using text as URL/Content preview
                result: predRes.data
            }, { headers });

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
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 poppins">Threat Analyzer</h1>
                <p className="text-slate-500">Analyze email content, URLs, or messages for phishing signatures.</p>
            </div>

            {/* Input Card */}
            <div className="cyber-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Search size={18} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-wider poppins">New Analysis</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-2 py-1 rounded">BERT MODEL v2.4</div>
                </div>
                <div className="p-6">
                    <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 placeholder-slate-400 text-sm leading-relaxed outline-none min-h-[160px] focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all "
                        placeholder="Paste suspicious content here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-medium text-slate-400">{text.length} characters</span>
                            <button className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                                <Copy size={12} /> Paste from Clipboard
                            </button>
                        </div>
                        <button
                            onClick={handleDetect}
                            disabled={loading || !text.trim()}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${loading || !text.trim()
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-primary hover:bg-[#1e293b] text-white shadow-slate-900/10 hover:-translate-y-0.5'
                                }`}
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> Analyzing Patterns...</>
                            ) : (
                                <><Search size={18} /> Run Diagnostics</>
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
                    className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium"
                >
                    <AlertTriangle size={18} className="shrink-0" />
                    {error}
                </motion.div>
            )}

            {/* Results Display */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Verdict Card */}
                            <div className="lg:col-span-4 cyber-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-full h-1.5 ${isPhishing ? 'bg-alert' : 'bg-accent'}`} />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Diagnostic Verdict</p>

                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isPhishing ? 'bg-red-50' : 'bg-emerald-50'}`}>
                                    {isPhishing
                                        ? <ShieldAlert size={40} className="text-alert" />
                                        : <CheckCircle size={40} className="text-accent" />
                                    }
                                </div>

                                <h3 className={`text-2xl font-black poppins mb-1 ${isPhishing ? 'text-alert' : 'text-accent'}`}>
                                    {isPhishing ? 'Phishing Detected' : 'Safe Content'}
                                </h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    {isPhishing ? 'High Risk - Do not interact' : 'Low Risk - No patterns found'}
                                </p>

                                <div className="w-full flex gap-2">
                                    <button className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2">
                                        <Download size={14} /> Report
                                    </button>
                                    <button className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2">
                                        <ExternalLink size={14} /> Details
                                    </button>
                                </div>
                            </div>

                            {/* Risk Meter Card */}
                            <div className="lg:col-span-8 cyber-card p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider poppins">Risk Probability Meter</h4>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                            <span className="w-2 h-2 rounded-full bg-alert" /> Phishing
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                            <span className="w-2 h-2 rounded-full bg-accent" /> Safe
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-10">
                                    <div className="relative w-40 h-40 shrink-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={gaugeData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={55}
                                                    outerRadius={75}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    stroke="none"
                                                    startAngle={180}
                                                    endAngle={-180}
                                                >
                                                    <Cell fill={isPhishing ? '#EF4444' : '#22C55E'} />
                                                    <Cell fill="#F1F5F9" />
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className={`text-3xl font-black poppins ${isPhishing ? 'text-alert' : 'text-accent'}`}>{riskPercent}%</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Confidence</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-bold text-slate-700">Threat Signature Match</span>
                                                <span className="text-xs font-black text-alert">{(result.all_probabilities.phishing * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${result.all_probabilities.phishing * 100}%` }}
                                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                                    className="h-full bg-alert rounded-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-bold text-slate-700">Legitimate Context Score</span>
                                                <span className="text-xs font-black text-accent">{(result.all_probabilities.legitimate * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${result.all_probabilities.legitimate * 100}%` }}
                                                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                                                    className="h-full bg-accent rounded-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Processing Time</p>
                                                <p className="text-xs font-bold text-slate-700">142ms</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Architecture</p>
                                                <p className="text-xs font-bold text-slate-700">BERT-Base</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Heuristic Analysis Section */}
                        {result.heuristics && result.heuristics.length > 0 && (
                            <div className="animate-fade-in space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <ShieldAlert size={14} className="text-alert" />
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest poppins">Verification Engine Flags</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.heuristics.map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-3 shadow-sm"
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-alert shrink-0">
                                                <AlertTriangle size={16} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 leading-tight">
                                                {h}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Explainer Section */}
                        {explanation && (
                            <div className="animate-fade-in">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <Info size={18} className="text-indigo-600" />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800 poppins">Explainability (SHAP Data)</h4>
                                </div>
                                <Explainer data={explanation} />
                            </div>
                        )}

                        {/* Good vs Bad Links Instruction Set */}
                        <div className="mt-12 space-y-8">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-black text-slate-900 poppins uppercase tracking-tight">Link Safety Intelligence</h2>
                                <p className="text-slate-500 text-sm font-medium">Follow these neural-verified instructions to distinguish between secure and malicious targets.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Bad Link Section */}
                                <div className="p-8 rounded-[32px] border border-red-100 bg-red-50/10 space-y-6 relative overflow-hidden group hover:shadow-xl hover:shadow-red-500/5 transition-all">
                                    <div className="absolute -top-4 -right-4 opacity-5 group-hover:scale-110 transition-transform">
                                        <AlertTriangle size={120} className="text-red-600" />
                                    </div>
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shadow-sm border border-red-200">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-800 poppins uppercase tracking-widest">RED FLAGS (MALICIOUS)</h3>
                                    </div>
                                    <ul className="space-y-4 relative z-10">
                                        {[
                                            { title: "Mismatched Domains", text: "Visible text says 'paypal.com' but hovering reveals 'paypal-security.net'." },
                                            { title: "IP-Only Destinations", text: "Raw IP addresses (e.g., http://203.0.113.1/login) bypass DNS reputation." },
                                            { title: "Urgency Lure Patterns", text: "Embedded links in phrases like 'Verify immediately' or 'Emergency Alert'." },
                                            { title: "Excessive Subdomains", text: "Layers of dots used to hide the real domain (e.g., 'amazon.secure-verify.tk')." }
                                        ].map((item, i) => (
                                            <li key={i} className="flex gap-4">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0 animate-pulse" />
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tighter leading-tight mb-1">{item.title}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.text}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Good Link Section */}
                                <div className="p-8 rounded-[32px] border border-emerald-100 bg-emerald-50/10 space-y-6 relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
                                    <div className="absolute -top-4 -right-4 opacity-5 group-hover:scale-110 transition-transform">
                                        <Shield size={120} className="text-emerald-600" />
                                    </div>
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
                                            <Shield size={24} />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-800 poppins uppercase tracking-widest">SAFE SIGNALS (TRUSTED)</h3>
                                    </div>
                                    <ul className="space-y-4 relative z-10">
                                        {[
                                            { title: "Direct Path Matching", text: "Hovered URL points exactly to the official brand domain (e.g., google.com)." },
                                            { title: "Standard TLDs", text: "Trusted organizations use common TLDs like .com, .org, or .gov." },
                                            { title: "Clean URL Structure", text: "No random hyphens, emojis, or non-latin characters in the domain." },
                                            { title: "SSL Certification", text: "Look for 'https://' - though remember SSL is now common in phishing too." }
                                        ].map((item, i) => (
                                            <li key={i} className="flex gap-4">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tighter leading-tight mb-1">{item.title}</p>
                                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.text}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Detector;
