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
  TrendingDown,
  User,
  Clock,
  Phone,
  Mail,
  Briefcase
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

  // Dynamic Date calculations
  const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  const currentMonthPrefix = todayStr.slice(0, 7); // "YYYY-MM"
  
  // 1. Today's Collection
  const todayBills = bills.filter(
    (b) => b.date === todayStr || (b.createdAt && b.createdAt.startsWith(todayStr))
  );
  const todayCollection = todayBills.reduce((sum, b) => sum + (Number(b.grandTotal) || 0), 0);

  // 2. Monthly Collection
  const monthlyBills = bills.filter(
    (b) => (b.date && b.date.startsWith(currentMonthPrefix)) || 
           (b.createdAt && b.createdAt.startsWith(currentMonthPrefix))
  );
  const monthlyCollection = monthlyBills.reduce((sum, b) => sum + (Number(b.grandTotal) || 0), 0);

  // 3. Today's Expense
  const todayExpensesList = expenses.filter(
    (e) => e.date === todayStr || (e.createdAt && e.createdAt.startsWith(todayStr))
  );
  const todayExpense = todayExpensesList.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // 4. Petty Cash: Cash collections minus expenses
  const cashCollected = bills
    .filter((b) => b.paymentMode === "Cash" || b.paymentMode === "Mixed")
    .reduce((sum, b) => sum + (Number(b.cashAmount || b.grandTotal) || 0), 0);
  const cashSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const pettyCash = cashCollected - cashSpent;

  // 5. Today's Visits (Appointments scheduled for today)
  const todayAppointments = appointments.filter(
    (a) => a.date === todayStr || (a.createdAt && a.createdAt.startsWith(todayStr))
  );
  const todayVisits = todayAppointments.length;

  // 6 & 7. Male & Female breakdown from real clients
  const maleClients = clients.filter((c) => c.gender?.toLowerCase() === "male");
  const femaleClients = clients.filter((c) => c.gender?.toLowerCase() === "female");

  // 8 & 9. New vs Existing Clients
  const newClients = clients.filter(
    (c) => c.createdAt && c.createdAt.startsWith(currentMonthPrefix)
  );
  const existingClients = clients.filter(
    (c) => !c.createdAt || !c.createdAt.startsWith(currentMonthPrefix)
  );

  // 10. Total Appointments
  const totalAppointments = appointments.length;

  // 11. Total Pending Bills
  const pendingBillsList = bills.filter(
    (b) => b.status === "Pending" || Number(b.pendingAmount) > 0
  );
  const totalPendingBills = pendingBillsList.length;

  // 12. Total Staff
  const totalStaff = employees.length;

  // Revenue & Expense Growth calculations
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonthPrefix = lastMonthDate.toISOString().slice(0, 7);

  const lastMonthRev = bills
    .filter((b) => (b.date && b.date.startsWith(lastMonthPrefix)) || (b.createdAt && b.createdAt.startsWith(lastMonthPrefix)))
    .reduce((sum, b) => sum + (Number(b.grandTotal) || 0), 0);
  const revGrowth = lastMonthRev > 0 ? ((monthlyCollection - lastMonthRev) / lastMonthRev) * 100 : 0;
  const revGrowthStr = revGrowth >= 0 ? `+${revGrowth.toFixed(1)}% MoM` : `${revGrowth.toFixed(1)}% MoM`;

  const thisMonthExp = expenses
    .filter((e) => (e.date && e.date.startsWith(currentMonthPrefix)) || (e.createdAt && e.createdAt.startsWith(currentMonthPrefix)))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const lastMonthExp = expenses
    .filter((e) => (e.date && e.date.startsWith(lastMonthPrefix)) || (e.createdAt && e.createdAt.startsWith(lastMonthPrefix)))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const expGrowth = lastMonthExp > 0 ? ((thisMonthExp - lastMonthExp) / lastMonthExp) * 100 : 0;
  const expGrowthStr = expGrowth >= 0 ? `+${expGrowth.toFixed(1)}% MoM` : `${expGrowth.toFixed(1)}% MoM`;

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
      title: "Total Male Clients",
      value: maleClients.length,
      icon: Contact,
      gradient: "from-purple-500 to-fuchsia-500",
      subtitle: "Male salon visitor profiles",
      modalKey: "male-visits"
    },
    {
      title: "Total Female Clients",
      value: femaleClients.length,
      icon: Contact,
      gradient: "from-violet-500 to-fuchsia-500",
      subtitle: "Female salon visitor profiles",
      modalKey: "female-visits"
    },
    {
      title: "Total New Clients",
      value: newClients.length,
      icon: UserPlus,
      gradient: "from-emerald-400 to-teal-600",
      subtitle: "Clients registered this month",
      modalKey: "new-clients"
    },
    {
      title: "Total Existing Clients",
      value: existingClients.length,
      icon: UserCheck,
      gradient: "from-cyan-400 to-blue-600",
      subtitle: "Registered client database",
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
            <RevenueChart bills={bills} />
          ) : (
            <div className="flex h-[280px] flex-col items-center justify-center text-center p-4 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs font-semibold text-slate-400">No revenue data available yet.</p>
              <p className="text-xxs text-slate-400 mt-1">Generate bills in Quick Billing to visualize revenue trends.</p>
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
            <ExpenseChart expenses={expenses} />
          ) : (
            <div className="flex h-[280px] flex-col items-center justify-center text-center p-4 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs font-semibold text-slate-400">No expense data available yet.</p>
              <p className="text-xxs text-slate-400 mt-1">Log expenses to visualize monthly expenditure outflow.</p>
            </div>
          )}
        </div>

        {/* Client Growth Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Customer Growth Curve</h3>
            <span className="text-xxs font-semibold bg-indigo-50 text-primary px-2 py-0.5 rounded-full">
              {clients.length > 0 ? `${clients.length} Registered Clients` : "0 Registered"}
            </span>
          </div>
          {clients.length > 0 ? (
            <ClientGrowthChart clients={clients} />
          ) : (
            <div className="flex h-[280px] flex-col items-center justify-center text-center p-4 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs font-semibold text-slate-400">No client records available yet.</p>
              <p className="text-xxs text-slate-400 mt-1">Register new clients to visualize registration trends.</p>
            </div>
          )}
        </div>

        {/* Appointment Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Weekly Appointment Summary</h3>
            <span className="text-xxs font-semibold bg-indigo-50 text-primary px-2 py-0.5 rounded-full">
              {appointments.length > 0 ? `${appointments.length} Total Booked` : "No Bookings"}
            </span>
          </div>
          {appointments.length > 0 ? (
            <AppointmentChart appointments={appointments} />
          ) : (
            <div className="flex h-[280px] flex-col items-center justify-center text-center p-4 bg-slate-50/30 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs font-semibold text-slate-400">No appointments scheduled yet.</p>
              <p className="text-xxs text-slate-400 mt-1">Book appointments to track weekly completed vs pending sessions.</p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== DYNAMIC STAT DETAIL MODALS ==================== */}

      {/* 1. Today's Collection Modal */}
      <Modal 
        isOpen={activeModal === "today-collection"} 
        onClose={() => setActiveModal(null)} 
        title="Today's Collections & Invoices"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-indigo-50/40 border border-indigo-100/60 rounded-xl">
            <span className="text-xs font-semibold text-slate-600">Total Billed Today</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(todayCollection)}</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-3">Bill ID</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayBills.length > 0 ? (
                  todayBills.map((b) => (
                    <tr key={b.id}>
                      <td className="p-3 font-semibold text-primary">{b.id}</td>
                      <td className="p-3">{b.clientName || "Walk-in Client"}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                          {b.paymentMode || "Cash"}
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-800">{formatCurrency(b.grandTotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400">No invoices generated for today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 2. Monthly Collection Modal */}
      <Modal 
        isOpen={activeModal === "monthly-collection"} 
        onClose={() => setActiveModal(null)} 
        title="Monthly Invoices & Revenue"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-sky-50/40 border border-sky-100/60 rounded-xl">
            <span className="text-xs font-semibold text-slate-600">Total Billed This Month</span>
            <span className="text-lg font-bold text-sky-600">{formatCurrency(monthlyCollection)}</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-3">Bill ID</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyBills.length > 0 ? (
                  monthlyBills.map((b) => (
                    <tr key={b.id}>
                      <td className="p-3 font-semibold text-primary">{b.id}</td>
                      <td className="p-3">{b.clientName || "Walk-in Client"}</td>
                      <td className="p-3 text-slate-500">{b.date || formatDate(b.createdAt)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                          {b.paymentMode || "Cash"}
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-800">{formatCurrency(b.grandTotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">No invoices recorded this month.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 3. Today's Expense Modal */}
      <Modal 
        isOpen={activeModal === "today-expense"} 
        onClose={() => setActiveModal(null)} 
        title="Today's Outflow & Expenses"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-orange-50/40 border border-orange-100/60 rounded-xl">
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
                {todayExpensesList.length > 0 ? (
                  todayExpensesList.map((e) => (
                    <tr key={e.id}>
                      <td className="p-3 font-semibold text-slate-800">{e.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-medium">
                          {e.category}
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-800">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-400">No expenses recorded today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 4. Petty Cash Modal */}
      <Modal 
        isOpen={activeModal === "petty-cash"} 
        onClose={() => setActiveModal(null)} 
        title="Petty Cash Ledger & Flow"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/40 border border-emerald-100/60 rounded-xl space-y-2.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Total Cash Received (Billing)</span>
              <span className="font-semibold text-emerald-600">+{formatCurrency(cashCollected)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Total Outflow (Expenses)</span>
              <span className="font-semibold text-rose-600">-{formatCurrency(cashSpent)}</span>
            </div>
            <div className="border-t border-emerald-100 pt-2 flex justify-between font-bold text-slate-800 text-sm">
              <span>Available Petty Cash</span>
              <span className={pettyCash >= 0 ? "text-emerald-600" : "text-rose-600"}>
                {formatCurrency(pettyCash)}
              </span>
            </div>
          </div>
          <p className="text-xxs text-slate-400 italic">
            Petty cash updates in real-time as cash bills are generated and expenses are logged into the system.
          </p>
        </div>
      </Modal>

      {/* 5. Today's Visits Modal */}
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
                {todayAppointments.length > 0 ? (
                  todayAppointments.map((a) => (
                    <tr key={a.id}>
                      <td className="p-3 font-semibold text-slate-800">{a.clientName}</td>
                      <td className="p-3">{a.serviceName}</td>
                      <td className="p-3 text-slate-600">{a.staffName || "Unassigned"}</td>
                      <td className="p-3 text-slate-600">{a.time}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          a.status === "Completed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">No appointments scheduled for today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 6. Male Clients Modal */}
      <Modal 
        isOpen={activeModal === "male-visits"} 
        onClose={() => setActiveModal(null)} 
        title="Male Clients Directory"
        size="lg"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Membership</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maleClients.length > 0 ? (
                  maleClients.map((c) => (
                    <tr key={c.id}>
                      <td className="p-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="p-3 text-slate-600">{c.phone || "N/A"}</td>
                      <td className="p-3 text-slate-600">{c.email || "N/A"}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
                          {c.membership || "Standard"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400">No male clients registered.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 7. Female Clients Modal */}
      <Modal 
        isOpen={activeModal === "female-visits"} 
        onClose={() => setActiveModal(null)} 
        title="Female Clients Directory"
        size="lg"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Membership</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {femaleClients.length > 0 ? (
                  femaleClients.map((c) => (
                    <tr key={c.id}>
                      <td className="p-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="p-3 text-slate-600">{c.phone || "N/A"}</td>
                      <td className="p-3 text-slate-600">{c.email || "N/A"}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-fuchsia-50 text-fuchsia-700 font-medium">
                          {c.membership || "Standard"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400">No female clients registered.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 8. New Clients Modal */}
      <Modal 
        isOpen={activeModal === "new-clients"} 
        onClose={() => setActiveModal(null)} 
        title="New Clients Registered This Month"
        size="lg"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Gender</th>
                  <th className="p-3">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {newClients.length > 0 ? (
                  newClients.map((c) => (
                    <tr key={c.id}>
                      <td className="p-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="p-3 text-slate-600">{c.phone || "N/A"}</td>
                      <td className="p-3 text-slate-600">{c.gender || "Unspecified"}</td>
                      <td className="p-3 text-slate-500">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400">No new clients added this month.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 9. Existing Clients Modal */}
      <Modal 
        isOpen={activeModal === "existing-clients"} 
        onClose={() => setActiveModal(null)} 
        title="Registered Clients Directory"
        size="lg"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Gender</th>
                  <th className="p-3">Membership</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.length > 0 ? (
                  clients.map((c) => (
                    <tr key={c.id}>
                      <td className="p-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="p-3 text-slate-600">{c.phone || "N/A"}</td>
                      <td className="p-3 text-slate-600">{c.gender || "Unspecified"}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                          {c.membership || "Standard"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400">No clients registered in the system.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 10. Total Appointments Modal */}
      <Modal 
        isOpen={activeModal === "total-appointments"} 
        onClose={() => setActiveModal(null)} 
        title="All Scheduled Appointments"
        size="lg"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-3">Client</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Time</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.length > 0 ? (
                  appointments.map((a) => (
                    <tr key={a.id}>
                      <td className="p-3 font-semibold text-slate-800">{a.clientName}</td>
                      <td className="p-3">{a.serviceName}</td>
                      <td className="p-3 text-slate-500">{a.date}</td>
                      <td className="p-3 text-slate-600">{a.time}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          a.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
                          a.status === "Confirmed" ? "bg-blue-50 text-blue-600" :
                          a.status === "Cancelled" ? "bg-rose-50 text-rose-600" :
                          "bg-amber-50 text-amber-600"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">No appointments logged yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 11. Pending Bills Modal */}
      <Modal 
        isOpen={activeModal === "pending-bills"} 
        onClose={() => setActiveModal(null)} 
        title="Pending & Unpaid Invoices"
        size="lg"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-3">Bill ID</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Pending Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingBillsList.length > 0 ? (
                  pendingBillsList.map((b) => (
                    <tr key={b.id}>
                      <td className="p-3 font-semibold text-primary">{b.id}</td>
                      <td className="p-3">{b.clientName}</td>
                      <td className="p-3 text-slate-500">{b.date}</td>
                      <td className="p-3 text-right font-bold text-rose-600">
                        {formatCurrency(b.pendingAmount || b.grandTotal)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400">No pending bills! All invoices are fully settled.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* 12. Total Staff Modal */}
      <Modal 
        isOpen={activeModal === "total-staff"} 
        onClose={() => setActiveModal(null)} 
        title="Active Staff & Stylists Roster"
        size="lg"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Department / Role</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr key={emp.id}>
                      <td className="p-3 font-semibold text-slate-800">{emp.name}</td>
                      <td className="p-3 text-slate-600">{emp.department || emp.role || "Stylist"}</td>
                      <td className="p-3 text-slate-600">{emp.phone || "N/A"}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          emp.status === "Inactive" ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {emp.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400">No employees listed. Add staff in Masters &gt; Employees.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
