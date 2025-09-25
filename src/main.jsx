import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ConfirmProvider } from './confirm/index.jsx'

createRoot(document.getElementById('root')).render(
    <>
        <ConfirmProvider>
            <BrowserRouter basename='/freelance-apps-hub'>
                <App />
            </BrowserRouter>
        </ConfirmProvider>
    </>,
)
