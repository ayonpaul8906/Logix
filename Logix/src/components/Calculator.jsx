import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalculator } from '../lib/useCalculator';
import { FiMinimize2, FiMaximize2, FiDelete, FiBookOpen } from 'react-icons/fi';

// --- Button Configurations ---

const buttonBaseStyle = 'p-3 rounded-xl text-xl font-semibold backdrop-blur-sm hover:bg-glass-bg/50 transition-all duration-150 shadow-inner-shadow border border-glass-border/50 flex items-center justify-center';

const basicButtons = [
  { label: 'C', style: 'text-accent-red bg-secondary-dark/70' },
  { label: 'DEL', style: 'text-accent-red bg-secondary-dark/70', icon: FiDelete },
  { label: '%', style: 'text-accent-green bg-glass-bg' },
  { label: '/', style: 'text-accent-green bg-glass-bg' },
  
  { label: '7', style: 'text-white bg-secondary-dark' },
  { label: '8', style: 'text-white bg-secondary-dark' },
  { label: '9', style: 'text-white bg-secondary-dark' },
  { label: '*', style: 'text-accent-green bg-glass-bg' },
  
  { label: '4', style: 'text-white bg-secondary-dark' },
  { label: '5', style: 'text-white bg-secondary-dark' },
  { label: '6', style: 'text-white bg-secondary-dark' },
  { label: '-', style: 'text-accent-green bg-glass-bg' },
  
  { label: '1', style: 'text-white bg-secondary-dark' },
  { label: '2', style: 'text-white bg-secondary-dark' },
  { label: '3', 'style': 'text-white bg-secondary-dark' },
  { label: '+', style: 'text-accent-green bg-glass-bg' },
  
  { label: '0', style: 'text-white bg-secondary-dark col-span-2' },
  { label: '.', style: 'text-white bg-secondary-dark' },
  { label: '=', style: 'bg-accent-blue/80 text-white shadow-soft-glow hover:bg-accent-blue' },
];

const scientificButtons = [
  // Using a slightly more compact grid layout for scientific mode on smaller screens
  // This is the core fix for the layout issue.
  { label: '(', style: 'text-accent-green/80' },
  { label: ')', style: 'text-accent-green/80' },
  { label: 'C', style: 'text-accent-red bg-secondary-dark/70' },
  { label: 'DEL', style: 'text-accent-red bg-secondary-dark/70', icon: FiDelete },
  
  { label: 'sin(', style: 'text-accent-blue/90 text-sm' },
  { label: 'cos(', style: 'text-accent-blue/90 text-sm' },
  { label: 'tan(', style: 'text-accent-blue/90 text-sm' },
  { label: '/', style: 'text-accent-green bg-glass-bg' },
  
  { label: 'log(', style: 'text-accent-blue/90 text-sm' },
  { label: 'ln(', style: 'text-accent-blue/90' },
  { label: 'sqrt(', style: 'text-accent-blue/90 text-sm' },
  { label: '*', style: 'text-accent-green bg-glass-bg' },
  
  { label: 'π', style: 'text-accent-blue/90' },
  { label: '^', style: 'text-accent-blue/90' },
  { label: '%', style: 'text-accent-green bg-glass-bg' },
  { label: '-', style: 'text-accent-green bg-glass-bg' },
  
  { label: '7', style: 'text-white bg-secondary-dark' },
  { label: '8', style: 'text-white bg-secondary-dark' },
  { label: '9', style: 'text-white bg-secondary-dark' },
  { label: '+', style: 'text-accent-green bg-glass-bg' },
  
  { label: '4', style: 'text-white bg-secondary-dark' },
  { label: '5', 'style': 'text-white bg-secondary-dark' },
  { label: '6', 'style': 'text-white bg-secondary-dark' },
  { label: '0', 'style': 'text-white bg-secondary-dark' },
  
  { label: '1', 'style': 'text-white bg-secondary-dark' },
  { label: '2', 'style': 'text-white bg-secondary-dark' },
  { label: '3', 'style': 'text-white bg-secondary-dark' },
  { label: '.', 'style': 'text-white bg-secondary-dark' },
  
  { label: '=', style: 'bg-accent-blue/80 text-white shadow-soft-glow hover:bg-accent-blue col-span-4 py-4' }, 
];

const CalculatorButton = ({ label, onClick, className, Icon }) => (
  <motion.button
    onClick={() => onClick(label)}
    whileTap={{ scale: 0.9, boxShadow: 'none' }}
    transition={{ duration: 0.05 }}
    className={`${buttonBaseStyle} ${className}`}
  >
    {Icon ? <Icon className="w-5 h-5" /> : label}
  </motion.button>
);

const TypingEffectDisplay = ({ text, isError }) => {
  const key = isError ? 'error' : text;
  return (
    <motion.div
        key={key} 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`w-full text-right p-4 overflow-x-auto whitespace-nowrap font-mono 
                    ${isError ? 'text-accent-red text-3xl font-bold' : 'text-white text-5xl'} 
                    transition-colors duration-300`}
    >
        {text}
    </motion.div>
  );
};

