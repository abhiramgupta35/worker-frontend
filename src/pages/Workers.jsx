import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Search, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { workerService } from '../services/api';
import { getWageConfig } from '../utils/wageConfig';

const Workers = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [form, setForm] = useState({ name: '', phone: '', role: 'KOOLI' });

    const fetchWorkers = async () => {
        setLoading(true);
        try { const r = await workerService.getAll(); setWorkers(r.data); }
        catch (e) { console.error(e); } finally { setLoading(false); }
    };
    useEffect(() => { fetchWorkers(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await workerService.create(form);
            setModalOpen(false); setForm({ name: '', phone: '', role: 'KOOLI' }); fetchWorkers();
        } catch (e) { 
            console.error('Full Error:', e);
            if (e.response) {
                console.error('Error Data:', e.response.data);
            }
        }
    };

    const handleToggleActive = async (worker) => {
        try { await workerService.toggleActive(worker.id); fetchWorkers(); }
        catch (e) { console.error(e); }
    };

    const handleDeleteWorker = async (worker) => {
        if (!window.confirm(`Delete "${worker.name}"? They will be removed from listings but all their assignment history will be preserved.`)) return;
        try { await workerService.delete(worker.id); fetchWorkers(); }
        catch (e) { console.error(e); }
    };

    const filtered = workers.filter(w => {
        const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.phone.includes(search);
        const matchRole = filterRole === 'ALL' || w.role === filterRole;
        return matchSearch && matchRole;
    });

    const activeCount = workers.filter(w => w.is_active).length;
    const onLeaveCount = workers.filter(w => !w.is_active).length;

    const columns = [
        {
            header: 'Name', render: r => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                        style={{ background: r.is_active ? 'linear-gradient(135deg,#1E2A4A,#2D3F6B)' : '#D1D5DB' }}>
                        {r.name[0]}
                    </div>
                    <div>
                        <p className={`font-semibold text-sm ${!r.is_active ? 'text-gray-400 line-through' : 'text-[#1A1A2E]'}`}>{r.name}</p>
                        <p className="text-[11px] text-[#9CA3AF]">{r.phone}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Role', render: r => (
                <span className={`p-badge ${r.role === 'KOOLI' ? 'p-badge-blue' : 'p-badge-orange'}`}>
                    {r.role === 'KOOLI' ? 'Kooli' : 'Grass Cutter'}
                </span>
            )
        },
        {
            header: 'Work Status', render: r => {
                const displayStatus = !r.is_active ? 'UNAVAILABLE' : r.status;
                return (
                    <span className={`p-badge ${displayStatus === 'AVAILABLE' ? 'p-badge-green' : displayStatus === 'ASSIGNED' ? 'p-badge-orange' : 'p-badge-red'}`}>{displayStatus}</span>
                );
            }
        },
        {
            header: 'Attendance', render: r => (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${r.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className={`text-xs font-semibold ${r.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                        {r.is_active ? 'Active' : 'On Leave'}
                    </span>
                </div>
            )
        },
        {
            header: 'Action', render: r => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleToggleActive(r)}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg border ${r.is_active
                                ? 'border-red-200 text-red-500 hover:bg-red-50'
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                            }`}
                    >
                        {r.is_active ? <><ToggleRight size={14} /> Mark Leave</> : <><ToggleLeft size={14} /> Mark Active</>}
                    </button>
                    <button
                        onClick={() => handleDeleteWorker(r)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                        title="Delete worker"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )
        },
    ];

    return (
        <Layout title="Worker Management">
            {/* Summary pills */}
            <div className="flex gap-3 mb-6">
                {[
                    { label: 'Total', value: workers.length, color: 'bg-[#1E2A4A] text-white' },
                    { label: 'Active', value: activeCount, color: 'bg-green-100 text-green-700' },
                    { label: 'On Leave', value: onLeaveCount, color: 'bg-red-100 text-red-600' },
                ].map(s => (
                    <div key={s.label} className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${s.color}`}>
                        <span>{s.value}</span><span className="font-normal opacity-70">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Controls row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex gap-3">
                    <div className="gold-divider" />
                    <select className="p-input bg-white text-sm h-10 w-[160px]"
                        value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                        <option value="ALL">All Roles</option>
                        <option value="KOOLI">Kooli</option>
                        <option value="GRASS_CUTTER">Grass Cutter</option>
                    </select>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={15} />
                        <input placeholder="Search workers…" className="p-input !pl-10 h-10 w-[220px] text-sm"
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button onClick={() => setModalOpen(true)} className="p-btn-primary">
                        <Plus size={16} /> Add Worker
                    </button>
                </div>
            </div>

            <div className="p-card overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F0EDE4]">
                    <div className="gold-divider" />
                    <h3 className="text-[15px] font-semibold text-[#1A1A2E]">
                        All Workers <span className="text-[#9CA3AF] font-normal">({filtered.length})</span>
                    </h3>
                </div>
                <DataTable columns={columns} data={filtered} isLoading={loading} emptyMessage="No workers found" />
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Worker">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div><label className="p-label">Full Name</label>
                        <input required className="p-input" placeholder="e.g. Rajan Kumar"
                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div><label className="p-label">Phone Number</label>
                        <input required className="p-input" placeholder="10-digit number"
                            value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div><label className="p-label">Role</label>
                        <select className="p-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                            <option value="KOOLI">Kooli — ₹{getWageConfig().kooliRate}/day</option>
                            <option value="GRASS_CUTTER">Grass Cutter — ₹{getWageConfig().grassCutterRate}/hr</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="p-btn-ghost flex-1">Cancel</button>
                        <button type="submit" className="p-btn-primary flex-1 justify-center">Add Worker</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Workers;
