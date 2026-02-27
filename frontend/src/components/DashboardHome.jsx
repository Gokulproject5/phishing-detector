import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { scanAPI } from '../services/api';

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
    <div className="premium-card p-8 group hover:scale-[1.02] transition-all duration-500 bg-white">
        <div className="flex items-start justify-between mb-6">
            <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-${color.split('-')[1]}-600 group-hover:rotate-12 transition-transform duration-500 border border-${color.split('-')[1]}-100/50`}>
                <Icon size={28} strokeWidth={1.5} />
            </div>
            {trend && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    <ArrowUpRight size={14} /> {trend}
                </div>
            )}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
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
                const [statsRes, intelRes] = await Promise.all([
                    scanAPI.getStats(),
                    scanAPI.getIntel()
                ]);
                setStats(statsRes.data);
                setIntel(intelRes.data);
            } catch (err) {
                console.error('Data telemetry failed:', err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-12 animate-slide-up pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">{user?.full_name?.split(' ')[0] || 'Analyst'}</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl text-lg leading-relaxed">
                        Your PhishGuard core is actively deconstructing threats across across all neural vectors. Status: <span className="text-emerald-600 font-bold">Optimized</span>.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="glass-box px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 bg-white">
                        <div className="relative">
                            <div className={`w-3 h-3 rounded-full ${stats.system_protected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <div className={`absolute inset-0 rounded-full animate-ping opacity-25 ${stats.system_protected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        </div>
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">
                            {stats.system_protected ? 'Neural Shield Active' : 'Shield Interrupted'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    label="Threat Index"
                    value={`${stats.risk_score}/100`}
                    icon={Activity}
                    color="bg-amber-500"
                    trend="Low Risk"
                />
                <StatCard
                    label="Neural Analysis"
                    value={stats.total_scans}
                    icon={Search}
                    color="bg-indigo-500"
                    trend="+12% Active"
                />
                <StatCard
                    label="Breaches Deflected"
                    value={stats.threats_blocked}
                    icon={ShieldCheck}
                    color="bg-emerald-500"
                    trend="Real-time"
                />
                <StatCard
                    label="Defense Tier"
                    value={stats.protection_level}
                    icon={Shield}
                    color="bg-indigo-600"
                    trend="Enterprise"
                />
            </div>

            {/* Hero Main Action */}
            <div className="premium-card overflow-hidden bg-white border border-slate-50 shadow-premium group">
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[450px]">
                    <div className="lg:col-span-7 p-12 lg:p-20 flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 w-fit border border-indigo-100/50"
                        >
                            <Zap size={14} className="fill-current" />
                            Next-Gen Explainable AI
                        </motion.div>
                        <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-8 leading-[1.05] tracking-tight">
                            Unmask threats with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-900">Explainable Logic.</span>
                        </h2>
                        <p className="text-slate-500 text-lg mb-12 leading-relaxed max-w-xl font-medium">
                            Our BERT-powered neural engine goes beyond simple detection. It identifies complex phishing patterns and provides human-readable forensics for every alert.
                        </p>
                        <button
                            onClick={onNavigateToAnalyze}
                            className="btn-premium w-full sm:w-auto py-5 px-10 rounded-2xl flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95"
                        >
                            <Search size={22} strokeWidth={2.5} />
                            Initiate Deep Analysis
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <div className="lg:col-span-5 bg-slate-50/50 flex items-center justify-center p-12 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        <motion.div
                            animate={{
                                rotate: [0, 5, 0, -5, 0],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10 p-16 bg-white rounded-[56px] shadow-2xl border-8 border-slate-50 group-hover:border-indigo-50 transition-colors duration-1000"
                        >
                            <Shield size={160} className="text-indigo-600 drop-shadow-2xl" strokeWidth={0.8} />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px]" />
                        </motion.div>
                    </div>
                </div>
                <div className="bg-slate-900/5 px-12 py-8 border-t border-slate-50 flex flex-wrap gap-12 items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                            <AlertTriangle size={20} className="text-amber-600" />
                        </div>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest italic opacity-60">"90% of breaches start via phishing."</span>
                    </div>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <Activity size={20} className="text-indigo-600" />
                        </div>
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">SHAP Logic Integrated</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
