"use client";

import { useState, useRef, useEffect } from "react";

interface CaptureInputProps {
    onSubmit: (text: string) => Promise<void>;
    placeholder?: string;
}

export default function CaptureInput({
    onSubmit,
    placeholder = "What's on your mind? Tell me about a task, follow-up, or something to remember...",
}: CaptureInputProps) {
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [text]);

    const handleSubmit = async () => {
        if (!text.trim() || isLoading) return;

        setIsLoading(true);
        setMessage(null);

        try {
            await onSubmit(text.trim());
            setMessage({ type: "success", text: "Got it. I'll keep track of this." });
            setText("");
        } catch {
            setMessage({ type: "error", text: "Something went wrong. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="w-full">
            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="input-text min-h-[120px] pr-16"
                    disabled={isLoading}
                    rows={3}
                />
                <button
                    onClick={handleSubmit}
                    disabled={!text.trim() || isLoading}
                    className="absolute right-3 bottom-3 btn-primary py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? (
                        <div className="spinner"></div>
                    ) : (
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
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Feedback Message */}
            {message && (
                <div
                    className={`mt-3 p-3 rounded-lg fade-in ${message.type === "success"
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Helper Text */}
            <p className="text-sm text-muted-foreground mt-3">
                Press <kbd className="px-1.5 py-0.5 bg-border rounded text-xs">Enter</kbd> to
                send, <kbd className="px-1.5 py-0.5 bg-border rounded text-xs">Shift+Enter</kbd> for
                new line
            </p>
        </div>
    );
}
