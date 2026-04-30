import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminLocations() {
  const [locations, setLocations] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: sbErr } = await supabase
      .from('locations')
      .select('id,created_at,name,type,city,department,address,lat,lng,instagram,whatsapp,schedule,description,status,verified,featured,image_url,email')
      .order('created_at', { ascending: false })
    if (sbErr) { setError(sbErr.message); setLoading(false); return }
    setLocations(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const applyLocal = (id, patch) =>
    setLocations((prev) => prev.map((l) => l.id === id ? { ...l, ...patch } : l))

  const updateStatus = useCallback(async (id, newStatus) => {
    applyLocal(id, { status: newStatus })
    const { error: sbErr } = await supabase
      .from('locations').update({ status: newStatus }).eq('id', id)
    if (sbErr) { setError(sbErr.message); fetch(); return false }
    return true
  }, [fetch])

  const updateLocation = useCallback(async (id, patch) => {
    applyLocal(id, patch)
    const { error: sbErr } = await supabase
      .from('locations').update(patch).eq('id', id)
    if (sbErr) { setError(sbErr.message); fetch(); return false }
    return true
  }, [fetch])

  const deleteLocation = useCallback(async (id) => {
    setLocations((prev) => prev.filter((l) => l.id !== id))
    const { error: sbErr } = await supabase
      .from('locations').delete().eq('id', id)
    if (sbErr) { setError(sbErr.message); fetch(); return false }
    return true
  }, [fetch])

  const toggleFlag = useCallback(async (id, flag, currentValue) => {
    return updateLocation(id, { [flag]: !currentValue })
  }, [updateLocation])

  return { locations, loading, error, refetch: fetch, updateStatus, updateLocation, deleteLocation, toggleFlag }
}
