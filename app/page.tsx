"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import MemoryCard from "@/components/MemoryCard";
import type { DailyBriefItem } from "@/types";

export default function Home() {
  const { user, isLoaded } = useUser();
  const userId = user?.id;
  const [briefItems, setBriefItems] = useState<DailyBriefItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Update time every minute
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
    if (briefItems.length === 0) {
      return "All clear. Nothing urgent needs your attention.";
    }
    if (briefItems.length === 1) {
      return "You have one thing to focus on today.";
    }
    return `You have ${briefItems.length} things to focus on today.`;
  };

  return (
    <div className="container-main py-12">
      {/* Header */}
      <header className="mb-12">
        <p className="text-muted-foreground mb-2">{currentTime}</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
          {getGreeting()}
        </h1>
        <p className="text-xl text-muted-foreground">{getStatusMessage()}</p>
      </header>

      {/* Quick Capture CTA */}
      <section className="mb-6">
        <Link
          href="/chat"
          className="glass-card card-hover block p-6 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary-600 transition-colors">
                Capture something
              </h3>
              <p className="text-muted-foreground">
                Tell me about a task, follow-up, or note
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-auto text-muted-foreground group-hover:text-primary-600 transition-colors"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Link>
      </section>

      {/* AI Assistant CTA */}
      <section className="mb-12">
        <Link
          href="/assistant"
          className="glass-card card-hover block p-6 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-purple-600 transition-colors">
                AI Assistant
              </h3>
              <p className="text-muted-foreground">
                Get personalized guidance on what to focus on
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-auto text-muted-foreground group-hover:text-purple-600 transition-colors"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Link>
      </section>

      {/* Today's Focus */}
      {briefItems.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">
              Today&apos;s Focus
            </h2>
            <Link
              href="/brief"
              className="text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
            >
              View Brief
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
          <div className="grid gap-4">
            {briefItems.slice(0, 2).map((item) => (
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
        <section className="glass-card p-12 text-center">
          <div className="text-6xl mb-4 opacity-30">✨</div>
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
  );
}
