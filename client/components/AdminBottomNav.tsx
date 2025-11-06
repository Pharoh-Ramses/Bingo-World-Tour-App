"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Gamepad2,
  MapPin,
  Settings,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  disabled?: boolean
}

const AdminBottomNav = () => {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      href: '/admin/sessions/create',
      label: 'Sessions',
      icon: <Gamepad2 className="w-5 h-5" />
    },
    {
      href: '/admin/locations',
      label: 'Locations',
      icon: <MapPin className="w-5 h-5" />
    },
    {
      href: '/admin/players',
      label: 'Players',
      icon: <Users className="w-5 h-5" />,
      disabled: true
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      disabled: true
    }
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-e3 z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href)

          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-0 opacity-40"
              >
                <span className="text-tertiary-300">
                  {item.icon}
                </span>
                <span className="text-[10px] text-tertiary-300 truncate max-w-full">
                  {item.label}
                </span>
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-0 transition-colors rounded-sm",
                active
                  ? "text-primary-700"
                  : "text-tertiary-400 active:bg-neutral-100"
              )}
            >
              <span className={cn(
                "transition-transform",
                active && "scale-110"
              )}>
                {item.icon}
              </span>
              <span className={cn(
                "text-[10px] truncate max-w-full",
                active && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export { AdminBottomNav }
