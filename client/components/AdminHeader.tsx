"use client"

import { useUser } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AdminHeader = () => {
  const { user } = useUser()

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-end px-6">
      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-error-500 rounded-full"></span>
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="body-2 text-tertiary-500 font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="body-3 text-tertiary-300">
              Administrator
            </p>
          </div>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              }
            }}
          />
        </div>
      </div>
    </header>
  )
}

export { AdminHeader }