import React from 'react';
import { motion } from 'framer-motion';
import {
    Home,
    Search,
    MessageSquare,
    BarChart3,
    Mail,
    Settings,
    Shield,
    LogOut,
    ChevronRight,
    ChevronLeft,
    Zap
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, onLogout, user }) => {
    const navItems = [
        { id: 'home', label: 'Overview', icon: Home },
        { id: 'analyze', label: 'Neural Scan', icon: Search },
        { id: 'chatbot', label: 'AI Oracle', icon: MessageSquare },
        { id: 'insights', label: 'Threat Intel', icon: BarChart3 },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 h-screen sidebar-dark text-white flex flex-col z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'w-[88px]' : 'w-[280px]'
                } border-r border-indigo-500/10 shadow-[20px_0_40px_-15px_rgba(0,0,0,0.2)]`}
        >
            {/* Logo Section */}
            <div className={`p-8 mb-4 flex items-center gap-4 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="relative group cursor-pointer">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Shield size={28} className="text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#1E1B4B] animate-pulse" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold tracking-tight poppins leading-none mb-1">
                            Phish<span className="text-indigo-400">Guard</span>
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Neural Core v2.4</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar Toggle - Floating Style */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-4 top-10 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xl hover:bg-indigo-500 transition-all border border-indigo-400/20 z-10 hover:scale-110"
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-5 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                ? 'bg-indigo-600/20 text-indigo-400 shadow-sm border border-indigo-500/20'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`transition-colors duration-300 ${isActive ? 'text-indigo-400' : 'group-hover:text-white'}`}>
                                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                {!isCollapsed && (
                                    <span className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                                        {item.label}
                                    </span>
                                )}
                            </div>
                            {!isCollapsed && isActive && (
                                <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Section - Elevated Profile */}
            <div className="p-4 mt-auto border-t border-white/5 space-y-4">
                <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 group">
                    <div className="relative">
                        <div className={`w-2.5 h-2.5 rounded-full ${user?.is_email_connected ? 'bg-emerald-500' : 'bg-slate-500'} transition-colors duration-1000`} />
                        {user?.is_email_connected && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />}
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Protection status</span>
                            <span className="text-[10px] font-bold text-slate-300 leading-tight">
                                {user?.is_email_connected ? 'Neural Guardian Active' : 'Neural Core Standby'}
                            </span>
                        </div>
                    )}
                </div>
                {user && (
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all group ${activeTab === 'profile'
                            ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-500/20'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                            } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-indigo-400 rounded-xl flex items-center justify-center text-sm font-extrabold shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                            {user.full_name?.charAt(0) || user.username?.charAt(0)}
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0 items-start">
                                <span className={`text-sm font-bold truncate leading-tight ${activeTab === 'profile' ? 'text-white' : 'text-slate-200'}`}>{user.full_name}</span>
                                <span className={`text-[10px] font-medium truncate tracking-wide ${activeTab === 'profile' ? 'text-indigo-100' : 'text-slate-400'}`}>@{user.username}</span>
                            </div>
                        )}
                    </button>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                        onClick={() => setActiveTab('settings')}
                        title="Settings"
                        className={`flex flex-col items-center justify-center gap-1 p-3 rounded-2xl transition-all ${activeTab === 'settings'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <Settings size={18} />
                        {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest">Setup</span>}
                    </button>
                    <button
                        onClick={onLogout}
                        title="Logout"
                        className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-[0.98]"
                    >
                        <LogOut size={18} />
                        {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest">Exit</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
