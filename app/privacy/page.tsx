import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: "Privacy Policy - Loop",
    description: "Learn how Loop collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/loop-logo.png" alt="Loop" width={32} height={32} className="w-8 h-8" />
                        <span className="text-lg font-bold text-gray-900">Loop</span>
                    </Link>
                    <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                <p className="text-gray-400 mb-10">Last updated: February 24, 2025</p>

                <div className="prose prose-gray max-w-none space-y-8">
                    {/* 1 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Introduction</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Loop (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the Loop productivity application (web and mobile). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. Please read this policy carefully. By using Loop, you consent to the data practices described in this policy.
                        </p>
                    </section>

                    {/* 2 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.1 Account Information</h3>
                        <p className="text-gray-600 leading-relaxed">
                            When you create an account, we collect your <strong>email address</strong>, <strong>full name</strong>, and <strong>profile photo</strong> through our authentication provider (Clerk). We store your user ID, email, name, and avatar URL in our database.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.2 User-Generated Content</h3>
                        <p className="text-gray-600 leading-relaxed">
                            We collect and store the content you provide to Loop, including:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li><strong>Captured text</strong> — messages, tasks, notes, and follow-ups you type into Loop</li>
                            <li><strong>Memory items</strong> — structured data extracted from your input (titles, descriptions, due dates, urgency levels)</li>
                            <li><strong>Chat messages</strong> — conversations with the AI assistant</li>
                            <li><strong>Draft messages</strong> — AI-generated follow-up drafts based on your items</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.3 Third-Party Service Credentials</h3>
                        <p className="text-gray-600 leading-relaxed">
                            When you connect third-party integrations (such as GitHub, Linear, Jira, Slack, Notion, Gmail, Google Calendar, Trello, Asana, Todoist, Confluence, or Discord), you provide API keys or access tokens. These credentials are <strong>encrypted at rest using AES-256-GCM encryption</strong> before being stored. We never store your credentials in plaintext. We only decrypt them temporarily in server memory when executing actions on your behalf.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.4 Device Information</h3>
                        <p className="text-gray-600 leading-relaxed">
                            If you use our mobile application, we collect your <strong>device push token</strong> (Expo Push Token) and <strong>platform type</strong> (iOS/Android) to send you push notifications. We do not collect device model, OS version, or other hardware identifiers.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.5 Subscription Information</h3>
                        <p className="text-gray-600 leading-relaxed">
                            If you subscribe to Loop Pro, payment processing is handled entirely by <strong>RevenueCat</strong> and the respective app store (Apple App Store or Google Play). We receive webhook notifications about your subscription status (active, expired, renewed) but we do <strong>not</strong> receive or store your payment card details, billing address, or any financial information.
                        </p>
                    </section>

                    {/* 3 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
                        <p className="text-gray-600 leading-relaxed">We use the information we collect to:</p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li>Provide, maintain, and improve the Loop service</li>
                            <li>Process your text input using AI to extract tasks, follow-ups, and notes</li>
                            <li>Power the AI chat assistant that helps manage your productivity</li>
                            <li>Execute actions on connected third-party services on your behalf (e.g., creating GitHub issues, Linear tickets)</li>
                            <li>Generate and deliver daily briefings of your priorities</li>
                            <li>Send push notifications for reminders and due-date alerts</li>
                            <li>Manage your subscription status</li>
                            <li>Facilitate account deletion upon your request</li>
                        </ul>
                    </section>

                    {/* 4 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">4. AI Data Processing</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Loop uses artificial intelligence to process your text input. This is a core part of how the service works. Here is exactly what happens:
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.1 Text Extraction (OpenAI)</h3>
                        <p className="text-gray-600 leading-relaxed">
                            When you capture text, it is sent to <strong>OpenAI&rsquo;s GPT-4o-mini</strong> model to extract structured information (task type, title, urgency, due date). OpenAI processes this data under their <a href="https://openai.com/enterprise-privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">API data usage policy</a>, which states that API inputs are <strong>not used to train their models</strong>.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.2 AI Chat Assistant (Anthropic Claude)</h3>
                        <p className="text-gray-600 leading-relaxed">
                            When you use the chat feature, your messages are sent to <strong>Anthropic&rsquo;s Claude</strong> model. Anthropic processes this data under their <a href="https://www.anthropic.com/policies/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">commercial API usage policy</a>, which states that API usage data is <strong>not used to train their models</strong>. Chat messages are not persistently stored by Anthropic.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.3 What We Send to AI Providers</h3>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li>Your text input (what you type into the capture or chat feature)</li>
                            <li>Your timezone (for due-date processing)</li>
                            <li>Current timestamp</li>
                            <li>Names of your connected services (so the AI knows which tools are available)</li>
                        </ul>
                        <p className="text-gray-600 leading-relaxed mt-2">
                            We do <strong>not</strong> send your email address, name, credentials, or any other personal information to AI providers.
                        </p>
                    </section>

                    {/* 5 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Data Storage and Security</h2>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.1 Where We Store Data</h3>
                        <p className="text-gray-600 leading-relaxed">
                            All user data is stored in <strong>Supabase</strong> (PostgreSQL database) with row-level security. Data is stored on Supabase&rsquo;s cloud infrastructure.
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.2 Encryption</h3>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li><strong>Third-party credentials</strong> are encrypted using AES-256-GCM (authenticated encryption) before storage. Each credential has a unique initialization vector (IV) and authentication tag.</li>
                            <li><strong>Data in transit</strong> is protected via HTTPS/TLS for all API communications.</li>
                            <li><strong>Authentication</strong> is handled by Clerk, which provides industry-standard security practices.</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">5.3 Data Retention</h3>
                        <p className="text-gray-600 leading-relaxed">
                            We retain your data for as long as your account is active. When you delete your account, all associated data is permanently deleted through a cascading delete operation, including memory items, notifications, credentials, device tokens, and subscription records.
                        </p>
                    </section>

                    {/* 6 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Third-Party Services</h2>
                        <p className="text-gray-600 leading-relaxed">Loop uses the following third-party services to operate:</p>

                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-3 font-semibold text-gray-800">Service</th>
                                        <th className="text-left p-3 font-semibold text-gray-800">Purpose</th>
                                        <th className="text-left p-3 font-semibold text-gray-800">Data Shared</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr><td className="p-3 font-medium">Clerk</td><td className="p-3">Authentication</td><td className="p-3">Email, name, avatar</td></tr>
                                    <tr><td className="p-3 font-medium">Supabase</td><td className="p-3">Database</td><td className="p-3">All user data (stored encrypted where applicable)</td></tr>
                                    <tr><td className="p-3 font-medium">OpenAI</td><td className="p-3">Text extraction</td><td className="p-3">User text input, timezone</td></tr>
                                    <tr><td className="p-3 font-medium">Anthropic</td><td className="p-3">AI chat assistant</td><td className="p-3">Chat messages, timezone, connected service names</td></tr>
                                    <tr><td className="p-3 font-medium">RevenueCat</td><td className="p-3">Subscription management</td><td className="p-3">User ID, subscription events</td></tr>
                                    <tr><td className="p-3 font-medium">Upstash QStash</td><td className="p-3">Scheduled notifications</td><td className="p-3">Notification payloads, scheduling data</td></tr>
                                    <tr><td className="p-3 font-medium">Expo Push Service</td><td className="p-3">Mobile push notifications</td><td className="p-3">Push tokens, notification content</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <p className="text-gray-600 leading-relaxed mt-4">
                            Each third-party service has its own privacy policy. We encourage you to review their terms.
                        </p>
                    </section>

                    {/* 7 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Connected Integrations</h2>
                        <p className="text-gray-600 leading-relaxed">
                            When you connect third-party services (GitHub, Linear, Jira, Slack, Notion, Gmail, Google Calendar, Trello, Asana, Todoist, Confluence, Discord), the AI assistant may perform actions on those services on your behalf — such as creating issues, retrieving data, or listing repositories. Actions are only taken when you explicitly interact with the AI, and the AI will always describe what it is doing. Your credentials are decrypted only during the execution of these actions and are never logged or cached in plaintext.
                        </p>
                    </section>

                    {/* 8 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Your Rights</h2>
                        <p className="text-gray-600 leading-relaxed">You have the right to:</p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li><strong>Access</strong> — View all data stored about you through the Memories and Notifications sections of the app</li>
                            <li><strong>Delete</strong> — Permanently delete your account and all associated data through the app settings or by contacting us</li>
                            <li><strong>Disconnect</strong> — Remove any connected third-party service integration at any time, which immediately deletes the stored encrypted credentials</li>
                            <li><strong>Export</strong> — Request a copy of your data by contacting us</li>
                        </ul>
                    </section>

                    {/* 9 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Children&rsquo;s Privacy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Loop is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected data from a child under 13, we will take steps to delete it promptly.
                        </p>
                    </section>

                    {/* 10 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Changes to This Policy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date. Continued use of the Service after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    {/* 11 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Contact Us</h2>
                        <p className="text-gray-600 leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at: <strong>support@loopapp.co</strong>
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-8 px-6 bg-white">
                <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-400">
                    <span>© {new Date().getFullYear()} Loop. All rights reserved.</span>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-gray-900 transition-colors font-medium text-gray-900">Privacy</Link>
                        <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
                        <Link href="/eula" className="hover:text-gray-900 transition-colors">EULA</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
