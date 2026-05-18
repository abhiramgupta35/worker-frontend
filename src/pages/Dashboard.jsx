import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { Users, UserCheck, UserPlus, Briefcase, IndianRupee, Wallet, Clock, Calendar, Download, Loader2 } from 'lucide-react';
import { workerService, reportService } from '../services/api';
import { format } from 'date-fns';
import { generateReportPdf } from '../utils/reportPdf';

const todayStr = () => format(new Date(), 'yyyy-MM-dd');
const todayMonthStr = () => format(new Date(), 'yyyy-MM');
const todayYearStr = () => format(new Date(), 'yyyy');

const Dashboard = () => {
    const [period, setPeriod] = useState('day'); // 'day' | 'month' | 'year'
    const [filterDate, setFilterDate] = useState(todayStr());
    const [filterMonth, setFilterMonth] = useState(todayMonthStr());
    const [filterYear, setFilterYear] = useState(todayYearStr());
    const [stats, setStats] = useState({
        totalWorkers: 0, availableWorkers: 0, assignedWorkers: 0,
        totalWorkToday: 0, totalEarningsToday: 0, totalCollected: 0, pendingPayments: 0,
    });
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    // Build the params for the generic report endpoint based on the selected period.
    const buildReportParams = useCallback(() => {
        if (period === 'month') return { period: 'month', month: filterMonth };
        if (period === 'year') return { period: 'year', year: filterYear };
        return { period: 'day', date: filterDate };
    }, [period, filterDate, filterMonth, filterYear]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [wRes, rRes] = await Promise.all([
                workerService.getAll(),
                reportService.get(buildReportParams()),
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
            // For day view show the day's assignments; for month/year show the most recent 15.
            const list = rRes.data.assignments || [];
            setRecent(period === 'day' ? list : list.slice(-15).reverse());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [buildReportParams, period]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDownloadPdf = async () => {
        setDownloading(true);
        try {
            // Always fetch fresh data right before generating, so the PDF is current.
            const res = await reportService.get(buildReportParams());
            generateReportPdf(res.data);
        } catch (e) {
            console.error(e);
            alert('Failed to generate PDF.');
        } finally {
            setDownloading(false);
        }
    };

    const isToday = period === 'day' && filterDate === todayStr();
    const displayDate = period === 'day' && filterDate
        ? format(new Date(filterDate + 'T00:00:00'), 'MMM d, yyyy')
        : '';
    const periodHeading = (() => {
        if (period === 'day') return isToday ? 'Today' : displayDate;
        if (period === 'month') {
            try {
                const [y, m] = filterMonth.split('-');
                return format(new Date(Number(y), Number(m) - 1, 1), 'MMMM yyyy');
            } catch { return filterMonth; }
        }
        return `Year ${filterYear}`;
    })();

    const statusBadge = (s) => {
        const cls = s === 'Full Payment' ? 'p-badge-green' : s === 'Half Payment' ? 'p-badge-orange' : 'p-badge-red';
        return <span className={`p-badge ${cls}`}>{s}</span>;
    };

    const columns = [
        ...(period !== 'day' ? [{ header: 'Date', render: r => <span className="text-[#6B7280] text-xs">{r.date}</span> }] : []),
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
                        {isToday ? 'Good Morning' : 'Viewing'}
                    </p>
                    <h2 className="text-white text-2xl font-bold leading-tight">
                        {isToday ? 'Welcome back, Admin 👋' : periodHeading}
                    </h2>
                    <p className="text-white/50 text-sm mt-1">
                        {isToday ? "Here's what's happening on your field today." : `Showing ${period} view.`}
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

            {/* Period + filter bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                {/* Period toggle */}
                <div className="inline-flex rounded-lg border border-[#E5E0D4] bg-white p-1">
                    {[
                        { key: 'day', label: 'Day' },
                        { key: 'month', label: 'Month' },
                        { key: 'year', label: 'Year' },
                    ].map(p => (
                        <button
                            key={p.key}
                            onClick={() => setPeriod(p.key)}
                            className={`px-3.5 h-8 text-xs font-semibold rounded-md transition-colors ${period === p.key
                                ? 'bg-[#1E2A4A] text-white'
                                : 'text-[#6B7280] hover:bg-[#F8F6F0]'}`}>
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Filter input — depends on period */}
                {period === 'day' && (
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8963E]" size={15} />
                        <input type="date"
                            className="p-input !pl-10 h-10 text-sm w-[190px]"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)} />
                    </div>
                )}
                {period === 'month' && (
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8963E]" size={15} />
                        <input type="month"
                            className="p-input !pl-10 h-10 text-sm w-[190px]"
                            value={filterMonth}
                            onChange={e => setFilterMonth(e.target.value)} />
                    </div>
                )}
                {period === 'year' && (
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8963E]" size={15} />
                        <input type="number" min="2000" max="2100"
                            className="p-input !pl-10 h-10 text-sm w-[140px]"
                            value={filterYear}
                            onChange={e => setFilterYear(e.target.value)} />
                    </div>
                )}

                {period === 'day' && !isToday && (
                    <button
                        onClick={() => setFilterDate(todayStr())}
                        className="text-xs font-semibold text-[#C8963E] hover:text-[#9B7230] underline transition-colors">
                        Back to Today
                    </button>
                )}

                <span className="text-xs text-[#9CA3AF]">Showing {periodHeading}</span>

                {/* Download PDF button */}
                <button
                    onClick={handleDownloadPdf}
                    disabled={downloading || loading}
                    className="ml-auto inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold text-white
                               bg-gradient-to-r from-[#1E2A4A] to-[#2D3F6B] hover:from-[#2D3F6B] hover:to-[#3D5285]
                               disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow">
                    {downloading
                        ? <><Loader2 size={15} className="animate-spin" /> Generating...</>
                        : <><Download size={15} /> Download PDF</>}
                </button>
            </div>

            {/* Stat cards row 1 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
                <StatCard label="Total Workers" value={stats.totalWorkers} icon={Users} subtext="All time" />
                <StatCard label="Available" value={stats.availableWorkers} icon={UserPlus} subtext="Right now" />
                <StatCard label="Assigned" value={stats.assignedWorkers} icon={UserCheck} subtext="Right now" />
                <StatCard label="Works" value={stats.totalWorkToday} icon={Briefcase} subtext={periodHeading} accent />
            </div>

            {/* Stat cards row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <StatCard label="Total Earnings" value={`₹${stats.totalEarningsToday}`} icon={IndianRupee} subtext={periodHeading} accent />
                <StatCard label="Collected" value={`₹${stats.totalCollected}`} icon={Wallet} subtext={periodHeading} />
                <StatCard label="Pending Payments" value={`₹${stats.pendingPayments}`} icon={Clock} subtext={periodHeading} />
            </div>

            {/* Assignments table */}
            <div className="p-card overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F0EDE4] flex items-center justify-between">
                    <div>
                        <div className="gold-divider" />
                        <h3 className="text-[15px] font-semibold text-[#1A1A2E]">
                            Assignments — {periodHeading}
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
