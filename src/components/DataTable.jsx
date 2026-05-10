import React from 'react';

const DataTable = ({ columns, data, isLoading, emptyMessage = "No records found" }) => {
    if (isLoading) {
        return (
            <div className="w-full h-44 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-[3px] border-[#E5E0D4] border-t-[#C8963E] animate-spin" />
                    <p className="text-xs text-[#9CA3AF] font-medium">Loading data…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i} className="p-th first:rounded-tl-xl last:rounded-tr-xl">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="p-td text-center py-14 text-[#9CA3AF]">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-[#F0EDE4] flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#C9C2B2]" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium">{emptyMessage}</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((row, ri) => (
                            <tr key={ri} className="group cursor-default">
                                {columns.map((col, ci) => (
                                    <td key={ci} className="p-td">
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
