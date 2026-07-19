import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
      <h1 className="text-4xl font-extrabold text-primary">404</h1>
      <h2 className="text-lg font-bold text-slate-800 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        The requested module or page could not be located in your ERP workspace.
      </p>
      <Link
        href="/dashboard"
        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
