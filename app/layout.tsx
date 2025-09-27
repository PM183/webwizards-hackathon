import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/auth/AuthGuard";
import { ToastProvider } from "../components/ui/toast";
import { ErrorBoundary } from "../components/ui/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PollWizard - Real-time Polling Platform",
  description: "Create, vote, and analyze polls in real-time. Built with Next.js 15, React 19, and Supabase for the modern web.",
  keywords: ["polling", "voting", "real-time", "analytics", "Next.js", "Supabase", "WebWizards"],
  authors: [{ name: "WebWizards Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#2563eb",
  openGraph: {
    title: "PollWizard - Real-time Polling Platform",
    description: "Create, vote, and analyze polls in real-time with advanced analytics and fraud detection.",
    type: "website",
    siteName: "PollWizard",
  },
  twitter: {
    card: "summary_large_image",
    title: "PollWizard - Real-time Polling Platform",
    description: "Create, vote, and analyze polls in real-time with advanced analytics and fraud detection.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <main className="flex-1">
                  {children}
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-8">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 brand-gradient rounded"></div>
                        <span className="brand-text-sm font-medium text-gray-900">PollWizard</span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>Built for WebWizards Hackathon</span>
                        <span>•</span>
                        <span>© 2024</span>
                      </div>
                    </div>
                  </div>
                </footer>
              </div>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
