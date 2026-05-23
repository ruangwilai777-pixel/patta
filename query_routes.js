import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sofybjtkbjzxlunzysyg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZnlianRrYmp6eGx1bnp5c3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NDk4NzEsImV4cCI6MjA4MzAyNTg3MX0.fQMLMUFppzIlCCum29RFKGakM9r96kdlYhl1V2oGZfk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
    const { data: trips, error } = await supabase.from('trips').select('route, driver_name').limit(100);
    if (error) {
        console.error(error);
        return;
    }
    const routes = new Set(trips.map(t => t.route));
    const drivers = new Set(trips.map(t => t.driver_name));
    console.log("Unique Routes in DB:", Array.from(routes));
    console.log("Unique Drivers in DB:", Array.from(drivers));
}

main();
