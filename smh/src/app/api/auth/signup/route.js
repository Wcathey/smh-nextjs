import { supabase } from "@/utils/supabase";
import bcrypt from "bcryptjs";  // Assuming bcryptjs is installed for hashing passwords

export async function POST(req) {
    try {
        // 1️⃣ Parse incoming JSON body to get user details
        const { email, password, first_name, last_name, phone_number, username, user_type } = await req.json();

        // 2️⃣ Check if all required fields are provided
        if (!email || !password || !first_name || !last_name || !phone_number || !username || !user_type) {
            return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 });
        }

        // 3️⃣ Validate user_type to be one of the allowed values
        const validUserTypes = ['client', 'preserver', 'admin'];
        if (!validUserTypes.includes(user_type)) {
            return new Response(JSON.stringify({ error: "Invalid user type" }), { status: 400 });
        }

        // Convert user_type to uppercase to match the database constraint
        const userTypeUpper = user_type.toUpperCase(); // Converts 'client' to 'CLIENT', 'preserver' to 'PRESERVER', etc.

        // 4️⃣ Validate Email Format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Basic email format check
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({ error: "Invalid email format" }), { status: 400 });
        }

        // 5️⃣ Create user in Supabase Auth
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

        // 6️⃣ Hash the password manually for storing in the "users" table (optional)
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password using bcrypt

        // 7️⃣ Store additional user info in the "users" table
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
                    email: user.email, // Ensure email is stored properly
                    hashed_password: hashedPassword // Store hashed password here
                }
            ]);

        if (userError) {
            return new Response(JSON.stringify({ error: userError.message }), { status: 400 });
        }

        // 8️⃣ Return success response
        return new Response(JSON.stringify({ message: "User created successfully", user }), { status: 201 });

    } catch (err) {
        console.error(err); // Log the error to help debug
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
