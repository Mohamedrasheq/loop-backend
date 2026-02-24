import Link from "next/link";
import Image from "next/image";

const FEATURES = [
  {
    icon: "✨",
    title: "AI Capture",
    description: "Just tell Loop what's on your mind. AI extracts tasks, follow-ups, and notes automatically.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: "🔗",
    title: "12+ Integrations",
    description: "Connect GitHub, Linear, Jira, Slack, Notion, Gmail, and more. Loop acts across all your tools.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: "📋",
    title: "Daily Briefs",
    description: "Every morning, see exactly what needs your attention. Prioritized by urgency and due dates.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: "🤖",
    title: "AI Chat Agent",
    description: "Chat with Claude to create issues, draft emails, and manage tasks — all in natural language.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

// Brand SVG icons for integrations
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="#181717"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
);
const LinearIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="#5E6AD2"><path d="M2.513 12.833c-.34-.766-.513-1.601-.513-2.5C2 6.358 5.358 3 9.333 3c.9 0 1.735.173 2.5.513L2.513 12.833zm1.209 2.395 9.945-9.945A7.347 7.347 0 0 1 16.667 10c0 .263-.014.523-.041.779L8.779 18.626A7.32 7.32 0 0 1 3.722 15.228zM10 18.667c-.364 0-.722-.027-1.073-.078L17.588 9.927A7.32 7.32 0 0 1 10 18.667zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" /></svg>
);
const JiraIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="#0052CC"><path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.594 24V12.518a1.005 1.005 0 0 0-1.023-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23 .262H11.429a5.218 5.218 0 0 0 5.215 5.215h2.129v2.057A5.218 5.218 0 0 0 24 12.749V1.263A1.001 1.001 0 0 0 23 .262z" /></svg>
);
const SlackIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" /><path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" /><path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D" /><path d="M15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z" fill="#ECB22E" /></svg>
);
const NotionIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="#000000"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.41 2.33c-.42-.326-.98-.7-2.055-.607L3.62 2.838c-.466.046-.56.28-.374.466l1.213.904zm.793 3.172v13.856c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.934-.56.934-1.166V6.354c0-.606-.233-.933-.747-.886l-15.177.886c-.56.047-.747.327-.747.886v.14zm14.337.42c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.747 0-.934-.234-1.495-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.513.28-.886.747-.933l3.222-.186zM2.1 1.612l13.542-.934c1.683-.14 2.1.046 2.8.56l3.876 2.705c.467.373.607.467.607 1.12v15.29c0 1.026-.373 1.632-1.68 1.726l-15.458.933c-.98.047-1.448-.093-1.962-.747L1.588 19.39c-.56-.747-.793-1.306-.793-1.96V3.34c0-.84.373-1.587 1.305-1.727z" /></svg>
);
const GmailIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335" /></svg>
);
const GoogleCalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32"><path d="M18.316 5.684H24v12.632h-5.684V5.684z" fill="#1A73E8" /><path d="M5.684 24h12.632v-5.684H5.684V24z" fill="#1A73E8" /><path d="M18.316 24V18.316H24V24h-5.684z" fill="#1557B0" /><path d="M0 18.316h5.684V5.684H0v12.632z" fill="#188038" /><path d="M5.684 0v5.684h12.632V0H5.684z" fill="#188038" /><path d="M0 5.684V0h5.684v5.684H0z" fill="#0D652D" /><path d="M0 18.316h5.684V24H0v-5.684z" fill="#0D652D" /><path d="M5.684 5.684h12.632v12.632H5.684V5.684z" fill="#FFF" /><path d="M9.2 16.4V8.6h1.8v7.8H9.2zm4.2-3.6c.5.3.8.8.8 1.4 0 .7-.3 1.2-.8 1.6-.5.3-1.1.5-1.8.5-.6 0-1.2-.1-1.6-.4v-1.4c.5.3 1 .5 1.5.5.3 0 .6-.1.8-.2.2-.2.3-.4.3-.6 0-.5-.4-.8-1.2-.8h-.7v-1.2h.6c.7 0 1.1-.3 1.1-.8 0-.3-.1-.4-.3-.6-.2-.1-.4-.2-.7-.2-.5 0-.9.2-1.3.5V9.9c.5-.3 1-.5 1.6-.5.6 0 1.1.2 1.5.5.4.3.6.8.6 1.3 0 .6-.3 1.1-.8 1.3z" fill="#1A73E8" /></svg>
);
const TrelloIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="#0052CC"><path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.645-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .794-.645 1.44-1.44 1.44H15c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z" /></svg>
);
const AsanaIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="#F06A6A"><path d="M18.78 12.653c-2.882 0-5.22 2.337-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.337 5.22-5.22-2.337-5.22-5.22-5.22zm-13.56 0c-2.882 0-5.22 2.337-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.337 5.22-5.22-2.337-5.22-5.22-5.22zM12 .907c-2.882 0-5.22 2.337-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.337 5.22-5.22S14.882.907 12 .907z" /></svg>
);
const TodoistIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="#E44332"><path d="M21 0H3C1.35 0 0 1.35 0 3v18c0 1.65 1.35 3 3 3h18c1.65 0 3-1.35 3-3V3c0-1.65-1.35-3-3-3zM5.95 10.77l1.06-1.5c.04-.06.12-.08.18-.04l.72.5 2.02 1.38c.06.04.14.02.18-.04l.84-1.2c.04-.06.12-.08.18-.04l2.7 1.86c.06.04.14.02.18-.04l.84-1.2c.04-.06.12-.08.18-.04l3.06 2.1c.06.04.08.12.04.18l-1.06 1.5c-.04.06-.12.08-.18.04l-2.72-1.86-1.02 1.44c-.04.06-.12.08-.18.04l-2.72-1.88-1.02 1.44c-.04.06-.12.08-.18.04L5.99 10.95c-.06-.04-.08-.12-.04-.18z" /></svg>
);
const ConfluenceIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32"><path d="M1.393 18.658c-.33.558-.658 1.2-.888 1.632a.475.475 0 0 0 .178.648l3.362 2.065a.478.478 0 0 0 .652-.163c.2-.347.479-.84.79-1.386 1.87-3.28 3.712-2.907 7.11-1.342l3.15 1.45a.476.476 0 0 0 .63-.238L18.42 17.6a.477.477 0 0 0-.23-.628c-.917-.423-2.756-1.27-3.657-1.685-5.334-2.45-9.51-2.225-13.14 3.37z" fill="#1868DB" /><path d="M22.607 5.342c.33-.558.658-1.2.888-1.632a.475.475 0 0 0-.178-.648l-3.362-2.065a.478.478 0 0 0-.652.163c-.2.347-.479.84-.79 1.386-1.87 3.28-3.712 2.907-7.11 1.342l-3.15-1.45a.476.476 0 0 0-.63.238L5.58 6.4a.477.477 0 0 0 .23.628c.917.423 2.756 1.27 3.657 1.685 5.334 2.45 9.51 2.225 13.14-3.37z" fill="#0052CC" /></svg>
);
const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="#5865F2"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
);

