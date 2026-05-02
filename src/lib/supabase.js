import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cxnwnxqrvtkaosmkjzoz.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_2M5oIpzVs2QRFgpE7VHMMg_NMuAnCCv'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
