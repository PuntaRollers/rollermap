import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cxnwnxqrvtkaosmkjzoz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bndueHFydnRrYW9zbWtqem96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODI5NDMsImV4cCI6MjA5MzA1ODk0M30.T3exr9Czb35kF_qslr7kQKRY5kunsca9KfWNm1ymXt4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