const INTEGRATIONS: { name: string; icon: React.ReactNode }[] = [
  { name: "GitHub", icon: <GitHubIcon /> },
  { name: "Linear", icon: <LinearIcon /> },
  { name: "Jira", icon: <JiraIcon /> },
  { name: "Slack", icon: <SlackIcon /> },
  { name: "Notion", icon: <NotionIcon /> },
  { name: "Gmail", icon: <GmailIcon /> },
  { name: "Google Calendar", icon: <GoogleCalendarIcon /> },
  { name: "Trello", icon: <TrelloIcon /> },
  { name: "Asana", icon: <AsanaIcon /> },
  { name: "Todoist", icon: <TodoistIcon /> },
  { name: "Confluence", icon: <ConfluenceIcon /> },
  { name: "Discord", icon: <DiscordIcon /> },
];

const STEPS = [
  {
    number: "01",
    title: "Capture anything",
    description: "Type your thoughts naturally. \"Remind me to review the PR tomorrow\" or \"Create a Jira ticket for the login bug.\"",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    number: "02",
    title: "AI processes it",
    description: "Loop extracts tasks, sets due dates, determines urgency, and proposes actions across your connected tools.",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    number: "03",
    title: "Actions executed",
    description: "Approve proposed actions with one click. GitHub issues created, Linear tickets filed, Gmail drafts ready.",
    gradient: "from-emerald-500 to-emerald-600",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen landing-gradient-bg grid-pattern">
      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/loop-logo.png" alt="Loop" width={32} height={32} className="w-8 h-8" />
            <span className="text-lg font-bold text-gray-900">Loop</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-landing btn-landing-primary text-sm !py-2 !px-5">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Soft decorative gradients */}
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-blue-400/8 rounded-full blur-[100px] animate-glow" />
        <div className="absolute bottom-10 right-[10%] w-96 h-96 bg-purple-400/6 rounded-full blur-[120px] animate-glow" style={{ animationDelay: "1.5s" }} />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white mb-8 text-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-500">AI-powered productivity for modern teams</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Your calm{" "}
            <span className="gradient-text">chief-of-staff,</span>
            <br />
            powered by AI
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Loop quietly keeps track of your tasks, follow-ups, and notes — then takes action across GitHub, Linear, Jira, Slack, and 8 more tools.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/sign-up" className="btn-landing btn-landing-primary">
              Get Started Free
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
            <Link href="/sign-in" className="btn-landing btn-landing-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-24 px-6 landing-section">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
              Everything you need to{" "}
              <span className="gradient-text-blue">stay on top</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto font-normal">
              From capturing thoughts to executing actions — Loop handles the busywork so you can focus.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="landing-feature-card group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-normal">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INTEGRATIONS ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
            Connect <span className="gradient-text">12+ tools</span> you already use
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-14 font-normal">
            Loop integrates with your favorite services. Connect once, and the AI agent can take action on your behalf.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {INTEGRATIONS.map((integration) => (
              <div
                key={integration.name}
                className="flex flex-col items-center justify-center gap-3 py-6 px-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {integration.icon}
                </div>
                <span className="text-xs font-semibold text-gray-700">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-24 px-6 landing-section">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
              Simple as{" "}
              <span className="gradient-text-blue">1-2-3</span>
            </h2>
            <p className="text-gray-500 text-lg font-normal">No setup wizards. No complex workflows. Just talk to Loop.</p>
          </div>
          <div className="space-y-10">
            {STEPS.map((step) => (
              <div key={step.number} className="landing-step flex gap-6">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1`}>
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed font-normal">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 px-6 landing-section">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card-glow p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
              Ready to get{" "}
              <span className="gradient-text">started?</span>
            </h2>
            <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto font-normal">
              Join Loop and let AI handle the busywork. Your focus is too valuable for task management.
            </p>
            <Link href="/sign-up" className="btn-landing btn-landing-primary text-base">
              Create Your Account
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image src="/loop-logo.png" alt="Loop" width={28} height={28} className="w-7 h-7" />
            <span className="font-bold text-gray-900">Loop</span>
            <span className="text-gray-400 text-sm font-normal">· Your calm chief-of-staff</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
            <Link href="/sign-in" className="hover:text-gray-900 transition-colors">Sign In</Link>
            <Link href="/sign-up" className="hover:text-gray-900 transition-colors">Sign Up</Link>
          </div>
          <p className="text-sm text-gray-400 font-normal">
            © {new Date().getFullYear()} Loop. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
