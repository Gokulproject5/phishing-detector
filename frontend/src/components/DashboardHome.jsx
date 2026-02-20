import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import API_URL from '../config';
import {
    Zap,
    Shield,
    ShieldCheck,
    AlertTriangle,
    Search,
    ChevronRight,
    ArrowUpRight,
    Activity
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
    <div className="cyber-card p-6 flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-slate-900 poppins">{value}</h3>
            {trend && (
                <p className="text-xs font-semibold text-emerald-500 mt-2 flex items-center gap-1">
                    <ArrowUpRight size={12} /> {trend}
                </p>
            )}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
    </div>
);

const DashboardHome = ({ onNavigateToAnalyze, user }) => {
    const [stats, setStats] = useState({
        total_scans: 0,
        threats_blocked: 0,
        risk_score: 0,
        protection_level: 'Standard',
        system_protected: true
    });
    const [intel, setIntel] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('phish_token');
                if (!token) return;
                const [statsRes, intelRes] = await Promise.all([
                    axios.get(`${API_URL}/stats`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_URL}/api/threats/intel`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setStats(statsRes.data);
                setIntel(intelRes.data);
            } catch (err) {
                console.error('Data fetch failed', err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 poppins mb-2">
                        Welcome Back, {user?.full_name || 'Security Analyst'}
                    </h1>
                    <p className="text-slate-500">Your PhishGuard system is active and monitoring neural patterns.</p>
                </div>
                <div className="flex gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${stats.system_protected ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${stats.system_protected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {stats.system_protected ? 'System Protected' : 'System Alert'}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    label="Risk Score"
                    value={`${stats.risk_score}/100`}
                    icon={Activity}
                    color="bg-orange-500"
                    trend="Based on history"
                />
                <StatCard
                    label="Total Scans"
                    value={stats.total_scans}
                    icon={Search}
                    color="bg-indigo-500"
                    trend="+12% this week"
                />
                <StatCard
                    label="Threats Blocked"
                    value={stats.threats_blocked}
                    icon={ShieldCheck}
                    color="bg-emerald-500"
                    trend="Real-time protection"
                />
                <StatCard
                    label="Protection Level"
                    value={stats.protection_level}
                    icon={Shield}
                    color="bg-indigo-600"
                    trend="Active Defender"
                />
            </div>

            {/* Main Action Card */}
            <div className="cyber-card overflow-hidden">
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Shield size={160} />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-4">
                            Neural Engine v2.4 Active
                        </div>
                        <h2 className="text-3xl font-bold poppins mb-4">Explainable Phishing Detection</h2>
                        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                            Analyze suspicious emails, URLs, or messages using our advanced BERT model and understand the underlying logic with SHAP explainability.
                        </p>
                        <button
                            onClick={onNavigateToAnalyze}
                            className="bg-accent hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20"
                        >
                            <Search size={20} />
                            Start New Analysis
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                            <AlertTriangle size={20} className="text-orange-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-1">Stay Alert</h4>
                            <p className="text-sm text-slate-500 italic">"90% of data breaches start with a phishing attack. Always verify before you click."</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 border-l border-slate-200 pl-8">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Zap size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-1">BERT Integration</h4>
                            <p className="text-sm text-slate-500">Our model understands context, identifying subtle signs that rule-based systems miss.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
