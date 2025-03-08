import { supabase } from "@/utils/supabase";

export default async function handler(req, res) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

    const { id } = req.query;

    // Ensure user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Fetch user by ID
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();

    if (error) return res.status(404).json({ error: "User not found" });

    res.status(200).json(data);
}
