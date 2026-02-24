"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

const navItems = [
    {
        href: "/dashboard",
        label: "Home",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    {
        href: "/chat",
        label: "Capture",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
    {
        href: "/brief",
        label: "Daily Brief",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
    {
        href: "/memories",
        label: "Memories",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        ),
    },
    {
        href: "/notifications",
        label: "Notifications",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
        ),
    },
    {
        href: "/integrations",
        label: "Integrations",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v6m0 8v6M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24M2 12h6m8 0h6M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24" />
            </svg>
        ),
    },
];

export default function Navigation() {
    const pathname = usePathname();

    // Don't render nav on auth pages or landing page
    if (pathname === "/" || pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
        return null;
    }

    return (
        <nav className="w-64 h-screen fixed left-0 top-0 p-4 border-r border-gray-100 bg-white z-40">
            {/* Logo */}
            <div className="mb-8 px-3">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image src="/loop-logo.png" alt="Loop" width={32} height={32} className="w-8 h-8" />
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">
                            Loop
                        </h1>
                        <p className="text-xs text-gray-400">
                            Your calm chief-of-staff
                        </p>
                    </div>
                </Link>
            </div>

            {/* Nav Links */}
            <div className="space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-link ${isActive ? "active" : ""}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* User Section */}
            <div className="absolute bottom-6 left-4 right-4">
                <SignedIn>
                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10",
                                },
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                Account
                            </p>
                            <p className="text-xs text-gray-400">
                                Manage profile
                            </p>
                        </div>
                    </div>
                </SignedIn>
                <SignedOut>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <Link
                            href="/sign-in"
                            className="btn-primary w-full text-center block"
                        >
                            Sign In
                        </Link>
                    </div>
                </SignedOut>
            </div>
        </nav>
    );
}
