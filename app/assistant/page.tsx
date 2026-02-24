"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import DashboardLayout from "@/components/DashboardLayout";
import type { AssistantResponse } from "@/types";

export default function AssistantPage() {
    const { user, isLoaded } = useUser();
    const userId = user?.id;

    const [message, setMessage] = useState<string>("");
    const [priorityTasks, setPriorityTasks] = useState<any[]>([]);
    const [proposedActions, setProposedActions] = useState<any[]>([]);
    const [githubRepos, setGithubRepos] = useState<any[]>([]);
    const [linearTeams, setLinearTeams] = useState<any[]>([]);
    const [linearUsers, setLinearUsers] = useState<any[]>([]);
    const [linearLabels, setLinearLabels] = useState<any[]>([]);
    const [linearProjects, setLinearProjects] = useState<any[]>([]);
    const [linearCycles, setLinearCycles] = useState<any[]>([]);
    const [linearWorkflowStates, setLinearWorkflowStates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [executingAction, setExecutingAction] = useState<string | null>(null);
    const [executionResults, setExecutionResults] = useState<Record<string, { success: boolean; message: string }>>({});
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<string>("");

    useEffect(() => {
        // Update time
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
    }, []);

    useEffect(() => {
        if (isLoaded && userId) {
            fetchAssistant();
            fetchGithubRepos();
            fetchLinearContext();
        }
    }, [isLoaded, userId]);

    const fetchAssistant = async () => {
        if (!userId) return;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/assistant?userId=${userId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch assistant response");
            }
            const data: AssistantResponse = await res.json();
            setMessage(data.message);
            setPriorityTasks(data.priority_tasks || []);
            setProposedActions(data.proposed_actions || []);
        } catch (err) {
            console.error("Error fetching assistant:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGithubRepos = async () => {
        try {
            const res = await fetch('/api/github/repos');
            if (res.ok) {
                const data = await res.json();
                setGithubRepos(data);
            }
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

    const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null);
    const [editingPayload, setEditingPayload] = useState<any>(null);

    const handleExecuteAction = async (action: any, index: number) => {
        if (!userId) return;

        const actionId = `action-${index}`;
        setExecutingAction(actionId);

        try {
            const res = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    action,
                    // For demo purposes, we'll try to match a task ID if possible
                    memoryItemId: priorityTasks[0]?.id
                }),
            });

            const result = await res.json();

            if (res.ok) {
                // Sync the list state with the executed action
                setProposedActions(prev => {
                    const next = [...prev];
                    next[index] = action;
                    return next;
                });

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

    const startEditing = (idx: number) => {
        setEditingActionIndex(idx);
        setEditingPayload({ ...proposedActions[idx].payload });
    };

    const saveEdit = () => {
        if (editingActionIndex === null) return;
        const updatedActions = [...proposedActions];
        // Immutable update
        updatedActions[editingActionIndex] = {
            ...updatedActions[editingActionIndex],
            payload: { ...editingPayload }
        };
        setProposedActions(updatedActions);
        setEditingActionIndex(null);
        setEditingPayload(null);
    };

    const handleApproveAndExecute = async (idx: number, isFromEditMode: boolean = false) => {
        const actionToExecute = isFromEditMode
            ? { ...proposedActions[idx], payload: { ...editingPayload } }
            : proposedActions[idx];

        await handleExecuteAction(actionToExecute, idx);

        if (isFromEditMode) {
            setEditingActionIndex(null);
            setEditingPayload(null);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    return (
        <DashboardLayout>
            <div className="container-main py-12">
                {/* Header */}
                <header className="mb-8">
                    <Link
                        href="/dashboard"
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-4 transition-colors"
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
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back to Home
                    </Link>
                    <p className="text-muted-foreground mb-2">{currentTime}</p>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2 page-header-gradient">
                        {getGreeting()}
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Your AI assistant is ready to help
                    </p>
                </header>

                {/* Assistant Response */}
                <section className="mb-8">
                    {isLoading && (
                        <div className="glass-card p-8">
                            <div className="flex items-center gap-4">
                                <div className="spinner"></div>
                                <span className="text-muted-foreground">
                                    Analyzing your tasks...
                                </span>
                            </div>
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="glass-card p-8 border-red-200">
                            <p className="text-red-600 mb-4">
                                {error}
                            </p>
                            <button onClick={fetchAssistant} className="btn-primary">
                                Try Again
                            </button>
                        </div>
                    )}

                    {!isLoading && !error && message && (
                        <div className="glass-card p-8 fade-in">
                            {/* AI Avatar */}
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white flex-shrink-0">
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
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        AI Assistant
                                    </p>
                                    <div className="prose prose-slate max-w-none mb-6">
                                        <p className="text-foreground text-lg leading-relaxed whitespace-pre-wrap">
                                            {message}
                                        </p>
                                    </div>

                                    {/* Level 2: Proposed Actions */}
                                    {proposedActions.length > 0 && (
                                        <div className="mt-8 space-y-4">
                                            <h3 className="text-sm font-semibold text-primary-500 uppercase tracking-wider flex items-center gap-2">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                                </span>
                                                Proposed Actions (Level 2)
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                {proposedActions.map((action, idx) => (
                                                    <div key={idx} className="glass-card p-6 border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10 transition-all duration-300 relative overflow-hidden group">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-xl">
                                                                    {action.type.includes('github') ? '🐙' :
                                                                        action.type.includes('linear') ? '📈' :
                                                                            action.type.includes('gmail') ? '✉️' : '📝'}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-foreground capitalize leading-tight">
                                                                        {action.type.replace(/_/g, ' ')}
                                                                    </h4>
                                                                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Requires Approval</p>
                                                                </div>
                                                            </div>
                                                            {editingActionIndex !== idx && !executionResults[`action-${idx}`] && (
                                                                <button
                                                                    onClick={() => startEditing(idx)}
                                                                    className="text-xs text-muted-foreground hover:text-primary-500 transition-colors flex items-center gap-1"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                                    Edit
                                                                </button>
                                                            )}
                                                        </div>

                                                        {editingActionIndex === idx ? (
                                                            <div className="space-y-4 mb-4 fade-in">
                                                                {/* GitHub Repo Selector */}
                                                                {action.type.includes('github') && (
                                                                    <div>
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase block">Repository</label>
                                                                            <button
                                                                                onClick={fetchGithubRepos}
                                                                                className="text-[10px] text-primary-500 hover:underline uppercase font-bold"
                                                                            >
                                                                                Refresh List
                                                                            </button>
                                                                        </div>
                                                                        <select
                                                                            value={editingPayload.repo}
                                                                            onChange={(e) => setEditingPayload({ ...editingPayload, repo: e.target.value })}
                                                                            className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none cursor-pointer"
                                                                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                                                                        >
                                                                            <option value="" disabled>Select a repository</option>
                                                                            {editingPayload.repo && !githubRepos.some(r => r.full_name === editingPayload.repo) && (
                                                                                <option value={editingPayload.repo}>{editingPayload.repo} (Suggested)</option>
                                                                            )}
                                                                            {githubRepos.map((repo) => (
                                                                                <option key={repo.id} value={repo.full_name}>
                                                                                    {repo.full_name}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                )}

                                                                {/* Linear Team Request */}
                                                                {action.type === 'create_linear_issue' && (() => {
                                                                    const selectedTeamId = editingPayload.teamId;
                                                                    const selectStyle = { backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' };
                                                                    const selectClass = "w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none cursor-pointer";
                                                                    const labelClass = "text-[10px] font-bold text-muted-foreground uppercase block mb-1";
                                                                    // Filter team-scoped data
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
                                                                                {/* Assignee */}
                                                                                <div>
                                                                                    <label className={labelClass}>Assignee</label>
                                                                                    <select value={editingPayload.assigneeId || ""} onChange={(e) => setEditingPayload({ ...editingPayload, assigneeId: e.target.value })} className={selectClass} style={selectStyle}>
                                                                                        <option value="">Unassigned</option>
                                                                                        {linearUsers.map((user: any) => (<option key={user.id} value={user.id}>{user.displayName || user.name}</option>))}
                                                                                    </select>
                                                                                </div>
                                                                                {/* Priority */}
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
                                                                                {/* Project */}
                                                                                <div>
                                                                                    <label className={labelClass}>Project</label>
                                                                                    <select value={editingPayload.projectId || ""} onChange={(e) => setEditingPayload({ ...editingPayload, projectId: e.target.value || undefined })} className={selectClass} style={selectStyle}>
                                                                                        <option value="">No Project</option>
                                                                                        {teamProjects.map((p: any) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                                                                    </select>
                                                                                </div>
                                                                                {/* Cycle */}
                                                                                <div>
                                                                                    <label className={labelClass}>Cycle</label>
                                                                                    <select value={editingPayload.cycleId || ""} onChange={(e) => setEditingPayload({ ...editingPayload, cycleId: e.target.value || undefined })} className={selectClass} style={selectStyle}>
                                                                                        <option value="">No Cycle</option>
                                                                                        {teamCycles.map((c: any) => (<option key={c.id} value={c.id}>{c.name || `Cycle ${c.number}`}</option>))}
                                                                                    </select>
                                                                                </div>
                                                                            </div>

                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                {/* Workflow State */}
                                                                                <div>
                                                                                    <label className={labelClass}>Status</label>
                                                                                    <select value={editingPayload.stateId || ""} onChange={(e) => setEditingPayload({ ...editingPayload, stateId: e.target.value || undefined })} className={selectClass} style={selectStyle}>
                                                                                        <option value="">Default</option>
                                                                                        {teamStates.map((s: any) => (<option key={s.id} value={s.id}>{s.name} ({s.type})</option>))}
                                                                                    </select>
                                                                                </div>
                                                                                {/* Label */}
                                                                                <div>
                                                                                    <label className={labelClass}>Label</label>
                                                                                    <select value={editingPayload.labelIds?.[0] || ""} onChange={(e) => setEditingPayload({ ...editingPayload, labelIds: e.target.value ? [e.target.value] : [] })} className={selectClass} style={selectStyle}>
                                                                                        <option value="">No Label</option>
                                                                                        {teamLabels.map((label: any) => (<option key={label.id} value={label.id}>{label.name}</option>))}
                                                                                    </select>
                                                                                </div>
                                                                            </div>

                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                {/* Due Date */}
                                                                                <div>
                                                                                    <label className={labelClass}>Due Date</label>
                                                                                    <input type="date" value={editingPayload.dueDate || ""} onChange={(e) => setEditingPayload({ ...editingPayload, dueDate: e.target.value || undefined })} className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors" />
                                                                                </div>
                                                                                {/* Estimate */}
                                                                                <div>
                                                                                    <label className={labelClass}>Estimate</label>
                                                                                    <input type="number" min="0" step="1" placeholder="Points" value={editingPayload.estimate ?? ""} onChange={(e) => setEditingPayload({ ...editingPayload, estimate: e.target.value ? Number(e.target.value) : undefined })} className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors" />
                                                                                </div>
                                                                            </div>

                                                                            {/* Subscribers */}
                                                                            <div>
                                                                                <label className={labelClass}>Subscribers</label>
                                                                                <select value={editingPayload.subscriberIds?.[0] || ""} onChange={(e) => setEditingPayload({ ...editingPayload, subscriberIds: e.target.value ? [e.target.value] : [] })} className={selectClass} style={selectStyle}>
                                                                                    <option value="">None</option>
                                                                                    {linearUsers.map((user: any) => (<option key={user.id} value={user.id}>{user.displayName || user.name}</option>))}
                                                                                </select>
                                                                            </div>

                                                                            {/* Parent Issue ID */}
                                                                            <div>
                                                                                <label className={labelClass}>Parent Issue ID</label>
                                                                                <input type="text" placeholder="e.g. LIN-123 or UUID" value={editingPayload.parentId || ""} onChange={(e) => setEditingPayload({ ...editingPayload, parentId: e.target.value || undefined })} className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors" />
                                                                            </div>
                                                                        </>);
                                                                })()}

                                                                {/* Gmail To/Subject */}
                                                                {action.type === 'draft_gmail_reply' && (
                                                                    <>
                                                                        <div>
                                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Recipient</label>
                                                                            <input
                                                                                type="email"
                                                                                value={editingPayload.to}
                                                                                onChange={(e) => setEditingPayload({ ...editingPayload, to: e.target.value })}
                                                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary-500 transition-colors"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Subject</label>
                                                                            <input
                                                                                type="text"
                                                                                value={editingPayload.subject}
                                                                                onChange={(e) => setEditingPayload({ ...editingPayload, subject: e.target.value })}
                                                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary-500 transition-colors"
                                                                            />
                                                                        </div>
                                                                    </>
                                                                )}

                                                                <div>
                                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">{action.type === 'draft_gmail_reply' ? 'Email Body' : 'Title'}</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editingPayload.title || editingPayload.subject || ''}
                                                                        onChange={(e) => {
                                                                            if (action.type === 'draft_gmail_reply') setEditingPayload({ ...editingPayload, subject: e.target.value });
                                                                            else setEditingPayload({ ...editingPayload, title: e.target.value });
                                                                        }}
                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary-500 transition-colors"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">{action.type === 'draft_gmail_reply' ? 'Message' : 'Description'}</label>
                                                                    <textarea
                                                                        rows={3}
                                                                        value={editingPayload.body || editingPayload.description || ''}
                                                                        onChange={(e) => {
                                                                            if (action.type === 'draft_gmail_reply') setEditingPayload({ ...editingPayload, body: e.target.value });
                                                                            else if (action.type === 'create_linear_issue') setEditingPayload({ ...editingPayload, description: e.target.value });
                                                                            else setEditingPayload({ ...editingPayload, body: e.target.value });
                                                                        }}
                                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary-500 transition-colors resize-none"
                                                                    />
                                                                </div>
                                                                <div className="flex gap-2 pt-2">
                                                                    <button
                                                                        onClick={() => handleApproveAndExecute(idx, true)}
                                                                        disabled={executingAction === `action-${idx}`}
                                                                        className="btn-primary flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                                                                    >
                                                                        {executingAction === `action-${idx}` ? (
                                                                            <div className="spinner w-4 h-4 border-2 border-white/20 border-t-white"></div>
                                                                        ) : 'Approve & Execute'}
                                                                    </button>
                                                                    <button onClick={() => setEditingActionIndex(null)} className="btn-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider">Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="space-y-3 mb-6">
                                                                    {action.type.includes('github') && (
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-muted-foreground text-[10px] font-bold uppercase mt-1 w-20 flex-shrink-0 text-right">Repo:</span>
                                                                            <code className="bg-white/5 px-2 py-0.5 rounded text-xs text-primary-400 font-mono">{action.payload.repo}</code>
                                                                        </div>
                                                                    )}
                                                                    {action.type === 'create_linear_issue' && (
                                                                        <>
                                                                            <div className="flex items-start gap-2">
                                                                                <span className="text-muted-foreground text-[10px] font-bold uppercase mt-1 w-20 flex-shrink-0 text-right">Team ID:</span>
                                                                                <code className="bg-white/5 px-2 py-0.5 rounded text-xs text-purple-400 font-mono">{action.payload.teamId}</code>
                                                                            </div>
                                                                            {/* Show more details if available in payload */}
                                                                            {action.payload.assigneeId && (
                                                                                <div className="flex items-start gap-2">
                                                                                    <span className="text-muted-foreground text-[10px] font-bold uppercase mt-1 w-20 flex-shrink-0 text-right">Assignee:</span>
                                                                                    <code className="bg-white/5 px-2 py-0.5 rounded text-xs text-purple-400 font-mono">{action.payload.assigneeId}</code>
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                    {action.type === 'draft_gmail_reply' && (
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-muted-foreground text-[10px] font-bold uppercase mt-1 w-20 flex-shrink-0 text-right">To:</span>
                                                                            <p className="text-xs text-blue-400 font-medium">{action.payload.to}</p>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-start gap-2">
                                                                        <span className="text-muted-foreground text-[10px] font-bold uppercase mt-1 w-20 flex-shrink-0 text-right">
                                                                            {action.type === 'draft_gmail_reply' ? 'Subject:' : 'Title:'}
                                                                        </span>
                                                                        <p className="text-sm text-foreground font-medium">{action.payload.title || action.payload.subject}</p>
                                                                    </div>
                                                                    <div className="flex items-start gap-2">
                                                                        <span className="text-muted-foreground text-[10px] font-bold uppercase mt-1 w-20 flex-shrink-0 text-right">Details:</span>
                                                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{action.payload.body || action.payload.description}</p>
                                                                    </div>
                                                                </div>

                                                                {executionResults[`action-${idx}`] ? (
                                                                    <div className={`text-sm p-4 rounded-xl flex items-start gap-3 fade-in ${executionResults[`action-${idx}`].success ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                                        <span className="text-xl">{executionResults[`action-${idx}`].success ? '✅' : '❌'}</span>
                                                                        <div>
                                                                            <p className="font-bold text-xs uppercase tracking-wider">{executionResults[`action-${idx}`].success ? 'Success' : 'Error'}</p>
                                                                            <p className="mt-0.5 opacity-90">{executionResults[`action-${idx}`].message}</p>
                                                                            {!executionResults[`action-${idx}`].success && (
                                                                                <button onClick={() => startEditing(idx)} className="mt-2 text-[10px] font-bold uppercase tracking-widest underline decoration-2 underline-offset-4">Fix & Retry</button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleApproveAndExecute(idx)}
                                                                        disabled={executingAction === `action-${idx}`}
                                                                        className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-3 font-bold uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all active:scale-[0.98]"
                                                                    >
                                                                        {executingAction === `action-${idx}` ? (
                                                                            <>
                                                                                <div className="spinner w-5 h-5 border-2 border-white/20 border-t-white"></div>
                                                                                <span>Executing...</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                                                                <span>Approve & Execute</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Priority Tasks */}
                                    {priorityTasks.length > 0 && (
                                        <div className="mt-8 space-y-4">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                                🎯 Focus Areas
                                            </h3>
                                            <div className="space-y-3">
                                                {priorityTasks.map((task, idx) => (
                                                    <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                                        <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center text-xs font-bold">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-foreground">{task.title}</h4>
                                                            <p className="text-sm text-muted-foreground mt-1">{task.reason}</p>
                                                            {task.suggested_steps?.length > 0 && (
                                                                <ul className="mt-2 space-y-1">
                                                                    {task.suggested_steps.map((step: string, sIdx: number) => (
                                                                        <li key={sIdx} className="text-xs text-muted-foreground flex items-center gap-2">
                                                                            <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                                                                            {step}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t border-white/20">
                                <button
                                    onClick={fetchAssistant}
                                    className="btn-secondary flex items-center gap-2"
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
                                    >
                                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                        <path d="M21 3v5h-5" />
                                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                        <path d="M8 16H3v5" />
                                    </svg>
                                    Refresh Analysis
                                </button>
                                <Link href="/chat" className="btn-primary flex items-center gap-2">
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
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    Capture New Task
                                </Link>
                            </div>
                        </div>
                    )}
                </section>

                {/* Quick Links */}
                <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/brief" className="glass-card p-4 card-hover">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    📋
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground">Daily Brief</h3>
                                    <p className="text-sm text-muted-foreground">View all tasks</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/memories" className="glass-card p-4 card-hover">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                    🧠
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground">All Memories</h3>
                                    <p className="text-sm text-muted-foreground">Browse history</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
