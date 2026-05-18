import React, { useState } from 'react';
import Layout from '../components/Layout';
import { getWageConfig, saveWageConfig } from '../utils/wageConfig';
import { Check, SlidersHorizontal, Hammer, Scissors, Info } from 'lucide-react';

const Settings = () => {
    const [config, setConfig] = useState(() => getWageConfig());
    const [saved, setSaved] = useState(false);
    const [dirty, setDirty] = useState(false);

    const handleChange = (key, val) => {
        setConfig(prev => ({ ...prev, [key]: val }));
        setDirty(true);
        setSaved(false);
    };

    const handleSave = (e) => {
        e.preventDefault();
        saveWageConfig({
            kooliRate: parseFloat(config.kooliRate) || 800,
            grassCutterRate: parseFloat(config.grassCutterRate) || 250,
        });
        setSaved(true);
        setDirty(false);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <Layout title="Settings">

            {/* Page header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="gold-divider" />
                    <h2 className="text-2xl font-bold text-[#1A1A2E]">Settings</h2>
                    <p className="text-sm text-[#9CA3AF] mt-1">Manage wage rates and system preferences.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#1E2A4A,#2D3F6B)' }}>
                    <SlidersHorizontal size={22} color="#C8963E" />
                </div>
            </div>

            <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* ── Left: Rate Cards (2/3 width) ── */}
                    <div className="xl:col-span-2 space-y-5">

                        {/* Section label */}
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-[#E5E0D4]" />
                            <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest px-2">Worker Wage Rates</span>
                            <div className="h-px flex-1 bg-[#E5E0D4]" />
                        </div>

                        {/* Kooli card */}
                        <div className="p-card p-6">
                            <div className="flex items-start gap-5">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg,#1E2A4A,#2D3F6B)' }}>
                                    <Hammer size={24} color="#C8963E" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-base font-bold text-[#1A1A2E]">Kooli Worker</h4>
                                        <span className="text-xs font-semibold text-[#1E2A4A] bg-[#EEF1F8] px-3 py-1 rounded-full">Per Day</span>
                                    </div>
                                    <p className="text-sm text-[#9CA3AF] mb-4">Fixed daily wage paid to Kooli workers regardless of hours.</p>
                                    <label className="p-label">Daily Wage Amount</label>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[#C8963E] text-2xl font-bold">₹</span>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            required
                                            className="p-input text-2xl font-bold h-14"
                                            value={config.kooliRate}
                                            onChange={e => handleChange('kooliRate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grass Cutter card */}
                        <div className="p-card p-6">
                            <div className="flex items-start gap-5">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg,#C8963E,#E8B86D)' }}>
                                    <Scissors size={24} color="#fff" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-base font-bold text-[#1A1A2E]">Grass Cutter</h4>
                                        <span className="text-xs font-semibold text-[#92400E] bg-[#FEF3C7] px-3 py-1 rounded-full">Per Hour</span>
                                    </div>
                                    <p className="text-sm text-[#9CA3AF] mb-4">Hourly wage multiplied by hours worked for each assignment.</p>
                                    <label className="p-label">Hourly Wage Amount</label>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[#C8963E] text-2xl font-bold">₹</span>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            required
                                            className="p-input text-2xl font-bold h-14"
                                            value={config.grassCutterRate}
                                            onChange={e => handleChange('grassCutterRate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save button */}
                        <div className="flex items-center gap-4 pt-1">
                            <button
                                type="submit"
                                className="p-btn-primary px-8 py-3 text-base"
                                disabled={!dirty && !saved}
                                style={{ opacity: !dirty && !saved ? 0.5 : 1 }}
                            >
                                {saved
                                    ? <><Check size={17} /> Saved Successfully</>
                                    : 'Save Changes'}
                            </button>
                            {saved && (
                                <span className="text-sm text-[#059669] font-semibold flex items-center gap-1.5">
                                    <Check size={14} /> New assignments will use updated rates.
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ── Right: Info panel (1/3 width) ── */}
                    <div className="space-y-5">

                        {/* How it works */}
                        <div className="p-card p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Info size={16} className="text-[#C8963E]" />
                                <h4 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider">How It Works</h4>
                            </div>
                            <div className="space-y-3 text-sm text-[#6B7280]">
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#EEF1F8] flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-[10px] font-bold text-[#1E2A4A]">1</span>
                                    </div>
                                    <p>Set the daily wage for <strong className="text-[#1A1A2E]">Kooli</strong> workers here.</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#FEF3C7] flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-[10px] font-bold text-[#92400E]">2</span>
                                    </div>
                                    <p>Set the hourly rate for <strong className="text-[#1A1A2E]">Grass Cutters</strong>. Amount = Rate × Hours.</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#D1FAE5] flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-[10px] font-bold text-[#065F46]">3</span>
                                    </div>
                                    <p>Click <strong className="text-[#1A1A2E]">Save Changes</strong> — all new assignments auto-calculate using the updated rates.</p>
                                </div>
                            </div>
                        </div>

                        {/* Current rates preview */}
                        <div className="p-card p-6">
                            <h4 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider mb-4">Current Rates</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F6F0] border border-[#E5E0D4]">
                                    <div className="flex items-center gap-2">
                                        <Hammer size={14} className="text-[#1E2A4A]" />
                                        <span className="text-sm font-semibold text-[#1A1A2E]">Kooli</span>
                                    </div>
                                    <span className="text-base font-bold text-[#C8963E]">₹{config.kooliRate}<span className="text-xs font-normal text-[#9CA3AF]">/day</span></span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F6F0] border border-[#E5E0D4]">
                                    <div className="flex items-center gap-2">
                                        <Scissors size={14} className="text-[#C8963E]" />
                                        <span className="text-sm font-semibold text-[#1A1A2E]">Grass Cutter</span>
                                    </div>
                                    <span className="text-base font-bold text-[#C8963E]">₹{config.grassCutterRate}<span className="text-xs font-normal text-[#9CA3AF]">/hr</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </form>

        </Layout>
    );
};

export default Settings;
