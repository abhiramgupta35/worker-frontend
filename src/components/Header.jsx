import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ title }) => {
    const { user } = useAuth();

    const getInitials = () => {
        if (user?.first_name) {
            return user.first_name.charAt(0).toUpperCase();
        }
        if (user?.username) {
            return user.username.charAt(0).toUpperCase();
        }
        return 'A';
    };

    const getDisplayName = () => {
        if (user?.first_name) {
            return `${user.first_name} ${user.last_name || ''}`.trim();
        }
        if (user?.username) {
            return user.username.charAt(0).toUpperCase() + user.username.slice(1);
        }
        return 'Admin';
    };

    const initials = getInitials();
    const displayName = getDisplayName();

    return (
        <header className="h-[68px] bg-white/80 backdrop-blur-md border-b border-[#E5E0D4] sticky top-0 z-40 px-8 flex items-center justify-between">
            <div>
                <h2 className="text-[17px] font-semibold text-[#1A1A2E] tracking-tight">{title}</h2>
            </div>

            <div className="flex items-center gap-5">
                {/* Search */}
                {/* <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={15} />
                    <input
                        type="text"
                        placeholder="Quick search…"
                        className="p-input !pl-10 h-9 w-[240px] text-sm"
                    />
                </div> */}

                {/* Bell */}
                <button className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F0EDE4] transition-colors">
                    <Bell size={18} className="text-[#6B7280]" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
                        style={{ background: 'linear-gradient(135deg,#C8963E,#E8B86D)' }} />
                </button>

                {/* Profile */}
                <button className="flex items-center gap-3 pl-5 border-l border-[#E5E0D4]">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: 'linear-gradient(135deg,#1E2A4A,#2D3F6B)' }}>
                        {initials}
                    </div>
                    <div className="hidden lg:block text-left">
                        <p className="text-[13px] font-semibold text-[#1A1A2E] leading-tight">{displayName}</p>
                        <p className="text-[10px] text-[#9CA3AF]">Manager</p>
                    </div>
                    <ChevronDown size={14} className="text-[#9CA3AF]" />
                </button>
            </div>
        </header>
    );
};

export default Header;
