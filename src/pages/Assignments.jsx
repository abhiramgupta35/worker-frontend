import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { workerService, ownerService, assignmentService } from '../services/api';
import { getWageConfig } from '../utils/wageConfig';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);

    const [formOwner, setFormOwner] = useState('');
    const [formDate, setFormDate] = useState('');
    const [selectedWorkers, setSelectedWorkers] = useState([]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [a, w, o] = await Promise.all([
                assignmentService.getAll(), workerService.getAll(), ownerService.getAll()
            ]);
            setAssignments(a.data);
            setWorkers(w.data.filter(x => x.status === 'AVAILABLE' && x.is_active));
            setOwners(o.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    useEffect(() => { fetchAll(); }, []);

    const handleWorkerSelect = (workerId) => {
        if (!workerId) return;
        const worker = workers.find(w => w.id === parseInt(workerId));
        if (worker) {
            const { kooliRate } = getWageConfig();
            setSelectedWorkers(prev => [...prev, { ...worker, hours_worked: 0, amount: worker.role === 'KOOLI' ? kooliRate : 0 }]);
            setWorkers(prev => prev.filter(w => w.id !== worker.id));
        }
    };

    const handleRemoveWorker = (worker) => {
        setSelectedWorkers(prev => prev.filter(w => w.id !== worker.id));
        setWorkers(prev => [...prev, worker]);
    };

    const handleUpdateHours = (id, hours) => {
        const hrs = parseFloat(hours) || 0;
        const { grassCutterRate } = getWageConfig();
        setSelectedWorkers(prev => prev.map(w =>
            w.id === id ? { ...w, hours_worked: hrs, amount: hrs * grassCutterRate } : w
        ));
    };

    const totalAssignAmount = selectedWorkers.reduce((sum, w) => sum + w.amount, 0);

    const handleAdd = async (e) => {
        e.preventDefault();
        try { 
            await Promise.all(selectedWorkers.map(w =>
                assignmentService.create({
                    worker: w.id,
                    owner: formOwner,
                    work_type: w.role,
                    hours_worked: w.hours_worked,
                    amount: w.amount,
                    date: formDate
                })
            ));
            setAddOpen(false); 
            setFormOwner('');
            setSelectedWorkers([]);
            fetchAll(); 
        } catch (e) { console.error(e); }
    };

    const handleToggle = async (a) => {
        try { await assignmentService.toggleActive(a.id); fetchAll(); }
        catch (e) { console.error(e); }
    };

    const badge = (s) => {
        const cls = s === 'Full Payment' ? 'p-badge-green' : s === 'Half Payment' ? 'p-badge-orange' : 'p-badge-red';
        return <span className={`p-badge ${cls}`}>{s}</span>;
    };

    // Owner lookup map for deriving per-row payment status from owner-level totals.
    const ownerMap = React.useMemo(() => {
        const m = {};
        owners.forEach(o => { m[o.id] = o; });
        return m;
    }, [owners]);

    // Payment status of an assignment is derived from the OWNER's outstanding balance
    // (payments are now collected at owner level, not per-assignment).
    const getRowStatus = (r) => {
        const o = ownerMap[r.owner];
        if (!o) return 'Pending';
        const work = parseFloat(o.total_work_amount || 0);
        const paid = parseFloat(o.total_paid || 0);
        if (work > 0 && paid >= work) return 'Full Payment';
        if (paid > 0) return 'Half Payment';
        return 'Pending';
    };

    // Group summary
    const activeCount = assignments.filter(a => a.is_active).length;
    const inactiveCount = assignments.filter(a => !a.is_active).length;
    const totalPending = assignments.filter(a => a.is_active && getRowStatus(a) !== 'Full Payment').length;

    const columns = [
        { header: 'Date', render: r => <span className="text-[#6B7280] text-xs">{r.date}</span> },
        {
            header: 'Worker', render: r => (
                <div className={!r.is_active ? 'opacity-50' : ''}>
                    <p className="font-semibold text-[#1A1A2E] text-sm">{r.worker_name}</p>
                </div>
            )
        },
        { header: 'Owner', render: r => <span className={!r.is_active ? 'opacity-50 text-sm' : 'text-sm'}>{r.owner_name}</span> },
        {
            header: 'Type', render: r => (
                <span className={`p-badge ${r.work_type === 'KOOLI' ? 'p-badge-blue' : 'p-badge-orange'} ${!r.is_active ? 'opacity-50' : ''}`}>
                    {r.work_type}
                </span>
            )
        },
        { header: 'Hrs', render: r => <span className="text-[#6B7280]">{r.hours_worked || '—'}</span> },
        { header: 'Amount', render: r => <span className={`font-bold text-[#1A1A2E] ${!r.is_active ? 'opacity-50' : ''}`}>₹{r.amount}</span> },
        {
            header: 'Payment', render: r => r.is_active ? badge(getRowStatus(r)) : (
                <span className="p-badge" style={{ background: '#F3F4F6', color: '#9CA3AF' }}>Inactive</span>
            )
        },
        {
            header: 'Active', render: r => (
                <button onClick={() => handleToggle(r)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${r.is_active
                            ? 'border-orange-200 text-orange-500 hover:bg-orange-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}>
                    {r.is_active ? <><ToggleRight size={13} /> Active</> : <><ToggleLeft size={13} /> Inactive</>}
                </button>
            )
        },
    ];

    return (
        <Layout title="Work Assignments">
            {/* Summary pills */}
            <div className="flex gap-3 mb-6">
                {[
                    { label: 'Total', value: assignments.length, style: { background: '#1E2A4A', color: '#fff' } },
                    { label: 'Active', value: activeCount, style: { background: '#D1FAE5', color: '#065F46' } },
                    { label: 'Inactive', value: inactiveCount, style: { background: '#F3F4F6', color: '#6B7280' } },
                    { label: 'Unpaid', value: totalPending, style: { background: '#FEE2E2', color: '#991B1B' } },
                ].map(s => (
                    <div key={s.label} className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2" style={s.style}>
                        <span>{s.value}</span><span className="font-normal opacity-70">{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="gold-divider" />
                    <h3 className="text-xl font-bold text-[#1A1A2E]">Daily Assignments</h3>
                    <p className="text-[13px] text-[#9CA3AF] mt-0.5">Toggle work active/inactive for nightly reset</p>
                </div>
                <button onClick={() => {
                    setAddOpen(true);
                    setFormOwner('');
                    setFormDate(new Date().toISOString().split('T')[0]);
                    setSelectedWorkers([]);
                }} className="p-btn-primary">
                    <Plus size={16} /> New Assignment
                </button>
            </div>

            <div className="p-card overflow-hidden">
                <DataTable columns={columns} data={assignments} isLoading={loading} />
            </div>

            {/* ── Add Assignment Modal ─────────────────────────────── */}
            <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Create Assignment" maxWidth="max-w-[600px]">
                <form onSubmit={handleAdd} className="flex flex-col h-full max-h-[80vh]">
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-6">
                        <div><label className="p-label pb-2">Assignment Date</label>
                            <input type="date" required className="p-input" value={formDate} onChange={e => setFormDate(e.target.value)} />
                        </div>
                        
                        <div><label className="p-label pb-2">Select Owner</label>
                            <select required className="p-input" value={formOwner} onChange={e => setFormOwner(e.target.value)}>
                                <option value="">Choose owner…</option>
                                {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                            </select>
                        </div>
                        
                        <div><label className="p-label pb-2">Select Available Workers</label>
                            <select className="p-input" value="" onChange={e => handleWorkerSelect(e.target.value)}>
                                <option value="">Choose worker to add…</option>
                                {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.role === 'KOOLI' ? 'Kooli' : 'Grass Cutter'})</option>)}
                            </select>
                            {workers.length === 0 && selectedWorkers.length === 0 && <p className="text-xs text-red-500 mt-2">No active available workers.</p>}
                        </div>

                        {/* List of selected workers */}
                        {selectedWorkers.length > 0 && (
                            <div>
                                <h4 className="p-label mb-3">Selected Workers</h4>
                                <div className="space-y-3">
                                    {selectedWorkers.map(w => (
                                        <div key={w.id} className="p-4 rounded-xl border border-[#E5E0D4] bg-[#F8F6F0] relative group">
                                            <button type="button" onClick={() => handleRemoveWorker(w)}
                                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center border border-red-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={14} />
                                            </button>
                                            
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-[#1A1A2E] text-sm">{w.name}</p>
                                                    <p className="text-xs text-[#6B7280]">{w.role === 'KOOLI' ? `Kooli (₹${getWageConfig().kooliRate}/day fixed)` : `Grass Cutter (₹${getWageConfig().grassCutterRate}/hr)`}</p>
                                                </div>
                                                
                                                <div className="flex items-center gap-4">
                                                    {w.role === 'GRASS_CUTTER' && (
                                                        <div className="flex items-center gap-2">
                                                            <label className="text-xs font-medium text-[#6B7280]">Hours:</label>
                                                            <input type="number" step="0.5" className="p-input w-20 py-1.5 px-2 text-sm"
                                                                value={w.hours_worked || ''}
                                                                onChange={e => handleUpdateHours(w.id, e.target.value)}
                                                                placeholder="0" required />
                                                        </div>
                                                    )}
                                                    <div className="w-24 text-right">
                                                        <span className="font-bold text-[#1A1A2E]">₹{w.amount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fixed footer with total and actions */}
                    <div className="pt-4 border-t border-[#E5E0D4] mt-auto shrink-0 bg-white">
                        <div className="p-4 rounded-xl border border-[#E5D5B0] flex items-center justify-between mb-4"
                            style={{ background: 'linear-gradient(135deg,#FDF3E0,#FFF9F0)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg,#C8963E,#E8B86D)' }}>
                                    <span className="text-white text-sm font-bold">₹</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-[#C8963E] uppercase tracking-wider">Total Amount</p>
                                    <p className="text-[10px] text-[#9CA3AF] leading-none mt-1">{selectedWorkers.length} worker(s)</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-[#1A1A2E]">₹{totalAssignAmount}</p>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setAddOpen(false)} className="p-btn-ghost flex-1 py-2.5">Cancel</button>
                            <button type="submit" className="p-btn-primary flex-1 justify-center py-2.5" disabled={!formOwner || selectedWorkers.length === 0}>Assign {selectedWorkers.length} Worker(s)</button>
                        </div>
                    </div>
                </form>
            </Modal>

        </Layout>
    );
};

export default Assignments;
