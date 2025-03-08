import { getSession } from 'next-auth/react'
import supabase from '../../../../lib/supabase'

//Get Assignment by Id
export async function GET(req, { params }) {
  const { assignment_id } = params
  const session = await getSession({ req })

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { user_type, id: userId } = session.user

  const { data: assignment, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', assignment_id)
    .single()

  if (error || !assignment) {
    return new Response(JSON.stringify({ error: 'Assignment not found' }), { status: 404 })
  }

  // Authorization based on user type
  if (user_type === 'client' && assignment.client_id !== userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
  }

  if (user_type === 'preserver' && (assignment.preserver_id !== userId || !['Open', 'Completed', 'Paid_out'].includes(assignment.status))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
  }

  if (user_type === 'admin') {
    return new Response(JSON.stringify(assignment), { status: 200 })
  }

  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
}

//Update Assignment by id
export async function PUT(req, { params }) {
    const { assignment_id } = params
    const session = await getSession({ req })
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const { user_type, id: userId } = session.user

    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignment_id)
      .single()

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Assignment not found' }), { status: 404 })
    }

    // Check for authorization
    if (user_type === 'client' && data.client_id !== userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
    }

    if (user_type === 'preserver' && data.preserver_id !== userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
    }

    const updatedAssignment = { ...data, ...await req.json() }

    const { error: updateError } = await supabase
      .from('assignments')
      .update(updatedAssignment)
      .eq('id', assignment_id)

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 })
    }

    return new Response(JSON.stringify(updatedAssignment), { status: 200 })
  }

  //Delete Assignment *May use or not use*
  export async function DELETE(req, { params }) {
    const { assignment_id } = params
    const session = await getSession({ req })
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    if (session.user.user_type !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
    }

    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignment_id)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ message: 'Assignment deleted successfully' }), { status: 200 })
  }
