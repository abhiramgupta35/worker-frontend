import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Search, Eye, UserPlus2, Calendar, X, Trash2, Check, UserPlus, IndianRupee } from 'lucide-react';
import { ownerService, workerService, assignmentService, reportService } from '../services/api';
import { getWageConfig } from '../utils/wageConfig';
import { format } from 'date-fns';

const Owners = () => {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    // Modals
    const [addOpen, setAddOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [assignOpen, setAssignOpen] = useState(false);
    const [collectOpen, setCollectOpen] = useState(false);

    // View modal state
    const [viewOwner, setViewOwner] = useState(null);
    const [viewData, setViewData] = useState(null);
    const [viewDate, setViewDate] = useState('');
    const [viewLoading, setViewLoading] = useState(false);

    // Edit amount state: { [assignmentId]: editedValue }
    const [editAmounts, setEditAmounts] = useState({});
    const [savingAmount, setSavingAmount] = useState(null); // id being saved
    const [removingId, setRemovingId] = useState(null);    // id being removed

    // Assign modal state
    const [assignOwner, setAssignOwner] = useState(null);
    const [assignDate, setAssignDate] = useState('');
    const [availWorkers, setAvailWorkers] = useState([]);
    const [selectedWorkers, setSelectedWorkers] = useState([]);

    // Collect payment state (owner-level)
    const [collectForm, setCollectForm] = useState({ amount: '', note: '' });

    // Add owner form
    const [addForm, setAddForm] = useState({ name: '', phone: '', address: '' });

    // ── Fetch ──────────────────────────────────────────────────────────────
    const fetchOwners = async () => {
        setLoading(true);
        try { const r = await ownerService.getAll(); setOwners(r.data); }
        catch (e) { console.error(e); } finally { setLoading(false); }
    };
    useEffect(() => { fetchOwners(); }, []);

    const loadViewData = useCallback(async (ownerId, date) => {
        setViewLoading(true);
        try { const r = await ownerService.getDetails(ownerId, date); setViewData(r.data); setEditAmounts({}); }
        catch (e) { console.error(e); } finally { setViewLoading(false); }
    }, []);

    // Reload view data when date filter changes
    useEffect(() => {
        if (viewOwner) loadViewData(viewOwner.id, viewDate);
    }, [viewDate, viewOwner, loadViewData]);

    const fetchReport = useCallback(async () => {
        if (!filterDate) {
            setReportData(null);
            return;
        }
        setReportLoading(true);
        try {
            const r = await reportService.getDaily(filterDate);
            setReportData(r.data);
        } catch (e) {
            console.error(e);
        } finally {
            setReportLoading(false);
        }
    }, [filterDate]);

    // Fetch report data for main page date filter
    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleAddOwner = async (e) => {
        e.preventDefault();
        try { await ownerService.create(addForm); setAddOpen(false); setAddForm({ name: '', phone: '', address: '' }); fetchOwners(); }
        catch (e) { console.error(e); }
    };

    const openView = async (owner) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        setViewOwner(owner);
        setViewDate(today);
        setViewOpen(true);
        loadViewData(owner.id, today);
    };

    const openAssign = async (owner) => {
        setAssignOwner(owner);
        const today = format(new Date(), 'yyyy-MM-dd');
        setAssignDate(today);
        const r = await workerService.getAll();
        setAvailWorkers(r.data.filter(w => w.status === 'AVAILABLE' && w.is_active));
        setSelectedWorkers([]);
        setAssignOpen(true);
    };

    // "Add Worker Again" from inside the View modal
    const openAssignFromView = () => {
        openAssign(viewOwner);
    };

    const handleWorkerSelect = (workerId) => {
        if (!workerId) return;
        const worker = availWorkers.find(w => w.id === parseInt(workerId));
        if (worker) {
            const { kooliRate } = getWageConfig();
            setSelectedWorkers(prev => [...prev, { ...worker, hours_worked: 0, amount: worker.role === 'KOOLI' ? kooliRate : 0 }]);
            setAvailWorkers(prev => prev.filter(w => w.id !== worker.id));
        }
    };

    const handleRemoveSelectedWorker = (worker) => {
        setSelectedWorkers(prev => prev.filter(w => w.id !== worker.id));
        setAvailWorkers(prev => [...prev, worker]);
    };

    const handleUpdateHours = (id, hours) => {
        const hrs = parseFloat(hours) || 0;
        const { grassCutterRate } = getWageConfig();
        setSelectedWorkers(prev => prev.map(w =>
            w.id === id ? { ...w, hours_worked: hrs, amount: hrs * grassCutterRate } : w
        ));
    };

    const totalAssignAmount = selectedWorkers.reduce((sum, w) => sum + w.amount, 0);

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await Promise.all(selectedWorkers.map(w =>
                assignmentService.create({
                    worker: w.id,
                    owner: assignOwner.id,
                    work_type: w.role,
                    hours_worked: w.hours_worked,
                    amount: w.amount,
                    date: assignDate
                })
            ));
            setAssignOpen(false);
            fetchOwners();
            fetchReport();
            // If the view modal is open for the same owner, refresh it
            if (viewOpen && viewOwner?.id === assignOwner?.id) {
                loadViewData(viewOwner.id, viewDate);
            }
        } catch (e) { console.error(e); }
    };

    // ── Collect Payment (owner-level) ─────────────────────────────────────
    const openCollect = () => {
        setCollectForm({ amount: viewData?.totals.total_pending || '', note: '' });
        setCollectOpen(true);
    };

    const handleCollect = async (e) => {
        e.preventDefault();
        try {
            await ownerService.collectPayment(viewOwner.id, collectForm);
            setCollectOpen(false);
            setCollectForm({ amount: '', note: '' });
            loadViewData(viewOwner.id, viewDate);
            fetchOwners();
        } catch (e) { console.error(e); }
    };

    // ── Delete owner ───────────────────────────────────────────────────────
    const handleDeleteOwner = async (owner) => {
        if (!window.confirm(`Delete "${owner.name}"? They will be removed from listings but all their assignment and payment history will be preserved.`)) return;
        try { await ownerService.delete(owner.id); fetchOwners(); }
        catch (e) { console.error(e); }
    };

    // ── Remove assignment ──────────────────────────────────────────────────
    const handleRemoveAssignment = async (assignment) => {
        if (!window.confirm(`Remove ${assignment.worker_name} from this assignment? This cannot be undone.`)) return;
        setRemovingId(assignment.id);
        try {
            await assignmentService.deleteAssignment(assignment.id);
            fetchOwners();
            fetchReport();
            if (viewOwner) loadViewData(viewOwner.id, viewDate);
        } catch (e) { console.error(e); }
        finally { setRemovingId(null); }
    };

    // ── Update amount ──────────────────────────────────────────────────────
    const handleSaveAmount = async (assignment) => {
        const newAmount = editAmounts[assignment.id];
        if (newAmount === undefined || newAmount === '') return;
        setSavingAmount(assignment.id);
        try {
            await assignmentService.updateAmount(assignment.id, parseFloat(newAmount));
            fetchReport();
            if (viewOwner) loadViewData(viewOwner.id, viewDate);
        } catch (e) { console.error(e); }
        finally { setSavingAmount(null); }
    };

    const filtered = owners.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase()) || o.phone.includes(search)
    );

    // ── Table Columns ──────────────────────────────────────────────────────
    const ownerCols = [
        { header: 'Name', render: r => <span className="font-semibold text-[#1A1A2E]">{r.name}</span> },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Address', render: r => <span className="text-[#6B7280] text-xs">{r.address}</span> },
        {
            header: 'Today', render: r => (
                <span className="font-bold text-[#1A1A2E]">{r.assigned_workers_count}</span>
            )
        },
        {
            header: 'Total Pending', render: r => (
                <span className="font-bold text-red-600">₹{r.total_pending}</span>
            )
        },
        {
            header: 'Actions', render: r => (
                <div className="flex items-center gap-3">
                    <button onClick={() => openView(r)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#C8963E] hover:text-[#9B7230] transition-colors">
                        <Eye size={13} /> View
                    </button>
                    <span className="text-[#E5E0D4]">|</span>
                    <button onClick={() => openAssign(r)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#1E2A4A] hover:text-[#2D3F6B] transition-colors">
                        <UserPlus2 size={13} /> Assign
                    </button>
                    <span className="text-[#E5E0D4]">|</span>
                    <button onClick={() => handleDeleteOwner(r)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
                        title="Delete owner">
                        <Trash2 size={13} /> Delete
                    </button>
                </div>
            )
        },
    ];

    const dailyCols = [
        { header: 'Owner', render: r => <span className="font-semibold text-[#1A1A2E]">{r.owner_name}</span> },
        { header: 'Workers Taken', render: r => <span className="font-bold text-[#1A1A2E] text-center">{r.worker_count}</span> },
        { header: 'Work Amount', render: r => <span className="font-bold text-[#1A1A2E]">₹{r.total_work_amount}</span> },
        { header: 'Paid', render: r => <span className="font-bold text-[#059669]">₹{r.paid_amount}</span> },
        { header: 'Pending', render: r => <span className="font-bold text-[#DC2626]">₹{r.pending_amount}</span> },
        {
            header: 'Actions', render: r => (
                <div className="flex items-center gap-3">
                    <button onClick={() => openView(r)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#C8963E] hover:text-[#9B7230] transition-colors">
                        <Eye size={13} /> View
                    </button>
                    <span className="text-[#E5E0D4]">|</span>
                    <button onClick={() => openAssign(r)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#1E2A4A] hover:text-[#2D3F6B] transition-colors">
                        <UserPlus2 size={13} /> Assign
                    </button>
                </div>
            )
        },
    ];

    const enrichedDailyData = filterDate ? filtered.map(owner => {
        const stats = reportData?.owner_summary?.find(s => s.owner_name === owner.name);
        return {
            ...owner,
            owner_name: owner.name,
            worker_count: stats?.worker_count || 0,
            total_work_amount: stats?.total_work_amount || 0,
            paid_amount: stats?.paid_amount || 0,
            pending_amount: stats?.pending_amount || 0,
        };
    }) : [];

    // Assignment rows inside the View modal
    const assignmentRows = (viewData?.assignments || []).map(r => {
        const isBusy = removingId === r.id || savingAmount === r.id;
        const editVal = editAmounts[r.id] !== undefined ? editAmounts[r.id] : r.amount;

        return (
            <div key={r.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center px-4 py-3 border-b border-[#F0EDE4] last:border-0 hover:bg-[#FAFAF8] transition-colors">
                {/* Worker name + type */}
                <div className="min-w-0">
                    <p className="font-semibold text-[#1A1A2E] text-sm truncate">{r.worker_name}</p>
                    <span className={`p-badge text-[10px] mt-0.5 inline-block ${r.work_type === 'KOOLI' ? 'p-badge-blue' : 'p-badge-orange'}`}>{r.work_type}</span>
                </div>

                {/* Hours */}
                <div className="text-center">
                    <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-0.5">Hrs</p>
                    <p className="text-sm text-[#6B7280]">{r.hours_worked || '—'}</p>
                </div>

                {/* Editable Amount */}
                <div className="flex items-center gap-1">
                    <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-xs">₹</span>
                        <input
                            type="number"
                            className="p-input pl-5 pr-2 py-1 text-sm w-24 font-semibold"
                            value={editVal}
                            onChange={e => setEditAmounts(prev => ({ ...prev, [r.id]: e.target.value }))}
                            disabled={isBusy}
                        />
                    </div>
                    {editAmounts[r.id] !== undefined && String(editAmounts[r.id]) !== String(r.amount) && (
                        <button
                            onClick={() => handleSaveAmount(r)}
                            disabled={isBusy}
                            className="w-7 h-7 rounded-lg bg-[#C8963E] text-white flex items-center justify-center hover:bg-[#9B7230] transition-colors flex-shrink-0"
                            title="Save amount">
                            {savingAmount === r.id
                                ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <Check size={13} />}
                        </button>
                    )}
                </div>

                {/* Remove button */}
                <div>
                    <button
                        onClick={() => handleRemoveAssignment(r)}
                        disabled={isBusy}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove worker">
                        {removingId === r.id
                            ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            : <Trash2 size={14} />}
                    </button>
                </div>
            </div>
        );
    });

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <Layout title="Owner Management">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
                <div>
                    <div className="gold-divider" />
                    <h3 className="text-xl font-bold text-[#1A1A2E]">All Owners</h3>
                    <p className="text-[13px] text-[#9CA3AF] mt-0.5">{owners.length} owners registered</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={15} />
                        <input placeholder="Search…" className="p-input !pl-10 h-10 w-[200px] text-sm"
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={15} />
                        <input type="date" className="p-input !pl-10 h-10 w-[160px] text-sm"
                            value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                    </div>
                    <button onClick={() => setAddOpen(true)} className="p-btn-primary">
                        <Plus size={16} /> Add Owner
                    </button>
                </div>
            </div>

            <div className="p-card overflow-hidden">
                {filterDate ? (
                    <DataTable 
                        columns={dailyCols} 
                        data={enrichedDailyData} 
                        isLoading={reportLoading} 
                        emptyMessage="No owners found" 
                    />
                ) : (
                    <DataTable columns={ownerCols} data={filtered} isLoading={loading} emptyMessage="No owners found" />
                )}
            </div>

            {/* ── Add Owner Modal ─────────────────────────────────────── */}
            <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Owner">
                <form onSubmit={handleAddOwner} className="space-y-4">
                    <div><label className="p-label">Owner Name</label>
                        <input required className="p-input" placeholder="Full name"
                            value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} />
                    </div>
                    <div><label className="p-label">Phone Number</label>
                        <input required className="p-input" placeholder="10-digit number"
                            value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} />
                    </div>
                    <div><label className="p-label">Address</label>
                        <textarea rows={2} required className="p-input resize-none" placeholder="Full address"
                            value={addForm.address} onChange={e => setAddForm({ ...addForm, address: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setAddOpen(false)} className="p-btn-ghost flex-1">Cancel</button>
                        <button type="submit" className="p-btn-primary flex-1 justify-center">Save Owner</button>
                    </div>
                </form>
            </Modal>

            {/* ── View Owner Modal ─────────────────────────────────────── */}
            <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title={`${viewOwner?.name} — Details`} maxWidth="max-w-[860px]">
                <div className="space-y-5">
                    {/* Owner info */}
                    <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#F8F6F0] border border-[#E5E0D4]">
                        {viewOwner && [['Name', viewOwner.name], ['Phone', viewOwner.phone], ['Address', viewOwner.address]].map(([k, v]) => (
                            <div key={k} className={k === 'Address' ? 'col-span-3 sm:col-span-1' : ''}>
                                <p className="p-label">{k}</p>
                                <p className="text-sm font-semibold text-[#1A1A2E]">{v}</p>
                            </div>
                        ))}
                    </div>

                    {/* Date filter */}
                    <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-[#C8963E]" />
                        <div className="flex-1">
                            <label className="p-label">Filter by Date</label>
                            <input type="date" className="p-input h-9 text-sm"
                                value={viewDate} onChange={e => setViewDate(e.target.value)} />
                        </div>
                        {viewDate && (
                            <button onClick={() => setViewDate('')}
                                className="text-xs text-[#9CA3AF] hover:text-[#1A1A2E] mt-4 underline">
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Totals summary */}
                    {viewData && (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl text-center border border-[#E5E0D4] bg-white">
                                <p className="p-label mb-1">Total Work</p>
                                <p className="text-lg font-bold text-[#1A1A2E]">₹{viewData.totals.total_work_amount}</p>
                                <p className="text-[10px] text-[#9CA3AF] mt-1">All-time</p>
                            </div>
                            <div className="p-3 rounded-xl text-center border border-[#D1FAE5] bg-[#F0FDF4]">
                                <p className="p-label mb-1 text-[#059669]">Collected</p>
                                <p className="text-lg font-bold text-[#059669]">₹{viewData.totals.total_paid}</p>
                                <button type="button" onClick={openCollect}
                                    className="mt-1.5 text-[11px] font-bold text-white bg-[#059669] rounded-lg px-3 py-1 hover:bg-[#047857] transition-colors w-full flex items-center justify-center gap-1">
                                    <IndianRupee size={11} /> Collect
                                </button>
                            </div>
                            <div className="p-3 rounded-xl text-center border border-[#FEE2E2] bg-[#FFF5F5]">
                                <p className="p-label mb-1 text-[#DC2626]">Pending</p>
                                <p className="text-lg font-bold text-[#DC2626]">₹{viewData.totals.total_pending}</p>
                                <p className="text-[10px] text-[#9CA3AF] mt-1">Outstanding</p>
                            </div>
                        </div>
                    )}

                    {/* Assignments table */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="p-label">Assignment History {viewDate ? `— ${format(new Date(viewDate + 'T00:00:00'), 'MMM d, yyyy')}` : '(All Time)'}</p>
                            <button
                                onClick={openAssignFromView}
                                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1E2A4A] hover:bg-[#2D3F6B] transition-colors px-3 py-1.5 rounded-lg">
                                <UserPlus size={13} /> Add Worker
                            </button>
                        </div>

                        {viewLoading ? (
                            <div className="h-24 flex items-center justify-center">
                                <div className="w-7 h-7 rounded-full border-[3px] border-[#E5E0D4] border-t-[#C8963E] animate-spin" />
                            </div>
                        ) : (
                            <div className="rounded-xl border border-[#E5E0D4] overflow-hidden">
                                {/* Header row */}
                                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 py-2 bg-[#F8F6F0] border-b border-[#E5E0D4]">
                                    {['Worker', 'Hrs', 'Amount', ''].map((h, i) => (
                                        <p key={i} className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider text-center first:text-left">{h}</p>
                                    ))}
                                </div>

                                {assignmentRows.length > 0
                                    ? assignmentRows
                                    : <p className="text-center text-sm text-[#9CA3AF] py-8">No assignments for this period</p>
                                }
                            </div>
                        )}
                    </div>

                    {/* Collection History */}
                    {viewData?.payment_history?.length > 0 && (
                        <div>
                            <p className="p-label mb-2">Collection History</p>
                            <div className="rounded-xl border border-[#E5E0D4] overflow-hidden">
                                <div className="grid grid-cols-[1fr_1fr_auto] gap-x-4 px-4 py-2 bg-[#F8F6F0] border-b border-[#E5E0D4]">
                                    {['Date', 'Note', 'Amount'].map((h, i) => (
                                        <p key={i} className={`text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider ${i === 2 ? 'text-right' : ''}`}>{h}</p>
                                    ))}
                                </div>
                                {viewData.payment_history.map(p => (
                                    <div key={p.id} className="grid grid-cols-[1fr_1fr_auto] gap-x-4 px-4 py-3 border-b border-[#F0EDE4] last:border-0 hover:bg-[#FAFAF8]">
                                        <p className="text-sm text-[#6B7280]">{format(new Date(p.date + 'T00:00:00'), 'MMM d, yyyy')}</p>
                                        <p className="text-sm text-[#6B7280]">{p.note || '—'}</p>
                                        <p className="text-sm font-bold text-[#059669] text-right">₹{p.amount}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* ── Assign Worker Modal ──────────────────────────────────── */}
            <Modal isOpen={assignOpen} onClose={() => setAssignOpen(false)} title={`Assign Workers to ${assignOwner?.name}`} maxWidth="max-w-[620px]">
                <form onSubmit={handleAssign} className="flex flex-col h-full">
                    <div className="space-y-6 pb-6">
                        {/* Assignment Date */}
                        <div className="p-4 bg-[#F8F6F0] rounded-xl border border-[#E5E0D4] flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#C8963E] border border-[#E5E0D4]">
                                <Calendar size={20} />
                            </div>
                            <div className="flex-1">
                                <label className="p-label !mb-0.5">Assignment Date</label>
                                <input 
                                    type="date" 
                                    required 
                                    className="p-input h-9 text-sm" 
                                    value={assignDate} 
                                    onChange={e => setAssignDate(e.target.value)} 
                                />
                            </div>
                        </div>

                        {/* Dropdown to add workers */}
                        <div><label className="p-label pb-2">Select Available Workers</label>
                            <select className="p-input" value="" onChange={e => handleWorkerSelect(e.target.value)}>
                                <option value="">Choose worker to add…</option>
                                {availWorkers.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} ({w.role === 'KOOLI' ? 'Kooli' : 'Grass Cutter'})</option>
                                ))}
                            </select>
                            {availWorkers.length === 0 && selectedWorkers.length === 0 && (
                                <p className="text-xs text-red-500 mt-2">No active available workers right now.</p>
                            )}
                        </div>

                        {/* List of selected workers */}
                        {selectedWorkers.length > 0 && (
                            <div>
                                <h4 className="p-label mb-3">Selected Workers</h4>
                                <div className="space-y-3">
                                    {selectedWorkers.map(w => (
                                        <div key={w.id} className="p-4 rounded-xl border border-[#E5E0D4] bg-[#F8F6F0] relative group">
                                            <button type="button" onClick={() => handleRemoveSelectedWorker(w)}
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
                            <button type="button" onClick={() => setAssignOpen(false)} className="p-btn-ghost flex-1 py-2.5">Cancel</button>
                            <button type="submit" className="p-btn-primary flex-1 justify-center py-2.5" disabled={selectedWorkers.length === 0}>Assign {selectedWorkers.length} Worker(s)</button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* ── Collect Payment Modal ──────────────────────────────────── */}
            <Modal isOpen={collectOpen} onClose={() => setCollectOpen(false)} title={`Collect Payment — ${viewOwner?.name}`} maxWidth="max-w-[480px]">
                <form onSubmit={handleCollect} className="space-y-5">
                    {/* Outstanding summary */}
                    {viewData && (
                        <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#E5E0D4] space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="p-label">Total Work</span>
                                <span className="font-bold text-[#1A1A2E]">₹{viewData.totals.total_work_amount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="p-label">Already Collected</span>
                                <span className="font-bold text-[#059669]">₹{viewData.totals.total_paid}</span>
                            </div>
                            <div className="h-px bg-[#E5E0D4]" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-[#DC2626]">Outstanding</span>
                                <span className="text-xl font-bold text-[#DC2626]">₹{viewData.totals.total_pending}</span>
                            </div>
                        </div>
                    )}

                    {/* Amount input */}
                    <div>
                        <label className="p-label">Amount Received (₹)</label>
                        <div className="relative mt-1">
                            
                            <input
                                type="number"
                                required
                                min="1"
                                step="any"
                                className="p-input pl-9 text-2xl font-bold h-14"
                                placeholder="0"
                                value={collectForm.amount || ''}
                                onChange={e => setCollectForm(prev => ({ ...prev, amount: e.target.value }))}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Optional note */}
                    <div>
                        <label className="p-label">Note (optional)</label>
                        <input
                            type="text"
                            className="p-input"
                            placeholder="e.g. Partial payment, UPI transfer..."
                            value={collectForm.note}
                            onChange={e => setCollectForm(prev => ({ ...prev, note: e.target.value }))}
                        />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setCollectOpen(false)} className="p-btn-ghost flex-1">Cancel</button>
                        <button
                            type="submit"
                            className="p-btn-primary flex-1 justify-center"
                            disabled={!collectForm.amount || parseFloat(collectForm.amount) <= 0}>
                            Record Collection
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Owners;
