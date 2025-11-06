"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Gamepad2,
    MapPin,
    Settings,
    Users,
    Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
}

const AdminSidebar = () => {
    const pathname = usePathname();

    const navItems: NavItem[] = [
        {
            href: "/admin",
            label: "Dashboard",
            icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
            href: "/admin/sessions",
            label: "Game Sessions",
            icon: <Gamepad2 className="w-4 h-4" />,
        },
        {
            href: "/admin/locations",
            label: "Locations",
            icon: <MapPin className="w-4 h-4" />,
        },
        {
            href: "/admin/players",
            label: "Players",
            icon: <Users className="w-4 h-4" />,
            badge: "Soon",
        },
        {
            href: "/admin/settings",
            label: "Settings",
            icon: <Settings className="w-4 h-4" />,
            badge: "Soon",
        },
    ];

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="w-64 bg-white border-r border-neutral-200 flex flex-col h-full">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-neutral-200">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="relative w-8 h-8 flex-shrink-0">
                        <Image
                            src="/assets/Logo.svg"
                            alt="Sunset Leisure Travel Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="heading-5 text-tertiary-500">Admin</h1>
                        <p className="body-3 text-tertiary-300">
                            BINGO World Tour
                        </p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-sm body-2 transition-colors group",
                            isActive(item.href)
                                ? "bg-primary-100 text-primary-700 font-medium"
                                : "text-tertiary-600 hover:bg-neutral-100 hover:text-tertiary-500",
                            item.badge && "opacity-60 pointer-events-none",
                        )}
                    >
                        <span
                            className={cn(
                                "flex-shrink-0",
                                isActive(item.href)
                                    ? "text-primary-700"
                                    : "text-tertiary-400",
                            )}
                        >
                            {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                            <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-500 rounded-full">
                                {item.badge}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-200">
                <div className="flex items-center gap-2 text-xs text-tertiary-400">
                    <Calendar className="w-3 h-3" />
                    <span>Admin Dashboard</span>
                </div>
            </div>
        </div>
    );
};

export { AdminSidebar };
