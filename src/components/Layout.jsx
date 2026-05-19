import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => (
    <div className="min-h-screen" style={{ background: '#F8F6F0' }}>
        <Sidebar />
        <div className="ml-[280px]">
            <main className="p-8">
                {children}
            </main>
        </div>
    </div>
);

export default Layout;
