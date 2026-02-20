import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import Detector from './components/Detector';
import Chatbot from './components/Chatbot';
import HistoryTable from './components/HistoryTable';
import Login from './components/Login';
import EmailInbox from './components/EmailInbox';
import Profile from './components/Profile';
import API_URL from './config';
import { ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import {
    PieChart as RPieChart, Pie as RPie, Cell as RCell, ResponsiveContainer as RResponsiveContainer,
    BarChart as RBarChart, Bar as RBar, XAxis as RXAxis, YAxis as RYAxis, Tooltip as RTooltip,
    Legend as RLegend
} from 'recharts';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [history, setHistory] = useState([]);
    const [lastScanId, setLastScanId] = useState(null);
    const [lastScanTimestamp, setLastScanTimestamp] = useState(null);
    const [alert, setAlert] = useState(null);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('phish_token');
            if (!token) return;

            const res = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setIsAuthenticated(true);
            fetchHistory(); // Fetch history after user profile
        } catch (err) {
            console.error('Profile fetch failed', err);
            handleLogout();
        }
    };

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('phish_token');
            const res = await axios.get(`${API_URL}/scans/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const raw = res.data;

            // Check for new background threats
            if (raw.length > 0) {
                const latest = raw[0];
                const latestTs = new Date(latest.timestamp).getTime();

                // Only alert if we have a baseline and the new scan is actually newer
                if (lastScanTimestamp && latestTs > lastScanTimestamp && latest.result?.prediction === 'Phishing') {
                    setAlert({
                        id: latest.id,
                        title: 'Background Threat Blocked',
                        message: `The extension caught a threat: ${latest.url}`,
                        time: new Date().toLocaleTimeString()
                    });
                    setTimeout(() => setAlert(null), 8000);
                }
                setLastScanTimestamp(latestTs);
                setLastScanId(latest.id);
            }

            const mapped = raw.map(s => ({
                id: s.id,
                url: s.url,
                prediction: s.result?.prediction || 'Unknown',
                score: s.result?.probability || 0,
                timestamp: s.timestamp
            }));
            setHistory(mapped);
        } catch (err) {
            console.error('History fetch failed', err);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isAuthenticated) fetchHistory();
        }, 8000);
        return () => clearInterval(interval);
    }, [isAuthenticated, lastScanTimestamp]);

    const handleLogout = () => {
        localStorage.removeItem('phish_token');
        setIsAuthenticated(false);
        setUser(null);
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('phish_history');
    };

    if (!isAuthenticated) {
        return <Login onLoginSuccess={() => fetchUserProfile()} />;
    }

    // Chart Data Generation
    const riskData = [
        { name: 'Phishing', value: history.filter(h => h.prediction === 'Phishing').length },
        { name: 'Legitimate', value: history.filter(h => h.prediction !== 'Phishing').length }
    ];

    const vectorData = [
        { name: 'Email', count: history.filter(h => h.url?.includes('mail') || h.url?.includes('[Email')).length },
        { name: 'URL Scan', count: history.filter(h => !h.url?.includes('mail') && !h.url?.includes('[Email')).length },
        { name: 'Other', count: 0 }
    ];

    const COLORS = ['#EF4444', '#10B981'];

    const renderContent = () => {
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
                    <div className="animate-fade-in space-y-8 pb-10">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-black text-slate-900 poppins">Threat Intelligence</h1>
                            <p className="text-slate-500 font-medium">Global phishing trends and system insights based on your neural logs.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-100/50">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 poppins">Risk Distribution</h4>
                                <div className="h-64">
                                    <RResponsiveContainer width="100%" height="100%">
                                        <RPieChart>
                                            <RPie
                                                data={riskData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {riskData.map((entry, index) => (
                                                    <RCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </RPie>
                                            <RTooltip />
                                            <RLegend verticalAlign="bottom" height={36} />
                                        </RPieChart>
                                    </RResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-100/50">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 poppins">Attack Vectors</h4>
                                <div className="h-64">
                                    <RResponsiveContainer width="100%" height="100%">
                                        <RBarChart data={vectorData}>
                                            <RXAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                            <RYAxis hide />
                                            <RTooltip cursor={{ fill: 'transparent' }} />
                                            <RBar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} barSize={40} />
                                        </RBarChart>
                                    </RResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <HistoryTable history={history} onClear={clearHistory} />
                    </div>
                );
            case 'settings':
                return (
                    <div className="animate-fade-in space-y-6">
                        <h1 className="text-2xl font-bold text-slate-900 poppins">System Settings</h1>
                        <div className="cyber-card divide-y divide-slate-100 bg-white">
                            {[
                                { title: 'Neural Engine Model', value: 'BERT-base-uncased', action: 'Switch' },
                                { title: 'SHAP Sensitivity', value: 'Medium (default)', action: 'Adjust' },
                                { title: 'Export Format', value: 'PDF / JSON', action: 'Change' },
                                { title: 'API Endpoint', value: 'http://localhost:8000', action: 'Edit' }
                            ].map((item, idx) => (
                                <div key={idx} className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{item.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">Current: {item.value}</p>
                                    </div>
                                    <button className="text-xs font-bold text-indigo-500 hover:underline">{item.action}</button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            // ...
            default:
                return <DashboardHome user={user} onNavigateToAnalyze={() => setActiveTab('analyze')} />;
        }
    };

    return (
        <div className="dashboard-container font-sans text-slate-900 antialiased">
            {/* Sidebar Component */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
                onLogout={handleLogout}
                user={user}
            />

            {/* Main Content Area */}
            <main
                className={`main-content min-h-screen bg-[#F8FAFC] transition-all duration-300 ${isSidebarCollapsed ? 'ml-[80px]' : 'ml-[260px]'
                    }`}
            >
                <div className="max-w-6xl mx-auto px-8 py-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* System Tray Style Background Indicator */}
            <div className={`fixed bottom-8 ${isSidebarCollapsed ? 'left-28' : 'left-[290px]'} z-[100] transition-all duration-300`}>
                <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xl px-5 py-3 rounded-[24px] border border-slate-200 shadow-2xl shadow-indigo-500/10 group cursor-default hover:bg-white transition-all">
                    <div className="relative">
                        <div className={`w-3.5 h-3.5 rounded-full ${user?.is_email_connected ? 'bg-emerald-500' : 'bg-slate-300'} transition-colors duration-500`} />
                        {user?.is_email_connected && (
                            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-30" />
                        )}
                        {user?.is_email_connected && (
                            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-pulse opacity-40 scale-150" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">Security Layer</span>
                            {user?.is_email_connected && <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-1 rounded animate-pulse">LIVE</span>}
                        </div>
                        <span className="text-xs font-black text-slate-800 leading-tight poppins">
                            {user?.is_email_connected ? 'Email Defender Active' : 'Email Engine Standby'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {alert && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-8 right-8 z-[100] w-96 bg-slate-900 text-white p-6 rounded-2xl shadow-2xl border border-indigo-500/30 flex gap-4"
                    >
                        <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                            <ShieldAlert size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-sm poppins uppercase tracking-wider text-red-400">{alert.title}</h4>
                                <span className="text-[10px] text-slate-500 font-bold">{alert.time}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed mb-3">{alert.message}</p>
                            <button
                                onClick={() => setAlert(null)}
                                className="text-[10px] font-black uppercase text-indigo-400 hover:text-white transition-colors"
                            >
                                Dismiss Report
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
