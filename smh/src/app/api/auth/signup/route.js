import { supabase } from "@/utils/supabase";

export async function POST(req) {
    try {
        // 1️⃣ Parse incoming JSON body to get user details
        const { email, password, first_name, last_name, phone, username, user_type } = await req.json();

        // 2️⃣ Check if all required fields are provided
        if (!email || !password || !first_name || !last_name || !phone || !username || !user_type) {
            return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 });
        }

        // 3️⃣ Validate user_type to be one of the allowed values
        const validUserTypes = ['client', 'preserver', 'admin'];
        if (!validUserTypes.includes(user_type)) {
            return new Response(JSON.stringify({ error: "Invalid user type" }), { status: 400 });
        }

        // 4️⃣ Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        }

        const user = data.user;

        // 5️⃣ Store additional user info in the "profiles" table
        const { error: profileError } = await supabase
            .from("profiles")
            .insert([
                {
                    id: user.id,
                    first_name,
                    last_name,
                    phone,
                    username,
                    user_type // Store the user type in the profiles table
                }
            ]);

        if (profileError) {
            return new Response(JSON.stringify({ error: profileError.message }), { status: 400 });
        }

        // 6️⃣ Return success response
        return new Response(JSON.stringify({ message: "User created successfully", user }), { status: 201 });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
