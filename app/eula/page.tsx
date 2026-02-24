import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: "End User License Agreement - Loop",
    description: "End User License Agreement governing your use of the Loop application.",
};

export default function EULAPage() {
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
                <h1 className="text-4xl font-bold text-gray-900 mb-2">End User License Agreement (EULA)</h1>
                <p className="text-gray-400 mb-10">Last updated: February 24, 2025</p>

                <div className="prose prose-gray max-w-none space-y-8">
                    {/* 1 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Agreement to Terms</h2>
                        <p className="text-gray-600 leading-relaxed">
                            This End User License Agreement (&ldquo;EULA&rdquo;) is a legal agreement between you (&ldquo;User&rdquo;) and Loop (&ldquo;Licensor&rdquo;) for the use of the Loop application, including its web and mobile versions (&ldquo;Application&rdquo;). By downloading, installing, or using the Application, you agree to be bound by the terms of this EULA. If you do not agree, do not use the Application.
                        </p>
                    </section>

                    {/* 2 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">2. License Grant</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Subject to the terms of this EULA, Loop grants you a limited, non-exclusive, non-transferable, revocable license to:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li>Download and install the Application on devices you own or control</li>
                            <li>Use the Application for your personal or internal business productivity purposes</li>
                            <li>Access the web version of the Application through a supported browser</li>
                        </ul>
                    </section>

                    {/* 3 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">3. License Restrictions</h2>
                        <p className="text-gray-600 leading-relaxed">You may not:</p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li>Copy, modify, or distribute the Application or any part of it</li>
                            <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of the Application</li>
                            <li>Rent, lease, lend, sell, sublicense, or transfer the Application to any third party</li>
                            <li>Remove, alter, or obscure any proprietary notices, labels, or marks on the Application</li>
                            <li>Use the Application to develop a competing product or service</li>
                            <li>Bypass any security features or access controls within the Application</li>
                        </ul>
                    </section>

                    {/* 4 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">4. AI-Powered Features</h2>
                        <p className="text-gray-600 leading-relaxed">
                            The Application includes AI-powered features that process your text input to extract tasks and provide conversational assistance. By using these features:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li>You understand that your text input is sent to third-party AI providers (OpenAI and Anthropic) for processing</li>
                            <li>You acknowledge that AI outputs are generated algorithmically and may contain errors or inaccuracies</li>
                            <li>You agree not to rely solely on AI-generated content for critical decisions</li>
                            <li>You understand that the AI may take actions on your connected third-party services (e.g., create issues, list data) only when you explicitly initiate such actions through the chat interface</li>
                        </ul>
                    </section>

                    {/* 5 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Data and Privacy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Your use of the Application is also governed by our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>, which describes how we collect, use, store, and protect your data. Key points:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li>Your account data (email, name) is stored securely in our database</li>
                            <li>Third-party service credentials are encrypted using AES-256-GCM before storage</li>
                            <li>Text input is processed by AI providers who do not use API data for model training</li>
                            <li>push notification tokens are stored to deliver reminders</li>
                            <li>You can delete all your data at any time by deleting your account</li>
                        </ul>
                    </section>

                    {/* 6 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Subscription and In-App Purchases</h2>
                        <p className="text-gray-600 leading-relaxed">
                            The Application may offer subscription plans (e.g., Loop Pro) that provide additional features. Subscriptions are managed through Apple App Store or Google Play Store via RevenueCat:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li>Payment is charged to your App Store or Play Store account at confirmation of purchase</li>
                            <li>Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period</li>
                            <li>You can manage or cancel subscriptions in your device&rsquo;s subscription settings</li>
                            <li>No refunds are provided for partial subscription periods, unless required by applicable law</li>
                        </ul>
                    </section>

                    {/* 7 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Third-Party Services</h2>
                        <p className="text-gray-600 leading-relaxed">
                            The Application integrates with third-party services. When you connect a third-party service:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li>You are responsible for complying with that service&rsquo;s terms of use</li>
                            <li>Loop is not responsible for the availability, security, or content of third-party services</li>
                            <li>Actions performed through the AI assistant on third-party services are done on your behalf and at your direction</li>
                            <li>You may disconnect any third-party service at any time</li>
                        </ul>
                    </section>

                    {/* 8 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Intellectual Property</h2>
                        <p className="text-gray-600 leading-relaxed">
                            The Application and all associated intellectual property rights (including but not limited to software code, design, graphics, trademarks, and documentation) are owned by Loop. This EULA does not grant you any ownership rights in the Application. You retain full ownership of the content you create using the Application.
                        </p>
                    </section>

                    {/* 9 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Disclaimer of Warranties</h2>
                        <p className="text-gray-600 leading-relaxed">
                            THE APPLICATION IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LOOP DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. LOOP DOES NOT WARRANT THAT THE APPLICATION WILL FUNCTION WITHOUT INTERRUPTION OR ERRORS, OR THAT AI-GENERATED CONTENT WILL BE ACCURATE.
                        </p>
                    </section>

                    {/* 10 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Limitation of Liability</h2>
                        <p className="text-gray-600 leading-relaxed">
                            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LOOP BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, WHETHER ARISING FROM CONTRACT, TORT, STRICT LIABILITY, OR OTHERWISE, EVEN IF LOOP HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. LOOP&rsquo;S TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE APPLICATION IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
                        </p>
                    </section>

                    {/* 11 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Termination</h2>
                        <p className="text-gray-600 leading-relaxed">
                            This EULA is effective until terminated. It will terminate automatically if you fail to comply with any term of this EULA. Upon termination, you must cease all use of the Application and delete all copies from your devices. Loop may also terminate your access to the Application at any time, with or without cause. Sections 8, 9, 10, and 12 survive termination.
                        </p>
                    </section>

                    {/* 12 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">12. Governing Law</h2>
                        <p className="text-gray-600 leading-relaxed">
                            This EULA shall be governed by and construed in accordance with the laws of the jurisdiction in which Loop operates. Any disputes arising under this EULA shall be resolved in the courts of that jurisdiction.
                        </p>
                    </section>

                    {/* 13 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">13. Severability</h2>
                        <p className="text-gray-600 leading-relaxed">
                            If any provision of this EULA is held to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions of this EULA will remain in full force and effect.
                        </p>
                    </section>

                    {/* 14 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">14. Entire Agreement</h2>
                        <p className="text-gray-600 leading-relaxed">
                            This EULA, together with the <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> and <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>, constitutes the entire agreement between you and Loop regarding the Application and supersedes all prior agreements and understandings.
                        </p>
                    </section>

                    {/* 15 */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">15. Contact Information</h2>
                        <p className="text-gray-600 leading-relaxed">
                            For questions about this EULA, please contact us at: <strong>support@loopapp.co</strong>
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
                        <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
                        <Link href="/eula" className="hover:text-gray-900 transition-colors font-medium text-gray-900">EULA</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
