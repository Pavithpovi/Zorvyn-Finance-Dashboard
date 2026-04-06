import { useState, useEffect } from 'react'
import UserAnalytics from './UserAnalytics'
import Records from './Records'
import FinancialAnimations from './FinancialAnimations'

function OwnerDashboard({ user }) {
  const [showAnalytics, setShowAnalytics] = useState(true)

  return (
    <div className="owner-module">
      <FinancialAnimations />
      <div className="module-header">
        <h1>👑 Owner Dashboard</h1>
        <p>Business Growth & Financial Strategy</p>
      </div>

      <div className="dashboard-toggle">
        <button 
          className={`btn ${showAnalytics ? 'active' : ''}`}
          onClick={() => setShowAnalytics(true)}
        >
          📈 High-Level Analytics
        </button>
        <button 
          className={`btn ${!showAnalytics ? 'active' : ''}`}
          onClick={() => setShowAnalytics(false)}
        >
          💰 Manage Records
        </button>
      </div>

      <div className="module-content">
        {showAnalytics ? <UserAnalytics user={user} /> : <Records user={user} />}
      </div>
    </div>
  )
}

export default OwnerDashboard
