import { supabase } from "@/utils/supabase";

export async function POST(req) {
  const { email, password } = await req.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 401 });
  }
  console.log(data);
  // Return the session information after login
  return new Response(
    JSON.stringify({
      message: "Login successful",
      user: data
    }),
    { status: 200 }
  );
}
