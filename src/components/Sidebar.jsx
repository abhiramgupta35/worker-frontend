import React from 'react';
import {
    LayoutDashboard, Users, UserRound, ClipboardList, BarChart3, Settings, LogOut
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Worker Management', path: '/workers' },
    { icon: UserRound, label: 'Owner Management', path: '/owners' },
    { icon: ClipboardList, label: 'Work Assignment', path: '/assignments' },
    { icon: BarChart3, label: 'Daily Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <aside className="w-[280px] h-screen fixed left-0 top-0 p-sidebar flex flex-col z-50">
            {/* Brand */}
            <div className="px-5 pt-8 pb-7">
                <div className="flex items-center gap-3.5">
                    <img src="/logo-worker.webp" alt="Logo" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                    <div>
                        <h1 className="text-white font-bold text-lg tracking-tight leading-tight">Worker</h1>
                        <p className="text-[11px] text-white/40 font-semibold tracking-widest uppercase">Management</p>
                    </div>
                </div>
                <div className="mt-7 h-px bg-white/10" />
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-1.5">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) => `p-sidebar-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} strokeWidth={1.75} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-4 pb-7 pt-4 border-t border-white/10">
                {user && (
                    <div className="px-3 pb-3 mb-2 border-b border-white/10">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Signed in as</p>
                        <p className="text-sm text-white/90 font-semibold truncate">{user.username}</p>
                    </div>
                )}
                <button onClick={handleLogout} className="p-sidebar-item w-full">
                    <LogOut size={20} strokeWidth={1.75} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
