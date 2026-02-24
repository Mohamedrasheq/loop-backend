"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import DashboardLayout from "@/components/DashboardLayout";
import MemoryCard from "@/components/MemoryCard";
import type { DailyBriefItem } from "@/types";

export default function DashboardHome() {
    const { user, isLoaded } = useUser();
    const userId = user?.id;
    const [briefItems, setBriefItems] = useState<DailyBriefItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState<string>("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                })
            );
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isLoaded && userId) {
            fetchBrief();
        }
    }, [isLoaded, userId]);

    const fetchBrief = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`/api/daily-brief?userId=${userId}`);
            const data = await res.json();
            setBriefItems(data.items || []);
        } catch (error) {
            console.error("Error fetching brief:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = async (id: string) => {
        try {
            await fetch("/api/close", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memoryItemId: id }),
            });
            setBriefItems((items) => items.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Error closing item:", error);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const getStatusMessage = () => {
        if (isLoading) return "Checking in...";
        if (briefItems.length === 0) return "All clear. Nothing urgent needs your attention.";
        if (briefItems.length === 1) return "You have one thing to focus on today.";
        return `You have ${briefItems.length} things to focus on today.`;
    };

    return (
        <DashboardLayout>
            <div className="container-main py-12">
                {/* Header */}
                <header className="mb-12">
                    <p className="text-muted-foreground mb-2 text-sm tracking-wide uppercase">{currentTime}</p>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3 page-header-gradient">
                        {getGreeting()}
                    </h1>
                    <p className="text-xl text-muted-foreground">{getStatusMessage()}</p>
                </header>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-4 mb-12">
                    {/* Capture CTA */}
                    <Link href="/chat" className="glass-card-glow card-hover block p-6 group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg text-foreground group-hover:text-blue-500 transition-colors">
                                    Capture something
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    Tell me about a task, follow-up, or note
                                </p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </div>
                    </Link>

                    {/* AI Assistant CTA */}
                    <Link href="/assistant" className="glass-card-glow card-hover block p-6 group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 8V4H8" />
                                    <rect width="16" height="12" x="4" y="8" rx="2" />
                                    <path d="M2 14h2" />
                                    <path d="M20 14h2" />
                                    <path d="M15 13v2" />
                                    <path d="M9 13v2" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg text-foreground group-hover:text-purple-500 transition-colors">
                                    AI Assistant
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    Get personalized guidance on what to focus on
                                </p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-purple-500 group-hover:translate-x-1 transition-all">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </div>
                    </Link>
                </div>

                {/* Today's Focus */}
                {briefItems.length > 0 && (
                    <section className="fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-foreground">
                                Today&apos;s Focus
                            </h2>
                            <Link
                                href="/brief"
                                className="text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 text-sm"
                            >
                                View Brief
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </Link>
                        </div>
                        <div className="grid gap-4">
                            {briefItems.slice(0, 3).map((item) => (
                                <MemoryCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    type={item.type}
                                    urgency={item.urgency}
                                    dueAt={item.dueAt}
                                    onClose={handleClose}
                                    showActions={true}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {!isLoading && briefItems.length === 0 && (
                    <section className="glass-card-glow p-12 text-center fade-in">
                        <div className="text-6xl mb-4 opacity-40">✨</div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            You&apos;re all caught up
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            There&apos;s nothing urgent right now. When you have tasks or
                            follow-ups, they&apos;ll appear here.
                        </p>
                    </section>
                )}
            </div>
        </DashboardLayout>
    );
}
