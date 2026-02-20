import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    User, Mail, Shield, ShieldCheck, Key,
    Camera, CheckCircle, AlertCircle, Loader2,
    Lock, Bell, Globe, Fingerprint
} from 'lucide-react';
import API_URL from '../config';

const API_BASE = API_URL;

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
            const token = localStorage.getItem('phish_token');
            const res = await axios.post(`${API_BASE}/auth/profile/update`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.status === 'success') {
                setStatus({ type: 'success', message: 'Security profile updated successfully!' });
                if (onRefreshUser) onRefreshUser();
                setFormData(prev => ({ ...prev, current_password: '', new_password: '' }));
            }
        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.detail || 'Update failed. Verify your current password.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl animate-fade-in space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 poppins">Security Profile</h1>
                <p className="text-slate-500 font-medium">Manage your neural identity and authentication layers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Avatar & Identity Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50 flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-indigo-200 group-hover:scale-105 transition-transform">
                                {user?.full_name?.charAt(0) || user?.username?.charAt(0)}
                            </div>
                            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-lg hover:bg-slate-50 transition-all">
                                <Camera size={14} />
                            </button>
                        </div>
                        <h3 className="mt-6 text-xl font-black text-slate-900 poppins">{user?.full_name}</h3>
                        <p className="text-sm font-bold text-slate-400">@{user?.username}</p>

                        <div className="w-full mt-8 pt-6 border-t border-slate-50 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Auth Level</span>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100 uppercase">Premium</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Defense Status</span>
                                <span className="text-[10px] font-black text-indigo-600">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Shield size={80} />
                        </div>
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Fingerprint size={20} className="text-indigo-300" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Neural Signature</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                                    Your identity is hashed with AES-256 for maximum security.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Settings Form */}
                <div className="lg:col-span-8 space-y-8">
                    <form onSubmit={handleUpdate} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50 space-y-8">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <User size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest poppins">Identity Details</h4>
                                <p className="text-xs text-slate-400 font-medium">Update your public security name.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 transition-all"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="Enter full name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username (Static)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                                        <Globe size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        disabled
                                        className="w-full bg-slate-100 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-slate-400 cursor-not-allowed"
                                        value={user?.username}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pb-4 border-b border-slate-50 pt-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <Lock size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest poppins">Security Logic</h4>
                                <p className="text-xs text-slate-400 font-medium">Update password or multi-factor layers.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 transition-all"
                                    value={formData.current_password}
                                    onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Neural Key (Password)</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 transition-all"
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
                                className={`flex items-start gap-3 p-4 rounded-2xl text-xs font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
                            >
                                {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                <span>{status.message}</span>
                            </motion.div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                Commit Changes
                            </button>
                        </div>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between group cursor-default shadow-lg shadow-slate-100/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                                    <Bell size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800">Security Alerts</span>
                                    <span className="text-[10px] text-slate-400 font-medium">Real-time threat notifications</span>
                                </div>
                            </div>
                            <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between group cursor-default shadow-lg shadow-slate-100/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                                    <Globe size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800">Browser Guard</span>
                                    <span className="text-[10px] text-slate-400 font-medium">Chrome Extension bridge</span>
                                </div>
                            </div>
                            <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
