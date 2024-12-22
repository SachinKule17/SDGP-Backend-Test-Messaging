const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qbqwbeppyliavvfzryze.supabase.co'; // Supabase URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFicXdiZXBweWxpYXZ2ZnpyeXplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzU4NTk1NywiZXhwIjoyMDQ5MTYxOTU3fQ.iCgfKb9CkkIIfmvozjHWmklW9BzbnT7Kd4GiN3Rhlh8'; // Supabase anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = { supabase };
