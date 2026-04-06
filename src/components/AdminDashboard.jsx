import { useState, useEffect } from 'react'
import Users from './Users'
import FinancialAnimations from './FinancialAnimations'
import { useScrollAnimation } from '../hooks/useAnimation'

function AdminDashboard({ user }) {
  const [stats, setStats] = useState({ totalUsers: 0, activeSystem: true, lastBackup: new Date().toLocaleDateString() })
  const { elementRef: welcomeRef, isVisible: welcomeVisible } = useScrollAnimation()

  useEffect(() => {
    // Fetch some global system stats if needed
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, totalUsers: data.length })))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="admin-module">
      <FinancialAnimations />
      <div ref={welcomeRef} className={`welcome-banner ${welcomeVisible ? 'fade-in' : ''}`}>
        <h1>🔐 Admin Console</h1>
        <p>System Oversight & User Management</p>
      </div>

      <div className="dashboard-cards">
        <div className="card">
          <h3>👥 Total Users</h3>
          <p className="stat-large">{stats.totalUsers}</p>
        </div>
        <div className="card">
          <h3>🛡️ System Status</h3>
          <p className="stat-large" style={{ color: '#2ecc71' }}>ONLINE</p>
        </div>
        <div className="card">
          <h3>💾 Internal Health</h3>
          <p className="stat-large">OPTIMAL</p>
        </div>
      </div>

      <div className="module-content" style={{ marginTop: '2rem' }}>
        <Users />
      </div>
    </div>
  )
}

export default AdminDashboard
