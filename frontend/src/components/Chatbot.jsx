import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Trash2, Cpu, Sparkles, MessageSquare, Terminal, ChevronRight } from 'lucide-react';
import { scanAPI } from '../services/api';

const SUGGESTED = [
    'What are signs of a phishing email?',
    'How does BERT detect phishing?',
    'What is smishing and vishing?',
    'Common tech support scams',
    'Best practices for cybersecurity',
    'Spam vs Phishing: What is the difference?',
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
            const res = await scanAPI.chat({ message: text });
            setMessages(prev => [...prev, { role: 'bot', content: res.data.response }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', content: 'Connection error. The neural link was interrupted.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 px-1">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Security Oracle</h1>
                    <p className="text-slate-500 font-medium">Real-time threat intelligence and guidance center.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setMessages([messages[0]])}
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl border border-slate-100 transition-all hover:border-rose-100"
                        title="Clear History"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0">
                {/* Chat Area */}
                <div className="lg:col-span-3 premium-card flex flex-col overflow-hidden bg-white shadow-premium">
                    {/* Message Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                        <AnimatePresence initial={false}>
                            {messages.map((m, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`w-11 h-11 rounded-[18px] flex items-center justify-center shrink-0 shadow-sm border transition-transform hover:scale-110 ${m.role === 'user'
                                        ? 'bg-indigo-600 text-white border-indigo-500 font-black text-sm'
                                        : 'bg-white text-slate-600 border-slate-100'
                                        }`}>
                                        {m.role === 'user'
                                            ? (user?.full_name?.charAt(0) || user?.username?.charAt(0) || <User size={18} />)
                                            : <Cpu size={20} strokeWidth={1.5} />
                                        }
                                    </div>
                                    <div className={`max-w-[75%] px-7 py-5 rounded-[28px] text-sm leading-relaxed shadow-sm ${m.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-slate-50 text-slate-700 border border-slate-100/50 rounded-tl-none font-medium'
                                        }`}>
                                        {m.content}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-5">
                                    <div className="w-11 h-11 rounded-[18px] bg-white border border-slate-100 flex items-center justify-center shrink-0">
                                        <Cpu size={20} className="text-indigo-600 animate-pulse" />
                                    </div>
                                    <div className="px-7 py-5 rounded-[28px] rounded-tl-none bg-slate-50 border border-slate-100/50 flex items-center gap-1.5 shadow-sm">
                                        {[0, 1, 2].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                                className="w-1.5 h-1.5 bg-indigo-600 rounded-full"
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Input Area */}
                    <div className="p-8 border-t border-slate-50 bg-slate-50/30">
                        <div className="flex gap-4 bg-white p-3 border border-slate-200 rounded-[28px] shadow-sm focus-within:border-indigo-500/30 focus-within:ring-[12px] focus-within:ring-indigo-500/5 transition-all">
                            <input
                                type="text"
                                className="flex-1 bg-transparent px-6 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none font-medium"
                                placeholder="Ask about phishing, security best practices..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={loading || !input.trim()}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-lg ${input.trim()
                                    ? 'bg-indigo-600 text-white hover:bg-slate-900 active:scale-95'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Training Context */}
                <div className="space-y-8">
                    <div className="premium-card p-8 bg-indigo-600 text-white relative overflow-hidden group">
                        <div className="absolute top-[-20px] right-[-20px] opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <Sparkles size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={16} className="text-indigo-200" />
                                <h4 className="font-black text-[10px] uppercase tracking-widest text-indigo-100">Intelligence Node</h4>
                            </div>
                            <h3 className="text-xl font-extrabold mb-3 leading-tight tracking-tight">Active Neural Learning</h3>
                            <p className="text-xs text-indigo-100/80 leading-relaxed font-medium">
                                Trained on millions of malicious signatures. I can deconstruct social engineering tactics in seconds.
                            </p>
                        </div>
                    </div>

                    <div className="premium-card p-8 bg-white overflow-hidden border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <Terminal size={14} className="text-slate-300" /> Suggested Queries
                        </h4>
                        <div className="space-y-3">
                            {SUGGESTED.map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleSend(s)}
                                    className="w-full text-left px-5 py-4 rounded-2xl text-[11px] font-bold text-slate-600 border border-slate-50 hover:border-indigo-500/30 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all flex items-center justify-between group"
                                >
                                    <span>{s}</span>
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="premium-card p-8 bg-slate-50/50 border-dashed border-2 flex items-start gap-4">
                        <MessageSquare size={18} className="text-indigo-600 shrink-0 mt-1" />
                        <div>
                            <h4 className="text-xs font-black text-slate-800 mb-1.5 uppercase tracking-widest">Header Analysis</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                Paste full email headers for forensic verification.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
