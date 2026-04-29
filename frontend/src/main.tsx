import React from 'react'
import ReactDOM from 'react-dom/client'
import { Panel } from './panel/Panel'

// This entry point is mainly for the 'index.html' localized dev build.
// The content script will mount separately.
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Panel />
    </React.StrictMode>,
)
