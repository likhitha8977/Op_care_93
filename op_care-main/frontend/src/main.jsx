import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './styles/global.css'
import { UserProvider } from './context/UserContext.jsx';

// Simple error boundary to reveal runtime errors during development
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Runtime error caught by ErrorBoundary:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '16px', color: '#b00020', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
          <h2>Application Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Mount log to verify client boot
// eslint-disable-next-line no-console
console.log('Bootstrapping React application...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
)
