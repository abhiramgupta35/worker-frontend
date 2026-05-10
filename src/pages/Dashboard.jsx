import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { Users, UserCheck, UserPlus, Briefcase, IndianRupee, Wallet, Clock, Calendar } from 'lucide-react';
import { workerService, reportService, assignmentService } from '../services/api';
import { format } from 'date-fns';

const todayStr = () => format(new Date(), 'yyyy-MM-dd');

const Dashboard = () => {
    const [filterDate, setFilterDate] = useState(todayStr());
    const [stats, setStats] = useState({
        totalWorkers: 0, availableWorkers: 0, assignedWorkers: 0,
        totalWorkToday: 0, totalEarningsToday: 0, totalCollected: 0, pendingPayments: 0,
    });
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (date) => {
        setLoading(true);
        try {
            const [wRes, rRes, aRes] = await Promise.all([
                workerService.getAll(),
                reportService.getDaily(date),
                assignmentService.getAll(),
            ]);
            const w = wRes.data;
            const r = rRes.data.summary;
            setStats({
                totalWorkers: w.length,
                availableWorkers: w.filter(x => x.status === 'AVAILABLE').length,
                assignedWorkers: w.filter(x => x.status === 'ASSIGNED').length,
                totalWorkToday: r.total_works,
                totalEarningsToday: r.total_earnings,
                totalCollected: r.collected_amount,
                pendingPayments: r.pending_amount,
            });
            const filtered = aRes.data.filter(a => a.date === date);
            setRecent(filtered.slice(0, 10));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(filterDate); }, [filterDate, fetchData]);

    const isToday = filterDate === todayStr();
    const displayDate = filterDate
        ? format(new Date(filterDate + 'T00:00:00'), 'MMM d, yyyy')
        : '';

    const statusBadge = (s) => {
        const cls = s === 'Full Payment' ? 'p-badge-green' : s === 'Half Payment' ? 'p-badge-orange' : 'p-badge-red';
        return <span className={`p-badge ${cls}`}>{s}</span>;
    };

    const columns = [
        { header: 'Worker', accessor: 'worker_name' },
        { header: 'Owner', accessor: 'owner_name' },
        {
            header: 'Type', render: r => (
                <span className={`p-badge ${r.work_type === 'KOOLI' ? 'p-badge-blue' : 'p-badge-orange'}`}>{r.work_type}</span>
            )
        },
        { header: 'Hours', accessor: 'hours_worked' },
        { header: 'Amount', render: r => <span className="font-semibold text-[#1A1A2E]">₹{r.amount}</span> },
        { header: 'Status', render: r => statusBadge(r.status) },
    ];

    return (
        <Layout title="Dashboard Overview">
            {/* Hero banner */}
            <div className="mb-8 rounded-2xl p-7 flex items-center justify-between overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #1E2A4A 0%, #2D3F6B 100%)' }}>
                <div className="absolute right-0 top-0 w-80 h-full opacity-10"
                    style={{ background: 'radial-gradient(circle at 80% 50%, #C8963E, transparent 65%)' }} />
                <div>
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">
                        {isToday ? 'Good Morning' : 'Viewing History'}
                    </p>
                    <h2 className="text-white text-2xl font-bold leading-tight">
                        {isToday ? 'Welcome back, Admin 👋' : displayDate}
                    </h2>
                    <p className="text-white/50 text-sm mt-1">
                        {isToday ? "Here's what's happening on your field today." : "Historical view for this date."}
                    </p>
                </div>
                <div className="hidden md:flex gap-6 text-right">
                    <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider">Works</p>
                        <p className="text-white text-3xl font-bold">{stats.totalWorkToday}</p>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider">Earnings</p>
                        <p className="text-3xl font-bold" style={{ color: '#E8B86D' }}>₹{stats.totalEarningsToday}</p>
                    </div>
                </div>
            </div>

            {/* Date filter bar */}
            <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8963E]" size={15} />
                    <input
                        type="date"
                        className="p-input !pl-10 h-10 text-sm w-[190px]"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                    />
                </div>
                {!isToday && (
                    <button
                        onClick={() => setFilterDate(todayStr())}
                        className="text-xs font-semibold text-[#C8963E] hover:text-[#9B7230] underline transition-colors">
                        Back to Today
                    </button>
                )}
                <span className="text-xs text-[#9CA3AF]">
                    {isToday ? 'Showing today\'s data' : `Showing data for ${displayDate}`}
                </span>
            </div>

            {/* Stat cards row 1 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
                <StatCard label="Total Workers" value={stats.totalWorkers} icon={Users} subtext="All time" />
                <StatCard label="Available" value={stats.availableWorkers} icon={UserPlus} subtext="Right now" />
                <StatCard label="Assigned" value={stats.assignedWorkers} icon={UserCheck} subtext="Right now" />
                <StatCard label="Works" value={stats.totalWorkToday} icon={Briefcase} subtext={isToday ? 'Today' : displayDate} accent />
            </div>

            {/* Stat cards row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <StatCard label="Total Earnings" value={`₹${stats.totalEarningsToday}`} icon={IndianRupee} subtext={isToday ? 'Today' : displayDate} accent />
                <StatCard label="Collected" value={`₹${stats.totalCollected}`} icon={Wallet} subtext={isToday ? 'Today' : displayDate} />
                <StatCard label="Pending Payments" value={`₹${stats.pendingPayments}`} icon={Clock} subtext={isToday ? 'Today' : displayDate} />
            </div>

            {/* Assignments table */}
            <div className="p-card overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F0EDE4] flex items-center justify-between">
                    <div>
                        <div className="gold-divider" />
                        <h3 className="text-[15px] font-semibold text-[#1A1A2E]">
                            Assignments — {isToday ? 'Today' : displayDate}
                        </h3>
                    </div>
                    <span className="text-xs text-[#9CA3AF] font-medium">{recent.length} record(s)</span>
                </div>
                <DataTable columns={columns} data={recent} isLoading={loading} emptyMessage="No assignments for this date" />
            </div>
        </Layout>
    );
};

export default Dashboard;
