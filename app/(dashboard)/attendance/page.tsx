"use client";

import React, { useState } from "react";
import { useCRUD } from "../../../firebase/hooks";
import { Table } from "../../../components/Table";
import { Modal } from "../../../components/Modal";
import { EmptyState } from "../../../components/EmptyState";
import { updateDocument } from "../../../firebase/firestore";
import { 
  CalendarCheck, 
  Plus, 
  Check, 
  X, 
  MapPin, 
  FileSpreadsheet,
  QrCode,
  UserCheck,
  Calendar,
  Trash2
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AttendancePage() {
  const { data: employees } = useCRUD("employees");
  const { data: logs, add: addLog, update: updateLog } = useCRUD("attendance_logs");
  const { data: holidays, add: addHoliday, remove: removeHoliday } = useCRUD("holidays");
  
  // Date and employee filters
  const [dateFilter, setDateFilter] = useState<"Today" | "This Month" | "All">("Today");
  const [employeeFilter, setEmployeeFilter] = useState<string>("All");

  // Excel Month & Year download filters
  const [exportMonth, setExportMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [exportYear, setExportYear] = useState<string>("2026");

  // QR check-in simulation states
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [gpsSimulating, setGpsSimulating] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; dist: number } | null>(null);

  // Manual Check-In form states
  const [manualOpen, setManualOpen] = useState(false);
  const [manualEmpId, setManualEmpId] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualInTime, setManualInTime] = useState("09:00 AM");
  const [manualOutTime, setManualOutTime] = useState("06:00 PM");
  const [manualHours, setManualHours] = useState<number>(9);
  const [manualStatus, setManualStatus] = useState("Present");
  const [manualBranch, setManualBranch] = useState("Main Branch");

  // Holiday management states
  const [holidaysOpen, setHolidaysOpen] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState(new Date().toISOString().split("T")[0]);

  // Trigger GPS scan simulation for QR Checkin
  const handleGPSLocate = () => {
    setGpsSimulating(true);
    setTimeout(() => {
      setGpsCoords({
        lat: 22.5726 + (Math.random() - 0.5) * 0.0001,
        lng: 88.3639 + (Math.random() - 0.5) * 0.0001,
        dist: Math.floor(5 + Math.random() * 15)
      });
      setGpsSimulating(false);
      toast.success("Geofence check: location retrieved within branch limit.");
    }, 1200);
  };

  // Perform QR Scanner self check-in
  const handleSelfCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) {
      toast.error("Please select an employee profile.");
      return;
    }
    const emp = employees.find(x => x.id === selectedEmpId);
    if (!emp) return;

    // Check if already checked in today
    const todayStr = new Date().toISOString().split("T")[0];
    const alreadyChecked = (logs || []).find(l => l.employeeId === emp.id && l.date === todayStr);
    if (alreadyChecked) {
      toast.error(`${emp.name} is already checked in for today.`);
      return;
    }

    const coords = gpsCoords || { lat: 22.5726, lng: 88.3639, dist: 12 };
    const now = new Date();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    try {
      await addLog({
        date: todayStr,
        day: daysOfWeek[now.getDay()],
        name: emp.name,
        phone: emp.phone || emp.email || "N/A",
        employeeId: emp.id,
        inTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        outTime: "",
        hours: 0,
        latitude: parseFloat(coords.lat.toFixed(6)),
        longitude: parseFloat(coords.lng.toFixed(6)),
        distance: `${coords.dist} meters`,
        branch: emp.department || "Main Branch",
        status: "Present"
      });

      toast.success(`${emp.name} checked in successfully.`);
      setScannerOpen(false);
      setSelectedEmpId("");
      setGpsCoords(null);
    } catch (err: any) {
      toast.error("Error logging check-in: " + err.message);
    }
  };

  // Perform Manual attendance logging
  const handleManualCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmpId) {
      toast.error("Select employee profile first.");
      return;
    }
    const emp = employees.find(x => x.id === manualEmpId);
    if (!emp) return;

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const parsedDate = new Date(manualDate);
    const dayStr = daysOfWeek[parsedDate.getDay()];

    try {
      await addLog({
        date: manualDate,
        day: dayStr,
        name: emp.name,
        phone: emp.phone || emp.email || "N/A",
        employeeId: emp.id,
        inTime: manualInTime || "N/A",
        outTime: manualOutTime || "N/A",
        hours: manualHours,
        latitude: 22.5726,
        longitude: 88.3639,
        distance: "Manual Input",
        branch: manualBranch || emp.department || "Main Branch",
        status: manualStatus
      });

      toast.success(`Manual check-in logged for ${emp.name}.`);
      setManualOpen(false);
      setManualEmpId("");
    } catch (err: any) {
      toast.error("Error saving manual entry: " + err.message);
    }
  };

  // Perform Checkout action log update
  const handleCheckout = async (logItem: any) => {
    const now = new Date();
    const outTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const todayStr = new Date().toISOString().split("T")[0];
    const [inHoursMin, inAmpm] = logItem.inTime.split(" ");
    let [inHrs, inMins] = inHoursMin.split(":").map(Number);
    if (inAmpm === "PM" && inHrs < 12) inHrs += 12;
    if (inAmpm === "AM" && inHrs === 12) inHrs = 0;

    const checkInDate = new Date(`${todayStr}T${String(inHrs).padStart(2, '0')}:${String(inMins).padStart(2, '0')}:05`);
    const diffMs = now.getTime() - checkInDate.getTime();
    const totalHrs = Math.max(0.1, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));

    try {
      await updateLog(logItem.id, {
        outTime: outTimeStr,
        hours: totalHrs
      });
      toast.success(`Check-out recorded for ${logItem.name}.`);
    } catch (err: any) {
      toast.error("Failed to check out: " + err.message);
    }
  };

  // Perform Holiday additions
  const handleAddHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName || !holidayDate) {
      toast.error("Please fill in holiday label and date.");
      return;
    }
    try {
      await addHoliday({
        name: holidayName,
        date: holidayDate
      });
      toast.success(`Holiday "${holidayName}" configured.`);
      setHolidayName("");
    } catch (err: any) {
      toast.error("Database write error: " + err.message);
    }
  };

  // Month-wise Excel CSV download utility
  const handleExportMonthwise = () => {
    const targetMonthStr = String(exportMonth).padStart(2, "0");
    const filteredForExport = (logs || []).filter(l => {
      if (!l.date) return false;
      const [year, month] = l.date.split("-");
      return month === targetMonthStr && year === exportYear;
    });

    if (filteredForExport.length === 0) {
      toast.error(`No logs found for month: ${exportMonth}/${exportYear}`);
      return;
    }

    const headers = ["Date", "Day", "Employee Name", "Contact Number", "Record ID", "In Time", "Out Time", "Hours Worked", "Longitude", "Latitude", "Check Distance", "Operating Branch", "Attendance Status"];
    const csvRows = [headers.join(",")];

    for (const item of filteredForExport) {
      const values = [
        `"${item.date}"`,
        `"${item.day}"`,
        `"${item.name}"`,
        `"${item.phone || ""}"`,
        `"${item.id}"`,
        `"${item.inTime}"`,
        `"${item.outTime || "Pending"}"`,
        `"${item.hours || 0}"`,
        `"${item.longitude}"`,
        `"${item.latitude}"`,
        `"${item.distance}"`,
        `"${item.branch || ""}"`,
        `"${item.status || "Present"}"`
      ];
      csvRows.push(values.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Ledger_${exportYear}_Month_${targetMonthStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel ledger downloaded successfully!");
  };

  // Status changing cell renderer with live Firestore sync
  const statusCell = ({ row }: any) => {
    const item = row.original;
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newStatus = e.target.value;
      try {
        await updateDocument("attendance_logs", item.id, { status: newStatus });
        toast.success(`Updated ${item.name} status to ${newStatus}`);
      } catch (err) {
        toast.error("Failed to update status.");
      }
    };

    let badgeColor = "bg-green-50 text-green-600 border-green-200";
    if (item.status === "Absent") badgeColor = "bg-red-50 text-danger border-red-200";
    else if (item.status === "Half-Day") badgeColor = "bg-orange-50 text-orange-600 border-orange-200";
    else if (item.status === "On Leave") badgeColor = "bg-blue-50 text-blue-600 border-blue-200";

    return (
      <select
        value={item.status || "Present"}
        onChange={handleStatusChange}
        className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold focus:outline-hidden cursor-pointer ${badgeColor}`}
      >
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
        <option value="Half-Day">Half-Day</option>
        <option value="On Leave">On Leave</option>
      </select>
    );
  };

  // Filter logs for stats and rendering
  const todayStr = new Date().toISOString().split("T")[0];
  const thisMonthPrefix = todayStr.substring(0, 7);

  const filteredLogs = (logs || []).filter(l => {
    if (employeeFilter !== "All" && l.name !== employeeFilter) return false;
    if (dateFilter === "Today") return l.date === todayStr;
    if (dateFilter === "This Month") return l.date && l.date.startsWith(thisMonthPrefix);
    return true;
  });

  // Calculate Metrics from filteredLogs
  const sumHours = filteredLogs.reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const totalHrsInt = Math.floor(sumHours);
  const totalMinsInt = Math.round((sumHours - totalHrsInt) * 60);
  const formattedHoursStr = `${String(totalHrsInt).padStart(2, "0")}:${String(totalMinsInt).padStart(2, "0")}`;

  const sundaysCount = filteredLogs.filter(l => l.day === "Sunday").length;
  const loggedEmployeeNames = new Set(filteredLogs.map(l => l.name));
  const absentCount = employees.filter(emp => !loggedEmployeeNames.has(emp.name)).length;

  const columns = [
    { accessorKey: "date", header: "DATE" },
    { accessorKey: "day", header: "DAY" },
    { accessorKey: "name", header: "NAME" },
    { accessorKey: "phone", header: "CONTACT NUMBER" },
    { accessorKey: "id", header: "ID", cell: ({ row }: any) => <span className="font-semibold text-xxs text-slate-400">{row.getValue("id").substring(0, 8)}</span> },
    { accessorKey: "inTime", header: "IN TIME", cell: ({ row }: any) => <span className="font-semibold text-emerald-600">{row.getValue("inTime")}</span> },
    { accessorKey: "outTime", header: "OUT TIME", cell: ({ row }: any) => <span className="font-semibold text-rose-500">{row.getValue("outTime") || "In Progress"}</span> },
    { accessorKey: "hours", header: "HOURS", cell: ({ row }: any) => <span className="font-bold">{row.getValue("hours")} hrs</span> },
    { accessorKey: "longitude", header: "LONGITUDE" },
    { accessorKey: "latitude", header: "LATITUDE" },
    { accessorKey: "distance", header: "DISTANCE" },
    { accessorKey: "branch", header: "BRANCH" },
    { accessorKey: "status", header: "STATUS", cell: statusCell },
    {
      id: "action",
      header: "ACTION",
      cell: ({ row }: any) => {
        const item = row.original;
        if (!item.outTime || item.outTime === "N/A" || item.outTime === "In Progress") {
          return (
            <button
              onClick={() => handleCheckout(item)}
              className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[10px] rounded-lg border border-rose-200/50"
            >
              Check Out
            </button>
          );
        }
        return <span className="text-[10px] font-bold text-slate-400">Completed</span>;
      }
    }
  ];

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 bg-white">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
            <CalendarCheck className="text-primary h-5 w-5" />
            Staff Attendance & Geofence Logs
          </h1>
          <p className="text-xxs text-slate-400 mt-1">Audit roster registers, check-in log sequences, geofencing limits and scan coordinates.</p>
        </div>

        {/* QR Scanning and Excel triggers */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setManualOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-650 bg-slate-50 hover:bg-slate-100 rounded-xl shadow-xs transition-colors border border-slate-200"
          >
            <UserCheck size={14} /> Manual Attendance Entry
          </button>
          <button
            onClick={() => setScannerOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors"
          >
            <QrCode size={14} /> Scan Check-In Terminal
          </button>
        </div>
      </div>

      {/* QR Code and Simulator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        
        {/* QR Scanner Display */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Check-in QR Code Terminal</h3>
          <div className="bg-white border border-slate-100 p-2.5 rounded-2xl mb-3 shadow-xs">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== "undefined" ? `${window.location.origin}/attendance` : "")}`}
              className="h-32 w-32 object-contain"
              alt="QR Terminal" 
            />
          </div>
          <p className="text-[10px] text-slate-400 max-w-[200px]">Employees can scan this geofenced QR terminal in the salon to log attendance logs.</p>
        </div>

        {/* Dynamic excel download console */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between shadow-xs md:col-span-3">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Monthly Excel Ledger Downloader</h3>
            <p className="text-xxs text-slate-400">Generate full attendance logs formatted directly for spreadsheet systems. Select target month/year below:</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end mt-4">
            <div>
              <label className="text-xxs font-semibold text-slate-500 block mb-1">Select Month</label>
              <select
                value={exportMonth}
                onChange={(e) => setExportMonth(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <div>
              <label className="text-xxs font-semibold text-slate-500 block mb-1">Select Year</label>
              <select
                value={exportYear}
                onChange={(e) => setExportYear(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
            <button
              onClick={handleExportMonthwise}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors col-span-2"
            >
              <FileSpreadsheet size={14} /> Export Month-wise Excel (CSV)
            </button>
          </div>
        </div>

      </div>

      {/* Date and Employee Filters Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border-b border-slate-100 pb-2">
        <div className="space-y-1">
          <label className="text-xxs font-semibold text-slate-500 block">Date Filters</label>
          <select
            value={dateFilter}
            onChange={(e: any) => setDateFilter(e.target.value)}
            className="w-full md:w-60 px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
          >
            <option value="Today">Today</option>
            <option value="This Month">This Month</option>
            <option value="All">All Logs</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xxs font-semibold text-slate-500 block">Employee Filters</label>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="w-full md:w-60 px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
          >
            <option value="All">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.name}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stat Cards - Matching Image 3 layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Hours Card */}
        <div className="bg-emerald-500 p-5 rounded-2xl text-white shadow-xs">
          <span className="text-xxs font-bold uppercase tracking-wider block opacity-80">Total Hours</span>
          <h2 className="text-2xl font-bold mt-2">{formattedHoursStr}</h2>
        </div>

        {/* Sundays Checked Card */}
        <div className="bg-rose-500 p-5 rounded-2xl text-white shadow-xs">
          <span className="text-xxs font-bold uppercase tracking-wider block opacity-80">Sundays</span>
          <h2 className="text-2xl font-bold mt-2">{sundaysCount}</h2>
        </div>

        {/* Holidays Card */}
        <div 
          onClick={() => setHolidaysOpen(true)}
          className="bg-blue-600 p-5 rounded-2xl text-white shadow-xs cursor-pointer hover:bg-blue-700 transition-all flex flex-col justify-between"
        >
          <div>
            <span className="text-xxs font-bold uppercase tracking-wider block opacity-80">Holidays</span>
            <h2 className="text-2xl font-bold mt-2">{holidays.length}</h2>
          </div>
          <span className="text-[9px] font-bold underline text-blue-100 block mt-2 text-right">Click to Manage</span>
        </div>

        {/* Absent Days Card */}
        <div className="bg-indigo-600 p-5 rounded-2xl text-white shadow-xs">
          <span className="text-xxs font-bold uppercase tracking-wider block opacity-80">Absent Days</span>
          <h2 className="text-2xl font-bold mt-2">{absentCount}</h2>
        </div>

      </div>

      {/* Ledger Log Table */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Roster Logs Registry</h3>
        {filteredLogs.length > 0 ? (
          <Table columns={columns} data={filteredLogs} />
        ) : (
          <EmptyState 
            title="No check-ins logged for active filters" 
            description="Log manually or simulate scan at the top check-in consoles." 
          />
        )}
      </div>

      {/* 1. Checkin Scanner Simulation Modal */}
      <Modal
        isOpen={scannerOpen}
        onClose={() => {
          setScannerOpen(false);
          setGpsCoords(null);
        }}
        title="Check-In Terminal Scanner Simulation"
        size="md"
      >
        <form onSubmit={handleSelfCheckin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Select Employee Profile *</label>
            <select
              required
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-855"
            >
              <option value="">Select Profile</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
              <MapPin size={12} className="text-primary" /> Geofence validation Check
            </label>
            <p className="text-[10px] text-slate-400 leading-normal">
              Self check-ins require scanning from coordinates within 100 meters of the branch boundary.
            </p>
            
            {gpsCoords ? (
              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-xxs space-y-1 text-slate-700">
                <div><span className="font-semibold">Simulated Latitude:</span> {gpsCoords.lat.toFixed(6)}</div>
                <div><span className="font-semibold">Simulated Longitude:</span> {gpsCoords.lng.toFixed(6)}</div>
                <div><span className="font-semibold">Branch Distance:</span> {gpsCoords.dist} meters (Validated ✓)</div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGPSLocate}
                disabled={gpsSimulating}
                className="w-full py-2 border border-slate-200 hover:bg-slate-50 font-bold text-xxs rounded-xl text-slate-650 transition-colors flex items-center justify-center gap-1.5"
              >
                {gpsSimulating ? "Detecting GPS location..." : "Retrieve Location Coordinates"}
              </button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setScannerOpen(false);
                setGpsCoords(null);
              }}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!gpsCoords}
              className={`px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-xs ${
                gpsCoords ? "bg-primary hover:bg-primary-dark" : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              Confirm Geofence Check-In
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Manual Attendance Entry Modal */}
      <Modal
        isOpen={manualOpen}
        onClose={() => setManualOpen(false)}
        title="Log Manual Roster Entry"
        size="md"
      >
        <form onSubmit={handleManualCheckinSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Select Employee *</label>
            <select
              required
              value={manualEmpId}
              onChange={(e) => setManualEmpId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-855"
            >
              <option value="">Select Profile</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Date *</label>
              <input
                type="date"
                required
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Operating Branch *</label>
              <input
                type="text"
                required
                value={manualBranch}
                onChange={(e) => setManualBranch(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">In Time</label>
              <input
                type="text"
                placeholder="09:00 AM"
                value={manualInTime}
                onChange={(e) => setManualInTime(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Out Time</label>
              <input
                type="text"
                placeholder="06:00 PM"
                value={manualOutTime}
                onChange={(e) => setManualOutTime(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Hours Worked</label>
              <input
                type="number"
                step="0.1"
                required
                value={manualHours}
                onChange={(e) => setManualHours(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Attendance Status *</label>
            <select
              value={manualStatus}
              onChange={(e) => setManualStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden text-slate-855"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half-Day">Half-Day</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setManualOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Save Manual Entry
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Manage Holidays Modal */}
      <Modal
        isOpen={holidaysOpen}
        onClose={() => setHolidaysOpen(false)}
        title="Manage Configured Holidays"
        size="md"
      >
        <div className="space-y-4">
          {/* Add Holiday Form */}
          <form onSubmit={handleAddHolidaySubmit} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar size={13} className="text-primary" /> Register New Holiday
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xxs font-semibold text-slate-500 block">Holiday Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xxs font-semibold text-slate-500 block">Holiday Date *</label>
                <input
                  type="date"
                  required
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden text-slate-800"
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white font-bold text-xxs rounded-lg hover:bg-primary-dark shadow-xs"
              >
                <Plus size={11} /> Add Holiday
              </button>
            </div>
          </form>

          {/* Holidays List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Holiday List ({holidays.length})</h4>
            {holidays.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto border border-slate-100 rounded-xl p-3 bg-white">
                {holidays.map(h => (
                  <div key={h.id} className="py-2 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{h.name}</p>
                      <span className="text-xxs text-slate-400">{formatDate(h.date)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove holiday "${h.name}"?`)) {
                          removeHoliday(h.id);
                          toast.success("Holiday removed.");
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-danger hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xxs text-slate-400 italic text-center py-4 border border-dashed border-slate-200 rounded-xl">
                No holidays registered yet. Add some above.
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setHolidaysOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
