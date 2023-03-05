import React from 'react';

function Layout({children}: { children: React.ReactNode }) {
    return (
        <div className="bg-black text-white font-roboto min-h-screen max-h-max">
            {children}
        </div>
    );
}

export default Layout;
