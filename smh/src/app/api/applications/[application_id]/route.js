import { supabase } from '@/utils/supabase';
import { getSession } from 'next-auth/react';

// 🔹 GET: Get all applications or a specific application by ID
export async function GET(req, { params }) {
    const session = await getSession({ req });
    const { id } = params;

    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { user_type, id: userId } = session.user;

    // Get all applications if admin, or only user's own application
    let applicationsQuery;
    if (user_type === 'admin') {
        applicationsQuery = supabase.from('applications').select('*');
    } else if (user_type === 'preserver') {
        applicationsQuery = supabase
            .from('applications')
            .select('*')
            .eq('preserver_id', userId);
    } else {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    if (id) {
        applicationsQuery = applicationsQuery.eq('id', id);
    }

    const { data, error } = await applicationsQuery;

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
}

// 🔹 POST: Create a new application (only preserver or admin)
export async function POST(req) {
    const session = await getSession({ req });

    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { user_type, id: userId } = session.user;

    // Prevent a preserver from creating an application if one already exists
    if (user_type === 'preserver') {
        const { data: existingApplication, error: fetchError } = await supabase
            .from('applications')
            .select('*')
            .eq('preserver_id', userId)
            .eq('status', 'pending') // Only allow creating if no pending application
            .single();

        if (fetchError) {
            return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
        }

        if (existingApplication) {
            return new Response(JSON.stringify({ error: 'You already have a pending application.' }), { status: 400 });
        }
    }

    // Parse incoming JSON body to get application details
    const { reason, experience } = await req.json();

    const { error } = await supabase
        .from('applications')
        .insert([
            {
                preserver_id: userId,
                reason,
                experience,
                status: 'pending',
            },
        ]);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Application submitted successfully' }), { status: 201 });
}

// 🔹 PUT: Update an application (Preserver can only withdraw, Admin can update all)
export async function PUT(req, { params }) {
    const session = await getSession({ req });
    const { id } = params;
    const { status, rejected_reason } = await req.json();

    // Ensure valid status
    const validStatuses = ['pending', 'approved', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
        return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400 });
    }

    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { user_type, id: userId } = session.user;

    // Check if the preserver is trying to withdraw their own application
    if (user_type === 'preserver') {
        const { data: application, error: fetchError } = await supabase
            .from('applications')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
        }

        if (!application) {
            return new Response(JSON.stringify({ error: 'Application not found' }), { status: 404 });
        }

        if (application.preserver_id !== userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
        }

        // Preservers can only update their application to 'withdrawn'
        if (status === 'withdrawn') {
            const { error: updateError } = await supabase
                .from('applications')
                .update({ status: 'withdrawn' })
                .eq('id', id);

            if (updateError) {
                return new Response(JSON.stringify({ error: updateError.message }), { status: 400 });
            }

            return new Response(JSON.stringify({ message: 'Application withdrawn successfully' }), { status: 200 });
        }

        return new Response(JSON.stringify({ error: 'Preservers can only set status to "withdrawn"' }), { status: 400 });
    }

    // Only admins can update the application status for other statuses
    if (user_type === 'admin') {
        const { error: adminUpdateError } = await supabase
            .from('applications')
            .update({ status, rejected_reason })
            .eq('id', id);

        if (adminUpdateError) {
            return new Response(JSON.stringify({ error: adminUpdateError.message }), { status: 400 });
        }

        return new Response(JSON.stringify({ message: 'Application updated successfully' }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
}

// 🔹 DELETE: Admin can delete applications (Preservers cannot delete applications directly)
export async function DELETE(req, { params }) {
    const session = await getSession({ req });
    const { id } = params;

    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { user_type, id: userId } = session.user;

    // Only admins can delete applications
    if (user_type !== 'admin') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Application deleted successfully' }), { status: 200 });
}
