import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Shield, ShieldCheck, Key,
    Camera, CheckCircle, AlertCircle, Loader2,
    Lock, Bell, Globe, Fingerprint
} from 'lucide-react';
import { authAPI } from '../services/api';

const Profile = ({ user, onRefreshUser }) => {
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        current_password: '',
        new_password: '',
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await authAPI.updateProfile(formData);

            if (res.data.status === 'success') {
                setStatus({ type: 'success', message: 'Neural Identity updated successfully!' });
                if (onRefreshUser) onRefreshUser();
                setFormData(prev => ({ ...prev, current_password: '', new_password: '' }));
            }
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.detail || 'Handshake failed. Protocol mismatch or invalid credentials.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl animate-slide-up space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Security Identity</h1>
                <p className="text-slate-500 font-medium">Manage your neural identity and authentication encryption layers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Avatar & Identity Card */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="premium-card p-10 flex flex-col items-center bg-white">
                        <div className="relative group">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="w-28 h-28 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[36px] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-500/20 transition-all border-4 border-white"
                            >
                                {user?.full_name?.charAt(0) || user?.username?.charAt(0)}
                            </motion.div>
                            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-xl hover:scale-110 transition-all">
                                <Camera size={18} />
                            </button>
                        </div>
                        <h3 className="mt-8 text-2xl font-black text-slate-900 tracking-tight">{user?.full_name}</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">ID: {user?.username}</p>

                        <div className="w-full mt-10 pt-8 border-t border-slate-50 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Clearance</span>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full border border-emerald-100 uppercase tracking-widest leading-none">Level 4</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Neural Status</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-indigo-600 uppercase">Synchronized</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-[-20%] right-[-10%] p-4 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                            <Shield size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                <Fingerprint size={24} className="text-indigo-300" />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-widest mb-2">Neural Signature</h4>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                    Your profile data and activity logs are encrypted with AES-256-GCM.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Settings Form */}
                <div className="lg:col-span-8 space-y-10">
                    <form onSubmit={handleUpdate} className="premium-card p-12 bg-white space-y-10">
                        <div className="flex items-center gap-5 pb-6 border-b border-slate-50">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                                <User size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-1">Identity Vector</h4>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Update your neural handle</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Identity</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-5 text-sm font-bold text-slate-800 outline-none focus:ring-[12px] focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all font-sans"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="Enter identity name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Permanent Handle</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300">
                                        <Globe size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        disabled
                                        className="w-full bg-slate-100/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-5 text-sm font-bold text-slate-400 cursor-not-allowed italic"
                                        value={user?.username}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 pb-6 border-b border-slate-50 pt-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                                <Lock size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-1">Security Logic</h4>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Recalibrate access credentials</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Passkey</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 outline-none focus:ring-[12px] focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all"
                                    value={formData.current_password}
                                    onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Neural Key</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 outline-none focus:ring-[12px] focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all"
                                    value={formData.new_password}
                                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {status.message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-start gap-4 p-5 rounded-2xl text-xs font-bold leading-relaxed ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                            >
                                <div className="mt-0.5 shrink-0">
                                    {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="uppercase tracking-widest text-[9px] font-black">{status.type === 'success' ? 'Protocol Success' : 'Neural Rejection'}</span>
                                    <span>{status.message}</span>
                                </div>
                            </motion.div>
                        )}

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-premium py-4 px-10 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                Synchronize Protocol
                            </button>
                        </div>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="premium-card p-8 flex items-center justify-between group cursor-default bg-white border border-slate-100/50">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all border border-slate-100">
                                    <Bell size={22} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-800 tracking-tight">Threat Notifications</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Monitoring</span>
                                </div>
                            </div>
                            <div className="w-12 h-6 bg-indigo-600 rounded-full relative p-1 shadow-inner cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                            </div>
                        </div>
                        <div className="premium-card p-8 flex items-center justify-between group cursor-pointer bg-white border border-slate-100/50 hover:border-emerald-500/20 transition-all">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all border border-slate-100">
                                    <Globe size={22} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-800 tracking-tight">Extension Bridge</span>
                                    <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-widest">Connected Node</span>
                                </div>
                            </div>
                            <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