const HistoryPanel = ({ history, clearHistory }) => (
    // FIX: Changed w-48 to w-60 on large screens for better visibility.
    <div className='w-full max-h-40 overflow-y-auto p-3 
                    rounded-xl bg-glass-bg backdrop-blur-sm border border-glass-border 
                    shadow-soft-glow text-xs text-gray-300 mb-4 
                    lg:w-60 lg:max-h-[500px] lg:sticky lg:top-24'
    >
        <div className='flex justify-between items-center mb-1 border-b border-glass-border pb-1'>
            <h3 className='font-bold text-sm text-accent-blue flex items-center'>
                <FiBookOpen className='w-4 h-4 mr-1' /> History
            </h3>
            <button 
                onClick={clearHistory} 
                className='text-xs text-accent-red/70 hover:text-accent-red transition'
                aria-label="Clear History"
            >
                Clear
            </button>
        </div>
        <div className='space-y-1'>
            {history.map((item, index) => (
                <motion.p 
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className='truncate opacity-80 hover:opacity-100 transition-opacity font-light'
                >
                    {item}
                </motion.p>
            ))}
            {history.length === 0 && <p className='text-gray-500 italic'>No recent calculations.</p>}
        </div>
    </div>
);


// --- Main Calculator Component ---

const Calculator = () => {
  const { 
    input, 
    history,
    error,
    isError,
    handleInput, 
    handleEqual, 
    handleKeyDown,
    clearHistory
  } = useCalculator();
  
  const [isScientificMode, setIsScientificMode] = useState(false); // Start in basic mode for better mobile-first view
  const currentButtons = isScientificMode ? scientificButtons : basicButtons;
  const currentGridCols = 'grid-cols-4'; 

  useEffect(() => {
    const handleKey = (e) => {
      e.preventDefault(); 
      handleKeyDown(e.key);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKeyDown]);

  const handleButtonClick = (label) => {
    if (label === '=') {
      handleEqual();
    } else {
      handleInput(label);
    }
  };

  const toggleMode = () => {
    setIsScientificMode(prev => !prev);
  };

  const shakeAnimation = isError ? {
    animate: 'shake',
    variants: { shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5 } } }
  } : {};

  // FIX: Dynamic width adjustment based on mode
  const containerWidthClass = isScientificMode ? 'max-w-md' : 'max-w-sm';

  return (
    // FIX: Main layout container ensures centering and side-by-side layout on large screens.
    <div className="flex flex-col lg:flex-row lg:gap-8 w-full max-w-6xl items-start justify-center">

        {/* Calculator Main Body - The central item */}
        <motion.div
          {...shakeAnimation} 
          className={`w-full ${containerWidthClass} p-5 rounded-3xl backdrop-blur-xl 
                      bg-secondary-dark/60 border border-glass-border 
                      shadow-2xl shadow-accent-blue/20 
                      transform transition-all duration-500 
                      hover:shadow-soft-glow order-1 lg:order-1`} 
        >
            {/* Mode Toggle Button */}
            <motion.button
                onClick={toggleMode}
                whileTap={{ scale: 0.9 }}
                className='w-full p-2 mb-4 rounded-xl text-sm font-medium text-accent-blue bg-glass-bg/50 
                           hover:bg-glass-bg transition-all duration-300 border border-glass-border'
                aria-label={isScientificMode ? "Switch to Basic Mode" : "Switch to Scientific Mode"}
            >
                {isScientificMode ? (
                    <span className='flex items-center justify-center'>
                        <FiMinimize2 className="w-4 h-4 mr-2"/> Switch to BASIC Mode
                    </span>
                ) : (
                    <span className='flex items-center justify-center'>
                        <FiMaximize2 className="w-4 h-4 mr-2"/> Switch to SCIENTIFIC Mode
                    </span>
                )}
            </motion.button>
            
            {/* Display Screen */}
            <div className={`mb-4 p-2 rounded-xl border-4 border-accent-blue/30 
                             bg-display-bg shadow-inner-shadow transition-all duration-300
                             ${isError ? 'border-accent-red' : 'border-accent-blue/30'}`}
            >
              <div className='h-8 text-right text-accent-blue/70 px-2 text-sm font-mono'>
                {error ? error : ''}
              </div>
              <TypingEffectDisplay 
                text={input} 
                isError={isError} 
              />
            </div>

            {/* Buttons Grid - Animated Transition */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={isScientificMode ? 'scientific' : 'basic'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`grid ${currentGridCols} gap-3 md:gap-4`}
                >
                    {currentButtons.map((btn) => (
                        <CalculatorButton
                          key={btn.label}
                          label={btn.label}
                          onClick={handleButtonClick}
                          className={btn.style}
                          Icon={btn.icon}
                        />
                    ))}
                </motion.div>
            </AnimatePresence>
        </motion.div>

        {/* History Panel - Placed side-by-side on large screens, or above calculator on small screens */}
        <div className='w-full lg:w-auto order-2 lg:order-2'>
            <HistoryPanel history={history} clearHistory={clearHistory} />
        </div>
    </div>
  );
};

export default Calculator;