import { createClient } from '@supabase/supabase-js';

// Absolute Hardcoded credentials to bypass any .env loading issues on port 5174
const supabaseUrl = 'https://sofybjtkbjzxlunzysyg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZnlianRrYmp6eGx1bnp5c3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NDk4NzEsImV4cCI6MjA4MzAyNTg3MX0.fQMLMUFppzIlCCum29RFKGakM9r96kdlYhl1V2oGZfk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
