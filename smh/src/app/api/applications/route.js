import { supabase } from '@/utils/supabase';
import { getSession } from 'next-auth/react';

// 🔹 GET: Retrieve all applications for logged-in user or admin
export async function GET(req) {
    const session = await getSession({ req });

    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { user_type, id: userId } = session.user;

    let applicationsQuery;

    if (user_type === 'preserver') {
        applicationsQuery = supabase
            .from('applications')
            .select('*')
            .eq('preserver_id', userId)
    } else if (user_type === 'admin') {
        applicationsQuery = supabase.from('applications').select('*');
    } else {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    const { data, error } = await applicationsQuery;

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
}

// 🔹 POST: Create a new application for preserver (after creating their account)
export async function POST(req) {
    try {
        const session = await getSession({ req });

        // 1️⃣ Only allow non-logged-in users or admins to create an application
        if (session && session.user.user_type !== 'admin') {
            return new Response(JSON.stringify({ error: "You already have an account." }), { status: 403 });
        }

        // 2️⃣ Parse request body
        const { email, password, first_name, last_name, phone, username, experience, reason } = await req.json();

        // 3️⃣ Validate required fields
        if (!email || !password || !first_name || !last_name || !phone || !username || !reason) {
            return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 });
        }

        // 4️⃣ Create preserver account via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

        if (authError) {
            return new Response(JSON.stringify({ error: authError.message }), { status: 400 });
        }

        const userId = authData.user.id;

        // 5️⃣ Store additional user details in "users" table
        const { error: userError } = await supabase
            .from("users")
            .insert([
                {
                    id: userId,
                    first_name,
                    last_name,
                    phone,
                    username,
                    user_type: "preserver"
                }
            ]);

        if (userError) {
            return new Response(JSON.stringify({ error: userError.message }), { status: 400 });
        }

        // 6️⃣ Check if preserver already has an application
        const { data: existingApplication, error: fetchError } = await supabase
            .from("applications")
            .select("id, status")
            .eq("preserver_id", userId)
            .single();

        if (fetchError && fetchError.code !== "PGRST116") {
            return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
        }

        // 7️⃣ If application exists, handle based on status
        if (existingApplication) {
            if (["pending", "approved"].includes(existingApplication.status)) {
                return new Response(JSON.stringify({ error: "You already have an active application." }), { status: 403 });
            }

            // 8️⃣ If "withdrawn" or "rejected", delete old application
            await supabase
                .from("applications")
                .delete()
                .eq("id", existingApplication.id);
        }

        // 9️⃣ Insert new application
        const { data: newApplication, error: appError } = await supabase
            .from("applications")
            .insert([
                {
                    preserver_id: userId,
                    experience,
                    reason,
                    status: "pending",
                    rejected_reason: null
                }
            ])
            .single();

        if (appError) {
            return new Response(JSON.stringify({ error: appError.message }), { status: 400 });
        }

        return new Response(JSON.stringify({ message: "Application submitted successfully", application: newApplication }), { status: 201 });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

// 🔹 PUT: Only Admin can update an application
export async function PUT(req) {
    try {
        const session = await getSession({ req });
        const { id, status, rejected_reason } = await req.json();

        // Ensure valid status
        const validStatuses = ['pending', 'approved', 'rejected', 'withdrawn'];
        if (!validStatuses.includes(status)) {
            return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400 });
        }

        // 1️⃣ Only admins can update an application
        if (session.user.user_type !== 'admin') {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

        const { error } = await supabase
            .from("applications")
            .update({ status, rejected_reason })
            .eq("id", id);

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        }

        return new Response(JSON.stringify({ message: "Application updated successfully" }), { status: 200 });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

// 🔹 DELETE: Only Admins can delete applications (Preservers cannot delete)
export async function DELETE(req) {
    const session = await getSession({ req });
    const { id } = await req.json();

    if (!id) {
        return new Response(JSON.stringify({ error: "Application ID is required" }), { status: 400 });
    }

    // Admin can delete an application
    if (session.user.user_type === 'admin') {
        // Delete application
        const { error: deleteError } = await supabase
            .from("applications")
            .delete()
            .eq("id", id);

        if (deleteError) {
            return new Response(JSON.stringify({ error: deleteError.message }), { status: 400 });
        }

        return new Response(JSON.stringify({ message: "Application deleted successfully" }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
}

// 🔹 PUT: Preservers can withdraw their application (change status to withdrawn)
export async function PUT_WITHDRAW(req) {
    const session = await getSession({ req });
    const { id } = await req.json();

    if (!id) {
        return new Response(JSON.stringify({ error: "Application ID is required" }), { status: 400 });
    }

    // Ensure that the preserver is updating their own application
    if (session.user.user_type !== 'preserver') {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    const { data: existingApplication, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !existingApplication) {
        return new Response(JSON.stringify({ error: "Application not found" }), { status: 404 });
    }

    if (existingApplication.preserver_id !== session.user.id) {
        return new Response(JSON.stringify({ error: "You can only withdraw your own application" }), { status: 403 });
    }

    // Update status to "withdrawn"
    const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'withdrawn' })
        .eq('id', id);

    if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "Application withdrawn successfully" }), { status: 200 });
}
