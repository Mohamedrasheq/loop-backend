"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

interface ConnectedService {
    service: string;
    metadata: Record<string, any>;
    connected_at: string;
}

interface AvailableService {
    name: string;
    displayName: string;
    description: string;
    credentialFields: Array<{
        key: string;
        label: string;
        type: string;
        required: boolean;
        helpUrl?: string;
        placeholder?: string;
    }>;
}

interface ConnectModal {
    service: AvailableService;
    credentials: Record<string, string>;
    metadata: Record<string, string>;
    isSubmitting: boolean;
}

const SERVICE_ICONS: Record<string, string> = {
    github: "🐙",
    linear: "📐",
    gmail: "📧",
    slack: "💬",
    notion: "📝",
    jira: "🎯",
    google_calendar: "📅",
    trello: "📋",
    asana: "🏗️",
    todoist: "✅",
    confluence: "📖",
    discord: "🎮",
};

const SERVICE_COLORS: Record<string, { from: string; to: string }> = {
    github: { from: "from-gray-700", to: "to-gray-900" },
    linear: { from: "from-indigo-500", to: "to-violet-600" },
    gmail: { from: "from-red-500", to: "to-orange-500" },
    slack: { from: "from-emerald-500", to: "to-teal-600" },
    notion: { from: "from-neutral-700", to: "to-neutral-900" },
    jira: { from: "from-blue-600", to: "to-blue-800" },
    google_calendar: { from: "from-blue-500", to: "to-cyan-500" },
    trello: { from: "from-sky-500", to: "to-sky-700" },
    asana: { from: "from-rose-500", to: "to-pink-600" },
    todoist: { from: "from-red-600", to: "to-red-800" },
    confluence: { from: "from-blue-500", to: "to-indigo-600" },
    discord: { from: "from-violet-500", to: "to-purple-700" },
};

const SETUP_INSTRUCTIONS: Record<string, string[]> = {
    github: [
        "Go to github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)",
        "Click 'Generate new token (classic)'",
        "Give it a name like 'Loop Integration'",
        "Select scopes: repo, read:user, read:org",
        "Click 'Generate token' and copy it immediately (you won't see it again)",
    ],
    linear: [
        "Go to linear.app → Settings → API",
        "Click 'Create key' under Personal API keys",
        "Give it a label like 'Loop'",
        "Copy the generated API key",
    ],
    gmail: [
        "Go to Google Cloud Console → APIs & Services → Credentials",
        "Create an OAuth 2.0 Client ID (type: Web application)",
        "Add authorized redirect URI: http://localhost:3000/api/auth/callback/google",
        "Enable the Gmail API in APIs & Services → Library",
        "Use the OAuth playground or your app's auth flow to get access & refresh tokens",
        "Required scopes: gmail.readonly, gmail.compose",
    ],
    slack: [
        "Go to api.slack.com/apps → Create New App → From scratch",
        "Name your app 'Loop' and select your workspace",
        "Go to OAuth & Permissions → add scopes: chat:write, channels:read, channels:history",
        "Click 'Install to Workspace' and authorize",
        "Copy the 'Bot User OAuth Token' (starts with xoxb-)",
    ],
    notion: [
        "Go to notion.so/my-integrations → New integration",
        "Name it 'Loop', select your workspace, and click Submit",
        "Copy the Internal Integration Token (starts with ntn_)",
        "Important: Share each Notion page/database with the integration by clicking ··· → Connections → Add 'Loop'",
    ],
    jira: [
        "Go to id.atlassian.com/manage-profile/security/api-tokens",
        "Click 'Create API token' → name it 'Loop'",
        "Copy the token (shown only once)",
        "Your domain is your Atlassian URL, e.g. yourcompany.atlassian.net",
        "Use the email address associated with your Atlassian account",
    ],
    google_calendar: [
        "Go to Google Cloud Console → APIs & Services → Credentials",
        "Create an OAuth 2.0 Client ID (type: Web application)",
        "Enable the Google Calendar API in APIs & Services → Library",
        "Use the OAuth playground (developers.google.com/oauthplayground) to generate tokens",
        "Select scope: calendar.events and authorize",
        "Copy the access token and refresh token",
    ],
    trello: [
        "Go to trello.com/power-ups/admin → New → API Key",
        "Copy your API Key from the page",
        "Click the 'Token' link on the same page to generate a token",
        "Authorize the app and copy the token from the success page",
    ],
    asana: [
        "Go to app.asana.com/0/my-apps",
        "Click 'Create new token'",
        "Name it 'Loop' and click Create",
        "Copy the Personal Access Token (shown only once)",
    ],
    todoist: [
        "Go to todoist.com → Settings → Integrations → Developer",
        "Scroll to 'API token' section",
        "Copy your API token (or click the copy icon)",
    ],
    confluence: [
        "Go to id.atlassian.com/manage-profile/security/api-tokens",
        "Click 'Create API token' → name it 'Loop'",
        "Copy the token (shown only once)",
        "Your domain is your Atlassian URL, e.g. yourcompany.atlassian.net",
        "Use the email address associated with your Atlassian account",
    ],
    discord: [
        "Go to discord.com/developers/applications → New Application",
        "Name it 'Loop' and create",
        "Go to Bot tab → click 'Add Bot'",
        "Under Token section, click 'Reset Token' → Copy the bot token",
        "Go to OAuth2 → URL Generator → select 'bot' scope",
        "Select permissions: Send Messages, Read Message History, Create Public Threads",
        "Copy the generated URL and open it to invite the bot to your server",
    ],
};

