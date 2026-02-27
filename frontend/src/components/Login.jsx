import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, AlertCircle, Loader2, Search } from 'lucide-react';
import { authAPI } from '../services/api';

const Login = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '', full_name: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const params = new URLSearchParams();
                params.append('username', formData.username);
                params.append('password', formData.password);

                const res = await authAPI.login(params);
                localStorage.setItem('phish_token', res.data.access_token);
                onLoginSuccess();
            } else {
                await authAPI.register({
                    username: formData.username,
                    password: formData.password,
                    full_name: formData.full_name
                });
                setIsLogin(true);
                setError('Neural profile created. Handshake verified. Please access the core.');
            }
        } catch (err) {
            const msg = err.response?.data?.detail || 'Handshake failed. Protocol mismatch or invalid credentials.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6 antialiased relative overflow-hidden">
            {/* Premium Background Ambiance */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[440px] relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="inline-flex w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-[28px] items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6"
                    >
                        <Shield size={40} strokeWidth={1.5} />
                    </motion.div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Phish<span className="text-indigo-600">Guard</span>
                    </h1>
                    <p className="text-slate-400 font-semibold text-xs uppercase tracking-[0.2em]">Neural Defense Core</p>
                </div>

                <div className="premium-card p-10 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
                    <div className="flex gap-1 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl mb-10">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 text-[10px] font-black tracking-widest rounded-xl transition-all duration-300 ${isLogin ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            ACCESS CORE
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 text-[10px] font-black tracking-widest rounded-xl transition-all duration-300 ${!isLogin ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            ENLIST
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-5 text-sm text-slate-800 outline-none focus:border-indigo-500/30 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 transition-all"
                                            placeholder="John Doe"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Vector</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-5 text-sm text-slate-800 outline-none focus:border-indigo-500/30 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 transition-all"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Neural Passkey</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-5 text-sm text-slate-800 outline-none focus:border-indigo-500/30 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex items-start gap-3 p-4 rounded-xl text-xs font-bold leading-snug ${error.includes('verified') || error.includes('created') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                            >
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-premium w-full py-4 uppercase tracking-[0.2em] text-[11px] font-black ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? 'Handshake Secure' : 'Register Identity')}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-center gap-6">
                        <div className="flex flex-col items-center gap-1 opacity-40">
                            <Search size={14} className="text-slate-600" />
                            <span className="text-[8px] font-black uppercase tracking-tighter">BERT 2.4</span>
                        </div>
                        <div className="w-px h-6 bg-slate-100" />
                        <div className="flex flex-col items-center gap-1 opacity-40">
                            <Shield size={14} className="text-slate-600" />
                            <span className="text-[8px] font-black uppercase tracking-tighter">Verified</span>
                        </div>
                        <div className="w-px h-6 bg-slate-100" />
                        <div className="flex flex-col items-center gap-1 opacity-40">
                            <Lock size={14} className="text-slate-600" />
                            <span className="text-[8px] font-black uppercase tracking-tighter">AES-256</span>
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-xs mt-10 font-bold uppercase tracking-widest">
                    Secured by <span className="text-indigo-500">PhishGuard Enterprise</span>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
