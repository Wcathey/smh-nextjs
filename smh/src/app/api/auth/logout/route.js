import { supabase } from "@/utils/supabase";

export async function POST() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "User logged out" }), { status: 200 });
}
