import { forwardRef } from 'react'

const LocationCard = forwardRef(function LocationCard({ loc, selected, onClick }, ref) {
  const initials = loc.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()

  return (
    <div
      ref={ref}
      className={`rm-card rm-loc-card ${selected?'rm-loc-card--selected':''}`}
      onClick={() => onClick(loc)}
    >
      <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
        <div className={`rm-avatar rm-avatar--${loc.type} rm-avatar--md`}>
          {initials}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,color:'var(--ink)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160}}>
              {loc.name}
            </span>
            {loc.verified && <span className="rm-badge rm-badge--verified">✦</span>}
            {loc.featured && <span className="rm-badge rm-badge--featured">⭐</span>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4,flexWrap:'wrap'}}>
            <span className={`rm-badge rm-badge--${loc.type}`}>
              {loc.type==='escuela'?'Escuela':'Grupo'}
            </span>
            <span style={{fontSize:11,color:'var(--muted)'}}>📍 {loc.city}</span>
          </div>
        </div>
        <span style={{fontSize:14,color:selected?'var(--brand)':'var(--line)',flexShrink:0}}>›</span>
      </div>
      {loc.schedule && (
        <div style={{fontSize:11,color:'var(--muted2)',marginTop:8,display:'flex',gap:4}}>
          🕐 {loc.schedule}
        </div>
      )}
    </div>
  )
})

export default LocationCard
