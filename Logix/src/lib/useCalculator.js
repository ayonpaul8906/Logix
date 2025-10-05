import { useState, useCallback, useEffect } from 'react';

const isOperator = (char) => ['+', '-', '*', '/', '%', '^'].includes(char);

// CRITICAL: Ensure correct JS Math function names and single parentheses.
const scientificMap = {
  'sin(': 'Math.sin(',
  'cos(': 'Math.cos(',
  'tan(': 'Math.tan(',
  'log(': 'Math.log10(', // Base 10 log
  'ln(': 'Math.log(',     // Natural log (ln)
  'sqrt(': 'Math.sqrt(',
  'π': 'Math.PI',
  '^': '**', 
};

export const useCalculator = () => {
  const [history, setHistory] = useState(() => {
    try {
      const storedHistory = localStorage.getItem('logix_history');
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('logix_history', JSON.stringify(history));
    } catch (e) {
      console.error("Could not save history to Local Storage", e);
    }
  }, [history]);

  const [input, setInput] = useState('0');
  const [error, setError] = useState(null);
  const [isError, setIsError] = useState(false);

  const calculate = useCallback((expression) => {
    let formattedExpression = expression.replace(/%/g, '/100*');
    
    // 1. Replace scientific function symbols and exponents
    // escape regex special chars in keys (so '^' etc. don't become anchors)
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    Object.keys(scientificMap).forEach(key => {
      const jsEquivalent = scientificMap[key];
      const regex = new RegExp(escapeRegex(key), 'g');
      formattedExpression = formattedExpression.replace(regex, jsEquivalent);
    });

    // 2. Insert implied multiplication 
    formattedExpression = formattedExpression
        // Insert * between a number or ) and a Math function (M), π, or (
        .replace(/([\d\)])(M)/g, '$1*$2') // Handle e.g., 5Math.sin
        .replace(/([\d\)])(Math\.PI|\()/g, '$1*$2') // Handle e.g., 5( or 5π
        // Insert * between ) and a number
        .replace(/\)([\d])/g, ')*$1')
        // Insert * between π and a number or (
        .replace(/Math\.PI([\d(])/g, 'Math.PI*$1');

    // Final check for trailing operators
    if (isOperator(formattedExpression.slice(-1))) {
      return { result: 'Error', error: 'Invalid Expression' };
    }

    try {
      // Replace the displayed π with Math.PI for evaluation (after implicit multiplication)
      formattedExpression = formattedExpression.replace(/π/g, 'Math.PI');
      
      const result = new Function(`return ${formattedExpression}`)();

      if (!isFinite(result)) {
        return { result: 'Error', error: 'Division by Zero' };
      }

      const finalResult = parseFloat(result.toFixed(10)).toString();
      return { result: finalResult, error: null };
    } catch (e) {
      //console.error("Calculation Error:", e);
      return { result: 'Error', error: 'Invalid Expression' };
    }
  }, []);
  
  // The rest of the hook (handleInput, handleEqual, handleKeyDown, clearHistory) remains correct.

  const handleInput = useCallback((value) => {
    if (isError) {
      setInput('0');
      setError(null);
      setIsError(false);
    }

    const lastChar = input.slice(-1);

    if (value === 'C') {
      setInput('0');
      setError(null);
      setIsError(false);
      return;
    }

    if (value === 'DEL') {
      if (input.length === 1 || input === 'Error') {
        setInput('0');
      } else {
        setInput(prev => prev.slice(0, -1));
      }
      return;
    }

    if (value === '.') {
      const parts = input.split(/[\+\-\*\/%^]/); // Added ^ to separators
      if (parts[parts.length - 1].includes('.')) return;
      
      if (isOperator(lastChar)) {
          setInput(prev => prev + '0.');
          return;
      }
    }
    
    // Handling Scientific Functions
    if (['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt(', '('].includes(value)) {
        // If the whole input is exactly "0", replace it with the function (fixes 0cos(...) issue)
        if (input === '0') {
            setInput(value);
            return;
        }
        // If previous char was a number or ), treat as potential implicit multiplication and append
        if (lastChar === ')' || /[0-9π]/.test(lastChar)) {
            setInput(prev => prev + value); 
        } else {
            // Otherwise append (handles cases like starting with '(' after negative sign etc.)
            setInput(prev => prev + value);
        }
        return;
    }
    
    if (value === 'π') {
        if (input === '0' || isOperator(lastChar) || lastChar === '(') {
            setInput(prev => (prev === '0' ? value : prev + value));
        } else {
            setInput(prev => prev + value);
        }
        return;
    }

    if (value === ')') {
        const openCount = (input.match(/\(/g) || []).length;
        const closeCount = (input.match(/\)/g) || []).length;
        if (openCount > closeCount) {
            setInput(prev => prev + value);
        }
        return;
    }
    
    if (isOperator(value)) {
      if (isOperator(lastChar)) {
        if (value === '-' && lastChar !== value) {
            setInput(prev => prev + value);
        } else if (value === '-' && lastChar === value) {
             return;
        } else {
            setInput(prev => prev.slice(0, -1) + value);
        }
        return;
      }
    }

    if (input === '0' && value !== '.' && !isOperator(value)) {
      setInput(value);
    } else {
      setInput(prev => prev + value);
    }
  }, [input, isError]);

  const handleEqual = useCallback(() => {
    if (isError) return;

    let expression = input;
    const openCount = (expression.match(/\(/g) || []).length;
    const closeCount = (expression.match(/\)/g) || []).length;
    
    if (openCount > closeCount) {
        const diff = openCount - closeCount;
        expression += ')'.repeat(diff);
    }

    const { result, error } = calculate(expression);

    if (error) {
      setInput('Error');
      setError(error);
      setIsError(true);
    } else {
      setInput(result);
      setError(null);
      setIsError(false);
      
      // Cleanup for history display
      const historyExpression = expression
        .replace(/Math\.(sin|cos|tan|log10|log|sqrt)/g, (match) => match.replace('Math.', ''))
        .replace(/log10/g, 'log')
        .replace(/log/g, 'ln')
        .replace(/\*\*/g, '^');

      const newHistoryItem = `${historyExpression} = ${result}`;
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 5));
    }
  }, [input, isError, calculate]);

  const clearHistory = () => {
    setHistory([]);
  };

  const handleKeyDown = useCallback((key) => {
    if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', '%', '^'].includes(key)) {
      handleInput(key);
    } else if (key === 'Enter' || key === '=') {
      handleEqual();
    } else if (key === 'Backspace') {
      handleInput('DEL');
    } else if (key === 'Escape') {
      handleInput('C');
    }
  }, [handleInput, handleEqual]);

  return {
    input,
    history,
    error,
    isError,
    handleInput,
    handleEqual,
    handleKeyDown,
    clearHistory,
  };
};