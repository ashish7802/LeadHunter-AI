import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-panel rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
        <h2 className="text-3xl font-extrabold text-indigo-400 mb-2">404</h2>
        <h3 className="text-base font-semibold mb-2">Page Not Found</h3>
        <p className="text-xs text-gray-400 mb-6">
          The requested page or resource could not be found.
        </p>
        <Link
          href="/"
          className="inline-block w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg transition-all"
        >
          Return to CRM Dashboard
        </Link>
      </div>
    </div>
  );
}
