"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import CaptureInput from "@/components/CaptureInput";

interface Message {
    id: string;
    type: "user" | "agent" | "actions";
    text: string;
    timestamp: Date;
    actions?: any[];
}

export default function ChatPage() {
    const { user } = useUser();
    const userId = user?.id;

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            type: "agent",
            text: "Hello! I'm here to help you keep track of things. Tell me about a task, follow-up, or something to remember.",
            timestamp: new Date(),
        },
    ]);
    const [isThinking, setIsThinking] = useState(false);

    // Platform context
    const [githubRepos, setGithubRepos] = useState<any[]>([]);
    const [linearTeams, setLinearTeams] = useState<any[]>([]);
    const [linearUsers, setLinearUsers] = useState<any[]>([]);
    const [linearLabels, setLinearLabels] = useState<any[]>([]);
    const [linearProjects, setLinearProjects] = useState<any[]>([]);
    const [linearCycles, setLinearCycles] = useState<any[]>([]);
    const [linearWorkflowStates, setLinearWorkflowStates] = useState<any[]>([]);

    // Action editing/execution
    const [editingActionId, setEditingActionId] = useState<string | null>(null);
    const [editingPayload, setEditingPayload] = useState<any>(null);
    const [executingAction, setExecutingAction] = useState<string | null>(null);
    const [executionResults, setExecutionResults] = useState<Record<string, { success: boolean; message: string }>>({});

    useEffect(() => {
        fetchGithubRepos();
        fetchLinearContext();
    }, []);

    const fetchGithubRepos = async () => {
        try {
            const res = await fetch('/api/github/repos');
            if (res.ok) setGithubRepos(await res.json());
        } catch (err) {
            console.error("Error fetching github repos:", err);
        }
    };

    const fetchLinearContext = async () => {
        try {
            const res = await fetch('/api/linear/context');
            if (res.ok) {
                const data = await res.json();
                setLinearTeams(data.teams || []);
                setLinearUsers(data.users || []);
                setLinearLabels(data.labels || []);
                setLinearProjects(data.projects || []);
                setLinearCycles(data.cycles || []);
                setLinearWorkflowStates(data.workflowStates || []);
            }
        } catch (err) {
            console.error("Error fetching linear context:", err);
        }
    };

    const handleSubmit = async (text: string) => {
        if (!userId) return;

        // Add user message
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            type: "user",
            text,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setIsThinking(true);

        try {
            // Single unified call — captures task + detects tool triggers
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    text,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }),
            });
            const data = await res.json();

            // Add agent reply
            const agentMessage: Message = {
                id: `agent-${Date.now()}`,
                type: "agent",
                text: data.reply || "Got it. I've noted this down.",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, agentMessage]);

            // If actions were proposed, show them inline
            if (data.proposed_actions?.length > 0) {
                const actionsMessage: Message = {
                    id: `actions-${Date.now()}`,
                    type: "actions",
                    text: "",
                    timestamp: new Date(),
                    actions: data.proposed_actions,
                };
                setMessages(prev => [...prev, actionsMessage]);
            }
        } catch (err) {
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                type: "agent",
                text: "Something went wrong. Please try again.",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleExecuteAction = async (action: any, actionId: string, messageId: string) => {
        if (!userId) return;
        setExecutingAction(actionId);

        try {
            const res = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action }),
            });
            const result = await res.json();

            if (res.ok) {
                setExecutionResults(prev => ({
                    ...prev,
                    [actionId]: { success: true, message: result.successMessage || "Action executed successfully!" }
                }));
            } else {
                setExecutionResults(prev => ({
                    ...prev,
                    [actionId]: { success: false, message: result.error || "Execution failed." }
                }));
            }
        } catch (err) {
            setExecutionResults(prev => ({
                ...prev,
                [actionId]: { success: false, message: "Network error occurred." }
            }));
        } finally {
            setExecutingAction(null);
        }
    };

    const handleApproveAndExecute = async (action: any, actionId: string, messageId: string) => {
        const actionToExecute = editingActionId === actionId
            ? { ...action, payload: { ...editingPayload } }
            : action;

        await handleExecuteAction(actionToExecute, actionId, messageId);
        if (editingActionId === actionId) {
            setEditingActionId(null);
            setEditingPayload(null);
        }
    };

    const startEditing = (actionId: string, payload: any) => {
        setEditingActionId(actionId);
        setEditingPayload({ ...payload });
    };

    const getActionIcon = (type: string) => {
        if (type.includes('github')) return '🐙';
        if (type.includes('linear')) return '📈';
        if (type.includes('gmail') || type.includes('email')) return '📧';
        return '⚡';
    };

    const getActionLabel = (type: string) => {
        switch (type) {
            case 'create_github_issue': return 'Create GitHub Issue';
            case 'draft_pr_description': return 'Draft PR Description';
            case 'create_linear_issue': return 'Create Linear Issue';
            case 'draft_gmail_reply': return 'Draft Gmail Reply';
            default: return type;
        }
    };

    const renderActionCard = (action: any, idx: number, messageId: string) => {
        const actionId = `${messageId}-action-${idx}`;
        const isEditing = editingActionId === actionId;
        const result = executionResults[actionId];
        const isExecuting = executingAction === actionId;

        const selectStyle = { backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' };
        const selectClass = "w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none cursor-pointer";
        const labelClass = "text-[10px] font-bold text-muted-foreground uppercase block mb-1";
        const inputClass = "w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors";

        return (
            <div key={actionId} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{getActionIcon(action.type)}</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{getActionLabel(action.type)}</span>
                    </div>
                    {!result && (
                        <button
                            onClick={() => isEditing ? (() => { setEditingActionId(null); setEditingPayload(null); })() : startEditing(actionId, action.payload)}
                            className="text-[10px] text-primary-500 hover:underline uppercase font-bold"
                        >
                            {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-3">
                        {/* GitHub Repo */}
                        {action.type.includes('github') && (
                            <div>
                                <label className={labelClass}>Repository</label>
                                <select value={editingPayload.repo} onChange={(e) => setEditingPayload({ ...editingPayload, repo: e.target.value })} className={selectClass} style={selectStyle}>
                                    <option value="" disabled>Select repository</option>
                                    {editingPayload.repo && !githubRepos.some((r: any) => r.full_name === editingPayload.repo) && (
                                        <option value={editingPayload.repo}>{editingPayload.repo} (Suggested)</option>
                                    )}
                                    {githubRepos.map((repo: any) => (
                                        <option key={repo.full_name} value={repo.full_name}>{repo.full_name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Linear Fields */}
                        {action.type === 'create_linear_issue' && (() => {
                            const selectedTeamId = editingPayload.teamId;
                            const teamLabels = linearLabels.filter((l: any) => !l.team || l.team.id === selectedTeamId);
                            const teamCycles = linearCycles.filter((c: any) => !c.team || c.team.id === selectedTeamId);
                            const teamStates = linearWorkflowStates.filter((s: any) => !s.team || s.team.id === selectedTeamId);
                            const teamProjects = linearProjects.filter((p: any) => !p.teams?.nodes?.length || p.teams.nodes.some((t: any) => t.id === selectedTeamId));
                            return (
                                <>
                                    {/* Team */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className={labelClass}>Team</label>
                                            <button onClick={fetchLinearContext} className="text-[10px] text-primary-500 hover:underline uppercase font-bold">Refresh</button>
                                        </div>
                                        <select value={editingPayload.teamId} onChange={(e) => setEditingPayload({ ...editingPayload, teamId: e.target.value })} className={selectClass} style={selectStyle}>
                                            <option value="" disabled>Select a team</option>
                                            {editingPayload.teamId && !linearTeams.some((t: any) => t.id === editingPayload.teamId) && (
                                                <option value={editingPayload.teamId}>{editingPayload.teamId} (Suggested)</option>
                                            )}
                                            {linearTeams.map((team: any) => (
                                                <option key={team.id} value={team.id}>{team.name} ({team.key})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Assignee</label>
                                            <select value={editingPayload.assigneeId || ""} onChange={(e) => setEditingPayload({ ...editingPayload, assigneeId: e.target.value })} className={selectClass} style={selectStyle}>
                                                <option value="">Unassigned</option>
                                                {linearUsers.map((u: any) => (<option key={u.id} value={u.id}>{u.displayName || u.name}</option>))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Priority</label>
                                            <select value={editingPayload.priority || 0} onChange={(e) => setEditingPayload({ ...editingPayload, priority: parseInt(e.target.value) })} className={selectClass} style={selectStyle}>
                                                <option value={0}>No Priority</option>
                                                <option value={1}>🔴 Urgent</option>
                                                <option value={2}>🟠 High</option>
                                                <option value={3}>🟡 Medium</option>
                                                <option value={4}>🔵 Low</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Project</label>
                                            <select value={editingPayload.projectId || ""} onChange={(e) => setEditingPayload({ ...editingPayload, projectId: e.target.value || undefined })} className={selectClass} style={selectStyle}>
                                                <option value="">No Project</option>
                                                {teamProjects.map((p: any) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Cycle</label>
                                            <select value={editingPayload.cycleId || ""} onChange={(e) => setEditingPayload({ ...editingPayload, cycleId: e.target.value || undefined })} className={selectClass} style={selectStyle}>
                                                <option value="">No Cycle</option>
                                                {teamCycles.map((c: any) => (<option key={c.id} value={c.id}>{c.name || `Cycle ${c.number}`}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Status</label>
                                            <select value={editingPayload.stateId || ""} onChange={(e) => setEditingPayload({ ...editingPayload, stateId: e.target.value || undefined })} className={selectClass} style={selectStyle}>
                                                <option value="">Default</option>
                                                {teamStates.map((s: any) => (<option key={s.id} value={s.id}>{s.name} ({s.type})</option>))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Label</label>
                                            <select value={editingPayload.labelIds?.[0] || ""} onChange={(e) => setEditingPayload({ ...editingPayload, labelIds: e.target.value ? [e.target.value] : [] })} className={selectClass} style={selectStyle}>
                                                <option value="">No Label</option>
                                                {teamLabels.map((l: any) => (<option key={l.id} value={l.id}>{l.name}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Due Date</label>
                                            <input type="date" value={editingPayload.dueDate || ""} onChange={(e) => setEditingPayload({ ...editingPayload, dueDate: e.target.value || undefined })} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Estimate</label>
                                            <input type="number" min="0" step="1" placeholder="Points" value={editingPayload.estimate ?? ""} onChange={(e) => setEditingPayload({ ...editingPayload, estimate: e.target.value ? Number(e.target.value) : undefined })} className={inputClass} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Subscribers</label>
                                        <select value={editingPayload.subscriberIds?.[0] || ""} onChange={(e) => setEditingPayload({ ...editingPayload, subscriberIds: e.target.value ? [e.target.value] : [] })} className={selectClass} style={selectStyle}>
                                            <option value="">None</option>
                                            {linearUsers.map((u: any) => (<option key={u.id} value={u.id}>{u.displayName || u.name}</option>))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Parent Issue ID</label>
                                        <input type="text" placeholder="e.g. LIN-123 or UUID" value={editingPayload.parentId || ""} onChange={(e) => setEditingPayload({ ...editingPayload, parentId: e.target.value || undefined })} className={inputClass} />
                                    </div>
                                </>
                            );
                        })()}

                        {/* Gmail Fields */}
                        {action.type === 'draft_gmail_reply' && (
                            <>
                                <div>
                                    <label className={labelClass}>Recipient</label>
                                    <input type="email" value={editingPayload.to} onChange={(e) => setEditingPayload({ ...editingPayload, to: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Subject</label>
                                    <input type="text" value={editingPayload.subject} onChange={(e) => setEditingPayload({ ...editingPayload, subject: e.target.value })} className={inputClass} />
                                </div>
                            </>
                        )}

                        {/* Title */}
                        <div>
                            <label className={labelClass}>{action.type === 'draft_gmail_reply' ? 'Subject' : 'Title'}</label>
                            <input
                                type="text"
                                value={editingPayload.title || editingPayload.subject || ''}
                                onChange={(e) => {
                                    if (action.type === 'draft_gmail_reply') setEditingPayload({ ...editingPayload, subject: e.target.value });
                                    else setEditingPayload({ ...editingPayload, title: e.target.value });
                                }}
                                className={inputClass}
                            />
                        </div>

                        {/* Description/Body */}
                        <div>
                            <label className={labelClass}>{action.type === 'draft_gmail_reply' ? 'Message' : 'Description'}</label>
                            <textarea
                                rows={4}
                                value={editingPayload.body || editingPayload.description || ''}
                                onChange={(e) => {
                                    if (action.type === 'draft_gmail_reply') setEditingPayload({ ...editingPayload, body: e.target.value });
                                    else if (action.type === 'create_linear_issue') setEditingPayload({ ...editingPayload, description: e.target.value });
                                    else setEditingPayload({ ...editingPayload, body: e.target.value });
                                }}
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => handleApproveAndExecute(action, actionId, messageId)}
                                disabled={isExecuting}
                                className="btn-primary flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                {isExecuting ? <div className="spinner w-4 h-4 border-2 border-white/20 border-t-white"></div> : 'Approve & Execute'}
                            </button>
                            <button onClick={() => { setEditingActionId(null); setEditingPayload(null); }} className="btn-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Read-only view */}
                        <div className="space-y-2">
                            {action.type.includes('github') && (
                                <div className="flex items-start gap-2">
                                    <span className="text-muted-foreground text-[10px] font-bold uppercase mt-1 w-16 flex-shrink-0 text-right">Repo:</span>
                                    <code className="bg-white/5 px-2 py-0.5 rounded text-xs text-primary-400 font-mono">{action.payload.repo}</code>
                                </div>
                            )}
                            {action.type === 'create_linear_issue' && (
                                <div className="flex items-start gap-2">
                                    <span className="text-muted-foreground text-[10px] font-bold uppercase mt-1 w-16 flex-shrink-0 text-right">Team:</span>
                                    <code className="bg-white/5 px-2 py-0.5 rounded text-xs text-purple-400 font-mono">{action.payload.teamId}</code>
                                </div>
                            )}
                            {action.type === 'draft_gmail_reply' && (
                                <div className="flex items-start gap-2">
                                    <span className="text-muted-foreground text-[10px] font-bold uppercase mt-1 w-16 flex-shrink-0 text-right">To:</span>
                                    <span className="text-xs text-blue-400 font-medium">{action.payload.to}</span>
                                </div>
                            )}
                            <div className="flex items-start gap-2">
                                <span className="text-muted-foreground text-[10px] font-bold uppercase mt-1 w-16 flex-shrink-0 text-right">Title:</span>
                                <p className="text-sm text-foreground font-medium">{action.payload.title || action.payload.subject}</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-muted-foreground text-[10px] font-bold uppercase mt-1 w-16 flex-shrink-0 text-right">Details:</span>
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{action.payload.body || action.payload.description}</p>
                            </div>
                        </div>

                        {result ? (
                            <div className={`text-sm p-3 rounded-xl flex items-start gap-2 ${result.success ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                <span className="text-base">{result.success ? '✅' : '❌'}</span>
                                <p className="text-xs leading-relaxed">{result.message}</p>
                            </div>
                        ) : (
                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={() => handleApproveAndExecute(action, actionId, messageId)}
                                    disabled={isExecuting}
                                    className="btn-primary flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    {isExecuting ? <div className="spinner w-4 h-4 border-2 border-white/20 border-t-white"></div> : '✓ Approve'}
                                </button>
                                <button onClick={() => startEditing(actionId, action.payload)} className="btn-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider">Edit</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="container-main py-8 flex flex-col h-screen">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Capture
                </h1>
                <p className="text-muted-foreground mt-1">
                    Tell me what&apos;s on your mind — I&apos;ll suggest actions across GitHub, Linear, and Gmail
                </p>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-6 space-y-4">
                {messages.map((message) => (
                    <div key={message.id}>
                        {message.type === "actions" ? (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] space-y-3 fade-in">
                                    <p className="text-sm text-muted-foreground italic px-1">{message.text}</p>
                                    {message.actions?.map((action: any, idx: number) =>
                                        renderActionCard(action, idx, message.id)
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[70%] p-4 rounded-2xl fade-in ${message.type === "user"
                                        ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-md"
                                        : "glass-card text-foreground rounded-bl-md"
                                        }`}
                                >
                                    <p className="leading-relaxed">{message.text}</p>
                                    <p
                                        className={`text-xs mt-2 ${message.type === "user"
                                            ? "text-white/70"
                                            : "text-muted-foreground"
                                            }`}
                                    >
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Thinking indicator */}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="glass-card text-foreground rounded-bl-md p-4 rounded-2xl fade-in">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span className="text-sm text-muted-foreground">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="sticky bottom-0 bg-background pt-4">
                <CaptureInput onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
