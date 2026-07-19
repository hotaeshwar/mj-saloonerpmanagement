"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
      <h1 className="text-4xl font-extrabold text-danger">500</h1>
      <h2 className="text-lg font-bold text-slate-800 mt-2">Application Error</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        An unexpected error occurred in the workspace.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
        >
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl transition-all"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
