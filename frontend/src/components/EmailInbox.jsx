import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Inbox, Shield, AlertTriangle, CheckCircle,
    RefreshCw, Filter, Search, Trash2, ChevronRight,
    Lock, ShieldAlert, Sparkles, ExternalLink, Download
} from 'lucide-react';
import { authAPI, scanAPI } from '../services/api';

const EmailInbox = ({ user, onRefreshUser }) => {
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [linkingAccount, setLinkingAccount] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncing, setSyncing] = useState(false);
    const [showConnectForm, setShowConnectForm] = useState(false);
    const [credentials, setCredentials] = useState({ email: '', password: '', provider: 'gmail' });
    const [error, setError] = useState(null);
    const [emails, setEmails] = useState([]);

    useEffect(() => {
        if (user) {
            setIsConnected(user.is_email_connected);
            if (user.is_email_connected) {
                fetchEmails();
            }
        }
    }, [user]);

    const fetchEmails = async () => {
        setSyncing(true);
        setError(null);
        try {
            const res = await scanAPI.fetchEmails(15);
            if (Array.isArray(res.data)) {
                setEmails(res.data);
                if (res.data.length > 0 && !selectedEmail) {
                    setSelectedEmail(res.data[0]);
                }
            }
        } catch (err) {
            setError("Neural log retrieval timed out. Check network integrity.");
        } finally {
            setSyncing(false);
        }
    };

    const handleLevelScan = async (email) => {
        setAnalyzing(true);
        setScanResult(null);
        try {
            let result;
            if (email.scan_result) {
                result = email.scan_result;
            } else {
                const res = await scanAPI.predict({ text: email.body });
                result = res.data;
            }
            setScanResult(result);

            await scanAPI.save({
                url: `[Email Scan] ${email.subject}`,
                result: result
            });

        } catch (err) {
            console.error("Forensic scan failure:", err);
        } finally {
            setAnalyzing(false);
        }
    };

    const submitCredentials = async (e) => {
        e.preventDefault();
        setLinkingAccount(true);
        setSyncProgress(0);
        setError(null);

        try {
            const interval = setInterval(() => {
                setSyncProgress(prev => Math.min(prev + 5, 90));
            }, 150);

            const res = await authAPI.connectEmail(credentials);

            clearInterval(interval);
            setSyncProgress(100);
            await new Promise(r => setTimeout(r, 600));

            if (res.data.status === 'success') {
                setIsConnected(true);
                setShowConnectForm(false);
                if (onRefreshUser) onRefreshUser();
                fetchEmails();
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Handshake rejected. Verify encryption keys/app passwords.");
            setLinkingAccount(false);
        }
    };

    const handleDemoMode = async () => {
        setLinkingAccount(true);
        setSyncProgress(0);
        setError(null);
        try {
            const demoCreds = { email: 'demo@phishguard.ai', password: 'demo123', provider: 'gmail' };
            const res = await authAPI.connectEmail(demoCreds);
            if (res.data.status === 'success') {
                setSyncProgress(100);
                setTimeout(async () => {
                    setIsConnected(true);
                    setShowConnectForm(false);
                    setLinkingAccount(false);
                    if (onRefreshUser) onRefreshUser();
                    await fetchEmails();
                }, 800);
            }
        } catch (err) {
            setError("Demo node synchronization failed.");
            setLinkingAccount(false);
        }
    };

    if (!isConnected && !linkingAccount) {
        return (
            <div className="h-[calc(100vh-160px)] flex flex-col items-center justify-center animate-slide-up p-10 bg-white premium-card">
                {showConnectForm ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md p-10 bg-white rounded-[40px] shadow-premium border border-slate-50"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Email Handshake</h3>
                            <button onClick={() => setShowConnectForm(false)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest">Abort</button>
                        </div>

                        <form onSubmit={submitCredentials} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Identity Node (Email)</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-[10px] focus:ring-indigo-500/5 focus:border-indigo-500/30 outline-none transition-all"
                                    placeholder="your@email.com"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Encrypted App Passkey</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-[10px] focus:ring-indigo-500/5 focus:border-indigo-500/30 outline-none transition-all"
                                    placeholder="••••••••••••"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                />
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">IMAP/SSL Required</span>
                                    <button
                                        type="button"
                                        onClick={handleDemoMode}
                                        className="text-[9px] text-indigo-500 font-black uppercase tracking-widest hover:underline"
                                    >
                                        Use Demo Node
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 text-[10px] font-black flex items-center gap-3 border border-rose-100">
                                    <AlertTriangle size={14} /> {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn-premium w-full py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl"
                            >
                                Verify & Connect Tunnel
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <div className="text-center max-w-2xl">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] flex items-center justify-center text-white mx-auto mb-10 shadow-2xl shadow-indigo-500/30 border-4 border-white"
                        >
                            <Mail size={44} strokeWidth={1.5} />
                        </motion.div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Neural Email Sentry</h2>
                        <p className="text-slate-500 mb-12 font-medium leading-relaxed px-10">
                            Activate enterprise-grade linguistic analysis for your inbox. Our BERT model deconstructs every thread to identify zero-day social engineering vectors.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {['Google Workspace', 'Microsoft 365', 'Custom SMTP'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => startLinking(p)}
                                    className="p-8 rounded-[32px] border border-slate-100 bg-white hover:border-indigo-500/30 hover:shadow-premium hover:-translate-y-1 transition-all flex flex-col items-center gap-5 group"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-slate-50">
                                        {p[0]}
                                    </div>
                                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-none">{p}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleDemoMode}
                            className="btn-premium px-12 py-5 rounded-2xl flex items-center gap-4 group shadow-2xl shadow-indigo-500/20"
                        >
                            <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                            Launch Instant Intelligence Demo
                        </button>

                        <div className="mt-14 flex items-center gap-10 bg-slate-900/5 px-8 py-4 rounded-3xl text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] border border-slate-100">
                            <span className="flex items-center gap-2 text-indigo-500"><Lock size={12} /> AES-256 Encrypted</span>
                            <span className="flex items-center gap-2 text-emerald-500"><Shield size={12} /> BERT Active Injection</span>
                            <span className="flex items-center gap-2 text-rose-500"><ShieldAlert size={12} /> Tactical Defense Layer</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (linkingAccount) {
        return (
            <div className="h-[calc(100vh-160px)] flex flex-col items-center justify-center bg-slate-900 rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent animate-pulse" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-28 h-28 mb-10 relative">
                        <RefreshCw size={112} className="text-indigo-500 animate-spin opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Shield size={48} className="text-indigo-400 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight mb-3">Initializing Neural Bridge</h3>
                    <p className="text-indigo-300/50 text-xs font-black uppercase tracking-[0.2em] mb-10">Handshake Protocol Exchange...</p>

                    <div className="w-80 h-2 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.6)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${syncProgress}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{syncProgress}% COMPLETE</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-160px)] flex bg-white rounded-[40px] border border-slate-100 overflow-hidden animate-slide-up shadow-premium">
            {/* Inbox Sidebar */}
            <div className="w-[420px] border-r border-slate-50 flex flex-col bg-slate-50/20">
                <div className="px-10 py-8 border-b border-slate-50 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                            <Inbox size={20} strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Secured Threads</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Handshake: RSA-4096</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchEmails}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-100 ${syncing ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Deconstruct secured messages..."
                            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold uppercase tracking-widest focus:ring-[10px] focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-3 custom-scrollbar">
                    {emails.map((email) => (
                        <div
                            key={email.id}
                            onClick={() => {
                                setSelectedEmail(email);
                                setScanResult(null);
                            }}
                            className={`p-6 cursor-pointer rounded-3xl transition-all relative overflow-hidden group border ${selectedEmail?.id === email.id ? 'bg-white shadow-xl border-slate-100 scale-[1.02]' : 'hover:bg-white/70 border-transparent hover:border-slate-50'}`}
                        >
                            {selectedEmail?.id === email.id && <div className="absolute left-0 top-0 w-1.5 h-full bg-indigo-600" />}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${email.status === 'unread' ? 'bg-indigo-600 animate-pulse' : 'bg-transparent'}`} />
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${email.status === 'unread' ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        {email.status}
                                    </span>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 group-hover:bg-white transition-colors">{email.time}</span>
                            </div>
                            <p className="text-xs font-black text-slate-900 tracking-tight mb-1 truncate">{email.from}</p>
                            <p className="text-[11px] text-slate-500 font-extrabold truncate leading-relaxed line-clamp-1">{email.subject}</p>

                            {email.isPhish && (
                                <div className="mt-4 flex items-center gap-2 text-[8px] font-black uppercase text-rose-500 bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-100 w-fit">
                                    <ShieldAlert size={10} /> Neural Breach Risk
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Email View Area */}
            <div className="flex-1 flex flex-col bg-slate-50/10">
                {selectedEmail ? (
                    <div className="flex-1 flex flex-col p-14 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-start mb-14 pb-8 border-b border-slate-100/50">
                            <div className="space-y-6 flex-1">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-indigo-500/20 border-4 border-white">
                                        {selectedEmail.from[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 leading-tight">{selectedEmail.subject}</h2>
                                        <div className="flex items-center gap-4 text-slate-500">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Assigned Origin</span>
                                                <span className="text-xs font-black text-slate-800">{selectedEmail.from}</span>
                                            </div>
                                            <div className="w-px h-8 bg-slate-100" />
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Tactical Timestamp</span>
                                                <span className="text-xs font-black text-slate-800">{selectedEmail.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleLevelScan(selectedEmail)}
                                    disabled={analyzing}
                                    className={`btn-premium px-8 py-4 rounded-2xl flex items-center gap-3 active:scale-95 ${analyzing ? 'opacity-50 grayscale' : ''}`}
                                >
                                    {analyzing ? <RefreshCw size={18} className="animate-spin" /> : <Shield size={18} />}
                                    Run Neural Scan
                                </button>
                                <button className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm">
                                    <Trash2 size={24} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>

                        {/* Analysis Result Banner */}
                        <AnimatePresence mode="wait">
                            {scanResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`mb-14 p-8 rounded-[36px] border-2 flex items-center gap-8 shadow-2xl ${scanResult.prediction === 'Phishing'
                                        ? 'bg-rose-50/50 border-rose-100 text-rose-800 shadow-rose-500/5'
                                        : 'bg-emerald-50/50 border-emerald-100 text-emerald-800 shadow-emerald-500/5'
                                        }`}
                                >
                                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 shadow-lg ${scanResult.prediction === 'Phishing' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {scanResult.prediction === 'Phishing'
                                            ? <ShieldAlert size={36} strokeWidth={1.5} />
                                            : <CheckCircle size={36} strokeWidth={1.5} />
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em]">
                                                {scanResult.prediction === 'Phishing' ? 'Social Engineering Detected' : 'Verified Logic Integrity'}
                                            </h4>
                                            <span className="text-[10px] font-black bg-white/60 px-3 py-1.5 rounded-xl border border-white/40 tracking-widest uppercase">BERT CORE v2.4</span>
                                        </div>
                                        <p className="text-xs font-bold opacity-80 leading-relaxed max-w-2xl">
                                            {scanResult.prediction === 'Phishing'
                                                ? `Neural patterns strongly indicate malicious intent (${(scanResult.probability * 100).toFixed(1)}% conf). This thread mimics a trusted entity to harvest secure credentials.`
                                                : `Legitimate communication verified with ${(scanResult.probability * 100).toFixed(1)}% confidence. Tactical heuristics confirms zero malicious vectors.`
                                            }
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="bg-white p-14 rounded-[48px] border border-slate-50 shadow-sm min-h-[400px] text-slate-700 leading-relaxed relative flex flex-col group">
                            <div className="absolute top-8 right-8 text-slate-100 group-hover:text-indigo-50/30 transition-colors">
                                <Sparkles size={80} />
                            </div>
                            <div className="relative z-10 text-base font-medium whitespace-pre-wrap max-w-4xl">
                                {selectedEmail.body}
                            </div>
                        </div>

                        <div className="mt-14 flex gap-4">
                            <button className="btn-secondary px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50">
                                <Download size={16} /> Forensic Report
                            </button>
                            <button className="btn-secondary px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50">
                                <ExternalLink size={16} /> Raw Metadata
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-200">
                        <div className="w-40 h-40 rounded-full border border-slate-100 flex items-center justify-center bg-white shadow-xl mb-10 relative">
                            <div className="absolute inset-2 rounded-full border border-dashed border-slate-200 animate-spin-slow" />
                            <Mail size={48} className="text-slate-100" />
                        </div>
                        <h3 className="text-xl font-black text-slate-400 uppercase tracking-[0.3em]">Standby</h3>
                        <p className="text-[10px] font-black text-slate-300 uppercase mt-2 tracking-widest">Select a thread for neural deconstruction</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailInbox;
