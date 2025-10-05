import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons imported from lucide-react to prevent compilation errors
import { X, RotateCcw, Send, Target } from 'lucide-react'; 
import { Chart } from 'chart.js/auto';

// Function to safely evaluate mathematical expressions (FUNCTION KEPT AS IS)
const evaluateFunction = (funcString, x) => {
    // ... (logic remains unchanged)
    if (!funcString || typeof funcString !== 'string') return undefined;
    
    let expression = funcString.trim()
        .replace(/\^/g, '**')
        .replace(/π/g, 'Math.PI')
        .replace(/\bpi\b/gi, 'Math.PI')
        .replace(/\be\b/gi, 'Math.E');

    const fnMap = {
        'sin': 'Math.sin',
        'cos': 'Math.cos',
        'tan': 'Math.tan',
        'log': 'Math.log10',
        'ln': 'Math.log',
        'sqrt': 'Math.sqrt',
        'abs': 'Math.abs'
    };

    Object.entries(fnMap).forEach(([key, value]) => {
        // Regex ensures we only replace function names followed by an open parenthesis
        const regex = new RegExp(`\\b${key}\\s*\\(`, 'gi'); 
        expression = expression.replace(regex, `${value}(`);
    });

    try {
        // Use the Function constructor for safe dynamic expression evaluation
        const fn = new Function('x', `return ${expression}`);
        const result = fn(x);
        // Only return if the result is a finite number
        return isFinite(result) ? result : undefined;
    } catch (err) {
        return undefined;
    }
};

const colors = ['#50D7D7', '#4F94D4', '#EF4444', '#A73BFF', '#FFD700'];

// GraphSettings Component (LOGIC KEPT AS IS)
const GraphSettings = ({ settings, onSettingsChange }) => {
    // ... (component logic remains unchanged)
    return (
        <div className="border-t border-zinc-700/60 mt-4 pt-4 text-white">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sky-400 text-sm font-semibold tracking-wider uppercase">Graph Settings</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    {/* Custom-styled checkbox */}
                    <input
                        type="checkbox"
                        checked={settings.showGrid}
                        onChange={e => onSettingsChange({ showGrid: e.target.checked })}
                        className="w-4 h-4 rounded appearance-none border border-sky-400/50 bg-zinc-700 checked:bg-sky-500 checked:border-sky-500 transition duration-150 shrink-0"
                    />
                    Show Grid
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings.showLegend}
                        onChange={e => onSettingsChange({ showLegend: e.target.checked })}
                        className="w-4 h-4 rounded appearance-none border border-sky-400/50 bg-zinc-700 checked:bg-sky-500 checked:border-sky-500 transition duration-150 shrink-0"
                    />
                    Show Legend
                </label>
                
                <div className="col-span-2 space-y-2">
                    <label className="text-sm block text-gray-300">X Range</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            value={settings.xRange[0]}
                            onChange={e => onSettingsChange({ 
                                xRange: [parseFloat(e.target.value), settings.xRange[1]]
                            })}
                            className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                        />
                        <span className='text-gray-400'>to</span>
                        <input
                            type="number"
                            value={settings.xRange[1]}
                            onChange={e => onSettingsChange({ 
                                xRange: [settings.xRange[0], parseFloat(e.target.value)]
                            })}
                            className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                        />
                    </div>
                </div>

                <div className="col-span-2 space-y-2">
                    <label className="text-sm block text-gray-300">Y Range</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            value={settings.yRange[0]}
                            onChange={e => onSettingsChange({ 
                                yRange: [parseFloat(e.target.value), settings.yRange[1]]
                            })}
                            className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                        />
                        <span className='text-gray-400'>to</span>
                        <input
                            type="number"
                            value={settings.yRange[1]}
                            onChange={e => onSettingsChange({ 
                                yRange: [settings.xRange[0], parseFloat(e.target.value)]
                            })}
                            className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// GraphMode Component (DESIGN UPDATED, LOGIC KEPT AS IS)
const GraphMode = () => {
    // State and Functions (KEPT AS IS)
    const [equations, setEquations] = useState([{ id: 1, text: 'x', color: colors[0] }]);
    const [newEquationText, setNewEquationText] = useState('');
    const [graphError, setGraphError] = useState(null);
    const [graphSettings, setGraphSettings] = useState({
        showGrid: true,
        showLegend: true,
        xRange: [-20, 20],
        yRange: [-20, 20],
        pointDensity: 0.1
    });
    const chartRef = useRef(null);
    const canvasRef = useRef(null);

    const generateDatasets = useCallback(() => {
        // ... (logic remains unchanged)
        const xMin = graphSettings.xRange[0];
        const xMax = graphSettings.xRange[1];
        const step = graphSettings.pointDensity;

        const numSteps = Math.ceil((xMax - xMin) / step);

        return equations.map((eq) => {
            const points = [];
            for (let i = 0; i <= numSteps; i++) {
                const x = xMin + i * step; 
                
                const y = evaluateFunction(eq.text, x);
                if (y !== undefined && y >= graphSettings.yRange[0] && y <= graphSettings.yRange[1]) {
                    points.push({ x: parseFloat(x.toFixed(6)), y: y });
                }
            }
            return {
                label: `y = ${eq.text}`,
                data: points,
                borderColor: eq.color,
                backgroundColor: eq.color,
                borderWidth: 2, 
                pointRadius: 0, 
                tension: 0.1, 
                fill: false
            };
        });
    }, [equations, graphSettings]);

    const updateChart = useCallback(() => {
        // ... (logic remains unchanged)
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: generateDatasets()
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 400 
                },
                elements: {
                    line: {
                        borderCapStyle: 'round'
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center',
                        min: graphSettings.xRange[0],
                        max: graphSettings.xRange[1],
                        grid: {
                            display: graphSettings.showGrid,
                            color: 'rgba(79, 148, 212, 0.15)', 
                            lineWidth: 1
                        },
                        ticks: {
                            color: '#E5E7EB',
                            maxTicksLimit: 11
                        },
                        border: {
                            color: '#4F94D4' 
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'center',
                        min: graphSettings.yRange[0],
                        max: graphSettings.yRange[1],
                        grid: {
                            display: graphSettings.showGrid,
                            color: 'rgba(79, 148, 212, 0.15)',
                            lineWidth: 1
                        },
                        ticks: {
                            color: '#E5E7EB',
                            maxTicksLimit: 11
                        },
                        border: {
                            color: '#4F94D4'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: graphSettings.showLegend,
                        position: 'top',
                        labels: {
                            color: '#E5E7EB',
                            font: {
                                family: 'Inter, monospace',
                                size: 14,
                                weight: '500'
                            },
                            padding: 15,
                            boxWidth: 15,
                            usePointStyle: true,
                            pointStyle: 'rectRounded'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        titleColor: '#E5E7EB',
                        bodyColor: '#D1D5DB',
                        borderColor: '#4F94D4',
                        borderWidth: 1,
                        displayColors: true,
                        boxPadding: 4,
                        callbacks: {
                            title: (tooltipItems) => {
                                return `x: ${tooltipItems[0].parsed.x.toFixed(4)}`;
                            },
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += `y: ${context.parsed.y.toFixed(4)}`;
                                }
                                return label;
                            }
                        }
                    }
                },
            }
        });
    }, [generateDatasets, graphSettings]);

    useEffect(() => {
        updateChart();
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [equations.length, updateChart]);

    const addEquation = () => {
        // ... (logic remains unchanged)
        const text = newEquationText.trim();
        if (!text) return;
        
        if (equations.length >= 5) {
            setGraphError('Maximum of 5 equations reached. Please remove one to add another.');
            return;
        }

        const testValue = evaluateFunction(text, 2);
        if (testValue === undefined) {
             setGraphError(`Invalid function: could not evaluate 'y = ${text}'. Check syntax (e.g., missing '*' or unmatched brackets).`);
             return;
        }
        
        const newId = Date.now();
        const newEq = { 
            id: newId, 
            text: text, 
            color: colors[equations.length % colors.length] 
        };
        setEquations(prev => [...prev, newEq]);
        setNewEquationText('');
        setGraphError(null);
    };

    const removeEquation = useCallback((id) => {
        setEquations(prev => prev.filter(eq => eq.id !== id));
        setGraphError(null);
    }, []);

    const clearGraph = () => {
        setEquations([]);
        setGraphError(null);
        setNewEquationText('');
    };

    const handleSettingsChange = (newSettings) => {
        setGraphSettings(prev => ({
            ...prev,
            ...newSettings
        }));
    };

return (
    // Main container with fixed height and proper overflow handling
    <div className="w-full h-full flex flex-col lg:flex-row gap-4">
        {/* Left Panel - Control Section */}
        <div className="w-full lg:w-80 h-full flex flex-col overflow-hidden">
            {/* Scrollable content container */}
            <div className="flex-1 overflow-y-auto">
                <div className="bg-zinc-800/90 rounded-xl border border-sky-400/30 shadow-xl p-4">
                    {/* Function Input Section */}
                    <div className="mb-4">
                        <h3 className="text-white text-lg font-bold mb-3 pb-2 border-b border-zinc-700/60">
                            Function Input
                        </h3>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sky-400 font-mono whitespace-nowrap">y =</span>
                            <div className="flex-1 flex items-center gap-2 min-w-0">
                                <input
                                    type="text"
                                    value={newEquationText}
                                    onChange={(e) => setNewEquationText(e.target.value)}
                                    placeholder="x^2, sin(x), log(x)"
                                    className="w-full p-2 rounded bg-zinc-700 border border-zinc-600 
                                             text-white font-mono focus:border-sky-400 focus:outline-none truncate"
                                    onKeyDown={(e) => { if (e.key === 'Enter') addEquation(); }}
                                />
                                <button
                                    onClick={addEquation}
                                    className="p-2 bg-sky-500 rounded-lg text-white hover:bg-sky-400 
                                             transition shrink-0"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Functions List - Scrollable */}
                    {equations.length > 0 && (
                        <div className="mb-4 border-t border-zinc-700/60 pt-4">
                            <h4 className="text-gray-300 text-sm mb-2">Active Functions:</h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                {equations.map((eq) => (
                                    <div
                                        key={eq.id}
                                        className="flex justify-between items-center p-2 rounded 
                                                 bg-zinc-700/50 border border-zinc-600"
                                    >
                                        <span className="font-mono text-sm truncate mr-2" style={{ color: eq.color }}>
                                            y = {eq.text}
                                        </span>
                                        <button 
                                            onClick={() => removeEquation(eq.id)}
                                            className="text-red-400/80 hover:text-red-400 transition shrink-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Graph Settings */}
                    <GraphSettings 
                        settings={graphSettings}
                        onSettingsChange={handleSettingsChange}
                    />

                    {/* Action Buttons */}
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={clearGraph}
                            className="flex items-center px-4 py-2 text-red-400 border border-red-400/50 
                                     rounded-lg hover:bg-red-400/10 transition"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" /> Clear
                        </button>
                    </div>

                    {/* Error Message */}
                    {graphError && (
                        <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 
                                      rounded-lg text-red-400 text-sm">
                            {graphError}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Panel - Graph Section */}
        <div className="flex-1 h-full min-h-0 bg-zinc-800/90 rounded-xl border border-sky-400/30 
                      shadow-xl p-4 flex flex-col overflow-hidden">
            <h3 className="text-white text-lg font-bold mb-3 pb-2 border-b border-zinc-700/60 shrink-0">
                Plot Output
            </h3>
            <div className="flex-1 w-full relative">
                <canvas ref={canvasRef} className="w-full h-full" />
            </div>
        </div>
    </div>
);
};

export default GraphMode;