import React, { useState } from 'react';
import Navbar from './Navbar';

function Layout({ children }) {
    const [darkMode, setDarkMode] = useState(false);

    return (
        <div className={darkMode ? 'bg-dark text-white min-vh-100' : 'bg-light text-dark min-vh-100'}>
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

            <main className="pt-4">
                {children}
            </main>

            <footer className="bg-dark text-white text-center py-3 mt-5">
                &copy; 2025 ElectroGadgets. All rights reserved.
            </footer>
        </div>
    );
}

export default Layout;
