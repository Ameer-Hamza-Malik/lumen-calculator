import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, Clock3, Delete, Divide, History, Moon, RotateCcw, Sun, Zap } from 'lucide-react';
import './styles.css';

const keys = [
  ['AC', 'control'], ['+/-', 'control'], ['%', 'control'], ['/', 'operator'],
  ['7', 'number'], ['8', 'number'], ['9', 'number'], ['*', 'operator'],
  ['4', 'number'], ['5', 'number'], ['6', 'number'], ['-', 'operator'],
  ['1', 'number'], ['2', 'number'], ['3', 'number'], ['+', 'operator'],
  ['0', 'zero'], ['.', 'number'], ['=', 'equals']
];

function calculate(expression) {
  const cleaned = expression.replace(/x/g, '*').replace(/[^0-9+\-*/%.() ]/g, '');
  if (!cleaned || !/[0-9]/.test(cleaned)) return '';
  try {
    const result = Function(`"use strict"; return (${cleaned})`)();
    if (!Number.isFinite(result)) return 'Error';
    return String(Number(result.toFixed(10)));
  } catch {
    return 'Error';
  }
}

function App() {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('lumen-history') || '[]'));
  const [dark, setDark] = useState(false);
  const [memory, setMemory] = useState(0);

  useEffect(() => localStorage.setItem('lumen-history', JSON.stringify(history)), [history]);

  const commit = async () => {
    if (!expression) return;
    const result = calculate(expression);
    if (result === 'Error' || !result) { setDisplay('Error'); return; }
    const item = { expression: expression.replace(/\*/g, ' x '), result, id: Date.now() };
    setDisplay(result);
    setHistory((current) => [item, ...current].slice(0, 8));
    setExpression(result);
    fetch('/api/calculations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expression: item.expression, result }) }).catch(() => {});
  };

  const press = (key) => {
    if (key === 'AC') { setExpression(''); setDisplay('0'); return; }
    if (key === '=') { commit(); return; }
    if (key === '+/-') { setExpression((current) => current.startsWith('-') ? current.slice(1) : `-${current}`); return; }
    if (key === '%') { setExpression((current) => current ? `(${current}/100)` : ''); return; }
    if (key === '⌫') { setExpression((current) => current.slice(0, -1)); return; }
    if (['+', '-', '*', '/'].includes(key)) {
      setExpression((current) => current && !/[+\-*/]$/.test(current) ? `${current}${key}` : current);
      return;
    }
    setExpression((current) => current === '0' ? key : `${current}${key}`);
  };

  useEffect(() => {
    const handleKey = (event) => {
      const key = event.key;
      if (/^[0-9.]$/.test(key)) press(key);
      if (['+', '-', '*', '/'].includes(key)) press(key);
      if (key === 'Enter' || key === '=') press('=');
      if (key === 'Escape') press('AC');
      if (key === 'Backspace') press('⌫');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  useEffect(() => { setDisplay(expression || '0'); }, [expression]);

  return <main className={dark ? 'app dark' : 'app'}>
    <div className="grain" />
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><Zap size={16} fill="currentColor" /></span><span>LUMEN<span className="muted">/</span>CALC</span></div>
      <div className="top-actions"><span className="status"><i /> API ONLINE</span><button className="icon-button" aria-label="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button></div>
    </header>
    <section className="workspace">
      <div className="calculator-panel">
        <div className="eyebrow"><span>Personal arithmetic instrument</span><span>v. 02.26</span></div>
        <div className="display-area">
          <div className="expression-line">{expression ? expression.replace(/\*/g, ' x ').replace(/\//g, ' ÷ ') : 'Ready when you are'}</div>
          <div className="display-value">{display}</div>
        </div>
        <div className="memory-row"><span>MEMORY <b>{memory}</b></span><div><button onClick={() => setMemory(Number(display) || 0)}>M+</button><button onClick={() => setExpression(String(memory))}>MR</button><button onClick={() => setMemory(0)}>MC</button></div></div>
        <div className="keypad">
          {keys.map(([key, type]) => <button key={key} className={`key ${type}`} onClick={() => press(key)}>{key === '/' ? <Divide size={20} /> : key === '⌫' ? <Delete size={19} /> : key}</button>)}
          <button className="key control backspace" onClick={() => press('⌫')} aria-label="Backspace"><Delete size={19} /></button>
        </div>
      </div>
      <aside className="history-panel">
        <div className="history-heading"><div><span className="section-kicker"><Clock3 size={14} /> RECENT ACTIVITY</span><h1>Small steps,<br /><em>big clarity.</em></h1></div><History size={22} /></div>
        <p className="intro">Your latest calculations live here, quietly ready for another look.</p>
        <div className="history-list">{history.length ? history.map((item) => <button className="history-item" key={item.id} onClick={() => setExpression(item.result)}><span>{item.expression}</span><strong>= {item.result}</strong><ArrowUpRight size={15} /></button>) : <div className="empty-history">No calculations yet.<br />Your rhythm will appear here.</div>}</div>
        {history.length > 0 && <button className="clear-history" onClick={() => setHistory([])}><RotateCcw size={14} /> Clear activity</button>}
        <div className="tip"><span className="tip-icon">i</span><span><b>Quick tip</b><br />Use your keyboard for a faster flow.</span></div>
      </aside>
    </section>
    <footer><span>BUILT FOR FOCUS</span><span className="footer-line" /><span>© LUMEN STUDIO</span></footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
