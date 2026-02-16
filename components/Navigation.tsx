"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

const navItems = [
    {
        href: "/",
        label: "Home",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    {
        href: "/chat",
        label: "Capture",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
    {
        href: "/brief",
        label: "Daily Brief",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
    {
        href: "/memories",
        label: "Memories",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        ),
    },
];

export default function Navigation() {
    const pathname = usePathname();

    // Don't render nav on auth pages
    if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
        return null;
    }

    return (
        <nav className="w-64 h-screen fixed left-0 top-0 p-4 border-r border-border bg-card">
            {/* Logo */}
            <div className="mb-8 px-3">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                    Loop
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Your calm chief-of-staff
                </p>
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
                    <div className="glass-card p-4 flex items-center gap-3">
                        <UserButton
                            afterSignOutUrl="/sign-in"
                            appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10",
                                },
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                Account
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Manage profile
                            </p>
                        </div>
                    </div>
                </SignedIn>
                <SignedOut>
                    <div className="glass-card p-4">
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

