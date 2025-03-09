import { getSession } from 'next-auth/react'
import { supabase } from '@/utils/supabase'
//Get all assignments based on user type
export async function GET(req) {
  const session = await getSession({ req })
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { user_type, id: userId } = session.user

  let assignmentsQuery

  if (user_type === 'client') {
    assignmentsQuery = supabase
      .from('assignments')
      .select('*')
      .eq('client_id', userId)
  } else if (user_type === 'preserver') {
    assignmentsQuery = supabase
      .from('assignments')
      .select('*')
      .or(`preserver_id.eq.${userId},status.eq.Open`)
  } else if (user_type === 'admin') {
    assignmentsQuery = supabase.from('assignments').select('*')
  } else {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
  }

  const { data, error } = await assignmentsQuery

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify(data), { status: 200 })
}

//Create New Assignment
export async function POST(req) {
    const session = await getSession({ req })
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    if (session.user.user_type === 'PRESERVER') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 })
    }

    const data = await req.json()

    const { data: newAssignment, error } = await supabase
      .from('assignments')
      .insert([
        {
          client_id: data.client_id,
          description: data.description,
          base_price: data.base_price,
          location_id: data.location_id,
          status: 'Pending',
        }
      ])
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify(newAssignment), { status: 201 })
  }
