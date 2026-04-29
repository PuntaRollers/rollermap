import { useRef, useCallback, useState, useEffect } from 'react'
import { useLocations }   from './hooks/useLocations'
import { useMapState }    from './hooks/useMapState'
import MapView            from './components/Map/MapView'
import Sidebar            from './components/Sidebar'
import BottomSheet        from './components/BottomSheet'
import RegisterForm       from './components/Register/RegisterForm'

const DESKTOP_BP = 768

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= DESKTOP_BP)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BP}px)`)
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

export default function App() {
  const isDesktop = useIsDesktop()
  const mapInstanceRef = useRef(null)
  const [sheetState, setSheetState] = useState('mid')
  const [showRegister, setShowRegister] = useState(false)

  const { locations: allLocations, loading, error } = useLocations()

  const {
    selectedId, filterType, filterCity, search,
    filtered, cities, hasActiveFilters,
    setSelectedId, setFilterType, setFilterCity, setSearch, clearFilters,
  } = useMapState(allLocations)

  const handleMarkerClick = useCallback((loc) => {
    setSelectedId(loc.id)
    if (!isDesktop) setSheetState('mid')
  }, [setSelectedId, isDesktop])

  const handleCardClick = useCallback((loc) => {
    setSelectedId(loc.id)
    mapInstanceRef.current?.flyTo({
      center: [loc.lng, loc.lat],
      zoom: Math.max(mapInstanceRef.current.getZoom(), 13),
      speed: 1.4, curve: 1.2,
    })
  }, [setSelectedId])

  const handleMapReady = useCallback((map) => {
    mapInstanceRef.current = map
  }, [])

  const sharedProps = {
    filtered, cities, loading, hasActiveFilters,
    selectedId, filterType, filterCity, search,
    onCardClick: handleCardClick,
    onTypeChange: setFilterType,
    onCityChange: setFilterCity,
    onSearchChange: setSearch,
    onClearFilters: clearFilters,
    onRegisterClick: () => setShowRegister(true),
  }

  return (
    <div className="rm-app">
      {isDesktop && <Sidebar {...sharedProps} />}
      <div style={{ flex:1, position:'relative', height:'100%' }}>
        {error && (
          <div className="rm-alert rm-alert--error" style={{ position:'absolute', top:14, left:'50%', transform:'translateX(-50%)', zIndex:30, whiteSpace:'nowrap' }}>
            ⚠️ {error}
          </div>
        )}
        <MapView locations={filtered} allLocations={allLocations} selectedId={selectedId} loading={loading} onMarkerClick={handleMarkerClick} onMapReady={handleMapReady} />
        {!isDesktop && (
          <div className="rm-mobile-header">
            <div className="rm-logo">
              <div className="rm-logo__icon">AR</div>
              <div>
                <div className="rm-logo__name">ROLLERMAP</div>
                <div className="rm-logo__sub">by Alianza Roller</div>
              </div>
            </div>
            <button className="rm-btn rm-btn--primary rm-btn--sm" style={{ borderRadius:'var(--r-full)' }} onClick={() => setSheetState(s => s === 'closed' ? 'mid' : 'closed')}>
              {sheetState === 'closed' ? `🛼 Ver lista (${filtered.length})` : '✕ Cerrar'}
            </button>
          </div>
        )}
      </div>
      {!isDesktop && <BottomSheet {...sharedProps} sheetState={sheetState} onStateChange={setSheetState} />}
      {showRegister && <RegisterForm onClose={() => setShowRegister(false)} isDesktop={isDesktop} />}
    </div>
  )
}
