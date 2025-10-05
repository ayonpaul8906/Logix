import React from 'react';
import Calculator from './components/Calculator';
import { FiCode } from 'react-icons/fi'; 

const Navbar = () => (
    <header className="w-full bg-secondary-dark/80 backdrop-blur-sm shadow-lg border-b border-glass-border fixed top-0 z-20">
        {/* FIX: Using 'px-4' for standard left/right padding across most screen sizes. */}
        <div className="max-w-6xl mx-10 py-4 flex justify-between items-center">
            <div className="text-3xl font-bold text-accent-blue flex items-center tracking-wider">
                {/* <FiCode className="w-8 h-8 mr-2 text-accent-green" /> */}
                <img src="/logo.png" alt="" className='w-10 h-10 mr-3'/>
                Logix 
            </div>
        </div>
    </header>
);

const Footer = () => (
    <footer className="w-full bg-secondary-dark/80 backdrop-blur-sm border-t border-glass-border mt-10 p-4 fixed bottom-0 z-20">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm font-light">
            &copy; {new Date().getFullYear()} Logix Calculator.
        </div>
    </footer>
);

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-primary-dark">
      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 z-0 bg-primary-dark 
                   bg-gradient-to-br from-primary-dark via-secondary-dark to-primary-dark"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"></div> 
      </div>

      <Navbar />

      <main className="flex-grow flex items-center justify-center p-4 pt-24 pb-20 z-10">
        <Calculator />
      </main>

      <Footer />
    </div>
  );
}

export default App;