"use client"

import { useUser, useClerk } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useAdmin } from '@/lib/useAdmin'

const AuthButton = () => {
  const { isSignedIn, user } = useUser()
  const { openSignIn } = useClerk()
  const { isAdmin, isLoading } = useAdmin()

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        {!isLoading && isAdmin && (
          <Link href="/admin">
            <Button 
              variant="primary" 
              className="px-4 py-2 rounded-lg"
            >
              Admin
            </Button>
          </Link>
        )}
        <span className="body-2 text-tertiary-300">
          Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
        </span>
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-8 h-8"
            }
          }}
        />
      </div>
    )
  }

  return (
    <Button 
      variant="outline" 
      onClick={() => openSignIn()}
      className="px-6 py-2 rounded-lg"
    >
      Sign In
    </Button>
  )
}

export default AuthButton
