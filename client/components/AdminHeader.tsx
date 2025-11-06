"use client";

import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminHeader = () => {
    const { user } = useUser();

    return (
        <header className="h-14 sm:h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6">
            {/* Mobile: Show title */}
            <div className="lg:hidden">
                <h2 className="heading-6 text-tertiary-500">Admin Panel</h2>
            </div>

            {/* Desktop: Empty space */}
            <div className="hidden lg:block"></div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative p-2">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
                </Button>

                {/* User Menu */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Desktop: Show user info */}
                    <div className="text-right hidden sm:block">
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
                                avatarBox: "w-8 h-8 sm:w-10 sm:h-10",
                            },
                        }}
                    />
                </div>
            </div>
        </header>
    );
};

export { AdminHeader };
