import { supabase } from "@/utils/supabase";

export async function POST(req) {
    const { email, password } = await req.json();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 401 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
}
