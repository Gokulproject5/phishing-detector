import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Shield, Lock, User, AlertCircle, Loader2, Search } from 'lucide-react';
import API_URL from '../config';

const API_BASE = API_URL;

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

                const res = await axios.post(`${API_BASE}/auth/login`, params);
                localStorage.setItem('phish_token', res.data.access_token);
                onLoginSuccess();
            } else {
                await axios.post(`${API_BASE}/auth/register`, {
                    username: formData.username,
                    password: formData.password,
                    full_name: formData.full_name
                });
                setIsLogin(true);
                setError('Registration successful! Please login.');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 antialiased">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex w-16 h-16 bg-primary text-white rounded-2xl items-center justify-center shadow-xl shadow-slate-900/20 mb-4 transform hover:rotate-6 transition-transform">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 poppins">PhishGuard AI</h1>
                    <p className="text-slate-500 text-sm mt-1">Neural Intelligence for Threat Detection</p>
                </div>

                <div className="cyber-card bg-white p-8 shadow-2xl shadow-slate-200/50">
                    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-8">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            LOGIN
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            REGISTER
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                        placeholder="Enter your name"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <User size={16} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                    placeholder="your-id"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all"
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
                                className={`flex items-start gap-2 p-3 rounded-lg text-xs font-semibold ${error.includes('successful') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}
                            >
                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white hover:bg-slate-800 hover:text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transform active:scale-95 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? 'ACCESS DASHBOARD' : 'CREATE ACCOUNT')}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            <Search size={12} /> BERT ENGINE V2.4
                        </div>
                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            <Lock size={12} /> AES-256 SECURE
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-xs mt-8 font-medium">
                    Protected by PhishGuard Enterprise Security. Need help?
                    <span className="text-indigo-500 cursor-pointer ml-1 hover:underline">Contact Support</span>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
