/**
 * @fileoverview Application Entry Point
 * @description Mounts the root React component into the DOM.
 *              Renders inside React.StrictMode for development warnings.
 *              Imports global Tailwind CSS styles from index.css.
 *
 * @module main
 */
import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Small overlay component to show global JS errors instead of a blank page
function GlobalErrorOverlay({ error }) {
  if (!error) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',color:'#fff',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{maxWidth:900,background:'#111',padding:20,borderRadius:8}}>
        <h2 style={{margin:0,fontSize:18}}>An unexpected error occurred</h2>
        <pre style={{whiteSpace:'pre-wrap',marginTop:10,fontSize:12,color:'#f9f9f9'}}>{String(error)}</pre>
        <p style={{marginTop:8,opacity:0.8}}>Try disabling browser extensions (adblockers) or reload the page.</p>
      </div>
    </div>
  );
}

function Root() {
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => {
    const onError = (event) => {
      try {
        const err = event?.error || event?.message || String(event);
        console.error('Global error captured', event);
        setGlobalError(err);
      } catch (e) {
        setGlobalError('Unknown error');
      }
    };

    const onRejection = (ev) => {
      console.error('Unhandled promise rejection', ev);
      setGlobalError(ev?.reason || String(ev));
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return (
    <>
      <StrictMode>
        <App />
      </StrictMode>
      <GlobalErrorOverlay error={globalError} />
    </>
  );
}

try {
  createRoot(document.getElementById('root')).render(<Root />);
} catch (e) {
  // Fallback if render throws synchronously
  console.error('Fatal render error', e);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding:24px;color:#111;background:#fff">Fatal error: ${String(e)}</div>`;
  }
}
