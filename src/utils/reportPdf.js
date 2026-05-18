import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Use 'Rs.' instead of the rupee glyph because the default jsPDF font
// (Helvetica) doesn't have the ₹ codepoint and renders it as garbage.
const money = (v) => `Rs.${Number(v || 0).toLocaleString('en-IN')}`;

const periodHeading = (period, label) => {
    if (!label) return '';
    if (period === 'day') {
        try { return format(new Date(label + 'T00:00:00'), 'EEEE, d MMM yyyy'); }
        catch { return label; }
    }
    if (period === 'month') {
        try {
            const [y, m] = label.split('-');
            return format(new Date(Number(y), Number(m) - 1, 1), 'MMMM yyyy');
        } catch { return label; }
    }
    return `Year ${label}`;
};

export const generateReportPdf = (report) => {
    const { period, period_label, summary, owner_summary = [], assignments = [], payments = [] } = report;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 40;

    // ── Header band ─────────────────────────────────────────────
    doc.setFillColor(30, 42, 74); // #1E2A4A
    doc.rect(0, 0, pageW, 90, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Worker Management', margin, 38);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const periodTitleMap = { day: 'Daily Report', month: 'Monthly Report', year: 'Yearly Report' };
    doc.text(`${periodTitleMap[period] || 'Report'} — ${periodHeading(period, period_label)}`, margin, 60);

    doc.setFontSize(9);
    doc.setTextColor(220, 220, 220);
    doc.text(`Generated on ${format(new Date(), 'd MMM yyyy, h:mm a')}`, margin, 76);

    let cursorY = 120;

    // ── Summary table ───────────────────────────────────────────
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Summary', margin, cursorY);
    cursorY += 8;

    autoTable(doc, {
        startY: cursorY,
        head: [['Metric', 'Value']],
        body: [
            ['Total Works', String(summary.total_works ?? 0)],
            ['Kooli Works', String(summary.kooli_works ?? 0)],
            ['Grass Cutter Works', String(summary.grass_cutter_works ?? 0)],
            ['Total Earnings', money(summary.total_earnings)],
            ['Collected', money(summary.collected_amount)],
            ['Pending', money(summary.pending_amount)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [200, 150, 62], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 6 },
        columnStyles: { 0: { cellWidth: 200 }, 1: { halign: 'right', fontStyle: 'bold' } },
        margin: { left: margin, right: margin },
    });

    cursorY = doc.lastAutoTable.finalY + 24;

    // ── Owner-wise breakdown ────────────────────────────────────
    if (owner_summary.length) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('Owner Breakdown', margin, cursorY);
        cursorY += 8;

        autoTable(doc, {
            startY: cursorY,
            head: [['Owner', 'Workers', 'Work Amount', 'Paid', 'Pending']],
            body: owner_summary.map(o => [
                o.owner_name,
                String(o.worker_count),
                money(o.total_work_amount),
                money(o.paid_amount),
                money(o.pending_amount),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [30, 42, 74], textColor: 255 },
            styles: { fontSize: 10, cellPadding: 6 },
            columnStyles: {
                1: { halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'right' },
                4: { halign: 'right' },
            },
            margin: { left: margin, right: margin },
        });

        cursorY = doc.lastAutoTable.finalY + 24;
    }

    // ── Detailed assignments ────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    if (cursorY > 720) { doc.addPage(); cursorY = 60; }
    doc.text(`Assignments (${assignments.length})`, margin, cursorY);
    cursorY += 8;

    if (assignments.length) {
        autoTable(doc, {
            startY: cursorY,
            head: [['Date', 'Worker', 'Owner', 'Type', 'Hrs', 'Amount', 'Active']],
            body: assignments.map(a => [
                a.date,
                a.worker_name,
                a.owner_name,
                a.work_type,
                a.hours_worked || '-',
                money(a.amount),
                a.is_active ? 'Yes' : 'No',
            ]),
            theme: 'striped',
            headStyles: { fillColor: [30, 42, 74], textColor: 255 },
            styles: { fontSize: 9, cellPadding: 5 },
            columnStyles: {
                4: { halign: 'center' },
                5: { halign: 'right' },
                6: { halign: 'center' },
            },
            margin: { left: margin, right: margin },
        });
        cursorY = doc.lastAutoTable.finalY + 24;
    } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text('No assignments in this period.', margin, cursorY + 14);
        cursorY += 36;
        doc.setTextColor(20, 20, 20);
    }

    // ── Payments collected ──────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    if (cursorY > 720) { doc.addPage(); cursorY = 60; }
    doc.text(`Payments Collected (${payments.length})`, margin, cursorY);
    cursorY += 8;

    if (payments.length) {
        // Build owner_id -> name from owner_summary if possible; fall back to id.
        autoTable(doc, {
            startY: cursorY,
            head: [['Date', 'Owner', 'Amount', 'Note']],
            body: payments.map(p => [
                p.date,
                String(p.owner),
                money(p.amount),
                p.note || '-',
            ]),
            theme: 'striped',
            headStyles: { fillColor: [16, 122, 87], textColor: 255 },
            styles: { fontSize: 9, cellPadding: 5 },
            columnStyles: { 2: { halign: 'right' } },
            margin: { left: margin, right: margin },
        });
    } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text('No payments collected in this period.', margin, cursorY + 14);
    }

    // ── Footer page numbers ─────────────────────────────────────
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Page ${i} of ${total}`,
            pageW - margin,
            doc.internal.pageSize.getHeight() - 20,
            { align: 'right' }
        );
    }

    const filenameLabel = (period_label || '').replace(/[^0-9A-Za-z-]/g, '_');
    doc.save(`worker-report-${period}-${filenameLabel}.pdf`);
};
