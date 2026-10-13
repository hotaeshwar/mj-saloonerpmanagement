"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CreditCard, 
  HelpCircle, 
  CalendarDays, 
  ClipboardList, 
  Users, 
  Scissors, 
  Gift, 
  Package, 
  GraduationCap, 
  Ticket, 
  MessageSquare, 
  UserCheck, 
  CalendarCheck, 
  Box, 
  Receipt, 
  Landmark, 
  BookOpen, 
  BarChart3, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Award
} from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  subItems?: MenuItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    "Manage Masters": true,
  });

  useEffect(() => {
    const handleToggle = () => setIsOpenMobile((prev) => !prev);
    window.addEventListener("toggle-mobile-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-mobile-sidebar", handleToggle);
  }, []);

  const toggleSubMenu = (name: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Billing", href: "/billing", icon: CreditCard },
    { name: "Enquiry", href: "/enquiry", icon: HelpCircle },
    { name: "Appointment Calendar", href: "/appointments", icon: CalendarDays },
    { name: "Appointments List", href: "/appointments-list", icon: ClipboardList },
    { name: "Clients", href: "/clients", icon: Users },
    {
      name: "Manage Masters",
      href: "#",
      icon: Settings,
      subItems: [
        { name: "Services", href: "/masters?tab=services", icon: Scissors },
        { name: "Packages", href: "/masters?tab=packages", icon: Gift },
        { name: "Products", href: "/masters?tab=products", icon: Package },
        { name: "Courses", href: "/masters?tab=courses", icon: GraduationCap },
        { name: "Memberships", href: "/masters?tab=memberships", icon: Award },
        { name: "Coupons", href: "/masters?tab=coupons", icon: Ticket },
        { name: "Employees", href: "/masters?tab=employees", icon: UserCheck },
      ]
    },
    { name: "Client Feedback", href: "/feedback", icon: MessageSquare },
    { name: "Attendance", href: "/attendance", icon: CalendarCheck },
    { name: "Inventory", href: "/inventory", icon: Box },
    { name: "Expenses", href: "/expenses", icon: Receipt },
    { name: "Withdraw", href: "/withdraw", icon: Landmark },
    { name: "Academy", href: "/academy", icon: BookOpen },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const renderLink = (item: MenuItem, displayExpanded: boolean, isChild = false) => {
    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href) && item.href !== "#");
    const Icon = item.icon;

    return (
      <Link
        key={item.name}
        href={item.href}
        title={!displayExpanded ? item.name : undefined}
        onClick={() => {
          if (item.href !== "#") {
            setIsOpenMobile(false);
            setIsHovered(false);
          }
        }}
        className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all duration-200 ${
          isChild ? (displayExpanded ? "pl-11" : "px-4") : ""
        } ${
          isActive
            ? "bg-primary text-white shadow-xs shadow-primary/20"
            : "text-slate-600 hover:text-primary hover:bg-indigo-50/30"
        } ${!displayExpanded ? "justify-center" : ""}`}
      >
        <Icon size={18} className={isActive ? "text-white shrink-0" : "text-slate-400 shrink-0"} />
        {displayExpanded && <span className="truncate">{item.name}</span>}
      </Link>
    );
  };

  const renderSidebarContent = (isMobile: boolean = false) => {
    const displayExpanded = isMobile ? true : isHovered;

    return (
      <div className="flex flex-col h-full w-full bg-white overflow-hidden">
        {/* Sidebar Header aligned with Topbar height */}
        <div className={`flex h-20 sm:h-24 items-center ${isMobile ? "justify-end px-4" : "justify-center px-2"} border-b border-slate-100 bg-white shrink-0`}>
          {isMobile && (
            <button
              onClick={() => setIsOpenMobile(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          {menuItems.map((item) => {
            if (item.subItems) {
              const hasActiveChild = item.subItems.some((child) => pathname === child.href);
              const isOpen = openSubMenus[item.name] || hasActiveChild;

              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => {
                      if (!displayExpanded) {
                        setIsHovered(true);
                      } else {
                        toggleSubMenu(item.name);
                      }
                    }}
                    title={!displayExpanded ? item.name : undefined}
                    className={`flex w-full items-center ${displayExpanded ? "justify-between" : "justify-center"} px-4 py-3 text-xs font-semibold rounded-xl text-slate-600 hover:text-primary hover:bg-indigo-50/30 transition-all`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <item.icon size={18} className="text-slate-400 shrink-0" />
                      {displayExpanded && <span className="truncate">{item.name}</span>}
                    </div>
                    {displayExpanded && (
                      <ChevronRight
                        size={14}
                        className={`text-slate-400 transition-transform shrink-0 ${isOpen ? "rotate-90" : ""}`}
                      />
                    )}
                  </button>
                  {isOpen && displayExpanded && (
                    <div className="space-y-1 transition-all animate-fade-in">
                      {item.subItems.map((child) => renderLink(child, displayExpanded, true))}
                    </div>
                  )}
                </div>
              );
            }
            return renderLink(item, displayExpanded);
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Floating Toggle Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform"
          aria-label="Toggle Navigation Drawer"
        >
          {isOpenMobile ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop & Laptop Sidebar - Flex Child that expands on hover and closes on removal, pushing content */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 bg-white transition-[width] duration-300 ease-in-out z-30 border-r border-slate-100 ${
          isHovered ? "w-[260px] xl:w-[280px]" : "w-20"
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="md:hidden fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
        />
      )}

      {/* Mobile & Tablet Drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-[260px] sm:w-[280px] max-w-[85vw] bg-white transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderSidebarContent(true)}
      </aside>
    </>
  );
};
export default Sidebar;
