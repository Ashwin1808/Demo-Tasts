import { useEffect, useState } from 'react'
import { api } from './api.js'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [health, setHealth] = useState('...')

  async function load() {
    try {
      setError('')
      const data = await api.getTasks()
      setTasks(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadHealth() {
    try {
      const h = await api.health()
      setHealth(h.status)
    } catch {
      setHealth('DOWN')
    }
  }

  useEffect(() => {
    load()
    loadHealth()
  }, [])

  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'COMPLETED').length
  const pending = total - completed

  async function handleCreate(e) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    try {
      setError('')
      await api.createTask({ title: title.trim(), description: description.trim() })
      setTitle('')
      setDescription('')
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggleStatus(task) {
    const next = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    try {
      await api.updateTask(task.id, { status: next })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this task?')) return
    try {
      await api.deleteTask(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Task Manager</h1>
          <p>Simple monolith for DevOps/DevSecOps pipeline demo</p>
        </div>
        <span className="badge">API: {health}</span>
      </div>

      <div className="stats">
        <div className="stat-card"><h3>Total tasks</h3><p>{total}</p></div>
        <div className="stat-card"><h3>Completed</h3><p>{completed}</p></div>
        <div className="stat-card"><h3>Pending</h3><p>{pending}</p></div>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleCreate} className="card">
        <h3 style={{ margin: '0 0 12px' }}>Create task</h3>
        <div className="form-row">
          <input className="input" placeholder="Title *" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="form-row">
          <textarea className="textarea" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit">Add task</button>
      </form>

      <div className="task-list">
        {loading ? <div className="card empty">Loading...</div>
          : tasks.length === 0 ? <div className="card empty">No tasks yet. Create your first one above.</div>
          : tasks.slice().sort((a,b)=> b.id - a.id).map(task => (
            <div key={task.id} className={`task-item ${task.status === 'COMPLETED' ? 'completed' : ''}`}>
              <div className="task-meta">
                <h4>{task.title} <span className={`pill ${task.status.toLowerCase()}`}>{task.status}</span></h4>
                {task.description && <p>{task.description}</p>}
                <small>#{task.id} · {new Date(task.createdAt).toLocaleString()} · updated {new Date(task.updatedAt).toLocaleString()}</small>
              </div>
              <div className="actions">
                <button
                  className={`btn ${task.status === 'COMPLETED' ? 'btn-ghost' : 'btn-success'}`}
                  onClick={() => toggleStatus(task)}
                >
                  {task.status === 'COMPLETED' ? 'Mark pending' : 'Mark done'}
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(task.id)}>Delete</button>
              </div>
            </div>
          ))}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 24 }}>
        Backend: <code style={{ color: 'var(--text)' }}>{import.meta.env.VITE_API_URL || 'http://localhost:8080'}</code> · API docs see README
      </p>
    </div>
  )
}
