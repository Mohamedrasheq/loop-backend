"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import type { Notification, NotificationStatus } from "@/types";

export default function NotificationsPage() {
    const { user, isLoaded } = useUser();
    const userId = user?.id;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<NotificationStatus | "all">("all");

    useEffect(() => {
        if (isLoaded && userId) {
            fetchNotifications();
        }
    }, [isLoaded, userId]);

    const fetchNotifications = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`/api/notifications?userId=${userId}`);
            const data = await res.json();
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredNotifications = notifications.filter((notification) => {
        if (filterStatus !== "all" && notification.status !== filterStatus) return false;
        return true;
    });

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const statusColors = {
        scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        sent: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };

    return (
        <div className="container-main py-8">
            {/* Header */}
            <header className="mb-8 font-poppins">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Notifications
                </h1>
                <p className="text-muted-foreground mt-1">
                    History and status of all your push reminders
                </p>
            </header>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) =>
                            setFilterStatus(e.target.value as NotificationStatus | "all")
                        }
                        className="select-input"
                    >
                        <option value="all">All</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="sent">Sent</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                    {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="spinner"></div>
                    <span className="ml-3 text-muted-foreground">
                        Loading notifications...
                    </span>
                </div>
            )}

            {/* Notifications Table */}
            {!isLoading && filteredNotifications.length > 0 && (
                <div className="glass-card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Message
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Status
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Scheduled For
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredNotifications.map((notification) => (
                                <tr
                                    key={notification.id}
                                    className="border-b border-border last:border-0 hover:bg-primary-50/50 dark:hover:bg-primary-50/5 transition-colors"
                                >
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                                                {notification.body}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[notification.status]}`}
                                        >
                                            {notification.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {formatDate(notification.scheduled_at)}
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {formatDate(notification.created_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredNotifications.length === 0 && (
                <div className="empty-state glass-card">
                    <div className="empty-state-icon">🔔</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        No notifications found
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        {notifications.length === 0
                            ? "Try asking the assistant to remind you of something."
                            : "No notifications match your current filters."}
                    </p>
                </div>
            )}
        </div>
    );
}
