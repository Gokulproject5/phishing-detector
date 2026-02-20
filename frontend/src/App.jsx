import React, { useState, useEffect } from 'react';
import { Shield, MessageSquare, Zap, Lock, ChevronRight, Activity, ShieldAlert, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Detector from './components/Detector';
import Chatbot from './components/Chatbot';

function App() {
    const [showChat, setShowChat] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#040b1a] text-white">
            {/* Background glow effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/8 rounded-full blur-[120px]" />
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? 'bg-[#040b1a]/90 backdrop-blur-xl border-b border-white/5 shadow-xl'
                    : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Shield size={18} className="text-white" />
                        </div>
                        <span className="text-base font-bold tracking-tight">PhishGuard AI</span>
                    </div>

                    {/* Nav links */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                        <a href="#" className="hover:text-white transition-colors">Dashboard</a>
                        <a href="#" className="hover:text-white transition-colors">Reports</a>
                        <a href="#" className="hover:text-white transition-colors">Security Tips</a>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Online
                        </div>
                        <button
                            onClick={() => setShowChat(!showChat)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${showChat
                                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <MessageSquare size={17} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero + Main Content */}
            <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-5">
                        <Zap size={12} />
                        Neural Engine v2.4 · BERT + SHAP
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
                        Detect phishing threats<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                            with AI precision.
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl">
                        Paste any suspicious email or message. Our BERT model scans it in milliseconds and explains exactly why it's safe or dangerous.
                    </p>
                </motion.div>

                {/* Content Grid */}
                <div className={`grid gap-6 transition-all duration-700 ${showChat ? 'grid-cols-1 lg:grid-cols-[1fr_380px]' : 'grid-cols-1'}`}>
                    <div className="min-w-0">
                        <Detector />
                    </div>

                    <AnimatePresence>
                        {showChat && (
                            <motion.div
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 40 }}
                                className="sticky top-20 self-start"
                            >
                                <Chatbot />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Lock size={14} />
                        <span>AES-256 · GDPR Compliant · Zero-log Policy</span>
                    </div>
                    <p className="text-slate-600 text-sm">© 2026 PhishGuard AI</p>
                    <div className="flex gap-4">
                        <Activity size={16} className="text-slate-700 hover:text-indigo-400 transition-colors cursor-pointer" />
                        <ShieldAlert size={16} className="text-slate-700 hover:text-indigo-400 transition-colors cursor-pointer" />
                        <Info size={16} className="text-slate-700 hover:text-indigo-400 transition-colors cursor-pointer" />
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
