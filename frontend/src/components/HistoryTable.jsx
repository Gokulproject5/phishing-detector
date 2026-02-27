import React from 'react';
import { Clock, ShieldAlert, CheckCircle, Trash2 } from 'lucide-react';

const HistoryTable = ({ history, onClear }) => {
    return (
        <div className="premium-card overflow-hidden">
            <div className="px-10 py-7 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[20px] bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100/50 shadow-sm">
                        <Clock size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Archival Logs</h4>
                        <span className="text-lg font-extrabold text-slate-900 tracking-tight">Neural Diagnostic Audit</span>
                    </div>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={onClear}
                        className="px-5 py-2.5 rounded-2xl text-[10px] font-black text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-2 uppercase tracking-widest border border-slate-100 hover:border-rose-100"
                    >
                        <Trash2 size={14} /> Purge Records
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/30 border-y border-slate-50">
                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Verdict</th>
                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Vector</th>
                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Correlation</th>
                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Sequence Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-10 py-24 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
                                            <Clock size={40} strokeWidth={1} />
                                        </div>
                                        <p className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Zero Activity Detected</p>
                                        <p className="text-[11px] text-slate-400 font-medium mt-2 max-w-[200px]">Initial scan session required to populate tactical history logs.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            history.map((item) => {
                                const isPhish = item.prediction?.toLowerCase() === 'phishing';
                                const dateObj = item.timestamp ? new Date(item.timestamp) : null;
                                const isValidDate = dateObj && !isNaN(dateObj.getTime());

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all group cursor-default">
                                        <td className="px-10 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isPhish ? 'bg-rose-50 text-rose-500 shadow-sm border border-rose-100' : 'bg-emerald-50 text-emerald-500 shadow-sm border border-emerald-100'}`}>
                                                    {isPhish ? <ShieldAlert size={20} strokeWidth={1.5} /> : <CheckCircle size={20} strokeWidth={1.5} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-black uppercase tracking-widest ${isPhish ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                        {item.prediction?.toUpperCase() || 'UNKNOWN'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">AI Handshake Confirmed</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-slate-900 truncate max-w-[340px] mb-1">{item.url || 'Neural Dump'}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Diagnostic Signature: {item.id ? String(item.id).substring(0, 8) : '00000000'}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                                                <div className={`w-1.5 h-1.5 rounded-full ${isPhish ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                                                <span className="text-xs font-black text-slate-900">
                                                    {((item.score || 0) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right whitespace-nowrap">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-black text-slate-900 poppins">
                                                    {isValidDate ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                                    {isValidDate ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-10 py-5 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">End-to-End Neural Encryption Enabled</p>
                <div className="flex gap-4">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">AES-256</span>
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">BERT 2.4</span>
                </div>
            </div>
        </div>
    );
};

export default HistoryTable;
