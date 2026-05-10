import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { Briefcase, ArrowUpRight, Wallet, Clock, Calendar } from 'lucide-react';
import { reportService } from '../services/api';
import { format } from 'date-fns';

const Reports = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        (async () => {
            setLoading(true);
            try { const r = await reportService.getDaily(date); setReport(r.data); }
            catch (e) { console.error(e); } finally { setLoading(false); }
        })();
    }, [date]);

    const ownerCols = [
        { header: 'Owner', render: r => <span className="font-semibold text-[#1A1A2E]">{r.owner_name}</span> },
        { header: 'Work Amount', render: r => <span className="font-bold text-[#1A1A2E]">₹{r.total_work_amount}</span> },
        { header: 'Paid', render: r => <span className="font-bold text-[#059669]">₹{r.paid_amount}</span> },
        { header: 'Pending', render: r => <span className="font-bold text-[#DC2626]">₹{r.pending_amount}</span> },
    ];

    return (
        <Layout title="Daily Reports">
            {/* Date selector banner */}
            <div className="mb-8 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{ background: 'linear-gradient(135deg,#FDF3E0, #FFF6E9)', border: '1px solid #E5D5B0' }}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#C8963E,#E8B86D)' }}>
                        <Calendar size={22} color="#fff" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B7230]">Report Date</p>
                        <p className="text-xl font-bold text-[#6B4A10]">{format(new Date(date + 'T00:00:00'), 'MMMM do, yyyy')}</p>
                    </div>
                </div>
                <div>
                    <label className="p-label">Select Date</label>
                    <input type="date" className="p-input h-10 text-sm" value={date} onChange={e => setDate(e.target.value)} />
                </div>
            </div>

            {loading ? (
                <div className="h-60 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-[3px] border-[#E5E0D4] border-t-[#C8963E] animate-spin" />
                </div>
            ) : report ? (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        <StatCard label="Total Works" value={report.summary.total_works} icon={Briefcase}
                            subtext={`${report.summary.kooli_works}K · ${report.summary.grass_cutter_works}G`} />
                        <StatCard label="Total Earnings" value={`₹${report.summary.total_earnings}`} icon={ArrowUpRight} accent />
                        <StatCard label="Collected" value={`₹${report.summary.collected_amount}`} icon={Wallet} />
                        <StatCard label="Pending" value={`₹${report.summary.pending_amount}`} icon={Clock} />
                    </div>

                    <div className="p-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#F0EDE4] flex items-center justify-between">
                            <div>
                                <div className="gold-divider" />
                                <h3 className="text-[15px] font-semibold text-[#1A1A2E]">Owner-wise Summary</h3>
                            </div>
                            <span className="text-xs text-[#9CA3AF]">{report.owner_summary.length} owners</span>
                        </div>
                        <DataTable columns={ownerCols} data={report.owner_summary} emptyMessage="No data for this date" />
                    </div>
                </>
            ) : (
                <div className="h-60 flex items-center justify-center text-[#9CA3AF]">No report data available</div>
            )}
        </Layout>
    );
};

export default Reports;
