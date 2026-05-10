import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title }) => (
    <div className="min-h-screen" style={{ background: '#F8F6F0' }}>
        <Sidebar />
        <div className="ml-[280px]">
            <Header title={title} />
            <main className="p-8">
                {children}
            </main>
        </div>
    </div>
);

export default Layout;
