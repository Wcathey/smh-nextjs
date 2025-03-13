import { supabase } from "@/utils/supabase";

export async function POST(req) {
    try {
        // Parse incoming JSON body to get user details
        const { email, password, first_name, last_name, phone_number, username, user_type } = await req.json();

        // Check if all required fields are provided
        if (!email || !password || !first_name || !last_name || !phone_number || !username || !user_type) {
            return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 });
        }

        // Validate user_type to be one of the allowed values
        const validUserTypes = ['client', 'preserver', 'admin'];
        if (!validUserTypes.includes(user_type)) {
            return new Response(JSON.stringify({ error: "Invalid user type" }), { status: 400 });
        }

        // Validate Email Format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Basic email format check
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({ error: "Invalid email format" }), { status: 400 });
        }

        // Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        // If signUp fails, return error
        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        }

        // Check if the user was successfully created
        const user = data.user;
        if (!user || !user.email) {
            return new Response(JSON.stringify({ error: "User creation failed or email is missing" }), { status: 400 });
        }

        // Store additional user info in the "users" table
        const { error: userError } = await supabase
            .from("users")
            .insert([
                {
                    id: user.id, // User ID from Supabase
                    first_name,
                    last_name,
                    phone_number,
                    username,
                    user_type, // Store user type in uppercase to match DB constraint
                    email: user.email // Ensure email is stored properly
                }
            ]);

        if (userError) {
            return new Response(JSON.stringify({ error: userError.message }), { status: 400 });
        }

        // Automatically log the user in after signup
        const { session, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (loginError) {
            return new Response(JSON.stringify({ error: loginError.message }), { status: 400 });
        }

        // Return success response with user and session data
        return new Response(JSON.stringify({ message: "User created and logged in successfully", user, session }), { status: 201 });

    } catch (err) {
        console.error(err); // Log the error to help debug
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
