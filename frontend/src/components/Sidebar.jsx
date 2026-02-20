import React from 'react';
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
    ChevronLeft
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, onLogout, user }) => {
    const navItems = [
        { id: 'home', label: 'Dashboard', icon: Home },
        { id: 'analyze', label: 'Analytics', icon: Search },
        { id: 'inbox', label: 'Email Scan', icon: Mail },
        { id: 'chatbot', label: 'AI Assistant', icon: MessageSquare },
        { id: 'insights', label: 'Threat Intel', icon: BarChart3 },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-[#0F172A] text-white flex flex-col z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-[260px]'
                } border-r border-slate-800 shadow-2xl`}
        >
            {/* Logo Section */}
            <div className={`p-6 border-b border-slate-800 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="relative">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                        <Shield size={24} className="text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0F172A] animate-pulse" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <h1 className="text-lg font-black tracking-tighter poppins uppercase leading-none mb-1">PhishGuard</h1>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">Neural Core v2.4</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 transition-colors border border-slate-800 z-10"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 mt-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-white transition-colors'} />
                                {!isCollapsed && <span className="text-sm font-semibold poppins">{item.label}</span>}
                            </div>
                            {!isCollapsed && isActive && <ChevronRight size={14} className="text-white/70" />}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-800 space-y-2">
                {user && (
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full px-4 py-3 mb-2 rounded-xl border flex items-center gap-3 transition-all ${activeTab === 'profile'
                            ? 'bg-indigo-500 border-indigo-400 shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-800/30 border-slate-800/50 hover:bg-slate-800/50'
                            } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-500/20 shrink-0">
                            {user.full_name?.charAt(0) || user.username?.charAt(0)}
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0 items-start">
                                <span className={`text-xs font-bold truncate ${activeTab === 'profile' ? 'text-white' : 'text-slate-200'}`}>{user.full_name}</span>
                                <span className={`text-[10px] truncate ${activeTab === 'profile' ? 'text-indigo-200' : 'text-slate-500'}`}>@{user.username}</span>
                            </div>
                        )}
                    </button>
                )}
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings'
                        ? 'bg-indigo-500 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <Settings size={20} />
                    {!isCollapsed && <span className="text-sm font-semibold poppins">Settings</span>}
                </button>
                <button
                    onClick={onLogout}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-[0.98] ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="text-sm font-semibold poppins">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
