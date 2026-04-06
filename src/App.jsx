import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Records from './components/Records'
import Users from './components/Users'
import UserAnalytics from './components/UserAnalytics'
import BackgroundAnimation from './components/BackgroundAnimation'
import FinancialAnimations from './components/FinancialAnimations'
import './index.css'

function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard')
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token with backend
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {
        localStorage.removeItem('token')
      })
    }
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    localStorage.setItem('token', token)
  }

  const handleViewChange = (view) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentView(view)
      setIsTransitioning(false)
    }, 200)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    setCurrentView('dashboard')
  }

  if (!user) {
    return (
      <div className="app">
        <BackgroundAnimation />
        <FinancialAnimations />
        <Login onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div className="app">
      <BackgroundAnimation />
      <FinancialAnimations />
      <header className="header">
        <h1 style={{ margin: '0', animation: 'slideInLeft 0.5s ease-out' }}>
          💰 Zorvyn Finance Dashboard
        </h1>
        <nav className="nav">
          <button 
            onClick={() => handleViewChange('dashboard')}
            style={{ 
              opacity: currentView === 'dashboard' ? 1 : 0.7,
              fontWeight: currentView === 'dashboard' ? 'bold' : 'normal'
            }}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => handleViewChange('records')}
            style={{ 
              opacity: currentView === 'records' ? 1 : 0.7,
              fontWeight: currentView === 'records' ? 'bold' : 'normal'
            }}
          >
            💰 Records
          </button>
          {user.role === 'admin' && (
            <button 
              onClick={() => handleViewChange('users')}
              style={{ 
                opacity: currentView === 'users' ? 1 : 0.7,
                fontWeight: currentView === 'users' ? 'bold' : 'normal'
              }}
            >
              👥 Users
            </button>
          )}
          {(user.role === 'admin' || user.role === 'owner') && (
            <button 
              onClick={() => handleViewChange('analytics')}
              style={{ 
                opacity: currentView === 'analytics' ? 1 : 0.7,
                fontWeight: currentView === 'analytics' ? 'bold' : 'normal'
              }}
            >
              📈 Analytics
            </button>
          )}
          <button 
            onClick={handleLogout}
            style={{ backgroundColor: '#e74c3c' }}
            title="Logout"
          >
            🚪 Exit
          </button>
        </nav>
      </header>
      <main className="main" style={{ opacity: isTransitioning ? 0.5 : 1, transition: 'opacity 0.2s ease' }}>
        {currentView === 'dashboard' && <Dashboard user={user} />}
        {currentView === 'records' && <Records user={user} />}
        {currentView === 'users' && user.role === 'admin' && <Users />}
        {currentView === 'analytics' && (user.role === 'admin' || user.role === 'owner') && <UserAnalytics user={user} />}
      </main>
    </div>
  )
}

export default App