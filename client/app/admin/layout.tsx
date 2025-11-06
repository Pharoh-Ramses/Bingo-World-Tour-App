"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminBottomNav } from "@/components/AdminBottomNav";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!isLoaded) return;

            if (!user) {
                router.push("/sign-in?redirect_url=/admin");
                return;
            }

            try {
                const response = await fetch("/api/auth/check-admin");
                const data = await response.json();

                if (!data.isAdmin) {
                    router.push("/");
                    return;
                }

                setIsAdmin(true);
            } catch (error) {
                console.error("Error checking admin status:", error);
                router.push("/");
            } finally {
                setIsChecking(false);
            }
        };

        checkAdminStatus();
    }, [user, isLoaded, router]);

    if (!isLoaded || isChecking) {
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="body-1 text-tertiary-300">
                        Verifying admin access...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="flex h-screen bg-neutral-50">
            {/* Desktop Sidebar - hidden on mobile */}
            <div className="hidden lg:block">
                <AdminSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />
                <main className="flex-1 overflow-auto pb-20 lg:pb-0">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation - hidden on desktop */}
            <div className="lg:hidden">
                <AdminBottomNav />
            </div>
        </div>
    );
}
