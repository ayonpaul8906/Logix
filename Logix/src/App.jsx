import React from 'react';
import Calculator from './components/Calculator';
import { FiCode } from 'react-icons/fi'; 

// --- Theme Style/Color Constants ---
const THEME = {
    NAV_BG: 'bg-zinc-900/80',
    GLASS_BORDER: 'border-zinc-700/60',
    TEXT_BRAND: 'text-sky-400',
    TEXT_FOOTER: 'text-gray-500',
};

const Navbar = () => (
    <header className={`w-full ${THEME.NAV_BG} backdrop-blur-md shadow-xl border-b ${THEME.GLASS_BORDER} fixed top-0 z-20`}>
        <div className="max-w-7xl mx-4 px-4 sm:px-6 py-3 flex justify-between items-center">
            <div className={`text-2xl sm:text-3xl font-extrabold ${THEME.TEXT_BRAND} flex items-center tracking-wide transition-all duration-300`}>
                <img src="/logo.png" alt="Logix Logo" className='w-8 h-8 sm:w-9 sm:h-9 mr-3'/>
                Logix 
            </div>
        </div>
    </header>
);

const Footer = () => (
    <footer className={`w-full ${THEME.NAV_BG} backdrop-blur-md border-t ${THEME.GLASS_BORDER} p-2.5 fixed bottom-0 z-20`}>
        <div className="max-w-7xl mx-auto text-center ${THEME.TEXT_FOOTER} text-xs font-light">
            &copy; {new Date().getFullYear()} Logix Calculator. Built with React & Tailwind.
        </div>
    </footer>
);

function App() {
    return (
        // The main container allows its content to scroll if it's too big for the viewport
        <div className="min-h-screen flex flex-col font-sans bg-gray-950">
            {/* Dynamic Background */}
            <div 
                className="fixed inset-0 z-0 bg-gray-950" 
                style={{
                    backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(12, 74, 110, 0.1), transparent 50%)' 
                }}
            >
                <div className="absolute inset-0 opacity-10 pointer-events-none"></div> 
            </div>

            <Navbar />

            {/* FINAL FIX: Increased bottom padding to pb-28 (7rem) to guarantee clearance.
                Added overflow-y-auto to allow scrolling within the main content if needed.
            */}
            <main className="flex-grow flex justify-center w-full px-4 pt-24 pb-28 z-10 min-h-full overflow-y-auto">
                <Calculator />
            </main>

            <Footer />
        </div>
    );
}

export default App;