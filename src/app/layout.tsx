import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LeadHunter AI v2 — High-Intent Web Development Intelligence',
  description: 'AI-powered SaaS discovering high-intent business leads actively seeking web development, redesign, and SaaS services in India and Canada.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090D16] text-gray-100 min-h-screen selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
