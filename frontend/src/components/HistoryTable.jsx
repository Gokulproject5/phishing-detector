import React from 'react';
import { Clock, ShieldAlert, CheckCircle, Trash2 } from 'lucide-react';

const HistoryTable = ({ history, onClear }) => {
    return (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Clock size={20} />
                    </div>
                    <div>
                        <span className="text-sm font-black text-slate-800 uppercase tracking-widest poppins block leading-none mb-1">Audit Trail</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Security Scans</span>
                    </div>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={onClear}
                        className="px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center gap-2 uppercase tracking-widest border border-transparent hover:border-red-100"
                    >
                        <Trash2 size={14} /> Wipe Logs
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Status</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Investigation Source</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Confidence</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-8 py-20 text-center text-slate-300">
                                    <div className="relative inline-block mb-4">
                                        <Clock size={48} className="opacity-10" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-slate-200 rounded-full animate-ping" />
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold poppins mb-1">No Activity Logged</p>
                                    <p className="text-xs font-medium">Your scan history will appear here once you run diagnostics.</p>
                                </td>
                            </tr>
                        ) : (
                            history.map((item) => {
                                const isPhish = item.prediction?.toLowerCase() === 'phishing';
                                const dateObj = item.timestamp ? new Date(item.timestamp) : null;
                                const isValidDate = dateObj && !isNaN(dateObj.getTime());

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPhish ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {isPhish ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
                                                </div>
                                                <span className={`text-xs font-black poppins ${isPhish ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {item.prediction?.toUpperCase() || 'UNKNOWN'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <p className="text-xs font-bold text-slate-700 truncate max-w-[300px] mb-0.5">{item.url || 'No Source Provided'}</p>
                                                <p className="text-[10px] text-slate-400 font-medium italic">Content investigation enabled</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black ${isPhish ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                                } border ${isPhish ? 'border-red-100' : 'border-emerald-100'}`}>
                                                {((item.score || 0) * 100).toFixed(0)}%
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right whitespace-nowrap">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold text-slate-500">
                                                    {isValidDate ? dateObj.toLocaleDateString() : 'N/A'}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400">
                                                    {isValidDate ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
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
            <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Neural Log Encryption Active (AES-256)</p>
            </div>
        </div>
    );
};

export default HistoryTable;
