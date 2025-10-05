import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2, Maximize2, Delete, History, LineChart } from 'lucide-react';
import GraphMode from './GraphMode';

// --- Theme & Style Constants ---
const THEME = {
  GLASS_BASE: 'bg-zinc-800/40 backdrop-blur-md', 
  GLASS_BORDER: 'border border-zinc-700/60',
  ACCENT_BLUE: 'text-sky-400', 
  ACCENT_GREEN: 'text-emerald-400', 
  ACCENT_RED: 'text-rose-400',
  TEXT_PRIMARY: 'text-white',
  EQUAL_BUTTON_BG: 'bg-sky-600/90 hover:bg-sky-500', 
};

// --- Button Base Style ---
const buttonBaseStyle = 'p-4 rounded-xl sm:rounded-2xl text-xl font-medium transition-all duration-200 shadow-xl ' +
                        `${THEME.GLASS_BORDER} ${THEME.GLASS_BASE} hover:shadow-2xl active:scale-[0.98] flex items-center justify-center`;

// --- Button Configurations ---

const basicButtons = [
  { label: 'C', style: `${THEME.ACCENT_RED} ${THEME.GLASS_BASE} hover:bg-zinc-800/60 font-bold` },
  { label: 'DEL', style: `${THEME.ACCENT_RED} ${THEME.GLASS_BASE} hover:bg-zinc-800/60 font-bold`, icon: Delete },
  { label: '%', style: `${THEME.ACCENT_GREEN} ${THEME.GLASS_BASE} hover:bg-zinc-800/60` },
  { label: '/', style: `${THEME.ACCENT_GREEN} ${THEME.GLASS_BASE} hover:bg-zinc-800/60` },
  
  { label: '7', style: `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
  { label: '8', style: `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
  { label: '9', style: `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
  { label: '*', style: `${THEME.ACCENT_GREEN} ${THEME.GLASS_BASE} hover:bg-zinc-800/60` },
  
  { label: '4', style: `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
  { label: '5', style: `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
  { label: '6', style: `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
  { label: '-', style: `${THEME.ACCENT_GREEN} ${THEME.GLASS_BASE} hover:bg-zinc-800/60` },
  
  { label: '1', style: `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
  { label: '2', style: `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
  { label: '3', 'style': `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
  { label: '+', style: `${THEME.ACCENT_GREEN} ${THEME.GLASS_BASE} hover:bg-zinc-800/60` },
  
  { label: '0', style: `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90 col-span-2` },
  { label: '.', style: `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
  { label: '=', style: `${THEME.EQUAL_BUTTON_BG} ${THEME.TEXT_PRIMARY} text-2xl font-bold shadow-sky-400/50 shadow-lg` },
];

const scientificButtons = [
    { label: '(', style: `${THEME.ACCENT_BLUE} ${THEME.GLASS_BASE} hover:bg-zinc-800/60` },
    { label: ')', style: `${THEME.ACCENT_BLUE} ${THEME.GLASS_BASE} hover:bg-zinc-800/60` },
    { label: 'C', style: `${THEME.ACCENT_RED} ${THEME.GLASS_BASE} hover:bg-zinc-800/60 font-bold` },
    { label: 'DEL', style: `${THEME.ACCENT_RED} ${THEME.GLASS_BASE} hover:bg-zinc-800/60 font-bold`, icon: Delete },
    { label: 'sin(', style: `${THEME.ACCENT_BLUE} ${THEME.GLASS_BASE} hover:bg-zinc-800/60 text-base sm:text-lg` },
    { label: 'cos(', style: `${THEME.ACCENT_BLUE} ${THEME.GLASS_BASE} hover:bg-zinc-800/60 text-base sm:text-lg` },
    
    { label: 'tan(', style: `${THEME.ACCENT_BLUE} ${THEME.GLASS_BASE} hover:bg-zinc-800/60 text-base sm:text-lg` },
    { label: '/', style: `${THEME.ACCENT_GREEN} ${THEME.GLASS_BASE} hover:bg-zinc-800/60` },
    { label: 'log(', style: `${THEME.ACCENT_BLUE} ${THEME.GLASS_BASE} hover:bg-zinc-800/60 text-base sm:text-lg` },
    { label: 'ln(', style: `${THEME.ACCENT_BLUE} ${THEME.GLASS_BASE} hover:bg-zinc-800/60 text-base sm:text-lg` },
    { label: 'sqrt(', style: `${THEME.ACCENT_BLUE} ${THEME.GLASS_BASE} hover:bg-zinc-800/60 text-base sm:text-lg` },
    { label: '*', style: `${THEME.ACCENT_GREEN} ${THEME.GLASS_BASE} hover:bg-zinc-800/60` },
    
    { label: 'π', style: `${THEME.ACCENT_BLUE} ${THEME.GLASS_BASE} hover:bg-zinc-800/60` },
    { label: '^', style: `${THEME.ACCENT_BLUE} ${THEME.GLASS_BASE} hover:bg-zinc-800/60` },
    { label: '%', style: `${THEME.ACCENT_GREEN} ${THEME.GLASS_BASE} hover:bg-zinc-800/60` },
    { label: '-', style: `${THEME.ACCENT_GREEN} ${THEME.GLASS_BASE} hover:bg-zinc-800/60` },
    { label: '7', style: `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
    { label: '8', style: `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },

    { label: '9', style: `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
    { label: '+', style: `${THEME.ACCENT_GREEN} ${THEME.GLASS_BASE} hover:bg-zinc-800/60` },
    { label: '4', style: `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
    { label: '5', 'style': `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
    { label: '6', 'style': `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
    { label: '0', 'style': `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
    
    { label: '1', 'style': `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
    { label: '2', 'style': `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
    { label: '3', 'style': `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
    { label: '.', 'style': `${THEME.TEXT_PRIMARY} bg-zinc-700/70 hover:bg-zinc-700/90` },
    { label: '=', style: `${THEME.EQUAL_BUTTON_BG} ${THEME.TEXT_PRIMARY} text-2xl font-bold shadow-sky-400/50 shadow-lg col-span-2 py-4` }, 
];

// --- Sub-Components ---

const ModeSwitcher = ({ currentMode, onModeChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const modes = [
        { id: 'BASIC', name: 'Basic', icon: <Minimize2 className="w-4 h-4" /> },
        { id: 'SCIENTIFIC', name: 'Scientific', icon: <Maximize2 className="w-4 h-4" /> },
        { id: 'GRAPH', name: 'Graph', icon: <LineChart className="w-4 h-4" /> }
    ];

    return (
        <div className="relative w-full mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-3 rounded-xl text-sm font-semibold ${THEME.ACCENT_BLUE} 
                            ${THEME.GLASS_BASE} ${THEME.GLASS_BORDER} hover:bg-zinc-700/50 
                            transition-all duration-300 shadow-md
                            flex items-center justify-between`}
            >
                <span className="flex items-center gap-2">
                    {modes.find(m => m.id === currentMode)?.icon}
                    {modes.find(m => m.id === currentMode)?.name} Mode
                </span>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute top-full left-0 right-0 mt-2 ${THEME.GLASS_BASE} ${THEME.GLASS_BORDER} rounded-xl overflow-hidden z-50 shadow-2xl`}
                    >
                        {modes.map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => {
                                    onModeChange(mode.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full p-3 flex items-center gap-2 transition-colors
                                            ${currentMode === mode.id ? `${THEME.ACCENT_BLUE} bg-zinc-700/60 font-bold` : `${THEME.TEXT_PRIMARY} hover:bg-zinc-700/30`}`}
                            >
                                {mode.icon}
                                {mode.name}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CalculatorButton = ({ label, onClick, className, Icon }) => (
    <motion.button
        onClick={() => onClick(label)}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className={`${buttonBaseStyle} ${className}`}
        aria-label={label === 'DEL' ? 'Delete' : label}
    >
        {Icon ? <Icon className="w-6 h-6" /> : label}
    </motion.button>
);

const HistoryPanel = ({ history, clearHistory }) => (
    <div className={`w-full max-h-56 overflow-y-auto p-4 
                     rounded-3xl ${THEME.GLASS_BASE} ${THEME.GLASS_BORDER} 
                     shadow-2xl text-gray-400 mb-6
                     lg:w-72 lg:max-h-[70vh] lg:sticky lg:top-8`}>
        <div className="flex justify-between items-center pb-2 border-b border-zinc-700/50 mb-2">
            <h3 className={`font-extrabold text-xl ${THEME.ACCENT_BLUE} flex items-center`}>
                <History className="w-5 h-5 mr-2" /> History
            </h3>
            <button 
                onClick={clearHistory} 
                className={`text-xs ${THEME.ACCENT_RED}/70 hover:${THEME.ACCENT_RED} transition font-semibold`}
                aria-label="Clear history"
            >
                Clear
            </button>
        </div>
        <div className="space-y-3 text-sm">
            {history.slice(0).reverse().map((item, index) => (
                <motion.p 
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="truncate text-white/80 font-light hover:text-white transition-colors"
                >
                    {item}
                </motion.p>
            ))}
            {history.length === 0 && (
                <p className="text-gray-500 italic py-4">No recent calculations.</p>
            )}
        </div>
    </div>
);


// --- Core Calculator Component with Integrated Logic ---

const Calculator = () => {
    const [mode, setMode] = useState('BASIC');
    const [input, setInput] = useState('');
    const [lastQuestion, setLastQuestion] = useState('');
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');
    const [isError, setIsError] = useState(false);

    // Helper function to safely evaluate the expression
    const safeEvaluate = useCallback((expression) => {
        // 1. Pre-process expression for JavaScript's Math object
        let cleanedExpression = expression
            .replace(/π/g, 'Math.PI')
            .replace(/ln\(/g, 'Math.log(') // Natural log (base e)
            .replace(/log\(/g, 'Math.log10(') // Common log (base 10)
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/%/g, ' % ') // Ensure % is treated as a binary operator
            .replace(/\^/g, '**'); // Power operator

        // Clean up double operators (e.g., '++' to '+')
        cleanedExpression = cleanedExpression.replace(/([+\-*/%])\s*([+\-*/%])/g, '$2');

        try {
            // Use a safe function scope for evaluation (better than direct eval)
            const result = Function('"use strict"; return (' + cleanedExpression + ')')();

            // *** CRITICAL FIX: Check result explicitly for Infinity (1/0) or NaN (0/0) ***
            if (result === Infinity || result === -Infinity) {
                // Modified error message for clarity
                throw new Error("Error");
            }

            if (isNaN(result)) {
                // If the result is NaN (Not a Number), it means an invalid operation occurred (like 0/0 or log(-1)).
                throw new Error("Invalid operation");
            }
            
            // Limit floating point precision for display
            return (Math.round(result * 1e10) / 1e10).toString();

        } catch (e) {
            // Re-throw known, friendly errors
            if (e.message.includes("Error! Inavlid operation") || e.message.includes("Invalid operation")) {
                throw e;
            }
            // Catch all other evaluation errors (syntax, etc.)
            throw new Error("Error! Inavlid operation");
        }
    }, []);

    // --- Input Handlers ---

    const handleInput = (value) => {
        setIsError(false);
        setError('');
        
        if (value === 'C') {
            setInput('');
            setLastQuestion('');
            return;
        }

        if (value === 'DEL') {
            setInput(prev => prev.slice(0, -1));
            return;
        }

        // Prevent multiple leading zeros unless followed by a decimal
        if (input === '0' && value !== '.') {
            setInput(value);
            return;
        }

        setInput(prev => prev + value);
    };

    const handleEqual = () => {
        if (!input) return;

        try {
            const result = safeEvaluate(input);
            const newEntry = `${input} = ${result}`;
            
            // Success path
            setHistory(prev => [...prev, newEntry]);
            setLastQuestion(input);
            setInput(result);
            setIsError(false);
            setError('');

        } catch (e) {
            // Error path
            setError(e.message);
            setIsError(true);
            setLastQuestion(input);
            setInput('');
        }
    };
    
    const clearHistory = () => setHistory([]);

    const handleKeyDown = useCallback((key) => {
        const allowedKeys = [...basicButtons.map(b => b.label), ...scientificButtons.map(b => b.label), 'Enter', 'Escape', 'Backspace'];
        if (!allowedKeys.includes(key) && !key.match(/[0-9]/)) return;

        if (key === 'Enter' || key === '=') {
            handleEqual();
        } else if (key === 'Escape' || key === 'C') {
            handleInput('C');
        } else if (key === 'Backspace') {
            handleInput('DEL');
        } else if (key !== 'DEL' && key !== 'C') {
            handleInput(key);
        }
    }, [handleEqual, handleInput]);

    useEffect(() => {
        if (mode === 'GRAPH') return;
        
        const handleKey = (e) => {
            if (e.defaultPrevented) return;
            e.preventDefault(); 
            handleKeyDown(e.key);
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleKeyDown, mode]);

    const handleButtonClick = (label) => {
        if (label === '=') {
            handleEqual();
        } else {
            handleInput(label);
        }
    };

    const shakeAnimation = isError ? {
        animate: 'shake',
        variants: { 
            shake: { 
                x: [0, -8, 8, -8, 8, 0], 
                transition: { duration: 0.4 } 
            } 
        }
    } : {};

    const renderContent = () => {
        if (mode === 'GRAPH') {
            return <GraphMode />;
        }

        const currentButtons = mode === 'SCIENTIFIC' ? scientificButtons : basicButtons;
        const gridCols = mode === 'SCIENTIFIC' ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-4';
        
        return (
            <>
                {/* Display */}
                <motion.div
                    {...(mode !== 'GRAPH' && shakeAnimation)}
                    className={`mb-4 p-4 rounded-2xl ${THEME.GLASS_BASE} ${THEME.GLASS_BORDER} h-auto min-h-[100px]
                                 border-4 ${isError ? 'border-rose-600/60' : 'border-sky-400/30'}
                                 shadow-inner-shadow transition-all duration-300`}
                >
                    {/* Last Question/Error in secondary area */}
                    <div className="h-6 text-right px-1 text-sm font-mono flex justify-end items-center">
                        <span className="text-gray-400 text-lg truncate">
                            {/* When an error occurs, show the original input */}
                            {isError ? lastQuestion : lastQuestion || ''}
                        </span>
                    </div>
                    {/* Input/Result in Main area - Responsive font size */}
                    <div className={`w-full text-right p-1 overflow-x-auto whitespace-nowrap font-sans font-extralight
                                 ${isError ? `${THEME.ACCENT_RED} text-3xl sm:text-3xl font-semibold` : `${THEME.TEXT_PRIMARY} text-5xl sm:text-4xl lg:text-4xl`}`}>
                        {/* Display the error message prominently, otherwise display the current input/result */}
                        {isError ? error : (input || '0')}
                    </div>
                </motion.div>

                {/* Buttons */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`grid ${gridCols} gap-3 sm:gap-4`}
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
            </>
        );
    };

    const graphModeHeightClasses = 'lg:h-[calc(100vh-6rem)]';
    
    return (
        <div className={`flex flex-col lg:flex-row lg:gap-8 w-full max-w-7xl items-start justify-center `}>
        <div className={`w-full p-4 rounded-2xl ${THEME.GLASS_BASE} 
                        ${THEME.GLASS_BORDER} shadow-2xl
                        ${mode === 'GRAPH' ? 'h-[calc(100vh-8rem)]' : ''}`}>
            <div className={`h-full flex flex-col ${mode === 'GRAPH' ? 'overflow-hidden' : ''}`}>
                <ModeSwitcher currentMode={mode} onModeChange={setMode} />
                <div className="flex-1 overflow-hidden">
                    {renderContent()}
                </div>
            </div>
        </div>

            {/* History Panel */}
            {mode !== 'GRAPH' && (
                <div className="w-full lg:w-auto">
                    <HistoryPanel history={history} clearHistory={clearHistory} />
                </div>
            )}
        </div>
    );
};

export default Calculator;