export default function IntegrationsPage() {
    const { user, isLoaded } = useUser();
    const userId = user?.id;

    const [connected, setConnected] = useState<ConnectedService[]>([]);
    const [available, setAvailable] = useState<AvailableService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modal, setModal] = useState<ConnectModal | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [disconnecting, setDisconnecting] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState(true);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchStatus = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`/api/credentials/status?userId=${userId}`);
            const data = await res.json();
            setConnected(data.connected || []);
            setAvailable(data.available || []);
        } catch (error) {
            console.error("Error fetching integration status:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (isLoaded && userId) {
            fetchStatus();
        }
    }, [isLoaded, userId, fetchStatus]);

    const handleConnect = async () => {
        if (!modal || !userId) return;
        setModal({ ...modal, isSubmitting: true });

        try {
            const res = await fetch("/api/credentials/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    service: modal.service.name,
                    credentials: modal.credentials,
                    metadata: modal.metadata,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                showToast(data.error || "Failed to connect", "error");
                setModal({ ...modal, isSubmitting: false });
                return;
            }

            showToast(data.message || "Connected successfully!", "success");
            setModal(null);
            fetchStatus();
        } catch (error: any) {
            showToast(error.message || "Connection failed", "error");
            setModal({ ...modal, isSubmitting: false });
        }
    };

    const handleDisconnect = async (service: string) => {
        if (!userId) return;
        setDisconnecting(service);

        try {
            const res = await fetch("/api/credentials/disconnect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, service }),
            });

            const data = await res.json();
            if (!res.ok) {
                showToast(data.error || "Failed to disconnect", "error");
                return;
            }

            showToast(data.message || "Disconnected", "success");
            fetchStatus();
        } catch (error: any) {
            showToast(error.message || "Disconnection failed", "error");
        } finally {
            setDisconnecting(null);
        }
    };

    const openConnectModal = (service: AvailableService) => {
        setModal({
            service,
            credentials: {},
            metadata: {},
            isSubmitting: false,
        });
        setShowInstructions(true);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="container-main py-12">
            {/* Header */}
            <header className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
                    Integrations
                </h1>
                <p className="text-lg text-muted-foreground">
                    Connect your tools so Loop can take action on your behalf.
                </p>
            </header>

            {/* Connected Services */}
            {connected.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
                        <span className="status-dot active inline-block" />
                        Connected
                    </h2>
                    <div className="grid gap-4">
                        {connected.map((svc) => {
                            const colors = SERVICE_COLORS[svc.service] || { from: "from-primary-500", to: "to-primary-600" };
                            return (
                                <div
                                    key={svc.service}
                                    className="glass-card p-5 flex items-center gap-4 fade-in"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center text-2xl shrink-0`}>
                                        {SERVICE_ICONS[svc.service] || "🔗"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-foreground capitalize">
                                            {svc.service}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Connected {formatDate(svc.connected_at)}
                                            {svc.metadata?.username && ` · ${svc.metadata.username}`}
                                            {svc.metadata?.email && ` · ${svc.metadata.email}`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDisconnect(svc.service)}
                                        disabled={disconnecting === svc.service}
                                        className="btn-secondary text-sm px-4 py-2 text-red-500 hover:text-red-600 hover:border-red-300 disabled:opacity-50"
                                    >
                                        {disconnecting === svc.service ? (
                                            <span className="flex items-center gap-2">
                                                <span className="spinner" /> Disconnecting...
                                            </span>
                                        ) : (
                                            "Disconnect"
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Available Services */}
            {available.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-5">
                        Available to Connect
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {available.map((svc) => {
                            const colors = SERVICE_COLORS[svc.name] || { from: "from-primary-500", to: "to-primary-600" };
                            return (
                                <div
                                    key={svc.name}
                                    className="glass-card card-hover p-6 cursor-pointer group"
                                    onClick={() => openConnectModal(svc)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center text-2xl shrink-0 opacity-60 group-hover:opacity-100 transition-opacity`}>
                                            {SERVICE_ICONS[svc.name] || "🔗"}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground group-hover:text-primary-600 transition-colors">
                                                {svc.displayName}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {svc.description}
                                            </p>
                                        </div>
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
                                            className="text-muted-foreground group-hover:text-primary-600 transition-colors mt-1"
                                        >
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Empty State */}
            {!isLoading && connected.length === 0 && available.length === 0 && (
                <section className="glass-card p-12 text-center">
                    <div className="text-6xl mb-4 opacity-30">🔌</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        No integrations available
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Integrations will appear here as they become available.
                    </p>
                </section>
            )}

            {/* All connected state */}
            {!isLoading && connected.length > 0 && available.length === 0 && (
                <section className="glass-card p-12 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        All services connected!
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        You&apos;re all set. Loop can now take actions across all your tools.
                    </p>
                </section>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <div className="spinner" style={{ width: 40, height: 40 }} />
                </div>
            )}

            {/* Connect Modal */}
            {modal && (
                <div className="modal-overlay" onClick={() => !modal.isSubmitting && setModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${(SERVICE_COLORS[modal.service.name] || { from: "from-primary-500", to: "to-primary-600" }).from} ${(SERVICE_COLORS[modal.service.name] || { from: "from-primary-500", to: "to-primary-600" }).to} flex items-center justify-center text-xl`}>
                                {SERVICE_ICONS[modal.service.name] || "🔗"}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    Connect {modal.service.displayName}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Enter your credentials to connect
                                </p>
                            </div>
                        </div>

                        {/* Setup Instructions */}
                        {SETUP_INSTRUCTIONS[modal.service.name] && (
                            <div className="mb-5">
                                <button
                                    onClick={() => setShowInstructions(!showInstructions)}
                                    className="flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors w-full"
                                >
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
                                        className={`transition-transform ${showInstructions ? "rotate-90" : ""}`}
                                    >
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                    How to get your credentials
                                </button>
                                {showInstructions && (
                                    <ol className="mt-3 space-y-2 pl-1">
                                        {SETUP_INSTRUCTIONS[modal.service.name].map((step, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                                                <span className="shrink-0 w-5 h-5 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-xs font-semibold">
                                                    {i + 1}
                                                </span>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </div>
                        )}

                        <div className="space-y-4 mb-6">
                            {modal.service.credentialFields.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                    </label>
                                    <input
                                        type={field.type === "password" ? "password" : "text"}
                                        placeholder={field.placeholder || ""}
                                        value={modal.credentials[field.key] || ""}
                                        onChange={(e) =>
                                            setModal({
                                                ...modal,
                                                credentials: {
                                                    ...modal.credentials,
                                                    [field.key]: e.target.value,
                                                },
                                            })
                                        }
                                        className="input-text text-sm"
                                        disabled={modal.isSubmitting}
                                    />
                                    {field.helpUrl && (
                                        <a
                                            href={field.helpUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary-500 hover:text-primary-600 mt-1 inline-block"
                                        >
                                            Where do I find this? →
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setModal(null)}
                                disabled={modal.isSubmitting}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConnect}
                                disabled={modal.isSubmitting}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {modal.isSubmitting ? (
                                    <>
                                        <span className="spinner" /> Connecting...
                                    </>
                                ) : (
                                    "Connect"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div
                    className={`fixed bottom-6 right-6 glass-card px-5 py-3 shadow-lg fade-in z-50 ${toast.type === "success"
                        ? "border-l-4 border-l-green-500"
                        : "border-l-4 border-l-red-500"
                        }`}
                >
                    <p className="text-sm font-medium text-foreground">{toast.message}</p>
                </div>
            )}
        </div>
    );
}
