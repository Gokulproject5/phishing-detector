import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Trash2, Cpu, Sparkles, MessageSquare, Terminal, ChevronRight } from 'lucide-react';
import API_URL from '../config';

const API_BASE = API_URL;

const SUGGESTED = [
    'What are signs of a phishing email?',
    'How does BERT detect phishing?',
    'What is smishing and vishing?',
    'Common tech support scams',
    'Best practices for cybersecurity',
    'Spam vs Phishing: What is the difference?',
    'How do I protect against ransomware?'
];

const Chatbot = ({ user }) => {
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Hi! I'm your PhishGuard AI assistant. Ask me anything about phishing threats, security best practices, or how our BERT model works." }
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
            const token = localStorage.getItem('phish_token');
            const res = await axios.post(`${API_BASE}/chat`,
                { message: text },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(prev => [...prev, { role: 'bot', content: res.data.response }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', content: 'Connection error. Please ensure the backend is running on port 8000.' }]);
        } finally {
            setLoading(false);
        }
    };

    const showSuggestions = messages.length === 1;

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 poppins">Security Assistant</h1>
                    <p className="text-slate-500 text-sm">Real-time threat intelligence and guidance.</p>
                </div>
                <button
                    onClick={() => setMessages([messages[0]])}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Clear Chat"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Chat Area */}
                <div className="lg:col-span-3 cyber-card flex flex-col overflow-hidden bg-white">
                    {/* Message Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                        <AnimatePresence initial={false}>
                            {messages.map((m, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.role === 'user'
                                        ? 'bg-primary text-white font-black text-xs'
                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                        {m.role === 'user'
                                            ? (user?.full_name?.charAt(0) || user?.username?.charAt(0) || <User size={16} />)
                                            : <Cpu size={16} />
                                        }
                                    </div>
                                    <div className={`max-w-[75%] px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user'
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
                                        }`}>
                                        {m.content}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                        <Cpu size={16} className="text-slate-400" />
                                    </div>
                                    <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-slate-50 border border-slate-100 flex items-center gap-1.5 shadow-sm">
                                        {[0, 1, 2].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                                                className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <div className="flex gap-3 bg-white p-2 border border-slate-200 rounded-xl shadow-inner focus-within:border-indigo-500/40 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                            <input
                                type="text"
                                className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none"
                                placeholder="Ask about phishing, security best practices..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={loading || !input.trim()}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all shrink-0 shadow-md ${input.trim()
                                    ? 'bg-primary text-white hover:bg-[#1e293b] active:scale-95'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Context */}
                <div className="space-y-6">
                    <div className="cyber-card p-5 bg-indigo-600 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={60} />
                        </div>
                        <div className="relative z-10">
                            <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                <Sparkles size={14} /> AI Context Aware
                            </h4>
                            <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                                Our assistant is trained on millions of cyber threat patterns and can explain technical security concepts in plain language.
                            </p>
                        </div>
                    </div>

                    <div className="cyber-card p-5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 poppins">
                            <Terminal size={14} /> Quick Inquiries
                        </h4>
                        <div className="space-y-2">
                            {SUGGESTED.map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleSend(s)}
                                    className="w-full text-left p-3 rounded-lg text-xs text-slate-600 border border-slate-100 hover:border-indigo-500/30 hover:bg-indigo-50 transition-all flex items-center justify-between group"
                                >
                                    <span>{s}</span>
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="cyber-card p-5 bg-slate-50 border-dashed">
                        <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-2 poppins">
                            <MessageSquare size={14} className="text-primary" /> Active Support
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            Need deep technical analysis? Attach a full email header in the chat for a more detailed forensic scan.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
