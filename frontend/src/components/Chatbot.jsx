import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Trash2, Cpu, Sparkles } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const SUGGESTED = [
    'What are signs of a phishing email?',
    'How does BERT detect phishing?',
    'What is spear phishing?',
    'How do I report phishing?',
];

const Chatbot = () => {
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Hi! I'm PhishGuard AI assistant. Ask me about phishing threats, security best practices, or how to stay safe online." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (msg) => {
        const text = msg || input;
        if (!text.trim()) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE}/chat`, { message: text });
            setMessages(prev => [...prev, { role: 'bot', content: res.data.response }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', content: 'Connection error. Please ensure the backend is running.' }]);
        } finally {
            setLoading(false);
        }
    };

    const showSuggestions = messages.length === 1;

    return (
        <div className="flex flex-col rounded-2xl border border-white/8 overflow-hidden" style={{ height: '600px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/15 rounded-lg flex items-center justify-center border border-indigo-500/20">
                        <Cpu size={16} className="text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">AI Assistant</p>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] text-emerald-400 font-medium">Active</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setMessages([messages[0]])}
                    className="text-slate-600 hover:text-slate-400 transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
                <AnimatePresence initial={false}>
                    {messages.map((m, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user'
                                    ? 'bg-indigo-500'
                                    : 'bg-white/5 border border-white/10'
                                }`}>
                                {m.role === 'user'
                                    ? <User size={13} className="text-white" />
                                    : <Bot size={13} className="text-slate-400" />
                                }
                            </div>
                            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                    ? 'bg-indigo-500 text-white rounded-tr-sm'
                                    : 'text-slate-300 rounded-tl-sm border border-white/5'
                                }`} style={m.role !== 'user' ? { background: 'rgba(255,255,255,0.04)' } : {}}>
                                {m.content}
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <Bot size={13} className="text-slate-400" />
                            </div>
                            <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5 flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                                        className="w-1.5 h-1.5 bg-slate-500 rounded-full"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Suggested prompts */}
                {showSuggestions && (
                    <div className="space-y-2 pt-2">
                        <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles size={10} /> Suggested
                        </p>
                        {SUGGESTED.map(s => (
                            <button
                                key={s}
                                onClick={() => handleSend(s)}
                                className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-slate-400 border border-white/5 hover:border-indigo-500/30 hover:text-white hover:bg-indigo-500/5 transition-all"
                                style={{ background: 'rgba(255,255,255,0.02)' }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/40 focus:bg-white/8 transition-all"
                        placeholder="Ask about phishing, security..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${input.trim()
                                ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20'
                                : 'bg-white/5 text-slate-600 cursor-not-allowed'
                            }`}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
