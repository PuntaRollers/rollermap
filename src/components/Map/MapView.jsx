import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const URUGUAY_CENTER = [-56.1645, -34.9011]

function buildPopupHTML(loc) {
  const initials = loc.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
  const waHref = loc.whatsapp ? `https://wa.me/${loc.whatsapp.replace(/\D/g,'')}` : null
  const igHref = loc.instagram ? `https://instagram.com/${loc.instagram.replace('@','')}` : null
  const desc = loc.description ? `${loc.description.slice(0,110)}${loc.description.length>110?'…':''}` : null
  return `<div class="rm-popup">
    <div class="rm-popup__header">
      ${loc.image_url
        ? `<div style="width:40px;height:40px;border-radius:8px;overflow:hidden;flex-shrink:0;"><img src="${loc.image_url}" style="width:100%;height:100%;object-fit:cover;"/></div>`
        : `<div class="rm-avatar rm-avatar--${loc.type} rm-avatar--sm" style="width:38px;height:38px;font-size:13px;border-radius:9px;">${initials}</div>`
      }
      <div class="rm-popup__title-col">
        <div class="rm-popup__name">${loc.name}</div>
        <div class="rm-popup__meta">
          <span class="rm-badge rm-badge--${loc.type}">${loc.type==='escuela'?'Escuela':'Grupo'}</span>
          <span class="rm-popup__city">📍 ${loc.city}</span>
        </div>
      </div>
      ${loc.verified ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:#00E5CC;font-size:9px;font-weight:900;color:#000;box-shadow:0 0 8px rgba(0,229,204,0.5);flex-shrink:0;">✓</span>` : ''}
    </div>
    ${desc ? `<p class="rm-popup__desc">${desc}</p>` : ''}
    ${loc.schedule ? `<div class="rm-popup__schedule">🕐 ${loc.schedule}</div>` : ''}
    <div class="rm-popup__actions">
      ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener" class="rm-popup__btn rm-popup__btn--wa">💬 WhatsApp</a>` : ''}
      ${igHref ? `<a href="${igHref}" target="_blank" rel="noopener" class="rm-popup__btn rm-popup__btn--ig">📸 Instagram</a>` : ''}
    </div>
  </div>`
}

function toGeoJSON(locs) {
  return {
    type: 'FeatureCollection',
    features: locs.map(loc => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [loc.lng, loc.lat] },
      properties: { ...loc }
    }))
  }
}

function createUserMarkerEl() {
  const el = document.createElement('div')
  el.style.cssText = `width:16px;height:16px;border-radius:50%;background:#0EA5E9;border:3px solid white;box-shadow:0 2px 8px rgba(14,165,233,0.35);`
  return el
}

export default function MapView({ locations=[], allLocations=[], selectedId=null, loading=false, onMarkerClick, onMapReady, onUserLocated }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const activePopup  = useRef(null)
  const userMarker   = useRef(null)
  const allLocsRef   = useRef([])
  const [mapReady, setMapReady] = useState(false)

  // Exponer función de geolocalización al padre
  useEffect(() => {
    if (!onUserLocated) return
    window.__rmGeolocate = () => {
      if (!navigator.geolocation || !mapRef.current) return
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          userMarker.current?.remove()
          userMarker.current = new mapboxgl.Marker({ element: createUserMarkerEl() })
            .setLngLat([coords.longitude, coords.latitude])
            .addTo(mapRef.current)
          mapRef.current.flyTo({ center:[coords.longitude, coords.latitude], zoom:11, speed:1.6, curve:1.4, essential:true })
          onUserLocated(coords)
        },
        () => {}
      )
    }
    return () => { delete window.__rmGeolocate }
  }, [onUserLocated])

  useEffect(() => {
    if (mapRef.current) return
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: URUGUAY_CENTER,
      zoom: 8,
      minZoom: 5,
      maxZoom: 18,
      pitchWithRotate: false,
      maxBounds: [[-62,-36],[-52,-28]],
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ showCompass:false }), 'top-right')
    map.addControl(new mapboxgl.ScaleControl({ unit:'metric' }), 'bottom-left')

    map.on('load', () => {
      map.setPadding({ bottom: 380, top: 60, left: 0, right: 0 })

      map.addSource('locations', {
        type: 'geojson',
        data: toGeoJSON([]),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 48,
      })

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'locations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#00E5CC', 5, '#9B4DFF', 15, '#FF5F00'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 5, 26, 15, 32],
          'circle-opacity': 0.88,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.25)',
        }
      })

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'locations',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: { 'text-color': '#000000' }
      })

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'locations',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['match', ['get', 'type'], 'escuela', '#00E5CC', '#9B4DFF'],
          'circle-radius': 13,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.35)',
        }
      })

      map.addLayer({
        id: 'unclustered-selected',
        type: 'circle',
        source: 'locations',
        filter: ['==', ['get', 'id'], ''],
        paint: {
          'circle-color': ['match', ['get', 'type'], 'escuela', '#00E5CC', '#9B4DFF'],
          'circle-radius': 18,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 1,
        }
      })

      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers:['clusters'] })
        const clusterId = features[0].properties.cluster_id
        map.getSource('locations').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return
          map.easeTo({ center: features[0].geometry.coordinates, zoom, duration: 500 })
        })
      })

      map.on('click', 'unclustered-point', (e) => {
        const props = e.features[0].properties
        const loc = allLocsRef.current.find(l => l.id === props.id) ?? props
        if (activePopup.current) activePopup.current.remove()
        activePopup.current = new mapboxgl.Popup({ offset:20, closeButton:true, maxWidth:'300px' })
          .setLngLat(e.features[0].geometry.coordinates)
          .setHTML(buildPopupHTML(loc))
          .addTo(map)
        onMarkerClick?.(loc)
      })

      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = '' })
      map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = '' })

      setMapReady(true)
      onMapReady?.(map)
    })

    return () => { map.remove(); mapRef.current = null }
  }, []) // eslint-disable-line

  useEffect(() => {
    allLocsRef.current = allLocations
    if (!mapReady || !mapRef.current) return
    mapRef.current.getSource('locations')?.setData(toGeoJSON(locations))
  }, [mapReady, locations, allLocations])

  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const filter = selectedId
      ? ['==', ['get', 'id'], selectedId]
      : ['==', ['get', 'id'], '']
    mapRef.current.setFilter('unclustered-selected', filter)
  }, [mapReady, selectedId])

  return (
    <div style={{ position:'relative', width:'100%', height:'100%' }}>
      <div ref={containerRef} style={{ width:'100%', height:'100%' }} />
      {(loading || !mapReady) && (
        <div className="rm-map-loading">
          <div className="rm-spinner rm-spinner--brand" /> Cargando mapa…
        </div>
      )}
    </div>
  )
}
