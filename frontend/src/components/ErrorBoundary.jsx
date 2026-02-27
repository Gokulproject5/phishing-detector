import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Neural system failure caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-6 antialiased">
                    <div className="w-full max-w-md text-center">
                        <div className="inline-flex w-20 h-20 bg-rose-50 text-rose-600 rounded-[28px] items-center justify-center shadow-2xl shadow-rose-500/10 mb-8 border border-rose-100">
                            <AlertTriangle size={40} strokeWidth={1.5} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">Neural Handshake Interrupted</h1>
                        <p className="text-slate-500 font-medium mb-6 leading-relaxed">
                            The system encountered an unexpected disruption in the neural processing layer.
                        </p>
                        {this.state.error && (
                            <div className="mb-10 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Error Diagnostic</p>
                                <p className="text-xs font-mono text-slate-600 break-all">{this.state.error.toString()}</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-premium w-full py-4 text-xs tracking-widest"
                            >
                                <RefreshCcw size={18} />
                                REBOOT CORE SYSTEM
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="btn-secondary w-full py-4 text-xs tracking-widest border border-slate-200"
                            >
                                <Home size={18} />
                                ESCAPE TO DASHBOARD
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
