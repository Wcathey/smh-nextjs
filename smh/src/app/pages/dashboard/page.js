'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    router.push('/auth/signin') // Redirect to sign-in page if not authenticated
    return null
  }

  return (
    <div>
      <h1>Welcome, {session.user.email}</h1>
      {/* Render content for authenticated users here */}
    </div>
  )
}
