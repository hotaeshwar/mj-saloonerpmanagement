"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  Coins, 
  Receipt, 
  Users, 
  UserCheck, 
  UserPlus, 
  Calendar, 
  AlertCircle, 
  Contact, 
  IndianRupee, 
  TrendingUp, 
  Activity,
  ArrowRight,
  TrendingDown
} from "lucide-react";
import { StatCard } from "../../../components/Card";
import { Modal } from "../../../components/Modal";
import { 
  RevenueChart, 
  ExpenseChart, 
  ClientGrowthChart, 
  AppointmentChart 
} from "../../../components/Charts";
import { useCRUD } from "../../../firebase/hooks";
import { formatCurrency, formatDate } from "../../../firebase/helpers";

export default function DashboardPage() {
  const { data: bills } = useCRUD("billing");
  const { data: expenses } = useCRUD("expenses");
  const { data: clients } = useCRUD("clients");
  const { data: appointments } = useCRUD("appointments");
  const { data: employees } = useCRUD("employees");

  // Local Modal States for Clicking Cards
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Calculations for Stats Card
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Today's Collection
  const todayCollection = bills
    .filter(b => b.date === todayStr)
    .reduce((sum, b) => sum + (b.grandTotal || 0), 0);

  // Monthly Collection
  const monthlyCollection = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);

  // Today's Expense
  const todayExpense = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  // Petty Cash
  const pettyCash = bills.reduce((sum, b) => sum + (b.paymentMode === "Cash" ? (b.grandTotal || 0) : 0), 0) - expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Today's Visits (appointments completed or clients who billed today)
  const todayVisits = appointments.filter(a => a.date === todayStr).length;

  // Male & Female counts (breakdown from clients database)
  const maleVisits = clients.filter(c => c.gender === "Male").length;
  const femaleVisits = clients.filter(c => c.gender === "Female").length;

  const totalNewClients = clients.filter(c => c.createdAt && c.createdAt.includes(todayStr.slice(0, 7))).length;
  const totalExistingClients = clients.length - totalNewClients;

  // Dynamic Revenue & Expense Growth calculations
  const thisMonthRev = bills.filter(b => b.date && b.date.startsWith(todayStr.slice(0, 7))).reduce((sum, b) => sum + (b.grandTotal || 0), 0);
  const lastMonthRev = bills.filter(b => {
    if (!b.date) return false;
    const prevDate = new Date();
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevPrefix = prevDate.toISOString().slice(0, 7);
    return b.date.startsWith(prevPrefix);
  }).reduce((sum, b) => sum + (b.grandTotal || 0), 0);
  const revGrowth = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : 0;
  const revGrowthStr = revGrowth >= 0 ? `+${revGrowth.toFixed(1)}% MoM` : `${revGrowth.toFixed(1)}% MoM`;

  const thisMonthExp = expenses.filter(e => e.date && e.date.startsWith(todayStr.slice(0, 7))).reduce((sum, e) => sum + (e.amount || 0), 0);
  const lastMonthExp = expenses.filter(e => {
    if (!e.date) return false;
    const prevDate = new Date();
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevPrefix = prevDate.toISOString().slice(0, 7);
    return e.date.startsWith(prevPrefix);
  }).reduce((sum, e) => sum + (e.amount || 0), 0);
  const expGrowth = lastMonthExp > 0 ? ((thisMonthExp - lastMonthExp) / lastMonthExp) * 100 : 0;
  const expGrowthStr = expGrowth >= 0 ? `+${expGrowth.toFixed(1)}% MoM` : `${expGrowth.toFixed(1)}% MoM`;

  const totalAppointments = appointments.length;
  const totalPendingBills = bills.filter(b => b.status === "Pending").length;
  const totalStaff = employees.length;

  const statCardsData = [
    {
      title: "Today's Collection",
      value: formatCurrency(todayCollection),
      icon: CreditCard,
      gradient: "from-violet-500 to-indigo-500",
      subtitle: "Click to view invoice details",
      modalKey: "today-collection"
    },
    {
      title: "Monthly Collection",
      value: formatCurrency(monthlyCollection),
      icon: TrendingUp,
      gradient: "from-cyan-500 to-sky-500",
      subtitle: "Click to view revenue reports",
      modalKey: "monthly-collection"
    },
    {
      title: "Today's Expense",
      value: formatCurrency(todayExpense),
      icon: Receipt,
      gradient: "from-orange-400 to-orange-600",
      subtitle: "Click to view daily expenses list",
      modalKey: "today-expense"
    },
    {
      title: "Petty Cash",
      value: formatCurrency(pettyCash),
      icon: Coins,
      gradient: "from-green-500 to-emerald-500",
      subtitle: "Click to view transaction ledger",
      modalKey: "petty-cash"
    },
    {
      title: "Today's Client Visits",
      value: todayVisits,
      icon: Users,
      gradient: "from-pink-500 to-rose-500",
      subtitle: "Click to view visiting clients",
      modalKey: "today-visits"
    },
    {
      title: "Total Male Visits",
      value: maleVisits,
      icon: Contact,
      gradient: "from-purple-500 to-fuchsia-500",
      subtitle: "Male salon visitors profile log",
      modalKey: "male-visits"
    },
    {
      title: "Total Female Visits",
      value: femaleVisits,
      icon: Contact,
      gradient: "from-violet-500 to-fuchsia-500",
      subtitle: "Female salon visitors profile log",
      modalKey: "female-visits"
    },
    {
      title: "Total New Clients",
      value: totalNewClients,
      icon: UserPlus,
      gradient: "from-emerald-400 to-teal-600",
      subtitle: "Clients registered this month",
      modalKey: "new-clients"
    },
    {
      title: "Total Existing Clients",
      value: totalExistingClients,
      icon: UserCheck,
      gradient: "from-cyan-400 to-blue-600",
      subtitle: "Loyal client records in registry",
      modalKey: "existing-clients"
    },
    {
      title: "Total Appointments",
      value: totalAppointments,
      icon: Calendar,
      gradient: "from-pink-500 to-orange-500",
      subtitle: "All scheduled appointment listings",
      modalKey: "total-appointments"
    },
    {
      title: "Total Pending Bills",
      value: totalPendingBills,
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-600",
      subtitle: "Unpaid customer transaction items",
      modalKey: "pending-bills"
    },
    {
      title: "Total Staff",
      value: totalStaff,
      icon: Users,
      gradient: "from-indigo-500 to-purple-600",
      subtitle: "Active roster employees list",
      modalKey: "total-staff"
    }
  ];

  return (
    <div className="space-y-8 bg-white min-h-screen">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Business Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time salon operations, billing reports, and analytics metrics.</p>
      </div>

      {/* Renders Clickable Gradient Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCardsData.map((card, idx) => (
          <StatCard
            key={idx}
            title={card.title}
            value={card.value}
            icon={card.icon}
            gradient={card.gradient}
            subtitle={card.subtitle}
            onClick={() => setActiveModal(card.modalKey)}
          />
        ))}
      </div>

      {/* Analytics Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Monthly Revenue Trend</h3>
            <span className="text-xxs font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
              {bills.length > 0 ? revGrowthStr : "0% MoM"}
            </span>
          </div>
          {bills.length > 0 ? (
            <RevenueChart />
          ) : (
            <div className="flex h-[280px] flex-col items-center justify-center text-center p-4 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs font-semibold text-slate-450 text-slate-400">No revenue data available to chart.</p>
            </div>
          )}
        </div>

        {/* Expense Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Expense Outflow</h3>
            <span className="text-xxs font-semibold bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
              {expenses.length > 0 ? expGrowthStr : "0% MoM"}
            </span>
          </div>
          {expenses.length > 0 ? (
            <ExpenseChart />
          ) : (
            <div className="flex h-[280px] flex-col items-center justify-center text-center p-4 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs font-semibold text-slate-450 text-slate-400">No expense data available to chart.</p>
            </div>
          )}
        </div>

        {/* Client Growth Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Customer Growth Curve</h3>
            <span className="text-xxs font-semibold bg-indigo-50 text-primary px-2 py-0.5 rounded-full">
              {totalNewClients > 0 ? `+${totalNewClients} New Registered` : "0 New Registered"}
            </span>
          </div>
          {clients.length > 0 ? (
            <ClientGrowthChart />
          ) : (
            <div className="flex h-[280px] flex-col items-center justify-center text-center p-4 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs font-semibold text-slate-450 text-slate-400">No client records available to chart.</p>
            </div>
          )}
        </div>

        {/* Appointment Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Appointment Status Summary</h3>
            <span className="text-xxs font-semibold bg-indigo-50 text-primary px-2 py-0.5 rounded-full">
              {appointments.length > 0 ? "Weekly Roster" : "Inactive Roster"}
            </span>
          </div>
          {appointments.length > 0 ? (
            <AppointmentChart />
          ) : (
            <div className="flex h-[280px] flex-col items-center justify-center text-center p-4 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs font-semibold text-slate-450 text-slate-400">No appointments scheduled to chart.</p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== STAT DETAIL MODALS ==================== */}

      {/* Today's Collection Modal */}
      <Modal 
        isOpen={activeModal === "today-collection"} 
        onClose={() => setActiveModal(null)} 
        title="Today's Collections & Invoices"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-xl">
            <span className="text-xs font-semibold text-slate-600">Total Billed Today</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(todayCollection)}</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-3">Bill ID</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.filter(b => b.date === todayStr).length > 0 ? (
                  bills.filter(b => b.date === todayStr).map((b) => (
                    <tr key={b.id}>
                      <td className="p-3 font-semibold text-primary">{b.id}</td>
                      <td className="p-3">{b.clientName}</td>
                      <td className="p-3">{b.paymentMode}</td>
                      <td className="p-3 text-right font-semibold text-slate-700">{formatCurrency(b.grandTotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-3 text-center text-slate-400">No invoices generated today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Today's Expense Modal */}
      <Modal 
        isOpen={activeModal === "today-expense"} 
        onClose={() => setActiveModal(null)} 
        title="Today's Outflow & Expenses"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-orange-50/30 border border-orange-100/50 rounded-xl">
            <span className="text-xs font-semibold text-slate-600">Expenses Logged Today</span>
            <span className="text-lg font-bold text-orange-600">{formatCurrency(todayExpense)}</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.filter(e => e.date === todayStr).length > 0 ? (
                  expenses.filter(e => e.date === todayStr).map((e) => (
                    <tr key={e.id}>
                      <td className="p-3 font-semibold text-slate-700">{e.title}</td>
                      <td className="p-3">{e.category}</td>
                      <td className="p-3 text-right font-semibold text-slate-700">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-3 text-center text-slate-400">No expenses recorded today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Today's Visits Modal */}
      <Modal 
        isOpen={activeModal === "today-visits"} 
        onClose={() => setActiveModal(null)} 
        title="Today's Client Visits"
        size="lg"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-3">Client</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Stylist</th>
                  <th className="p-3">Time</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.filter(a => a.date === todayStr).length > 0 ? (
                  appointments.filter(a => a.date === todayStr).map((a) => (
                    <tr key={a.id}>
                      <td className="p-3 font-semibold text-slate-700">{a.clientName}</td>
                      <td className="p-3">{a.serviceName}</td>
                      <td className="p-3">{a.staffName}</td>
                      <td className="p-3">{a.time}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          a.status === "Completed" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-slate-400">No visits logged for today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Petty Cash Modal */}
      <Modal 
        isOpen={activeModal === "petty-cash"} 
        onClose={() => setActiveModal(null)} 
        title="Petty Cash Transaction Ledger"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-xl space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Original Petty Buffer</span>
              <span className="font-semibold">{formatCurrency(15000)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Expenses Drawn</span>
              <span className="font-semibold text-danger">-{formatCurrency(15000 - pettyCash)}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-700">
              <span>Available Petty Cash</span>
              <span className="text-emerald-600">{formatCurrency(pettyCash)}</span>
            </div>
          </div>
          <p className="text-xxs text-slate-400 italic">Petty cash balances update dynamically whenever business expenses are entered into the ledger.</p>
        </div>
      </Modal>

      {/* Default Modal wrapper for other stats */}
      <Modal
        isOpen={
          activeModal !== null && 
          !["today-collection", "today-expense", "today-visits", "petty-cash"].includes(activeModal)
        }
        onClose={() => setActiveModal(null)}
        title="Data Registry View"
        size="md"
      >
        <div className="space-y-4 text-center py-6">
          <Activity size={48} className="mx-auto text-primary animate-spin" />
          <h4 className="font-semibold text-slate-800 text-sm">Loading detailed reports...</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">Please navigate to the specific sidebar modules (Reports, Clients, Academy or Settings) to modify this information.</p>
        </div>
      </Modal>
    </div>
  );
}
