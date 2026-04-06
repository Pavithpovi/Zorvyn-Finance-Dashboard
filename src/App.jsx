import { useState, useEffect } from 'react'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import OwnerDashboard from './components/OwnerDashboard'
import ViewerDashboard from './components/ViewerDashboard'
import Records from './components/Records'
import Users from './components/Users'
import UserAnalytics from './components/UserAnalytics'
import BackgroundAnimation from './components/BackgroundAnimation'
import FinancialAnimations from './components/FinancialAnimations'
import './index.css'

function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('home')
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
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
    setCurrentView('home')
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
    setCurrentView('home')
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

  const renderModule = () => {
    if (currentView === 'home') {
      if (user.role === 'admin') return <AdminDashboard user={user} />
      if (user.role === 'owner') return <OwnerDashboard user={user} />
      return <ViewerDashboard user={user} />
    }
    
    // Fallback/Legacy views
    if (currentView === 'records') return <Records user={user} />
    if (currentView === 'users' && user.role === 'admin') return <Users />
    if (currentView === 'analytics' && (user.role === 'admin' || user.role === 'owner')) return <UserAnalytics user={user} />
    
    return <Dashboard user={user} />
  }

  return (
    <div className="app">
      <BackgroundAnimation />
      <FinancialAnimations />
      <header className="header">
        <h1 style={{ margin: '0', animation: 'slideInLeft 0.5s ease-out' }}>
          💰 Zorvyn {user.role.toUpperCase()}
        </h1>
        <nav className="nav">
          <button 
            onClick={() => handleViewChange('home')}
            className={currentView === 'home' ? 'active' : ''}
          >
            🏠 {user.role === 'admin' ? 'Administration' : user.role === 'owner' ? 'Owner Portal' : 'Viewer Home'}
          </button>
          
          {(user.role === 'admin' || user.role === 'owner') && (
            <button 
              onClick={() => handleViewChange('records')}
              className={currentView === 'records' ? 'active' : ''}
            >
              📑 Full Records
            </button>
          )}

          <button 
            onClick={handleLogout}
            style={{ backgroundColor: '#e74c3c' }}
            className="logout-btn"
          >
            🚪 Exit
          </button>
        </nav>
      </header>
      <main className="main" style={{ opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.2s ease' }}>
        {renderModule()}
      </main>
    </div>
  )
}

export default App