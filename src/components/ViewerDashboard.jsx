import { useState, useEffect } from 'react'
import Dashboard from './Dashboard'
import FinancialAnimations from './FinancialAnimations'

function ViewerDashboard({ user }) {
  return (
    <div className="viewer-module">
      <FinancialAnimations />
      <div className="module-header">
        <h1>👁️ Viewer Console</h1>
        <p>Financial Performance Read-Only Insights</p>
      </div>

      <div className="dashboard-summary">
        {/* Use the existing Dashboard component but potentially restrict it further */}
        <Dashboard user={user} />
      </div>

      <div className="viewer-note">
        <p>⚠️ Note: You are currently assigned the <strong>Viewer</strong> role. You have read-only access to all financial records and analytics summaries.</p>
      </div>
    </div>
  )
}

export default ViewerDashboard
