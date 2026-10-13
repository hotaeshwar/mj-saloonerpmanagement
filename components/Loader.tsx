"use client";

import React, { useState, useEffect } from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = "md", 
  className = "", 
  fullScreen = false 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-t-primary border-slate-200 ${sizeClasses[size]} ${className}`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
};


export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse rounded bg-slate-100 ${className}`} />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="rounded-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 p-4 flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-6 flex-1" />
          ))}
        </div>
        <div className="divide-y divide-slate-100 p-4">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex gap-4 py-4">
              {Array.from({ length: cols }).map((_, c) => (
                <Skeleton key={c} className="h-5 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
