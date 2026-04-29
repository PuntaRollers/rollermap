import { useState, useEffect, useMemo } from 'react'
import { supabase }          from '../../lib/supabase'
import { useAdminLocations } from '../../hooks/useAdminLocations'
import AdminLogin            from './AdminLogin'
import EditModal             from './EditModal'

const STATUS_CONFIG = {
  pending : { label:'Pendiente',   bg:'#FEF9C3', color:'#92400E', border:'#FDE68A', dot:'#F59E0B' },
  approved: { label:'Aprobada',    bg:'#D1FAE5', color:'#064E3B', border:'#6EE7B7', dot:'#10B981' },
  disabled: { label:'Desactivada', bg:'#F1F5F9', color:'#475569', border:'#CBD5E1', dot:'#94A3B8' },
}

function SkeletonCard() {
  return (
    <div className="rm-card" style={{padding:16,display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <div className="rm-skeleton" style={{width:42,height:42,borderRadius:10,flexShrink:0}}/>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
          <div className="rm-skeleton" style={{height:14,borderRadius:6,width:'60%'}}/>
          <div className="rm-skeleton" style={{height:11,borderRadius:6,width:'40%'}}/>
        </div>
      </div>
      <div style={{display:'flex',gap:6}}>
        <div className="rm-skeleton" style={{height:28,borderRadius:8,flex:1}}/>
        <div className="rm-skeleton" style={{height:28,borderRadius:8,flex:1}}/>
      </div>
    </div>
  )
}

function AdminCard({ loc, onStatusChange, onEdit }) {
  const sc=STATUS_CONFIG[loc.status]??STATUS_CONFIG.disabled
  const initials=loc.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
  const createdAt=new Date(loc.created_at).toLocaleDateString('es-UY',{day:'2-digit',month:'short',year:'numeric'})
  const actions={
    pending :[{label:'✓ Aprobar',newStatus:'approved',cls:'rm-btn--success-soft'},{label:'✕ Desactivar',newStatus:'disabled',cls:'rm-btn--danger-soft'}],
    approved:[{label:'✕ Desactivar',newStatus:'disabled',cls:'rm-btn--danger-soft'}],
    disabled:[{label:'↺ Reactivar',newStatus:'approved',cls:'rm-btn--success-soft'}],
  }[loc.status]??[]

  return (
    <div className="rm-card">
      <div style={{height:3,background:sc.dot,borderRadius:'12px 12px 0 0'}}/>
      <div style={{padding:'14px 16px',display:'flex',flexDirection:'column',gap:11}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
          <div className={`rm-avatar rm-avatar--${loc.type} rm-avatar--md`}>{initials}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,color:'var(--ink)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160}}>{loc.name}</span>
              {loc.verified&&<span className="rm-badge rm-badge--verified">✦</span>}
              {loc.featured&&<span className="rm-badge rm-badge--featured">⭐</span>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4,flexWrap:'wrap'}}>
              <span className={`rm-badge rm-badge--${loc.type}`}>{loc.type==='escuela'?'Escuela':'Grupo'}</span>
              <span style={{fontSize:11,color:'var(--muted)'}}>📍 {loc.city}{loc.department?`, ${loc.department}`:''}</span>
            </div>
          </div>
          <span className={`rm-badge rm-badge--${loc.status}`}>{sc.label}</span>
        </div>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <span style={{fontSize:11,color:'var(--muted2)'}}>📅 {createdAt}</span>
          {loc.instagram&&<a href={`https://instagram.com/${loc.instagram}`} target="_blank" rel="noopener" style={{fontSize:11,color:'var(--brand)'}}>@{loc.instagram}</a>}
          {loc.whatsapp&&<a href={`https://wa.me/${loc.whatsapp}`} target="_blank" rel="noopener" style={{fontSize:11,color:'var(--grupo-text)'}}>💬 {loc.whatsapp}</a>}
        </div>
        <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
          {actions.map(a=>(
            <button key={a.newStatus} className={`rm-btn rm-btn--sm ${a.cls}`} onClick={()=>onStatusChange(loc.id,a.newStatus)}>{a.label}</button>
          ))}
          <button className="rm-btn rm-btn--sm rm-btn--secondary" style={{marginLeft:'auto'}} onClick={()=>onEdit(loc)}>✎ Editar</button>
        </div>
      </div>
    </div>
  )
}

function StatsBar({ stats }) {
  return (
    <div className="rm-stats">
      {[{label:'Total',val:stats.total,color:'var(--ink)'},{label:'Pendientes',val:stats.pending,color:'#92400E'},{label:'Aprobadas',val:stats.approved,color:'#064E3B'},{label:'Inactivas',val:stats.disabled,color:'var(--muted)'}].map(({label,val,color})=>(
        <div key={label} className="rm-stat">
          <div className="rm-stat__val" style={{color}}>{val}</div>
          <div className="rm-stat__label">{label}</div>
        </div>
      ))}
    </div>
  )
}

export default function AdminPanel() {
  const [user,         setUser]         = useState(null)
  const [authReady,    setAuthReady]    = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType,   setFilterType]   = useState('all')
  const [search,       setSearch]       = useState('')

  const { locations, loading, error, updateStatus, updateLocation } = useAdminLocations()

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      const u=session?.user
      if (u?.app_metadata?.role==='admin') setUser(u)
      setAuthReady(true)
    })
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>{
      const u=session?.user
      if (u?.app_metadata?.role==='admin') setUser(u)
      else setUser(null)
    })
    return ()=>subscription.unsubscribe()
  },[])

  const handleLogout=async()=>{await supabase.auth.signOut();setUser(null)}

  const stats=useMemo(()=>({
    total:locations.length,
    pending:locations.filter(l=>l.status==='pending').length,
    approved:locations.filter(l=>l.status==='approved').length,
    disabled:locations.filter(l=>l.status==='disabled').length,
  }),[locations])

  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase()
    return locations.filter(l=>{
      if (filterStatus!=='all'&&l.status!==filterStatus) return false
      if (filterType!=='all'&&l.type!==filterType) return false
      if (q&&!l.name.toLowerCase().includes(q)&&!l.city.toLowerCase().includes(q)) return false
      return true
    })
  },[locations,filterStatus,filterType,search])

  if (!authReady) return null
  if (!user) return <AdminLogin onLogin={setUser}/>

  return (
    <div className="rm-admin">
      <header className="rm-admin__header">
        <div className="rm-logo__icon">AR</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:700,color:'var(--ink)'}}>Panel Admin</div>
          <div style={{fontSize:10,color:'var(--muted2)'}}>{user.email}</div>
        </div>
        <button className="rm-btn rm-btn--sm rm-btn--secondary" onClick={handleLogout}>Salir</button>
      </header>

      <main className="rm-admin__main">
        {!loading&&<StatsBar stats={stats}/>}
        <div className="rm-input-wrap">
          <span className="rm-input-wrap__icon">🔍</span>
          <input className="rm-input" placeholder="Buscar por nombre o ciudad…" value={search} onChange={(e)=>setSearch(e.target.value)}/>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {[{val:'all',label:'Todos'},{val:'pending',label:'⏳ Pendientes'},{val:'approved',label:'✓ Aprobadas'},{val:'disabled',label:'— Inactivas'}].map(({val,label})=>(
            <button key={val} className={`rm-chip ${filterStatus===val?'rm-chip--active':''}`} onClick={()=>setFilterStatus(val)}>{label}</button>
          ))}
        </div>
        <div style={{display:'flex',gap:6}}>
          {[{val:'all',label:'Todos los tipos'},{val:'escuela',label:'🏫 Escuelas'},{val:'grupo',label:'👥 Grupos'}].map(({val,label})=>(
            <button key={val} className={`rm-chip ${filterType===val?'rm-chip--brand':''}`} onClick={()=>setFilterType(val)}>{label}</button>
          ))}
        </div>
        <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',color:'var(--muted2)'}}>
          {loading?'Cargando…':`${filtered.length} resultado${filtered.length!==1?'s':''}`}
        </div>
        {error&&<div className="rm-alert rm-alert--error">⚠️ {error}</div>}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {loading&&[1,2,3].map(i=><SkeletonCard key={i}/>)}
          {!loading&&filtered.length===0&&(
            <div className="rm-empty"><span style={{fontSize:32}}>🛼</span><div style={{fontSize:14}}>Sin resultados.</div></div>
          )}
          {!loading&&filtered.map(loc=>(
            <AdminCard key={loc.id} loc={loc} onStatusChange={updateStatus} onEdit={setEditTarget}/>
          ))}
        </div>
      </main>

      {editTarget&&(
        <EditModal loc={editTarget} onSave={updateLocation} onClose={()=>setEditTarget(null)} isDesktop={window.innerWidth>=768}/>
      )}
    </div>
  )
}
