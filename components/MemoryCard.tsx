"use client";

import type { MemoryType, Urgency } from "@/types";

interface MemoryCardProps {
    id: string;
    title: string;
    type: MemoryType;
    urgency: Urgency;
    dueAt: string | null;
    context?: string | null;
    onDraft?: (id: string) => void;
    onClose?: (id: string) => void;
    showActions?: boolean;
}

export default function MemoryCard({
    id,
    title,
    type,
    urgency,
    dueAt,
    context,
    onDraft,
    onClose,
    showActions = true,
}: MemoryCardProps) {
    const formatDueDate = (date: string | null) => {
        if (!date) return null;
        const d = new Date(date);
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (d.toDateString() === now.toDateString()) {
            return `Today at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        } else if (d.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        } else {
            return d.toLocaleDateString([], {
                weekday: "short",
                month: "short",
                day: "numeric",
            });
        }
    };

    const typeLabels = {
        task: "Task",
        follow_up: "Follow Up",
        note: "Note",
    };

    return (
        <div className="glass-card card-hover p-5 fade-in">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground text-lg leading-tight">
                        {title}
                    </h3>
                    {context && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {context}
                        </p>
                    )}
                </div>
                <span className={`urgency-badge urgency-${urgency}`}>{urgency}</span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-4">
                <span className={`type-badge type-${type}`}>{typeLabels[type]}</span>
                {dueAt && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
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
                        {formatDueDate(dueAt)}
                    </span>
                )}
            </div>

            {/* Actions */}
            {showActions && (
                <div className="flex gap-2">
                    {type !== "note" && onDraft && (
                        <button
                            onClick={() => onDraft(id)}
                            className="btn-secondary text-sm py-2 px-4"
                        >
                            Draft
                        </button>
                    )}
                    {onClose && (
                        <button
                            onClick={() => onClose(id)}
                            className="btn-secondary text-sm py-2 px-4"
                        >
                            Close
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
