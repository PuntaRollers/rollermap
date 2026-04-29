import { useState, useEffect } from 'react'

const DEPARTMENTS=['Artigas','Canelones','Cerro Largo','Colonia','Durazno','Flores','Florida','Lavalleja','Maldonado','Montevideo','Paysandú','Río Negro','Rivera','Rocha','Salto','San José','Soriano','Tacuarembó','Treinta y Tres']

export default function EditModal({ loc, onSave, onClose, isDesktop }) {
  const [form,    setForm]    = useState({})
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setForm({
      name:loc.name??'', city:loc.city??'', department:loc.department??'',
      address:loc.address??'', instagram:loc.instagram??'', whatsapp:loc.whatsapp??'',
      schedule:loc.schedule??'', description:loc.description??'',
      verified:loc.verified??false, featured:loc.featured??false,
    })
  }, [loc])

  const set=(key,val)=>setForm(f=>({...f,[key]:val}))

  const handleSave=async()=>{
    if (!form.name?.trim()){setError('El nombre es obligatorio.');return}
    if (!form.city?.trim()){setError('La ciudad es obligatoria.');return}
    setLoading(true);setError(null)
    const patch={
      name:form.name.trim(), city:form.city.trim(), department:form.department||null,
      address:form.address.trim()||null, instagram:form.instagram.replace('@','').trim()||null,
      whatsapp:form.whatsapp.replace(/\D/g,'')||null, schedule:form.schedule.trim()||null,
      description:form.description.trim()||null, verified:form.verified, featured:form.featured,
    }
    const ok=await onSave(loc.id,patch)
    if (!ok){setError('Error al guardar.');setLoading(false);return}
    onClose()
  }

  return (
    <div className="rm-overlay" onClick={(e)=>{if(e.target===e.currentTarget) onClose()}}>
      <div className="rm-modal" style={isDesktop?{borderRadius:'var(--r-xl)',maxHeight:'88dvh',margin:'auto'}:{}}>
        <div className="rm-modal__header">
          <button className="rm-btn rm-btn--icon" onClick={onClose}>←</button>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,color:'var(--ink)'}}>Editar ubicación</div>
            <div style={{fontSize:11,color:'var(--muted2)'}}>{loc.name}</div>
          </div>
        </div>

        <div className="rm-modal__body">
          {error&&<div className="rm-alert rm-alert--error"><span>⚠️</span><span>{error}</span></div>}

          <div className="rm-form-group">
            <label className="rm-label">Nombre</label>
            <input className="rm-input" value={form.name??''} onChange={(e)=>set('name',e.target.value)}/>
          </div>
          <div className="rm-form-row">
            <div className="rm-form-group">
              <label className="rm-label">Ciudad</label>
              <input className="rm-input" value={form.city??''} onChange={(e)=>set('city',e.target.value)}/>
            </div>
            <div className="rm-form-group">
              <label className="rm-label">Depto.</label>
              <select className="rm-select" value={form.department??''} onChange={(e)=>set('department',e.target.value)}>
                <option value="">—</option>
                {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="rm-form-group">
            <label className="rm-label">Dirección</label>
            <input className="rm-input" placeholder="Av. Principal 123" value={form.address??''} onChange={(e)=>set('address',e.target.value)}/>
          </div>
          <div className="rm-form-row">
            <div className="rm-form-group">
              <label className="rm-label">Instagram</label>
              <div className="rm-input-wrap">
                <span className="rm-input-wrap__icon" style={{fontSize:13}}>@</span>
                <input className="rm-input" value={form.instagram??''} onChange={(e)=>set('instagram',e.target.value.replace('@',''))}/>
              </div>
            </div>
            <div className="rm-form-group">
              <label className="rm-label">WhatsApp</label>
              <input className="rm-input" value={form.whatsapp??''} onChange={(e)=>set('whatsapp',e.target.value)} inputMode="tel"/>
            </div>
          </div>
          <div className="rm-form-group">
            <label className="rm-label">Horarios</label>
            <input className="rm-input" placeholder="Lun–Vie 16:00–20:00" value={form.schedule??''} onChange={(e)=>set('schedule',e.target.value)}/>
          </div>
          <div className="rm-form-group">
            <label className="rm-label">Descripción</label>
            <textarea className="rm-textarea" value={form.description??''} onChange={(e)=>set('description',e.target.value)} maxLength={400}/>
          </div>

          <div className={`rm-toggle ${form.verified?'rm-toggle--on':''}`} onClick={()=>set('verified',!form.verified)}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:form.verified?'var(--brand-text)':'var(--ink3)'}}>✦ Verificado</div>
              <div style={{fontSize:11,color:'var(--muted2)'}}>Identidad confirmada por Alianza Roller</div>
            </div>
            <div className={`rm-toggle__pill ${form.verified?'rm-toggle__pill--on':''}`}>
              <div className={`rm-toggle__dot ${form.verified?'rm-toggle__dot--on':''}`}/>
            </div>
          </div>

          <div className={`rm-toggle ${form.featured?'rm-toggle--on':''}`} onClick={()=>set('featured',!form.featured)}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:form.featured?'var(--brand-text)':'var(--ink3)'}}>⭐ Destacado</div>
              <div style={{fontSize:11,color:'var(--muted2)'}}>Aparece primero en la lista y el mapa</div>
            </div>
            <div className={`rm-toggle__pill ${form.featured?'rm-toggle__pill--on':''}`}>
              <div className={`rm-toggle__dot ${form.featured?'rm-toggle__dot--on':''}`}/>
            </div>
          </div>
        </div>

        <div className="rm-modal__footer">
          <button className="rm-btn rm-btn--secondary" onClick={onClose}>Cancelar</button>
          <button className="rm-btn rm-btn--primary rm-btn--full" onClick={handleSave} disabled={loading}>
            {loading&&<span className="rm-spinner"/>}
            {loading?'Guardando…':'✓ Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
