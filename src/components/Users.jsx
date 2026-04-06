import { useState, useEffect } from 'react'
import { useLoadingAnimation, useRipple } from '../hooks/useAnimation'

function Users() {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const { isLoading, error, setError } = useLoadingAnimation()
  const { createRipple } = useRipple()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer',
    status: 'active',
    password: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setUsers(await response.json())
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Failed to load users')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
    const method = editingUser ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        fetchUsers()
        setShowForm(false)
        setEditingUser(null)
        setFormData({ name: '', email: '', role: 'viewer', status: 'active', password: '' })
        setSuccessMsg(editingUser ? 'User updated successfully!' : 'User created successfully!')
        setTimeout(() => setSuccessMsg(''), 3000)
      } else {
        setError(data.error || 'Failed to save user')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        fetchUsers()
        setSuccessMsg('User deleted successfully!')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (err) {
      setError('Failed to delete user')
    }
  }

  return (
    <div>
      <h2 style={{ animation: 'slideInDown 0.5s ease-out' }}>👥 User Management</h2>

      {error && <div className="error">{error}</div>}
      {successMsg && <div className="success">{successMsg}</div>}

      <button
        className="btn"
        onClick={(e) => {
          createRipple(e)
          setShowForm(!showForm)
          if (!showForm) {
            setEditingUser(null)
            setFormData({ name: '', email: '', role: 'viewer', status: 'active', password: '' })
          }
        }}
        style={{ animation: 'slideInLeft 0.5s ease-out 0.1s both' }}
      >
        {showForm ? '❌ Cancel' : '➕ Add User'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem', padding: '1rem', border: '2px solid #ddd', borderRadius: '8px', animation: 'slideInDown 0.4s ease-out', backgroundColor: '#f9f9f9' }}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Role:</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="viewer">👁️ Viewer</option>
              <option value="analyst">👨‍💼 Analyst</option>
              <option value="admin">🔐 Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status:</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">✅ Active</option>
              <option value="inactive">❌ Inactive</option>
            </select>
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required={!editingUser}
            />
          </div>
          <button type="submit" className="btn" onClick={createRipple}>
            {editingUser ? '✏️ Update' : '💾 Create'} User
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
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.status}</td>
                  <td>
                    <button onClick={(e) => { createRipple(e); handleEdit(user); }} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>✏️</button>
                    <button onClick={(e) => { createRipple(e); handleDelete(user.id); }} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Users