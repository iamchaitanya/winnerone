import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log("Checking divide_logs SELECT...");
    const sel = await supabase.from('divide_logs').select('*').limit(1);
    console.log(JSON.stringify(sel, null, 2));

    console.log("Checking divide_logs INSERT...");
    const ins = await supabase.from('divide_logs').insert({
        player_id: 'b82d3e91-c116-4177-8c43-9118e7e1742d', // Ayaan's ID usually
        score: 0,
        wrong_count: 0,
        earnings: 0,
        details: [],
        played_at: new Date().toISOString()
    });
    console.log(JSON.stringify(ins, null, 2));
}
run();
