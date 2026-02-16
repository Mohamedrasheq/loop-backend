"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import type { MemoryItem, MemoryStatus, MemoryType } from "@/types";

export default function MemoriesPage() {
    const { user, isLoaded } = useUser();
    const userId = user?.id;

    const [items, setItems] = useState<MemoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<MemoryStatus | "all">("all");
    const [filterType, setFilterType] = useState<MemoryType | "all">("all");

    useEffect(() => {
        if (isLoaded && userId) {
            fetchMemories();
        }
    }, [isLoaded, userId]);

    const fetchMemories = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`/api/memories?userId=${userId}`);
            const data = await res.json();
            setItems(data.items || []);
        } catch (error) {
            console.error("Error fetching memories:", error);
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
            setItems((items) =>
                items.map((item) =>
                    item.id === id ? { ...item, status: "closed" as MemoryStatus } : item
                )
            );
        } catch (error) {
            console.error("Error closing item:", error);
        }
    };

    const filteredItems = items.filter((item) => {
        if (filterStatus !== "all" && item.status !== filterStatus) return false;
        if (filterType !== "all" && item.type !== filterType) return false;
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

    const typeLabels = {
        task: "Task",
        follow_up: "Follow Up",
        note: "Note",
    };

    const statusColors = {
        open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        nudged:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        closed:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        ignored:
            "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    };

    return (
        <div className="container-main py-8">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Memories
                </h1>
                <p className="text-muted-foreground mt-1">
                    All your captured items in one place
                </p>
            </header>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) =>
                            setFilterStatus(e.target.value as MemoryStatus | "all")
                        }
                        className="select-input"
                    >
                        <option value="all">All</option>
                        <option value="open">Open</option>
                        <option value="nudged">Nudged</option>
                        <option value="closed">Closed</option>
                        <option value="ignored">Ignored</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Type:</label>
                    <select
                        value={filterType}
                        onChange={(e) =>
                            setFilterType(e.target.value as MemoryType | "all")
                        }
                        className="select-input"
                    >
                        <option value="all">All</option>
                        <option value="task">Task</option>
                        <option value="follow_up">Follow Up</option>
                        <option value="note">Note</option>
                    </select>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                    {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="spinner"></div>
                    <span className="ml-3 text-muted-foreground">
                        Loading memories...
                    </span>
                </div>
            )}

            {/* Items Table */}
            {!isLoading && filteredItems.length > 0 && (
                <div className="glass-card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Title
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Type
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Status
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Due
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Created
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-border last:border-0 hover:bg-primary-50/50 dark:hover:bg-primary-50/5 transition-colors"
                                >
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {item.title}
                                            </p>
                                            {item.context && (
                                                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                                                    {item.context}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`type-badge type-${item.type}`}>
                                            {typeLabels[item.type]}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {item.due_at ? formatDate(item.due_at) : "—"}
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {formatDate(item.created_at)}
                                    </td>
                                    <td className="p-4">
                                        {item.status === "open" && (
                                            <button
                                                onClick={() => handleClose(item.id)}
                                                className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                                            >
                                                Close
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredItems.length === 0 && (
                <div className="empty-state glass-card">
                    <div className="empty-state-icon">📝</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        No memories found
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        {items.length === 0
                            ? "Start by capturing something in the Chat tab."
                            : "No items match your current filters."}
                    </p>
                </div>
            )}
        </div>
    );
}
