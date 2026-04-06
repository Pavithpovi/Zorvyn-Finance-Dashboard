import React, { useState, useEffect } from 'react'
import './UserAnalytics.css'

const UserAnalytics = ({ user }) => {
  const [userStats, setUserStats] = useState(null)
  const [allUsers, setAllUsers] = useState([])

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      // Fetch all users for analytics
      const usersRes = await fetch('/api/users', { headers })
      if (usersRes.ok) {
        const users = await usersRes.json()
        setAllUsers(users)

        // Calculate statistics
        const stats = {
          totalUsers: users.length,
          roleDistribution: {
            admin: users.filter(u => u.role === 'admin').length,
            owner: users.filter(u => u.role === 'owner').length,
            viewer: users.filter(u => u.role === 'viewer').length
          },
          departmentStats: {},
          companyStats: {},
          recentJoins: users
            .filter(u => u.joinDate)
            .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
            .slice(0, 5)
        }

        // Department statistics
        users.forEach(user => {
          if (user.department) {
            stats.departmentStats[user.department] = (stats.departmentStats[user.department] || 0) + 1
          }
        })

        // Company statistics
        users.forEach(user => {
          if (user.company) {
            stats.companyStats[user.company] = (stats.companyStats[user.company] || 0) + 1
          }
        })

        setUserStats(stats)
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err)
    }
  }

  if (!userStats) {
    return <div className="loading">Loading user analytics...</div>
  }

  const maxRoleCount = Math.max(...Object.values(userStats.roleDistribution))
  const maxDeptCount = Math.max(...Object.values(userStats.departmentStats))
  const maxCompanyCount = Math.max(...Object.values(userStats.companyStats))

  return (
    <div className="user-analytics">
      <h2 style={{ animation: 'slideInDown 0.5s ease-out', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img
          src="/images/growth-icon.svg"
          alt="Analytics"
          style={{ width: '40px', height: '40px', animation: 'pulse 2s ease-in-out infinite' }}
        />
        👥 User Analytics & Insights
      </h2>

      <div className="analytics-grid">
        {/* User Role Distribution */}
        <div className="analytics-card" style={{ animationDelay: '0.1s' }}>
          <h3>🎭 User Role Distribution</h3>
          <div className="chart-container">
            {Object.entries(userStats.roleDistribution).map(([role, count], index) => (
              <div key={role} className="bar-item">
                <div className="bar-label">
                  <span className="role-icon">
                    {role === 'admin' ? '🔧' : role === 'owner' ? '👑' : '👁️'}
                  </span>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </div>
                <div className="bar-wrapper">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(count / maxRoleCount) * 100}%`,
                      background: role === 'admin' ? '#e74c3c' : role === 'owner' ? '#f39c12' : '#3498db',
                      animationDelay: `${index * 0.2}s`
                    }}
                  >
                    <span className="bar-value">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="analytics-card" style={{ animationDelay: '0.2s' }}>
          <h3>🏷️ Department Distribution</h3>
          <div className="chart-container">
            {Object.entries(userStats.departmentStats).map(([dept, count], index) => (
              <div key={dept} className="bar-item">
                <div className="bar-label">{dept || 'Not Specified'}</div>
                <div className="bar-wrapper">
                  <div
                    className="bar-fill dept-bar"
                    style={{
                      width: `${(count / maxDeptCount) * 100}%`,
                      animationDelay: `${index * 0.2}s`
                    }}
                  >
                    <span className="bar-value">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Distribution */}
        <div className="analytics-card" style={{ animationDelay: '0.3s' }}>
          <h3>🏢 Company Distribution</h3>
          <div className="chart-container">
            {Object.entries(userStats.companyStats).map(([company, count], index) => (
              <div key={company} className="bar-item">
                <div className="bar-label">{company || 'Not Specified'}</div>
                <div className="bar-wrapper">
                  <div
                    className="bar-fill company-bar"
                    style={{
                      width: `${(count / maxCompanyCount) * 100}%`,
                      animationDelay: `${index * 0.2}s`
                    }}
                  >
                    <span className="bar-value">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent User Joins */}
        <div className="analytics-card" style={{ animationDelay: '0.4s' }}>
          <h3>🆕 Recent User Joins</h3>
          <div className="recent-joins">
            {userStats.recentJoins.map((user, index) => (
              <div key={user.id} className="join-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">
                    <span className="role-badge" data-role={user.role}>
                      {user.role === 'admin' ? '🔧' : user.role === 'owner' ? '👑' : '👁️'}
                      {user.role}
                    </span>
                  </div>
                  <div className="join-date">{user.joinDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Statistics Summary */}
        <div className="analytics-card summary-card" style={{ animationDelay: '0.5s' }}>
          <h3>📊 User Statistics Summary</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{userStats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{userStats.roleDistribution.admin}</div>
              <div className="stat-label">Admins</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{userStats.roleDistribution.owner}</div>
              <div className="stat-label">Owners</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{userStats.roleDistribution.viewer}</div>
              <div className="stat-label">Viewers</div>
            </div>
          </div>
        </div>

        {/* User Details Table */}
        <div className="analytics-card full-width" style={{ animationDelay: '0.6s' }}>
          <h3>📋 Complete User Directory</h3>
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Department</th>
                  <th>Join Date</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u, index) => (
                  <tr key={u.id} style={{ animationDelay: `${index * 0.05}s` }}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar small">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className="role-badge" data-role={u.role}>
                        {u.role === 'admin' ? '🔧' : u.role === 'owner' ? '👑' : '👁️'}
                        {u.role}
                      </span>
                    </td>
                    <td>{u.company || 'N/A'}</td>
                    <td>{u.department || 'N/A'}</td>
                    <td>{u.joinDate || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserAnalytics