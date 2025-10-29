"use client"

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function SetupRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const sessionCode = params.sessionCode as string

  useEffect(() => {
    // Redirect to step 1
    router.replace(`/game/${sessionCode}/setup/step-1`)
  }, [sessionCode, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="body-1 text-tertiary-300">Redirecting to setup...</p>
    </div>
  )
}
