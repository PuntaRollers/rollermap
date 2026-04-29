import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminLogin({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
    if (authErr) { setError(authErr.message); setLoading(false); return }
    if (data.user?.app_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('Tu cuenta no tiene permisos de administrador.')
      setLoading(false); return
    }
    onLogin(data.user)
  }

  return (
    <div style={{ minHeight:'100dvh', background:'var(--surface)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:400, background:'var(--base)', borderRadius:20, padding:32, boxShadow:'var(--shadow-lg)', border:'1px solid var(--line)' }}>
        <div className="rm-logo" style={{ marginBottom:28 }}>
          <div className="rm-logo__icon">AR</div>
          <div>
            <div className="rm-logo__name">ROLLERMAP</div>
            <div className="rm-logo__sub">Panel de administración</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="rm-form-group">
            <label className="rm-label">Email</label>
            <input className="rm-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@alianzaroller.com" />
          </div>
          <div className="rm-form-group">
            <label className="rm-label">Contraseña</label>
            <input className="rm-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <div className="rm-alert rm-alert--error"><span>⚠️</span><span>{error}</span></div>}
          <button className="rm-btn rm-btn--primary rm-btn--full" type="submit" disabled={loading} style={{ marginTop:4 }}>
            {loading && <span className="rm-spinner" />}
            {loading ? 'Entrando…' : 'Ingresar al panel'}
          </button>
        </form>
      </div>
    </div>
  )
}
