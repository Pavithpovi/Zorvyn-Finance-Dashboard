import { useState } from 'react'
import { useLoadingAnimation, useFormAnimation, useRipple } from '../hooks/useAnimation'
import './Login.css'

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
    phone: '',
    company: '',
    address: '',
    department: ''
  })
  const { isLoading, error, setError } = useLoadingAnimation()
  const { formRef, shakeError, handleFormSubmit } = useFormAnimation()
  const { createRipple } = useRipple()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (isLogin) {
      // Login validation
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields')
        return false
      }
    } else {
      // Signup validation
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        return false
      }
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            phone: formData.phone,
            company: formData.company,
            address: formData.address,
            department: formData.department
          }

      console.log('Making request to:', endpoint, 'with payload:', payload)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        if (isLogin) {
          onLogin(data.user, data.token)
        } else {
          setError('Account created successfully! Please login.')
          setIsLogin(true)
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'viewer'
          })
        }
      } else {
        setError(data.error || `${isLogin ? 'Login' : 'Registration'} failed`)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error - please check your connection and try again')
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'viewer',
      phone: '',
      company: '',
      address: '',
      department: ''
    })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-section">
            <div className="logo-icon">💰</div>
            <h1>Zorvyn Finance</h1>
            <p>Your Personal Finance Manager</p>
          </div>
        </div>

        <div className="auth-toggle">
          <button
            type="button"
            className={`toggle-btn ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            type="button"
            className={`toggle-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {isLogin && (
          <div className="demo-users-section">
            <h3>🚀 Quick Login - Demo Accounts</h3>
            <div className="demo-users-grid">
              <div className="demo-user-card" onClick={() => setFormData({...formData, email: 'admin@zorvyn.com', password: 'admin123'})}>
                <div className="demo-user-avatar">🔧</div>
                <div className="demo-user-info">
                  <div className="demo-user-name">System Administrator</div>
                  <div className="demo-user-role">Administrator</div>
                  <div className="demo-user-creds">admin@zorvyn.com / admin123</div>
                </div>
                <div className="demo-user-arrow">→</div>
              </div>

              <div className="demo-user-card" onClick={() => setFormData({...formData, email: 'owner@zorvyn.com', password: 'owner123'})}>
                <div className="demo-user-avatar">👑</div>
                <div className="demo-user-info">
                  <div className="demo-user-name">Business Owner</div>
                  <div className="demo-user-role">Owner</div>
                  <div className="demo-user-creds">owner@zorvyn.com / owner123</div>
                </div>
                <div className="demo-user-arrow">→</div>
              </div>

              <div className="demo-user-card" onClick={() => setFormData({...formData, email: 'viewer@zorvyn.com', password: 'viewer123'})}>
                <div className="demo-user-avatar">👁️</div>
                <div className="demo-user-info">
                  <div className="demo-user-name">Data Viewer</div>
                  <div className="demo-user-role">Viewer</div>
                  <div className="demo-user-creds">viewer@zorvyn.com / viewer123</div>
                </div>
                <div className="demo-user-arrow">→</div>
              </div>
            </div>
            <p className="demo-users-note">💡 Click any account to auto-fill the login form</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className={`auth-form ${shakeError ? 'wobble' : ''}`}>
          {!isLogin && (
            <div className="form-group">
              <label>👤 Full Name:</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  required={!isLogin}
                />
                <span className="input-icon">👤</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>📧 Email Address:</label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                disabled={isLoading}
                required
              />
              <span className="input-icon">📧</span>
            </div>
          </div>

          <div className="form-group">
            <label>🔐 Password:</label>
            <div className="input-wrapper">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
              <span className="input-icon">🔐</span>
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>🔒 Confirm Password:</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    required={!isLogin}
                  />
                  <span className="input-icon">🔒</span>
                </div>
              </div>

              <div className="form-group">
                <label>📞 Phone Number:</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    disabled={isLoading}
                  />
                  <span className="input-icon">📞</span>
                </div>
              </div>

              <div className="form-group">
                <label>🏢 Company:</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter your company name"
                    disabled={isLoading}
                  />
                  <span className="input-icon">🏢</span>
                </div>
              </div>

              <div className="form-group">
                <label>📍 Address:</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    disabled={isLoading}
                  />
                  <span className="input-icon">📍</span>
                </div>
              </div>

              <div className="form-group">
                <label>🏷️ Department:</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Enter your department"
                    disabled={isLoading}
                  />
                  <span className="input-icon">🏷️</span>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            onClick={createRipple}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <span className="btn-icon">{isLogin ? '🚀' : '✨'}</span>
                {isLogin ? 'Login to Account' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="link-btn"
              onClick={toggleMode}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>

      <div className="login-decoration">
        <div className="floating-element elem-1">💎</div>
        <div className="floating-element elem-2">📈</div>
        <div className="floating-element elem-3">💰</div>
        <div className="floating-element elem-4">📊</div>
        <div className="floating-element elem-5">🏦</div>
      </div>
    </div>
  )
}

export default Login