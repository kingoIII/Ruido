import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

console.log('Main.tsx loaded')

const rootElement = document.getElementById('root')
console.log('Root element:', rootElement)

if (rootElement) {
  try {
    const root = createRoot(rootElement)
    console.log('Root created')
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
    console.log('App rendered')
  } catch (error) {
    console.error('Error rendering app:', error)
  }
} else {
  console.error('Root element not found')
}

