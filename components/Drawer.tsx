import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: "left" | "right";
  size?: "sm" | "md" | "lg";
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  size = "md"
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  const positionClasses = {
    left: "left-0 animate-slide-in-left",
    right: "right-0 animate-slide-in-right",
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300">
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={onClose} 
      />
      <div 
        className={`absolute top-0 bottom-0 w-full ${sizeClasses[size]} ${positionClasses[position]} bg-white shadow-2xl border-l border-slate-100 flex flex-col h-full z-10 transition-transform duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {/* Content */}
        <div className="p-6 overflow-y-auto bg-white flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
