import { useState, useEffect } from 'react'
import { useScrollAnimation, useLoadingAnimation } from '../hooks/useAnimation'
import FinancialAnimations from './FinancialAnimations'

function Dashboard({ user }) {
  const [overview, setOverview] = useState(null)
  const [categories, setCategories] = useState([])
  const [recent, setRecent] = useState([])
  const { isLoading } = useLoadingAnimation()
  const { elementRef: cardsRef, isVisible: cardsVisible } = useScrollAnimation()
  const { elementRef: categoriesRef, isVisible: categoriesVisible } = useScrollAnimation()
  const { elementRef: recentRef, isVisible: recentVisible } = useScrollAnimation()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      const [overviewRes, categoriesRes, recentRes] = await Promise.all([
        fetch('/api/summary/overview', { headers }),
        fetch('/api/summary/categories', { headers }),
        fetch('/api/summary/recent?limit=5', { headers })
      ])

      if (overviewRes.ok) setOverview(await overviewRes.json())
      if (categoriesRes.ok) setCategories(await categoriesRes.json())
      if (recentRes.ok) setRecent(await recentRes.json())
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    }
  }

  if (!overview) return <div className="loading"></div>

  return (
    <div>
      <FinancialAnimations />
      <h2 style={{ animation: 'slideInDown 0.5s ease-out' }}>📊 Dashboard</h2>
      <p style={{ animation: 'slideInLeft 0.5s ease-out 0.1s both' }}>
        Welcome, <strong>{user.name}</strong> <span style={{ fontSize: '1.2em' }}>({user.role})</span>
      </p>

      {overview && (
        <div ref={cardsRef} className="dashboard-cards">
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <img
                src="/images/income-icon.svg"
                alt="Income"
                style={{ width: '48px', height: '48px', animation: 'bounce 2s ease-in-out infinite' }}
              />
              <div>
                <h3>💰 Total Income</h3>
                <p>${overview.income.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <img
                src="/images/expense-icon.svg"
                alt="Expenses"
                style={{ width: '48px', height: '48px', animation: 'bounce 2s ease-in-out infinite 0.5s' }}
              />
              <div>
                <h3>💸 Total Expenses</h3>
                <p>${overview.expense.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <img
                src="/images/balance-icon.svg"
                alt="Balance"
                style={{ width: '48px', height: '48px', animation: 'spin 3s linear infinite' }}
              />
              <div>
                <h3>📈 Net Balance</h3>
                <p style={{ color: overview.net >= 0 ? '#2ecc71' : '#e74c3c' }}>
                  ${overview.net.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <img
                src="/images/transactions-icon.svg"
                alt="Transactions"
                style={{ width: '48px', height: '48px', animation: 'pulse 2s ease-in-out infinite' }}
              />
              <div>
                <h3>📋 Total Transactions</h3>
                <p>{overview.totalTransactions}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div ref={categoriesRef} className="card">
          <h3>📂 Category Breakdown</h3>
          {categories.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => (
                  <tr key={index}>
                    <td>{cat.category}</td>
                    <td>{cat.type}</td>
                    <td>${cat.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#999' }}>No categories yet</p>
          )}
        </div>

        <div ref={recentRef} className="card">
          <h3>⏱️ Recent Transactions</h3>
          {recent.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.category}</td>
                    <td>{record.type}</td>
                    <td>${record.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#999' }}>No recent transactions</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard