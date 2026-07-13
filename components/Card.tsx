import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string; // Tailwind class, e.g. "from-violet-500 to-indigo-500"
  subtitle?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  gradient,
  subtitle,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] cursor-pointer group`}
    >
      {/* Premium Glassmorphism Accent overlay */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Decorative Blur Circle */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl group-hover:scale-125 transition-transform duration-500" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-white/80">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-white/70 font-medium">{subtitle}</p>}
        </div>
        <div className="p-3 bg-white/15 backdrop-blur-md rounded-xl text-white group-hover:bg-white/20 transition-colors border border-white/10 shadow-xs">
          <Icon size={22} className="group-hover:rotate-6 transition-transform" />
        </div>
      </div>
    </div>
  );
};
