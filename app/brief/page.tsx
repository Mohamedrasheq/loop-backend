"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import MemoryCard from "@/components/MemoryCard";
import DashboardLayout from "@/components/DashboardLayout";
import type { DailyBriefItem, DraftTone } from "@/types";

export default function BriefPage() {
    const { user, isLoaded } = useUser();
    const userId = user?.id;

    const [items, setItems] = useState<DailyBriefItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [draftModal, setDraftModal] = useState<{
        isOpen: boolean;
        itemId: string | null;
        itemTitle: string;
        draftText: string;
        isLoading: boolean;
    }>({
        isOpen: false,
        itemId: null,
        itemTitle: "",
        draftText: "",
        isLoading: false,
    });
    const [selectedTone, setSelectedTone] = useState<DraftTone>("polite");

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
            setItems(data.items || []);
        } catch (error) {
            console.error("Error fetching brief:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDraft = async (id: string) => {
        if (!userId) return;
        const item = items.find((i) => i.id === id);
        if (!item) return;

        setDraftModal({
            isOpen: true,
            itemId: id,
            itemTitle: item.title,
            draftText: "",
            isLoading: true,
        });

        try {
            const res = await fetch("/api/draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    memoryItemId: id,
                    tone: selectedTone,
                }),
            });
            const data = await res.json();
            setDraftModal((prev) => ({
                ...prev,
                draftText: data.draftText || "Unable to generate draft.",
                isLoading: false,
            }));
        } catch (error) {
            console.error("Error drafting:", error);
            setDraftModal((prev) => ({
                ...prev,
                draftText: "Something went wrong. Please try again.",
                isLoading: false,
            }));
        }
    };

    const handleClose = async (id: string) => {
        try {
            await fetch("/api/close", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memoryItemId: id }),
            });
            setItems((items) => items.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Error closing item:", error);
        }
    };

    const closeDraftModal = () => {
        setDraftModal({
            isOpen: false,
            itemId: null,
            itemTitle: "",
            draftText: "",
            isLoading: false,
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <DashboardLayout>
            <div className="container-main py-8">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground page-header-gradient">
                        Daily Brief
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Your most important items for today
                    </p>
                </header>

                {/* Tone Selector */}
                <div className="mb-6 flex items-center gap-3">
                    <label className="text-sm text-muted-foreground">Draft tone:</label>
                    <select
                        value={selectedTone}
                        onChange={(e) => setSelectedTone(e.target.value as DraftTone)}
                        className="select-input"
                    >
                        <option value="polite">Polite</option>
                        <option value="professional">Professional</option>
                        <option value="firm">Firm</option>
                    </select>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="spinner"></div>
                        <span className="ml-3 text-muted-foreground">Loading brief...</span>
                    </div>
                )}

                {/* Items */}
                {!isLoading && items.length > 0 && (
                    <div className="grid gap-4">
                        {items.map((item) => (
                            <MemoryCard
                                key={item.id}
                                id={item.id}
                                title={item.title}
                                type={item.type}
                                urgency={item.urgency}
                                dueAt={item.dueAt}
                                onDraft={handleDraft}
                                onClose={handleClose}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && items.length === 0 && (
                    <div className="empty-state glass-card">
                        <div className="empty-state-icon">📋</div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            No urgent items
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            You&apos;re all caught up! There are no tasks or follow-ups due in
                            the next 24 hours.
                        </p>
                    </div>
                )}

                {/* Draft Modal */}
                {draftModal.isOpen && (
                    <div className="modal-overlay" onClick={closeDraftModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Draft Message
                                </h3>
                                <button
                                    onClick={closeDraftModal}
                                    className="text-muted-foreground hover:text-foreground p-1"
                                >
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
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4">
                                For: {draftModal.itemTitle}
                            </p>

                            {draftModal.isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="spinner"></div>
                                    <span className="ml-3 text-muted-foreground">
                                        Drafting message...
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                        <p className="text-foreground whitespace-pre-wrap">
                                            {draftModal.draftText}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => copyToClipboard(draftModal.draftText)}
                                            className="btn-primary flex-1"
                                        >
                                            Copy to Clipboard
                                        </button>
                                        <button onClick={closeDraftModal} className="btn-secondary">
                                            Close
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
