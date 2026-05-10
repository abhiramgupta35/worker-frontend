import React from 'react';

const StatCard = ({ label, value, subtext, icon: Icon, accent = false }) => (
    <div className="p-card p-6 flex flex-col gap-5 relative overflow-hidden group">
        {/* subtle right decoration */}
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
            style={{ background: accent ? 'linear-gradient(135deg,#C8963E,#E8B86D)' : 'linear-gradient(135deg,#1E2A4A,#2D3F6B)' }} />

        <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
                style={{
                    background: accent
                        ? 'linear-gradient(135deg,#C8963E,#E8B86D)'
                        : 'linear-gradient(135deg,#1E2A4A,#2D3F6B)'
                }}>
                {Icon && <Icon size={20} color="#fff" strokeWidth={1.75} />}
            </div>
            {subtext && (
                <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider bg-[#F0EDE4] px-2 py-1 rounded-full">
                    {subtext}
                </span>
            )}
        </div>

        <div>
            <p className="p-label mb-1">{label}</p>
            <p className="text-[28px] font-bold text-[#1A1A2E] leading-none tracking-tight">{value}</p>
        </div>
    </div>
);

export default StatCard;
