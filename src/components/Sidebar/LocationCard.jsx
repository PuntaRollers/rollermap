import { forwardRef } from 'react'

const LocationCard = forwardRef(function LocationCard({ loc, selected, onClick }, ref) {
  const initials = loc.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()

  const avatarBg = loc.type === 'escuela' ? 'var(--brand)' : 'var(--grupo)'

  return (
    <div
      ref={ref}
      className={`rm-card rm-loc-card ${selected ? 'rm-loc-card--selected' : ''}`}
      onClick={() => onClick(loc)}
    >
      <div style={{ padding:'14px 14px', display:'flex', flexDirection:'column', gap:8 }}>

        {/* FILA PRINCIPAL */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>

          {/* Avatar */}
          {loc.image_url ? (
            <div style={{
              width:46, height:46, borderRadius:10, overflow:'hidden',
              flexShrink:0, border:'1px solid rgba(255,255,255,0.1)'
            }}>
              <img src={loc.image_url} alt={loc.name}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            </div>
          ) : (
            <div style={{
              width:46, height:46, borderRadius:10, flexShrink:0,
              background: avatarBg,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:"'Barlow Condensed', sans-serif",
              fontSize:16, fontWeight:800,
              color: loc.type === 'escuela' ? '#000' : '#fff',
              letterSpacing:0.5
            }}>
              {initials}
            </div>
          )}

          {/* Info central */}
          <div style={{ flex:1, minWidth:0 }}>

            {/* Nombre + verificado */}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
              <span style={{
                fontFamily:"'Barlow Condensed', sans-serif",
                fontSize:16, fontWeight:700, color:'var(--ink)',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                maxWidth:170
              }}>
                {loc.name}
              </span>
              {loc.verified && (
                <span style={{
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  width:15, height:15, borderRadius:'50%',
                  background:'var(--brand)', flexShrink:0,
                  boxShadow:'0 0 6px rgba(0,229,204,0.5)',
                  fontSize:8, fontWeight:900, color:'#000', lineHeight:1
                }}>✓</span>
              )}
              {loc.featured && (
                <span style={{ fontSize:12 }}>⭐</span>
              )}
            </div>

            {/* Badge tipo + ciudad */}
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span className={`rm-badge rm-badge--${loc.type}`}>
                {loc.type === 'escuela' ? 'Escuela' : 'Grupo'}
              </span>
              <span style={{ fontSize:11, color:'var(--muted)' }}>
                📍 {loc.city}
              </span>
            </div>
          </div>

          {/* Chevron */}
          <span style={{
            fontSize:18, color: selected ? 'var(--brand)' : 'rgba(255,255,255,0.15)',
            flexShrink:0, fontWeight:300
          }}>›</span>
        </div>

        {/* Horario */}
        {loc.schedule && (
          <div style={{ fontSize:11, color:'var(--muted2)', paddingLeft:58 }}>
            🕐 {loc.schedule}
          </div>
        )}

      </div>
    </div>
  )
})

export default LocationCard
