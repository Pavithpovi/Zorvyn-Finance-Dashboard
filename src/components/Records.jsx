import { useState, useEffect } from 'react'
import { useLoadingAnimation, useRipple } from '../hooks/useAnimation'

function Records({ user }) {
  const [records, setRecords] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const { isLoading, error, setError } = useLoadingAnimation()
  const { createRipple } = useRipple()
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: '',
    notes: ''
  })
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchRecords()
  }, [filters])

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.category) params.append('category', filters.category)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`/api/records?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setRecords(await response.json())
      }
    } catch (err) {
      console.error('Failed to fetch records:', err)
      setError('Failed to load records')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const url = editingRecord ? `/api/records/${editingRecord.id}` : '/api/records'
    const method = editingRecord ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchRecords()
        setShowForm(false)
        setEditingRecord(null)
        setFormData({ amount: '', type: 'expense', category: '', date: '', notes: '' })
        setSuccessMsg(editingRecord ? 'Record updated successfully!' : 'Record created successfully!')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (err) {
      setError('Failed to save record')
    }
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setFormData({
      amount: record.amount,
      type: record.type,
      category: record.category,
      date: record.date.split('T')[0],
      notes: record.notes
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        fetchRecords()
        setSuccessMsg('Record deleted successfully!')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (err) {
      setError('Failed to delete record')
    }
  }

  const canEdit = user.role === 'admin'

  return (
    <div>
      <h2 style={{ animation: 'slideInDown 0.5s ease-out', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img
          src="/images/transactions-icon.svg"
          alt="Records"
          style={{ width: '40px', height: '40px', animation: 'pulse 2s ease-in-out infinite' }}
        />
        💰 Financial Records
      </h2>

      {error && <div className="error">{error}</div>}
      {successMsg && <div className="success">{successMsg}</div>}

      <div style={{ marginBottom: '2rem', animation: 'slideInLeft 0.5s ease-out 0.1s both' }}>
        <h3>🔍 Filters</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '2px solid #ddd' }}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            type="text"
            placeholder="Category"
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '2px solid #ddd' }}
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '2px solid #ddd' }}
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '2px solid #ddd' }}
          />
        </div>
      </div>

      {canEdit && (
        <button
          className="btn"
          onClick={(e) => {
            createRipple(e)
            setShowForm(!showForm)
            if (!showForm) {
              setEditingRecord(null)
              setFormData({ amount: '', type: 'expense', category: '', date: '', notes: '' })
            }
          }}
          style={{ animation: 'slideInLeft 0.5s ease-out 0.2s both' }}
        >
          {showForm ? '❌ Cancel' : '➕ Add Record'}
        </button>
      )}

      {showForm && canEdit && (
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem', padding: '1rem', border: '2px solid #ddd', borderRadius: '8px', animation: 'slideInDown 0.4s ease-out', backgroundColor: '#f9f9f9' }}>
          <div className="form-group">
            <label>Amount:</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Type:</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-group">
            <label>Category:</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Notes:</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              style={{ minHeight: '80px' }}
            />
          </div>
          <button type="submit" className="btn" onClick={createRipple}>
            {editingRecord ? '✏️ Update' : '💾 Create'} Record
          </button>
        </form>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading"></div>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Notes</th>
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((record) => (
                <tr key={record.id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.category}</td>
                  <td>{record.type}</td>
                  <td>${record.amount}</td>
                  <td>{record.notes}</td>
                  {canEdit && (
                    <td>
                      <button onClick={(e) => { createRipple(e); handleEdit(record); }} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>✏️</button>
                      <button onClick={(e) => { createRipple(e); handleDelete(record.id); }} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>🗑️</button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={canEdit ? 6 : 5} style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Records