import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiRefreshCcw, FiSend } from 'react-icons/fi';
import { Chart } from 'chart.js/auto';

// Function to safely evaluate mathematical expressions
const evaluateFunction = (funcString, x) => {
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
        const regex = new RegExp(`\\b${key}\\s*\\(`, 'gi');
        expression = expression.replace(regex, `${value}(`);
    });

    try {
        const fn = new Function('x', `return ${expression}`);
        const result = fn(x);
        return isFinite(result) ? result : undefined;
    } catch (err) {
        return undefined;
    }
};

const colors = ['#50D7D7', '#4F94D4', '#EF4444', '#A73BFF', '#FFD700'];

const GraphSettings = ({ settings, onSettingsChange }) => {
    return (
        <div className="border-t border-glass-border mt-4 pt-4 text-white">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-gray-400 text-sm">Graph Settings</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={settings.showGrid}
                        onChange={e => onSettingsChange({ showGrid: e.target.checked })}
                        className="rounded border-glass-border"
                    />
                    Show Grid
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={settings.showLegend}
                        onChange={e => onSettingsChange({ showLegend: e.target.checked })}
                        className="rounded border-glass-border"
                    />
                    Show Legend
                </label>
                <div className="col-span-2">
                    <label className="text-sm block mb-1">Point Density</label>
                    <input
                        type="range"
                        min="0.01"
                        max="0.5"
                        step="0.01"
                        value={settings.pointDensity}
                        onChange={e => onSettingsChange({ pointDensity: parseFloat(e.target.value) })}
                        className="w-full"
                    />
                </div>
                <div className="col-span-2">
                    <label className="text-sm block mb-1">X Range</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            value={settings.xRange[0]}
                            onChange={e => onSettingsChange({ 
                                xRange: [parseFloat(e.target.value), settings.xRange[1]]
                            })}
                            className="w-24 p-1 bg-primary-dark border border-glass-border rounded text-sm"
                        />
                        <span>to</span>
                        <input
                            type="number"
                            value={settings.xRange[1]}
                            onChange={e => onSettingsChange({ 
                                xRange: [settings.xRange[0], parseFloat(e.target.value)]
                            })}
                            className="w-24 p-1 bg-primary-dark border border-glass-border rounded text-sm"
                        />
                    </div>
                </div>
                <div className="col-span-2">
                    <label className="text-sm block mb-1">Y Range</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            value={settings.yRange[0]}
                            onChange={e => onSettingsChange({ 
                                yRange: [parseFloat(e.target.value), settings.yRange[1]]
                            })}
                            className="w-24 p-1 bg-primary-dark border border-glass-border rounded text-sm"
                        />
                        <span>to</span>
                        <input
                            type="number"
                            value={settings.yRange[1]}
                            onChange={e => onSettingsChange({ 
                                yRange: [settings.yRange[0], parseFloat(e.target.value)]
                            })}
                            className="w-24 p-1 bg-primary-dark border border-glass-border rounded text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const GraphMode = () => {
    const [equations, setEquations] = useState([{ id: 1, text: 'x', color: colors[0] }]);
    const [newEquationText, setNewEquationText] = useState('');
    const [graphError, setGraphError] = useState(null);
    const [graphSettings, setGraphSettings] = useState({
        showGrid: true,
        showLegend: true,
        xRange: [-10, 10],
        yRange: [-10, 10],
        pointDensity: 0.1
    });
    const chartRef = useRef(null);
    const canvasRef = useRef(null);

    const generateDatasets = useCallback(() => {
        return equations.map((eq, index) => {
            const points = [];
            for (
                let x = graphSettings.xRange[0]; 
                x <= graphSettings.xRange[1]; 
                x += graphSettings.pointDensity
            ) {
                const y = evaluateFunction(eq.text, x);
                if (y !== undefined && y >= graphSettings.yRange[0] && y <= graphSettings.yRange[1]) {
                    points.push({ x, y });
                }
            }
            return {
                label: `y = ${eq.text}`,
                data: points,
                borderColor: eq.color,
                backgroundColor: eq.color,
                tension: 0.4,
                fill: false
            };
        });
    }, [equations, graphSettings]);

    const updateChart = useCallback(() => {
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: generateDatasets()
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center',
                        min: graphSettings.xRange[0],
                        max: graphSettings.xRange[1],
                        grid: {
                            display: graphSettings.showGrid,
                            color: 'rgba(79, 148, 212, 0.1)'
                        },
                        ticks: {
                            color: '#E5E7EB',
                            maxTicksLimit: 11
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'center',
                        min: graphSettings.yRange[0],
                        max: graphSettings.yRange[1],
                        grid: {
                            display: graphSettings.showGrid,
                            color: 'rgba(79, 148, 212, 0.1)'
                        },
                        ticks: {
                            color: '#E5E7EB',
                            maxTicksLimit: 11
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
                                family: 'monospace'
                            },
                            padding: 10
                        }
                    }
                },
                animation: {
                    duration: 300
                }
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
    }, [equations, updateChart]);

    const addEquation = () => {
        if (!newEquationText.trim()) return;
        if (equations.length >= 5) {
            setGraphError('Maximum of 5 equations reached.');
            return;
        }
        
        const newId = Date.now();
        const newEq = { 
            id: newId, 
            text: newEquationText, 
            color: colors[equations.length % colors.length] 
        };
        setEquations(prev => [...prev, newEq]);
        setNewEquationText('');
        setGraphError(null);
    };

    const removeEquation = useCallback((id) => {
        setEquations(prev => prev.filter(eq => eq.id !== id));
    }, []);

    const clearGraph = () => {
        setEquations([{ id: 1, text: 'x', color: colors[0] }]);
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
        <div className="w-full min-h-screen p-4 flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-80 lg:w-96 shrink-0">
                <div className="w-full p-4 rounded-xl bg-secondary-dark/60 border border-glass-border shadow-soft-glow sticky top-4">
                    <h3 className="text-white text-lg font-bold mb-3 border-b border-glass-border pb-2">
                        Function Input (y = f(x))
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-accent-green font-mono shrink-0">y =</span>
                        <div className="flex-1 flex items-center gap-2">
                            <input
                                type="text"
                                value={newEquationText}
                                onChange={(e) => setNewEquationText(e.target.value)}
                                placeholder="x^2, sin(x), log(x)"
                                className="w-full p-2 rounded bg-primary-dark border border-accent-blue/30 
                                         text-white font-mono focus:border-accent-blue focus:outline-none"
                                onKeyDown={(e) => { if (e.key === 'Enter') addEquation(); }}
                            />
                            <motion.button
                                onClick={addEquation}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 bg-accent-blue rounded-lg text-white hover:bg-accent-blue/80 
                                         transition shrink-0"
                            >
                                <FiSend className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>

                    {equations.length > 0 && (
                        <div className="mt-4 border-t border-glass-border pt-3">
                            <h4 className="text-gray-400 text-sm mb-2">Active Functions:</h4>
                            <AnimatePresence>
                                <div className="space-y-2">
                                    {equations.map((eq) => (
                                        <motion.div
                                            key={eq.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="flex justify-between items-center p-2 rounded bg-glass-bg border border-glass-border"
                                        >
                                            <span className="font-mono text-sm" style={{ color: eq.color }}>
                                                y = {eq.text}
                                            </span>
                                            <button 
                                                onClick={() => removeEquation(eq.id)}
                                                className="text-accent-red/70 hover:text-accent-red transition"
                                            >
                                                <FiX className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>
                        </div>
                    )}

                    <GraphSettings 
                        settings={graphSettings}
                        onSettingsChange={handleSettingsChange}
                    />

                    <div className="flex justify-end mt-4">
                        <motion.button
                            onClick={clearGraph}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center px-4 py-2 text-accent-red border border-accent-red/50 
                                     rounded-lg hover:bg-accent-red/10 transition"
                        >
                            <FiRefreshCcw className="w-4 h-4 mr-2" /> Reset
                        </motion.button>
                    </div>

                    {graphError && (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-accent-red text-sm mt-3"
                        >
                            {graphError}
                        </motion.p>
                    )}
                </div>
            </div>

            <div className="flex-1 h-[calc(100vh-8rem)] rounded-xl bg-secondary-dark/60 
                          border border-accent-blue/30 shadow-soft-glow overflow-hidden p-4">
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
};

export default GraphMode;