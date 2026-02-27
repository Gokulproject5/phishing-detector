import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import { authAPI, scanAPI } from './services/api';
import { ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary';
import Loader from './components/Loader';

// Lazy load components for performance optimization
const DashboardHome = lazy(() => import('./components/DashboardHome'));
const Detector = lazy(() => import('./components/Detector'));
const Chatbot = lazy(() => import('./components/Chatbot'));
const HistoryTable = lazy(() => import('./components/HistoryTable'));
const Login = lazy(() => import('./components/Login'));
const EmailInbox = lazy(() => import('./components/EmailInbox'));
const Profile = lazy(() => import('./components/Profile'));

import {
    PieChart as RPieChart, Pie as RPie, Cell as RCell, ResponsiveContainer as RRContainer,
    BarChart as RBarChart, Bar as RBar, XAxis as RXAxis, YAxis as RYAxis, Tooltip as RTooltip,
    Legend as RLegend
} from 'recharts';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('phish_token'));
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [history, setHistory] = useState([]);
    const [lastScanTimestamp, setLastScanTimestamp] = useState(null);
    const [alert, setAlert] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Dynamic SEO & Metadata Management
    useEffect(() => {
        const pageTitles = {
            home: 'Command Center | PhishGuard AI',
            analyze: 'Neural Scan | Deep Threat Analysis',
            inbox: 'Email Guardian | PhishGuard Security',
            chatbot: 'AI Oracle | Neural Intelligence',
            insights: 'Threat Intel | Intelligence Metrics',
            profile: 'Neural Identity | PhishGuard Profile',
            settings: 'Core Configuration | PhishGuard Settings'
        };
        const activeTitle = pageTitles[activeTab] || 'PhishGuard AI | Neural Defense Core';
        document.title = activeTitle;

        // Meta Description SEO Management
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        const descriptions = {
            home: 'Central command for PhishGuard AI neural defense.',
            analyze: 'Perform deep-scan neural analysis on suspicious content.',
            inbox: 'Secure your email inbox with real-time BERT scanning.',
            chatbot: 'Consult the AI Security Oracle for threat intelligence.',
            insights: 'Visualize global threat patterns and system metrics.'
        };
        metaDesc.setAttribute('content', descriptions[activeTab] || 'Advanced BERT-powered phishing detection and explainable security intelligence.');
    }, [activeTab]);

    const fetchUserProfile = async () => {
        try {
            const res = await authAPI.getMe();
            setUser(res.data);
            setIsAuthenticated(true);
            fetchHistory();
        } catch (err) {
            console.error('Handshake verification failed', err);
            handleLogout();
        } finally {
            setIsInitialLoad(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await scanAPI.getHistory();
            const raw = res.data;

            if (raw.length > 0) {
                const latest = raw[0];
                const latestTs = new Date(latest.timestamp).getTime();

                if (lastScanTimestamp && latestTs > lastScanTimestamp && latest.result?.prediction === 'Phishing') {
                    setAlert({
                        id: latest.id,
                        title: 'Neural Breach Prevented',
                        message: `The extension synchronized a threat detection at: ${latest.url}`,
                        time: new Date().toLocaleTimeString()
                    });
                    setTimeout(() => setAlert(null), 8000);
                }
                setLastScanTimestamp(latestTs);
            }

            if (Array.isArray(raw)) {
                setHistory(raw.map(s => ({
                    id: s.id,
                    url: s.url,
                    prediction: s.result?.prediction || 'Unknown',
                    score: s.result?.probability || 0,
                    timestamp: s.timestamp
                })));
            } else {
                setHistory([]);
            }
        } catch (err) {
            console.error('Neural log retrieval failed', err);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserProfile();
        } else {
            setIsInitialLoad(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isAuthenticated) fetchHistory();
        }, 15000); // Optimized interval for production
        return () => clearInterval(interval);
    }, [isAuthenticated, lastScanTimestamp]);

    const handleLogout = () => {
        localStorage.removeItem('phish_token');
        setIsAuthenticated(false);
        setUser(null);
    };

    const clearHistory = () => {
        setHistory([]);
    };

    if (isInitialLoad) return <Loader />;

    if (!isAuthenticated) {
        return (
            <Suspense fallback={<Loader message="Engaging Neural Interface..." />}>
                <Login onLoginSuccess={() => setIsAuthenticated(true)} />
            </Suspense>
        );
    }

    const historyArr = Array.isArray(history) ? history : [];

    const riskData = [
        { name: 'Phishing', value: historyArr.filter(h => h.prediction === 'Phishing').length },
        { name: 'Legitimate', value: historyArr.filter(h => h.prediction !== 'Phishing').length }
    ];

    const vectorData = [
        { name: 'Email', count: historyArr.filter(h => h.url?.includes('mail') || h.url?.includes('[Email')).length },
        { name: 'URL Scan', count: historyArr.filter(h => !h.url?.includes('mail') && !h.url?.includes('[Email')).length },
        { name: 'Other', count: 0 }
    ];

    const COLORS = ['#F43F5E', '#10B981'];

    const renderContent = () => {
        return (
            <Suspense fallback={<Loader message="Reconfiguring Workspace..." />}>
                {(() => {
                    switch (activeTab) {
                        case 'home':
                            return <DashboardHome user={user} onNavigateToAnalyze={() => setActiveTab('analyze')} />;
                        case 'analyze':
                            return <Detector user={user} />;
                        case 'inbox':
                            return <EmailInbox user={user} onRefreshUser={fetchUserProfile} />;
                        case 'chatbot':
                            return <Chatbot user={user} />;
                        case 'profile':
                            return <Profile user={user} onRefreshUser={fetchUserProfile} />;
                        case 'insights':
                            return (
                                <div className="animate-slide-up space-y-10 pb-20">
                                    <div className="flex flex-col gap-3">
                                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Threat Intelligence</h1>
                                        <p className="text-slate-500 font-medium">Global phishing trends and system insights based on your neural logs.</p>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="premium-card p-10">
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-10">Risk Distribution</h4>
                                            <div className="h-64">
                                                <RRContainer width="100%" height="100%">
                                                    <RPieChart>
                                                        <RPie
                                                            data={riskData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={65}
                                                            outerRadius={85}
                                                            paddingAngle={6}
                                                            dataKey="value"
                                                            stroke="none"
                                                            cornerRadius={40}
                                                        >
                                                            {riskData.map((entry, index) => (
                                                                <RCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </RPie>
                                                        <RTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                                                        <RLegend verticalAlign="bottom" height={36} iconType="circle" />
                                                    </RPieChart>
                                                </RRContainer>
                                            </div>
                                        </div>
                                        <div className="premium-card p-10">
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-10">Attack Vectors</h4>
                                            <div className="h-64">
                                                <RRContainer width="100%" height="100%">
                                                    <RBarChart data={vectorData}>
                                                        <RXAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', fill: '#94A3B8' }} />
                                                        <RYAxis hide />
                                                        <RTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                                                        <RBar dataKey="count" fill="var(--primary)" radius={[10, 10, 10, 10]} barSize={40} />
                                                    </RBarChart>
                                                </RRContainer>
                                            </div>
                                        </div>
                                    </div>
                                    <HistoryTable history={historyArr} onClear={clearHistory} />
                                </div>
                            );
                        case 'settings':
                            return (
                                <div className="animate-slide-up space-y-8">
                                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
                                    <div className="premium-card divide-y divide-slate-50 bg-white overflow-hidden">
                                        {[
                                            { title: 'Neural Engine Model', value: 'BERT-base-uncased', action: 'Switch Architecture' },
                                            { title: 'SHAP Sensitivity', value: 'Medium (Optimal)', action: 'Recalibrate' },
                                            { title: 'Export Format', value: 'PDF / JSON Intelligence', action: 'Configure' },
                                            { title: 'API Gateway', value: 'http://localhost:8000', action: 'Network Settings' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 mb-1">{item.title}</p>
                                                    <p className="text-xs font-medium text-slate-500">Current: {item.value}</p>
                                                </div>
                                                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-all border border-indigo-100/50">
                                                    {item.action}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        default:
                            return <DashboardHome user={user} onNavigateToAnalyze={() => setActiveTab('analyze')} />;
                    }
                })()}
            </Suspense>
        );
    };

    return (
        <ErrorBoundary>
            <div className="dashboard-container font-sans text-slate-900 antialiased bg-[#FDFDFF]">
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isCollapsed={isSidebarCollapsed}
                    setIsCollapsed={setIsSidebarCollapsed}
                    onLogout={handleLogout}
                    user={user}
                />

                <main className={`main-content min-h-screen transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSidebarCollapsed ? 'ml-[88px]' : 'ml-[280px]'}`}>
                    <div className="max-w-7xl mx-auto px-10 py-12">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.02, y: -10 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>



                <AnimatePresence>
                    {alert && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9, x: 50 }}
                            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: 20 }}
                            className="fixed bottom-10 right-10 z-[100] w-[420px]"
                        >
                            <div className="premium-card p-6 bg-slate-900 border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] flex gap-5 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
                                <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-rose-500/20">
                                    <ShieldAlert size={28} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h4 className="font-black text-xs uppercase tracking-widest text-rose-400">{alert.title}</h4>
                                        <span className="text-[10px] text-slate-500 font-black">{alert.time}</span>
                                    </div>
                                    <p className="text-[13px] font-medium text-slate-300 leading-relaxed mb-4">{alert.message}</p>
                                    <button onClick={() => setAlert(null)} className="text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-rose-400 transition-colors">
                                        Purge Threat Report
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ErrorBoundary>
    );
}

export default App;
