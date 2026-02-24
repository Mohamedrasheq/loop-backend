import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: "Terms of Service - Loop",
    description: "Terms and conditions governing your use of the Loop application.",
};

export default function TermsOfServicePage() {
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
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
                <p className="text-gray-400 mb-10">Last updated: February 24, 2025</p>

                <div className="prose prose-gray max-w-none space-y-8">
                    {/* 1 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                        <p className="text-gray-600 leading-relaxed">
                            By accessing or using Loop (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to all of these Terms, you may not access or use the Service. These Terms constitute a legally binding agreement between you and Loop.
                        </p>
                    </section>

                    {/* 2 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Loop is an AI-powered productivity application that helps you capture tasks, follow-ups, and notes from natural language input. The Service includes:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li>AI-powered text extraction to identify tasks and action items</li>
                            <li>An AI chat assistant for managing productivity and executing actions</li>
                            <li>Integration with third-party tools (GitHub, Linear, Jira, Slack, Notion, Gmail, Google Calendar, Trello, Asana, Todoist, Confluence, Discord)</li>
                            <li>Scheduled notifications and daily briefings</li>
                            <li>Web and mobile applications</li>
                        </ul>
                    </section>

                    {/* 3 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Account Registration</h2>
                        <p className="text-gray-600 leading-relaxed">
                            You must create an account to use the Service. You agree to provide accurate, current, and complete information during registration. You are responsible for safeguarding your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
                        </p>
                    </section>

                    {/* 4 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Acceptable Use</h2>
                        <p className="text-gray-600 leading-relaxed">You agree not to:</p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
                            <li>Attempt to gain unauthorized access to other users&rsquo; accounts or data</li>
                            <li>Use the Service to store, transmit, or process illegal content</li>
                            <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                            <li>Use automated tools (bots, scrapers) to access the Service beyond the intended API</li>
                            <li>Exceed reasonable usage limits or abuse AI processing capacity</li>
                            <li>Share your third-party integration credentials with unauthorized parties through the Service</li>
                            <li>Use the Service to harass, abuse, or harm others</li>
                        </ul>
                    </section>

                    {/* 5 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Third-Party Integrations</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Loop allows you to connect third-party services. By connecting a service, you:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li>Authorize Loop&rsquo;s AI assistant to perform actions on that service on your behalf when you explicitly request it</li>
                            <li>Acknowledge that Loop will encrypt and store your API keys/tokens using AES-256-GCM encryption</li>
                            <li>Agree that you are solely responsible for any actions taken by the AI assistant on your connected services</li>
                            <li>Understand that you can disconnect any integration at any time, which immediately deletes the stored credentials</li>
                        </ul>
                        <p className="text-gray-600 leading-relaxed mt-3">
                            We are not responsible for the availability, accuracy, or reliability of third-party services. Your use of those services is governed by their respective terms and policies.
                        </p>
                    </section>

                    {/* 6 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">6. AI-Generated Content</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Loop uses artificial intelligence (OpenAI and Anthropic models) to process your input, generate suggestions, and execute actions. You acknowledge that:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li>AI-generated content may not always be accurate, complete, or appropriate</li>
                            <li>You are responsible for reviewing and verifying any AI-generated output before acting on it</li>
                            <li>AI-extracted tasks, priorities, and urgency levels are suggestions, not guarantees</li>
                            <li>Actions proposed by the AI assistant (such as creating issues, drafting emails) should be reviewed before approval</li>
                            <li>We are not liable for any damages resulting from reliance on AI-generated content or actions</li>
                        </ul>
                    </section>

                    {/* 7 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Subscriptions and Payments</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Loop offers both free and paid subscription tiers. If you subscribe to Loop Pro:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li>Payment is processed through the Apple App Store or Google Play Store via RevenueCat</li>
                            <li>Subscriptions automatically renew unless cancelled before the current period ends</li>
                            <li>Refunds are subject to the policies of the respective app store</li>
                            <li>We reserve the right to change pricing with reasonable notice</li>
                            <li>Downgrading to a free tier may result in reduced access to certain features</li>
                        </ul>
                    </section>

                    {/* 8 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Intellectual Property</h2>
                        <p className="text-gray-600 leading-relaxed">
                            The Loop application, including its design, code, AI models (as used), trademarks, and documentation, is the intellectual property of Loop. You retain ownership of all content you create within the Service. By using the Service, you grant Loop a limited license to store, process, and transmit your content solely for the purpose of providing the Service.
                        </p>
                    </section>

                    {/* 9 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Account Termination</h2>
                        <p className="text-gray-600 leading-relaxed">
                            You may delete your account at any time through the application. Upon deletion, all of your data — including memory items, credentials, notifications, device tokens, and subscription records — will be permanently removed through cascading deletion. We may also suspend or terminate your account if you violate these Terms, with or without notice.
                        </p>
                    </section>

                    {/* 10 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Disclaimer of Warranties</h2>
                        <p className="text-gray-600 leading-relaxed">
                            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. WE DO NOT GUARANTEE THE ACCURACY OF AI-GENERATED CONTENT.
                        </p>
                    </section>

                    {/* 11 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Limitation of Liability</h2>
                        <p className="text-gray-600 leading-relaxed">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, LOOP AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SERVICE, ANY ACTIONS TAKEN BY THE AI ASSISTANT ON CONNECTED THIRD-PARTY SERVICES, OR ANY CONTENT OBTAINED FROM THE SERVICE.
                        </p>
                    </section>

                    {/* 12 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">12. Indemnification</h2>
                        <p className="text-gray-600 leading-relaxed">
                            You agree to indemnify and hold harmless Loop from any claims, damages, losses, or expenses arising from your use of the Service, violation of these Terms, or infringement of any third party&rsquo;s rights.
                        </p>
                    </section>

                    {/* 13 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">13. Governing Law</h2>
                        <p className="text-gray-600 leading-relaxed">
                            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Loop operates, without regard to its conflict of law provisions.
                        </p>
                    </section>

                    {/* 14 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">14. Changes to Terms</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We reserve the right to modify these Terms at any time. Material changes will be communicated by updating this page and the &ldquo;Last updated&rdquo; date. Continued use of the Service after any such changes constitutes your acceptance of the new Terms.
                        </p>
                    </section>

                    {/* 15 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">15. Contact Us</h2>
                        <p className="text-gray-600 leading-relaxed">
                            If you have any questions about these Terms, please contact us at: <strong>support@loopapp.co</strong>
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-8 px-6 bg-white">
                <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-400">
                    <span>© {new Date().getFullYear()} Loop. All rights reserved.</span>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-gray-900 transition-colors font-medium text-gray-900">Terms</Link>
                        <Link href="/eula" className="hover:text-gray-900 transition-colors">EULA</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
