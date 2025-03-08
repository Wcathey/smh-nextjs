import { supabase } from "@/utils/supabase";

export async function GET() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    return new Response(JSON.stringify(data.user), { status: 200 });
}
