import { forwardRef } from 'react'

const LocationCard = forwardRef(function LocationCard({ loc, selected, onClick }, ref) {
  const initials = loc.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()

  return (
    <div
      ref={ref}
      className={`rm-card rm-loc-card ${selected?'rm-loc-card--selected':''}`}
      onClick={() => onClick(loc)}
    >
      {loc.image_url && (
        <div style={{ width:'100%', height:72, overflow:'hidden', position:'relative' }}>
          <img src={loc.image_url} alt={loc.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:32, background:'linear-gradient(to bottom, transparent, rgba(10,10,22,0.9))' }} />
        </div>
      )}

      <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
          {!loc.image_url && (
            <div className={`rm-avatar rm-avatar--${loc.type} rm-avatar--md`}>{initials}</div>
          )}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:15, fontWeight:700, color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:180 }}>
                {loc.name}
              </span>
              {loc.verified && (
                <span title="Verificado" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:16, height:16, borderRadius:'50%', background:'var(--brand)', flexShrink:0, boxShadow:'0 0 8px rgba(0,229,204,0.5)', fontSize:9, fontWeight:900, color:'#000', lineHeight:1 }}>✓</span>
              )}
              {loc.featured && <span className="rm-badge rm-badge--featured">⭐</span>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4, flexWrap:'wrap' }}>
              <span className={`rm-badge rm-badge--${loc.type}`}>{loc.type==='escuela'?'Escuela':'Grupo'}</span>
              <span style={{ fontSize:11, color:'var(--muted)' }}>📍 {loc.city}</span>
            </div>
          </div>
          <span style={{ fontSize:14, color:selected?'var(--brand)':'rgba(255,255,255,0.2)', flexShrink:0 }}>›</span>
        </div>
        {loc.schedule && (
          <div style={{ fontSize:11, color:'var(--muted2)', display:'flex', gap:4 }}>🕐 {loc.schedule}</div>
        )}
      </div>
    </div>
  )
})

export default LocationCard
