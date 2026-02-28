/**
 * @fileoverview Application Entry Point
 * @description Mounts the root React component into the DOM.
 *              Renders inside React.StrictMode for development warnings.
 *              Imports global Tailwind CSS styles from index.css.
 *
 * @module main
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
