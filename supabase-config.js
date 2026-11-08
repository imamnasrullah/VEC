const SUPABASE_URL = "https://irayxhkvfutjqwaeulvk.supabase.co";
const SUPABASE_KEY = "sb_publishable_qtMxQIW51NYE--NcauZKZw_nZU-5vTt";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase client berhasil dibuat!");