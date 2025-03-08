import { supabase } from "@/utils/supabase";

import { supabase } from "@/utils/supabase";

export default async function handler(req, res) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

    // Ensure user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Query all users
    const { data, error } = await supabase.from("users").select("*");

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ users: data });
}
