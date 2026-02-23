import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Inbox, Shield, AlertTriangle, CheckCircle,
    Clock, Search, Trash2, Eye, ChevronRight, RefreshCw,
    Filter, MoreVertical, Star, Paperclip, Link2, ExternalLink,
    Lock, Smartphone, ShieldAlert, Sparkles
} from 'lucide-react';
import API_URL from '../config';

const API_BASE = API_URL;

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
            const token = localStorage.getItem('phish_token');
            const res = await axios.get(`${API_BASE}/api/email/fetch?limit=15`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (Array.isArray(res.data)) {
                setEmails(res.data);
                if (res.data.length > 0 && !selectedEmail) {
                    setSelectedEmail(res.data[0]);
                }
            } else {
                console.error("Fetched emails is not an array", res.data);
                setEmails([]);
            }
        } catch (err) {
            console.error("Failed to fetch emails", err);
            setError("Could not fetch emails. Please check your connection.");
        } finally {
            setSyncing(false);
        }
    };

    const handleSync = async () => {
        await fetchEmails();
    };

    const handleLevelScan = async (email) => {
        setAnalyzing(true);
        setScanResult(null);
        try {
            const token = localStorage.getItem('phish_token');
            // If already scanned by backend, use it
            if (email.scan_result) {
                setScanResult(email.scan_result);
            } else {
                const res = await axios.post(`${API_BASE}/predict`, { text: email.body }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setScanResult(res.data);
            }

            await axios.post(`${API_BASE}/scans/save`, {
                url: `[Email Scan] ${email.subject}`,
                result: email.scan_result || scanResult
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

        } catch (err) {
            console.error("Scan failed", err);
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
            const token = localStorage.getItem('phish_token');

            // Artificial progress for UX
            const interval = setInterval(() => {
                setSyncProgress(prev => Math.min(prev + 5, 90));
            }, 200);

            const res = await axios.post(`${API_BASE}/auth/connect-email-credentials`, credentials, {
                headers: { Authorization: `Bearer ${token}` }
            });

            clearInterval(interval);
            setSyncProgress(100);
            await new Promise(r => setTimeout(r, 500));

            if (res.data.status === 'success') {
                setIsConnected(true);
                setShowConnectForm(false);
                if (onRefreshUser) onRefreshUser();
                fetchEmails();
            }
        } catch (err) {
            console.error("Failed to connect email", err);
            setError(err.response?.data?.detail || "Connection failed. Please check credentials.");
            setLinkingAccount(false);
        } finally {
            // setLinkingAccount(false); // Managed in catch or success
        }
    };

    const handleDemoMode = async () => {
        setLinkingAccount(true);
        setSyncProgress(0);
        setError(null);
        try {
            const demoCreds = { email: 'demo@phishguard.ai', password: 'demo123', provider: 'gmail' };
            const token = localStorage.getItem('phish_token');
            const res = await axios.post(`${API_BASE}/auth/connect-email-credentials`, demoCreds, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            setError("Demo mode failed to initialize.");
            setLinkingAccount(false);
        }
    };

    const startLinking = (provider) => {
        setCredentials({ ...credentials, provider: provider.toLowerCase().includes('google') ? 'gmail' : provider.toLowerCase().includes('microsoft') ? 'outlook' : 'gmail' });
        setShowConnectForm(true);
    };

    if (!isConnected && !linkingAccount) {
        return (
            <div className="h-[calc(100vh-160px)] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm animate-fade-in p-8 text-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
                {showConnectForm ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md bg-white p-8 rounded-[32px] shadow-2xl border border-slate-100"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-900 poppins uppercase tracking-tight">Email Handshake</h3>
                            <button onClick={() => setShowConnectForm(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase poppins">Cancel</button>
                        </div>

                        <form onSubmit={submitCredentials} className="space-y-4">
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="Enter your email"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">App Password / Pass</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="Enter App Password"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                />
                                <p className="text-[9px] text-slate-400 font-medium px-1">Note: Use an App Password if using Gmail/Outlook (IMAP enabled).</p>
                                <button
                                    type="button"
                                    onClick={handleDemoMode}
                                    className="text-[9px] text-indigo-500 font-bold hover:underline"
                                >
                                    Don't have an App Password? Try Demo Mode
                                </button>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 rounded-xl text-red-500 text-[10px] font-bold poppins flex items-center gap-2">
                                    <AlertTriangle size={12} /> {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-200 mt-2"
                            >
                                Verify & Connect Tunnel
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-200 animate-bounce-slow">
                            <Mail size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 poppins mb-2">Neural Email Defense</h2>
                        <p className="text-slate-500 max-w-md mb-10 font-medium">
                            Activate PhishGuard's enterprise-grade scanning layer for your inbox. Our BERT model analyzes every incoming thread for advanced social engineering.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-12">
                            {[
                                { name: 'Google Workspace', icon: 'G', color: 'text-blue-500' },
                                { name: 'Microsoft 365', icon: 'M', color: 'text-orange-500' },
                                { name: 'Custom SMTP', icon: 'S', color: 'text-slate-700' }
                            ].map(provider => (
                                <button
                                    key={provider.name}
                                    onClick={() => startLinking(provider.name)}
                                    className="p-8 rounded-3xl border border-slate-100 bg-white hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all flex flex-col items-center gap-4 group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl font-black ${provider.color} group-hover:scale-110 transition-transform shadow-inner`}>
                                        {provider.icon}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 poppins">Connect {provider.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={handleDemoMode}
                                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 active:scale-95"
                            >
                                <Sparkles size={18} /> Launch Instant Demo
                            </button>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-2">
                                <Lock size={12} /> No account required for demo mode
                            </p>
                        </div>
                    </>
                )}
                <div className="mt-8 flex items-center gap-8 bg-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <span className="flex items-center gap-1.5 text-indigo-400"><Lock size={12} /> End-to-End Encrypted</span>
                    <span className="flex items-center gap-1.5 text-emerald-400"><Shield size={12} /> Live BERT Ingestion</span>
                    <span className="flex items-center gap-1.5 text-orange-400"><ShieldAlert size={12} /> Zero-Trust Auth</span>
                </div>
            </div>
        );
    }

    if (linkingAccount) {
        return (
            <div className="h-[calc(100vh-160px)] flex flex-col items-center justify-center bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent animate-pulse" />
                </div>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 flex flex-col items-center"
                >
                    <div className="w-24 h-24 mb-8 relative">
                        <RefreshCw size={96} className="text-indigo-500 animate-spin opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Shield size={40} className="text-indigo-400 shrink-0" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white poppins mb-2">Establishing Neural Tunnel</h3>
                    <p className="text-indigo-300/60 text-sm mb-8 font-medium tracking-wide">Syncing via PhishGuard OAuth Handshake...</p>

                    <div className="w-72 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                        <motion.div
                            className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${syncProgress}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{syncProgress}% Handshake Verified</span>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-160px)] flex bg-white rounded-3xl border border-slate-200 overflow-hidden animate-fade-in shadow-xl shadow-slate-200/50">
            {/* Inbox Sidebar */}
            <div className="w-96 border-r border-slate-100 flex flex-col bg-slate-50/20">
                <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                            <Inbox size={16} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 poppins uppercase tracking-wider">Secured Inbox</h3>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={handleSync}
                            className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${syncing ? 'animate-spin text-indigo-600' : 'text-slate-400'}`}
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search secured threads..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-xs focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-50 px-2 pb-4">
                    {emails.map((email) => (
                        <div
                            key={email.id}
                            onClick={() => {
                                setSelectedEmail(email);
                                setScanResult(null);
                            }}
                            className={`p-4 cursor-pointer rounded-2xl transition-all mb-1 ${selectedEmail?.id === email.id ? 'bg-white shadow-lg border-l-4 border-indigo-600' : 'hover:bg-white/60'}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${email.status === 'unread' ? 'bg-indigo-600' : 'bg-transparent'}`} />
                                    <span className={`text-[10px] font-black uppercase ${email.status === 'unread' ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        {email.status}
                                    </span>
                                    {email.isPhish && (
                                        <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-1.5 py-0.5 rounded-lg flex items-center gap-1">
                                            <AlertTriangle size={10} /> Threat
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">{email.time}</span>
                            </div>
                            <p className={`text-xs font-bold truncate mb-0.5 ${email.status === 'unread' ? 'text-slate-900' : 'text-slate-600'}`}>{email.from}</p>
                            <p className="text-[11px] text-slate-500 font-bold truncate mb-2">{email.subject}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 italic">"{email.preview}"</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Email View Area */}
            <div className="flex-1 flex flex-col bg-slate-50/50">
                {selectedEmail ? (
                    <div className="flex-1 flex flex-col p-10 overflow-y-auto max-w-5xl mx-auto w-full">
                        <div className="flex justify-between items-start mb-10 pb-6 border-b border-slate-100">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-xl shadow-indigo-100">
                                        {selectedEmail.from[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 poppins leading-none mb-2">{selectedEmail.subject}</h2>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <span className="text-xs font-bold">From:</span>
                                            <span className="text-xs font-black text-slate-700">{selectedEmail.from}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-xs font-bold">{selectedEmail.time}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleLevelScan(selectedEmail)}
                                    disabled={analyzing}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all shadow-xl ${analyzing
                                        ? 'bg-slate-200 text-slate-400'
                                        : 'bg-primary hover:bg-slate-800 text-white shadow-indigo-100 hover:-translate-y-1'
                                        }`}
                                >
                                    {analyzing ? <RefreshCw size={14} className="animate-spin" /> : <Shield size={14} />}
                                    Run Neural Scan
                                </button>
                                <button className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Analysis Result Banner */}
                        <AnimatePresence>
                            {scanResult && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, y: -20 }}
                                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                                    className={`mb-10 p-6 rounded-3xl border-2 flex items-center gap-6 shadow-xl ${scanResult.prediction === 'Phishing'
                                        ? 'bg-red-50/50 border-red-100 text-red-700 shadow-red-100'
                                        : 'bg-emerald-50/50 border-emerald-100 text-emerald-700 shadow-emerald-100'
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${scanResult.prediction === 'Phishing' ? 'bg-red-100' : 'bg-emerald-100'}`}>
                                        {scanResult.prediction === 'Phishing'
                                            ? <AlertTriangle size={32} />
                                            : <CheckCircle size={32} />
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-sm font-black poppins uppercase tracking-wider">
                                                {scanResult.prediction === 'Phishing' ? 'Social Engineering Flagged' : 'Neural Validation Passed'}
                                            </p>
                                            <span className="text-[10px] font-black bg-white/50 px-2 py-1 rounded-lg">BERT-v2.4 Diagnostics</span>
                                        </div>
                                        <p className="text-xs font-medium opacity-80 leading-relaxed">
                                            {scanResult.prediction === 'Phishing'
                                                ? `High-risk linguistic markers detected (${(scanResult.probability * 100).toFixed(1)}% confidence). This message mimics a trusted entity to solicit credentials.`
                                                : `Legitimate communication patterns identified with ${(scanResult.probability * 100).toFixed(1)}% confidence. No malicious vectors found in this thread.`
                                            }
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm min-h-[400px] text-slate-700 leading-relaxed relative text-sm font-medium">
                            {selectedEmail.body}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-10">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-dashed border-slate-200 animate-spin-slow" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Mail size={40} className="text-slate-200" />
                            </div>
                        </div>
                        <p className="mt-8 text-sm font-bold text-slate-400">Select a thread for secure neural inspection</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase mt-2 tracking-widest">End-to-End Encrypted Tunnel Active</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailInbox;
