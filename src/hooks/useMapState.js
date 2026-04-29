import { useState, useMemo } from 'react'

export function useMapState(locations = []) {
  const [selectedId,  setSelectedId]  = useState(null)
  const [filterType,  setFilterType]  = useState(null)
  const [filterCity,  setFilterCity]  = useState(null)
  const [search,      setSearch]      = useState('')

  const cities = useMemo(() => {
    const set = new Set(locations.map((l) => l.city))
    return Array.from(set).sort()
  }, [locations])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return locations.filter((l) => {
      if (filterType && l.type !== filterType) return false
      if (filterCity && l.city !== filterCity) return false
      if (q && !l.name.toLowerCase().includes(q) &&
               !l.city.toLowerCase().includes(q)) return false
      return true
    })
  }, [locations, filterType, filterCity, search])

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedId) ?? null,
    [locations, selectedId]
  )

  function clearFilters() {
    setFilterType(null)
    setFilterCity(null)
    setSearch('')
  }

  const hasActiveFilters = filterType !== null || filterCity !== null || search !== ''

  return {
    selectedId, filterType, filterCity, search,
    filtered, cities, selectedLocation, hasActiveFilters,
    setSelectedId, setFilterType, setFilterCity, setSearch, clearFilters,
  }
}
