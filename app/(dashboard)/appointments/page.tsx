"use client";

import React, { useState } from "react";
import { useCRUD } from "../../../firebase/hooks";
import { Modal } from "../../../components/Modal";
import { EmptyState } from "../../../components/EmptyState";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  CalendarDays, 
  Sparkles, 
  BookOpen, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "react-hot-toast";

type CalendarViewMode = "daily" | "weekly" | "monthly";

export default function AppointmentsPage() {
  const { data: appointments, add: addAppointment, update: updateAppointment, remove: deleteAppointment } = useCRUD("appointments");
  const { data: employees } = useCRUD("employees");
  const { data: services } = useCRUD("services");

  // Date and View modes
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("monthly");

  // Dialog forms
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState<any>(null);

  // New Booking State
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [aptTime, setAptTime] = useState("10:00 AM");
  const [aptDate, setAptDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");

  // Reschedule State
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  // Helpers
  const dateStr = currentDate.toISOString().split("T")[0];

  // Month navigation helpers
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  // Generate Month Days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding for previous month days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const monthDays = getDaysInMonth(currentDate);

  // Appointment Actions
  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !selectedService || !selectedStaff) {
      toast.error("Please fill in all booking fields.");
      return;
    }

    try {
      await addAppointment({
        clientName,
        clientPhone,
        serviceName: selectedService,
        staffName: selectedStaff,
        date: aptDate,
        time: aptTime,
        status: "Pending",
        notes
      });
      // reset
      setClientName("");
      setClientPhone("");
      setSelectedService("");
      setSelectedStaff("");
      setNotes("");
      setIsBookModalOpen(false);
      toast.success("Appointment successfully booked!");
    } catch (e) {}
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateAppointment(id, { status: newStatus });
      toast.success(`Appointment status updated to ${newStatus}`);
    } catch (e) {}
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime || !selectedApt) return;
    try {
      await updateAppointment(selectedApt.id, {
        date: rescheduleDate,
        time: rescheduleTime,
        status: "Rescheduled"
      });
      setIsRescheduleOpen(false);
      toast.success("Appointment rescheduled successfully.");
    } catch (e) {}
  };

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 bg-white gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
            <CalendarIcon className="text-primary h-5 w-5" />
            Appointments Calendar
          </h1>
          <p className="text-xxs text-slate-400 mt-1">Book salon treatments, manage stylist schedules, and log client visits.</p>
        </div>
        <div className="flex gap-2">
          {/* View Toggles */}
          <div className="bg-slate-50 p-1 rounded-xl border border-slate-100 flex text-xs">
            {(["daily", "weekly", "monthly"] as CalendarViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                  viewMode === mode ? "bg-white text-primary shadow-xs font-bold" : "text-slate-500"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors"
          >
            <Plus size={14} /> Book Appointment
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar Layout vs Detail Listing */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 bg-white">
        
        {/* Calendar Viewport (ColSpan 3) */}
        <div className="xl:col-span-3 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-850 uppercase tracking-wide">
              {currentDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </h2>
            <div className="flex gap-1.5">
              <button onClick={prevMonth} className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextMonth} className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {viewMode === "monthly" ? (
            /* Month Calendar Grid */
            <div className="space-y-1">
              <div className="grid grid-cols-7 text-center font-bold text-xxs text-slate-400 uppercase tracking-wider py-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {monthDays.map((day, idx) => {
                  if (!day) return <div key={idx} className="bg-slate-50/20 aspect-square rounded-xl" />;
                  
                  const dStr = day.toISOString().split("T")[0];
                  const dayApts = appointments.filter(a => a.date === dStr);
                  const isToday = new Date().toISOString().split("T")[0] === dStr;
                  const isSelected = dateStr === dStr;

                  return (
                    <div
                      key={idx}
                      onClick={() => setCurrentDate(day)}
                      className={`min-h-16 aspect-square p-2 border rounded-xl flex flex-col justify-between cursor-pointer transition-colors relative hover:bg-indigo-50/20 ${
                        isSelected 
                          ? "border-primary bg-indigo-50/10" 
                          : isToday 
                            ? "border-primary/50 bg-white" 
                            : "border-slate-100 bg-white"
                      }`}
                    >
                      <span className={`text-xs font-semibold ${
                        isToday ? "bg-primary text-white h-5 w-5 rounded-full flex items-center justify-center font-bold" : "text-slate-800"
                      }`}>{day.getDate()}</span>
                      
                      {dayApts.length > 0 && (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-[9px] text-slate-500 font-semibold truncate hidden md:block">
                            {dayApts.length} Booking{dayApts.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Simple Daily/Weekly Listing inside Grid */
            <div className="space-y-3">
              <h3 className="text-xs text-slate-500">Selected schedule for <span className="font-semibold text-slate-700">{dateStr}</span></h3>
              <div className="divide-y divide-slate-100">
                {appointments.filter(a => a.date === dateStr).length > 0 ? (
                  appointments
                    .filter(a => a.date === dateStr)
                    .map(apt => (
                      <div key={apt.id} className="py-3 flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl">
                            <Clock size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{apt.clientName}</p>
                            <p className="text-xxs text-slate-500">{apt.serviceName} with <span className="font-semibold text-primary">{apt.staffName}</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-700">{apt.time}</p>
                          <span className="text-xxs font-semibold text-slate-400 capitalize">{apt.status}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No bookings configured for this date slot.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Daily Target Listing Panel (ColSpan 1) */}
        <div className="xl:col-span-1 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col h-full max-h-[80vh] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-150 pb-2">
            Schedule Detail ({appointments.filter(a => a.date === dateStr).length})
          </h3>
          
          <div className="space-y-4 flex-1">
            {appointments.filter(a => a.date === dateStr).length > 0 ? (
              appointments.filter(a => a.date === dateStr).map(apt => (
                <div key={apt.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{apt.clientName}</h4>
                      <p className="text-[10px] text-slate-400">{apt.clientPhone}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      apt.status === "Completed" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-600 space-y-1">
                    <p><span className="font-semibold">Treatment:</span> {apt.serviceName}</p>
                    <p><span className="font-semibold">Stylist:</span> {apt.staffName}</p>
                    <p><span className="font-semibold">Time:</span> {apt.time}</p>
                    {apt.notes && <p className="italic text-slate-400 mt-1">"{apt.notes}"</p>}
                  </div>

                  {/* Actions */}
                  {apt.status !== "Completed" && (
                    <div className="flex gap-1.5 pt-2">
                      <button
                        onClick={() => updateStatus(apt.id, "Completed")}
                        className="flex-1 py-1 border border-green-200 bg-green-50 text-green-600 font-bold text-[9px] rounded-lg hover:bg-green-100/50 transition-colors"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApt(apt);
                          setRescheduleDate(apt.date);
                          setRescheduleTime(apt.time);
                          setIsRescheduleOpen(true);
                        }}
                        className="flex-1 py-1 border border-slate-200 text-slate-600 font-bold text-[9px] rounded-lg hover:bg-slate-100/50 transition-colors"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => updateStatus(apt.id, "Cancelled")}
                        className="p-1 border border-red-200 text-danger rounded-lg hover:bg-red-50"
                      >
                        <XCircle size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <CalendarDays size={32} className="mx-auto text-slate-300 stroke-1" />
                <p className="text-xs">No appointments booked for this date. Click buttons above to schedule new bookings.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Appointment Booking"
        size="md"
      >
        <form onSubmit={handleBook} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Client Full Name *</label>
              <input
                type="text"
                required
                placeholder="Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Mobile Number *</label>
              <input
                type="text"
                required
                placeholder="10 digit number"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Select Service *</label>
              <select
                required
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
              >
                <option value="">Select Treatment...</option>
                {services.map(s => <option key={s.id} value={s.name}>{s.name} (₹{s.price})</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Assign Stylist *</label>
              <select
                required
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
              >
                <option value="">Select Staff...</option>
                {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Appointment Date</label>
              <input
                type="date"
                value={aptDate}
                onChange={(e) => setAptDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-805"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Preferred Time Slot</label>
              <input
                type="text"
                placeholder="e.g. 11:30 AM"
                value={aptTime}
                onChange={(e) => setAptTime(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Booking Notes</label>
            <textarea
              rows={2}
              placeholder="Client requirements, remarks, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title="Reschedule Appointment"
        size="sm"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">New Date</label>
            <input
              type="date"
              required
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">New Time Slot</label>
            <input
              type="text"
              required
              placeholder="e.g. 03:00 PM"
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRescheduleOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Apply Change
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
