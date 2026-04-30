import { useState, useCallback, useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { supabase } from '../../lib/supabase'

const STEPS=[{id:1,label:'Básico',icon:'📋'},{id:2,label:'Ubicación',icon:'📍'},{id:3,label:'Contacto',icon:'📲'}]
const INITIAL_FORM={type:'',name:'',city:'',department:'',address:'',lat:'',lng:'',instagram:'',whatsapp:'',email:'',schedule:'',description:'',imageFile:null}
const DEPARTMENTS=['Artigas','Canelones','Cerro Largo','Colonia','Durazno','Flores','Florida','Lavalleja','Maldonado','Montevideo','Paysandú','Río Negro','Rivera','Rocha','Salto','San José','Soriano','Tacuarembó','Treinta y Tres']
const FALLBACK_CITIES=[
  'Artigas','Atlántida','Bella Unión','Canelones','Carmelo','Ciudad de la Costa',
  'Colonia del Sacramento','Dolores','Durazno','Florida','Fray Bentos','Juan Lacaze',
  'La Paz','Las Piedras','Maldonado','Melo','Mercedes','Minas','Migues','Montevideo',
  'Nueva Helvecia','Nueva Palmira','Pando','Parque del Plata','Paso Carrasco',
  'Paysandú','Progreso','Punta del Este','Rivera','Rocha','Salinas','Salto',
  'San Jacinto','San José de Mayo','San Ramón','Santa Lucía','Sauce','Soca',
  'Tacuarembó','Tala','Treinta y Tres','Trinidad','Young','Fray Bentos'
].sort()

function useCities() {
  const [cities,setCities]=useState(FALLBACK_CITIES)
  useEffect(()=>{
    supabase.from('locations').select('city').eq('status','approved').then(({data})=>{
      if (!data?.length) return
      const fromDb=[...new Set(data.map(d=>d.city))]
      setCities([...new Set([...fromDb,...FALLBACK_CITIES])].sort())
    })
  },[])
  return cities
}

function MiniMap({lat,lng,onChange}) {
  const containerRef=useRef(null)
  const mapRef=useRef(null)
  const markerRef=useRef(null)
  const debounceRef=useRef(null)
  const [hasMarker,setHasMarker]=useState(false)

  useEffect(()=>{
    const map=new mapboxgl.Map({container:containerRef.current,style:'mapbox://styles/mapbox/light-v11',center:[-56.1645,-32.5228],zoom:5.5,minZoom:4,maxZoom:17})
    map.addControl(new mapboxgl.NavigationControl({showCompass:false}),'top-right')
    map.on('click',(e)=>{
      const {lat:la,lng:ln}=e.lngLat
      onChange('lat',la.toFixed(6));onChange('lng',ln.toFixed(6))
      place(map,[ln,la])
    })
    mapRef.current=map
    return ()=>{map.remove();mapRef.current=null;markerRef.current=null}
  },[]) // eslint-disable-line

  useEffect(()=>{
    clearTimeout(debounceRef.current)
    debounceRef.current=setTimeout(()=>{
      const map=mapRef.current
      const la=parseFloat(lat),ln=parseFloat(lng)
      if (!map||isNaN(la)||isNaN(ln)) return
      if (la<-90||la>90||ln<-180||ln>180) return
      place(map,[ln,la])
      map.flyTo({center:[ln,la],zoom:13,speed:1.5,curve:1.3})
    },400)
    return ()=>clearTimeout(debounceRef.current)
  },[lat,lng])

  function place(map,lngLat) {
    if (markerRef.current){markerRef.current.setLngLat(lngLat)}
    else {
      const el=document.createElement('div')
      el.className='rm-minimap__marker'
      markerRef.current=new mapboxgl.Marker({element:el,anchor:'center'}).setLngLat(lngLat).addTo(map)
    }
    setHasMarker(true)
  }

  return (
    <div className="rm-minimap">
      <div ref={containerRef} style={{width:'100%',height:'100%'}}/>
      {!hasMarker&&<div className="rm-minimap__hint">👆 Tocá el mapa para marcar tu ubicación</div>}
    </div>
  )
}

function validate(step,form) {
  const errs={}
  if (step===1){if(!form.type) errs.type='Seleccioná un tipo';if(!form.name.trim()) errs.name='El nombre es obligatorio';if(!form.city.trim()) errs.city='La ciudad es obligatoria'}
  if (step===2){if(form.lat&&isNaN(parseFloat(form.lat))) errs.lat='Latitud inválida';if(form.lng&&isNaN(parseFloat(form.lng))) errs.lng='Longitud inválida'}
  if (step===3){if(form.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email='Email inválido'}
  return errs
}

async function submitToSupabase(form) {
  const payload={
    type:form.type, name:form.name.trim(), city:form.city.trim(),
    department:form.department||null, address:form.address.trim()||null,
    lat:form.lat?parseFloat(form.lat):null, lng:form.lng?parseFloat(form.lng):null,
    instagram:form.instagram.replace('@','').trim()||null,
    whatsapp:form.whatsapp.replace(/\D/g,'')||null,
    email:form.email.trim()||null,
    schedule:form.schedule.trim()||null,
    description:form.description.trim()||null,
    status:'pending'
  }
  const {data,error}=await supabase.from('locations').insert(payload).select('id').single()
  if (error) throw new Error(error.message)
  return data
}

function Step1({form,errors,onChange,cities}) {
  return (
    <>
      <div className="rm-form-group">
        <label className="rm-label">Tipo <span style={{color:'var(--brand)'}}>*</span></label>
        <div className="rm-type-grid">
          {[{value:'escuela',icon:'🏫',label:'Escuela',desc:'Clases y formación'},{value:'grupo',icon:'👥',label:'Grupo',desc:'Rides y encuentros'}].map(({value,icon,label,desc})=>(
            <div key={value} className={`rm-type-card rm-type-card--${value} ${form.type===value?'rm-type-card--selected':''}`} onClick={()=>onChange('type',value)}>
              <span style={{fontSize:28}}>{icon}</span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:form.type===value?(value==='escuela'?'var(--brand-text)':'var(--grupo-text)'):'var(--muted)'}}>{label}</span>
              <span style={{fontSize:11,color:'var(--muted2)',textAlign:'center'}}>{desc}</span>
            </div>
          ))}
        </div>
        {errors.type&&<span style={{fontSize:11.5,color:'var(--danger)'}}>⚠ {errors.type}</span>}
      </div>
      <div className="rm-form-group">
        <label className="rm-label">Nombre <span style={{color:'var(--brand)'}}>*</span></label>
        <input className={`rm-input ${errors.name?'rm-input--error':''}`} placeholder="Ej: Punta Rollers" value={form.name} maxLength={80} onChange={(e)=>onChange('name',e.target.value)}/>
        {errors.name&&<span style={{fontSize:11.5,color:'var(--danger)'}}>⚠ {errors.name}</span>}
      </div>
      <div className="rm-form-group">
        <label className="rm-label">Ciudad <span style={{color:'var(--brand)'}}>*</span></label>
        <input className={`rm-input ${errors.city?'rm-input--error':''}`} placeholder="Ej: Las Piedras" value={form.city} onChange={(e)=>onChange('city',e.target.value)} list="rm-cities-list" autoComplete="off"/>
        <datalist id="rm-cities-list">{cities.map(c=><option key={c} value={c}/>)}</datalist>
        {errors.city&&<span style={{fontSize:11.5,color:'var(--danger)'}}>⚠ {errors.city}</span>}
      </div>
      <div className="rm-form-group">
        <label className="rm-label">Departamento</label>
        <select className="rm-select" value={form.department} onChange={(e)=>onChange('department',e.target.value)}>
          <option value="">Seleccioná un departamento</option>
          {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
        </select>
      </div>
    </>
  )
}

function Step2({form,errors,onChange}) {
  const [geoLoading,setGeoLoading]=useState(false)
  const [geoError,setGeoError]=useState(null)
  const handleGeolocate=()=>{
    if (!navigator.geolocation){setGeoError('No disponible.');return}
    setGeoLoading(true);setGeoError(null)
    navigator.geolocation.getCurrentPosition(({coords})=>{onChange('lat',coords.latitude.toFixed(6));onChange('lng',coords.longitude.toFixed(6));setGeoLoading(false)},()=>{setGeoError('No se pudo obtener.');setGeoLoading(false)},{enableHighAccuracy:true,timeout:8000})
  }
  const hasCoords=form.lat&&form.lng&&!isNaN(parseFloat(form.lat))&&!isNaN(parseFloat(form.lng))
  return (
    <>
      <div className="rm-form-group">
        <label className="rm-labe
