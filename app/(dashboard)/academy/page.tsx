"use client";

import React, { useState } from "react";
import { useCRUD } from "../../../firebase/hooks";
import { Table } from "../../../components/Table";
import { Modal } from "../../../components/Modal";
import { EmptyState } from "../../../components/EmptyState";
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  Award, 
  CreditCard, 
  FileSpreadsheet, 
  Plus, 
  Check, 
  Printer, 
  PlusCircle, 
  Clock 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { formatCurrency, formatDate } from "../../../firebase/helpers";

type AcademyTab = "students" | "batches" | "attendance" | "fees" | "exams" | "certificates";

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState<AcademyTab>("students");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string>("");

  // CRUD instances
  const { data: students, add: addStudent } = useCRUD("academy_students");
  const { data: batches, add: addBatch } = useCRUD("academy_batches");
  const { data: courses } = useCRUD("courses");
  const { data: employees } = useCRUD("employees");

  // Local Form state placeholders
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  const [batchName, setBatchName] = useState("");
  const [batchTiming, setBatchTiming] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");

  // Handlers
  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentPhone || !selectedCourse) {
      toast.error("Please fill all required student enrollment details.");
      return;
    }

    try {
      await addStudent({
        name: studentName,
        email: studentEmail || `${studentName.toLowerCase().replace(/\s+/g, "")}@example.com`,
        phone: studentPhone,
        enrolledCourse: selectedCourse,
        batch: selectedBatch || "Unassigned",
        status: "Active"
      });
      setStudentName("");
      setStudentPhone("");
      setStudentEmail("");
      setModalOpen(false);
      toast.success("Student successfully enrolled and admitted.");
    } catch (err) {}
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName || !batchTiming || !selectedCourse) {
      toast.error("Please fill all required batch planning details.");
      return;
    }

    try {
      await addBatch({
        name: batchName,
        course: selectedCourse,
        timing: batchTiming,
        faculty: selectedFaculty || "Unassigned",
        status: "Active"
      });
      setBatchName("");
      setBatchTiming("");
      setModalOpen(false);
      toast.success("New batch schedule configured successfully.");
    } catch (err) {}
  };

  // Static/Mock details for demo tabs
  const attendanceMockData = [
    { id: "1", student: "Emily Blunt", course: "Masters Diploma in Cosmetology", date: new Date().toISOString().split('T')[0], status: "Present", remark: "On time" },
    { id: "2", student: "John Krasinski", course: "Professional Bridal Makeup Artistry", date: new Date().toISOString().split('T')[0], status: "Late", remark: "15m delay" },
  ];

  const feesMockData = [
    { id: "fee-101", student: "Emily Blunt", course: "Masters Diploma in Cosmetology", total: 120000, paid: 60000, balance: 60000, dueDate: "25/08/2026", status: "Partial" },
    { id: "fee-102", student: "John Krasinski", course: "Professional Bridal Makeup Artistry", total: 60000, paid: 60000, balance: 0, dueDate: "Paid", status: "Paid" },
  ];

  const examsMockData = [
    { id: "ex-1", student: "Emily Blunt", exam: "Mid-Term Styling Practical", score: "88/100", result: "Pass", date: "10/07/2026" },
    { id: "ex-2", student: "John Krasinski", exam: "Bridal Draping Exam", score: "92/100", result: "Pass", date: "08/07/2026" },
  ];

  const certificatesMockData = [
    { id: "cert-1", student: "John Krasinski", course: "Professional Bridal Makeup Artistry", issuedDate: "12/07/2026", authority: "Sarah Connor", status: "Issued" },
    { id: "cert-2", student: "Emily Blunt", course: "Masters Diploma in Cosmetology", issuedDate: "Awaiting Finals", authority: "Marcus Wright", status: "Pending" },
  ];

  const handlePayFees = (item: any) => {
    toast.success(`Processing payment slip for ${item.student}. Outstanding balance reduced.`);
  };

  const handlePrintCertificate = (item: any) => {
    toast.success(`Printing Certificate ID: ${item.id} for ${item.student}`);
  };

  // Dynamic Render columns depending on active tab
  const studentCols = [
    { accessorKey: "name", header: "Student Name", cell: ({ row }: any) => <span className="font-semibold text-slate-800">{row.getValue("name")}</span> },
    { accessorKey: "phone", header: "Mobile" },
    { accessorKey: "enrolledCourse", header: "Enrolled Course" },
    { accessorKey: "batch", header: "Batch" },
    { accessorKey: "status", header: "Enroll Status", cell: ({ row }: any) => <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-bold text-[10px]">Active</span> },
  ];

  const batchCols = [
    { accessorKey: "name", header: "Batch Name", cell: ({ row }: any) => <span className="font-semibold text-slate-800">{row.getValue("name")}</span> },
    { accessorKey: "course", header: "Course Plan" },
    { accessorKey: "timing", header: "Timing Slot" },
    { accessorKey: "faculty", header: "Instructing Faculty" },
  ];

  const attendanceCols = [
    { accessorKey: "student", header: "Student Name", cell: ({ row }: any) => <span className="font-semibold text-slate-800">{row.getValue("student")}</span> },
    { accessorKey: "course", header: "Course" },
    { accessorKey: "date", header: "Date" },
    { 
      accessorKey: "status", 
      header: "Status",
      cell: ({ row }: any) => {
        const val = row.getValue("status");
        return (
          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
            val === "Present" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
          }`}>
            {val}
          </span>
        );
      }
    },
    { accessorKey: "remark", header: "Notes" },
  ];

  const feeCols = [
    { accessorKey: "student", header: "Student Name", cell: ({ row }: any) => <span className="font-semibold text-slate-800">{row.getValue("student")}</span> },
    { accessorKey: "course", header: "Course" },
    { accessorKey: "total", header: "Fee Cost", cell: ({ row }: any) => <span>{formatCurrency(row.getValue("total"))}</span> },
    { accessorKey: "paid", header: "Paid To Date", cell: ({ row }: any) => <span className="text-green-600 font-medium">{formatCurrency(row.getValue("paid"))}</span> },
    { accessorKey: "balance", header: "Pending Balance", cell: ({ row }: any) => <span className="text-danger font-medium">{formatCurrency(row.getValue("balance"))}</span> },
    { accessorKey: "dueDate", header: "Due Date/Status" },
    {
      id: "actions",
      header: "Payments",
      cell: ({ row }: any) => {
        const item = row.original;
        return item.balance > 0 ? (
          <button
            onClick={() => handlePayFees(item)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-white font-bold text-[10px] rounded-lg shadow-xs"
          >
            <CreditCard size={10} /> Collect Fee
          </button>
        ) : (
          <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-0.5"><Check size={12} /> Clear</span>
        );
      }
    }
  ];

  const examCols = [
    { accessorKey: "student", header: "Student Name", cell: ({ row }: any) => <span className="font-semibold text-slate-800">{row.getValue("student")}</span> },
    { accessorKey: "exam", header: "Exam Subject" },
    { accessorKey: "score", header: "Score Grade", cell: ({ row }: any) => <span className="font-bold text-slate-700">{row.getValue("score")}</span> },
    { accessorKey: "date", header: "Exam Date" },
    { accessorKey: "result", header: "Status", cell: ({ row }: any) => <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-bold text-[10px]">Pass</span> },
  ];

  const certificateCols = [
    { accessorKey: "student", header: "Student Name", cell: ({ row }: any) => <span className="font-semibold text-slate-800">{row.getValue("student")}</span> },
    { accessorKey: "course", header: "Course Major" },
    { accessorKey: "issuedDate", header: "Award Date" },
    { accessorKey: "authority", header: "Signed Faculty" },
    {
      id: "actions",
      header: "Output",
      cell: ({ row }: any) => {
        const item = row.original;
        return item.status === "Issued" ? (
          <button
            onClick={() => handlePrintCertificate(item)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-850 hover:bg-slate-900 text-white font-bold text-[10px] rounded-lg shadow-xs"
          >
            <Printer size={10} /> Print PDF
          </button>
        ) : (
          <span className="text-slate-400 text-xxs font-medium italic">Pending exam marks</span>
        );
      }
    }
  ];

  const menuTabs = [
    { key: "students", label: "Student Registry", icon: Users },
    { key: "batches", label: "Batches Planner", icon: Clock },
    { key: "attendance", label: "Attendance Logs", icon: Calendar },
    { key: "fees", label: "Fees Ledgers", icon: CreditCard },
    { key: "exams", label: "Exams & Results", icon: FileSpreadsheet },
    { key: "certificates", label: "Certifications", icon: Award },
  ];

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 bg-white">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
            <GraduationCap className="text-primary h-6 w-6" />
            Academy Management Suite
          </h1>
          <p className="text-xxs text-slate-400 mt-1">Manage vocational course enrollments, student records, batch planners, fee tracking and certificates.</p>
        </div>
        <div>
          {activeTab === "students" && (
            <button
              onClick={() => {
                setModalType("enroll");
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors"
            >
              <Plus size={14} /> Enroll Student
            </button>
          )}
          {activeTab === "batches" && (
            <button
              onClick={() => {
                setModalType("batch");
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors"
            >
              <Plus size={14} /> Configure Batch
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Sub-tab selectors */}
      <div className="flex overflow-x-auto gap-1 border-b border-slate-100 pb-1.5 scrollbar-none bg-white">
        {menuTabs.map(tab => {
          const TabIcon = tab.icon;
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                isSelected 
                  ? "border-primary text-primary" 
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <TabIcon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main viewport based on selected Tab */}
      <div className="bg-white">
        {activeTab === "students" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Enrolled Students Database</h3>
            {students.length > 0 ? (
              <Table columns={studentCols} data={students} searchKey="name" searchPlaceholder="Search student name..." />
            ) : (
              <EmptyState 
                title="No students admitted yet"
                description="Admit aspiring stylists to course packages to manage exam sheets and certificates."
                actionText="Enroll First Student"
                onAction={() => {
                  setModalType("enroll");
                  setModalOpen(true);
                }}
              />
            )}
          </div>
        )}

        {activeTab === "batches" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Active Batch Timetables</h3>
            {batches.length > 0 ? (
              <Table columns={batchCols} data={batches} searchKey="name" searchPlaceholder="Search batch names..." />
            ) : (
              <EmptyState 
                title="No active batches configured"
                description="Establish timing rosters and allocate tutors for vocational training tracks."
                actionText="Add Batch Schedule"
                onAction={() => {
                  setModalType("batch");
                  setModalOpen(true);
                }}
              />
            )}
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="space-y-4 bg-white">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Student Attendance Register</h3>
            <Table columns={attendanceCols} data={attendanceMockData} />
          </div>
        )}

        {activeTab === "fees" && (
          <div className="space-y-4 bg-white">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Academy Course Fee Accounts</h3>
            <Table columns={feeCols} data={feesMockData} />
          </div>
        )}

        {activeTab === "exams" && (
          <div className="space-y-4 bg-white">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Student Examination Scores</h3>
            <Table columns={examCols} data={examsMockData} />
          </div>
        )}

        {activeTab === "certificates" && (
          <div className="space-y-4 bg-white">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Certificate Awards Registry</h3>
            <Table columns={certificateCols} data={certificatesMockData} />
          </div>
        )}
      </div>

      {/* Enroll Student Dialog */}
      <Modal
        isOpen={modalOpen && modalType === "enroll"}
        onClose={() => setModalOpen(false)}
        title="Student Admissions Entry"
        size="md"
      >
        <form onSubmit={handleEnrollStudent} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Student Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Mobile Phone Number *</label>
            <input
              type="text"
              required
              placeholder="10 digit number"
              value={studentPhone}
              onChange={(e) => setStudentPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
            <input
              type="email"
              placeholder="student@example.com"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Select Course Plan *</label>
            <select
              required
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
            >
              <option value="">Choose course...</option>
              {courses.map(c => <option key={c.id} value={c.name}>{c.name} (₹{c.price})</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Assign Active Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
            >
              <option value="">Unassigned</option>
              {batches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Enroll Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Configure Batch Dialog */}
      <Modal
        isOpen={modalOpen && modalType === "batch"}
        onClose={() => setModalOpen(false)}
        title="Create Training Batch"
        size="md"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Batch Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Masterclass Morning 2026"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Timing slot *</label>
            <input
              type="text"
              required
              placeholder="e.g. 09:30 AM - 01:00 PM"
              value={batchTiming}
              onChange={(e) => setBatchTiming(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Linked Course Track *</label>
            <select
              required
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
            >
              <option value="">Select Course...</option>
              {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Assign Faculty Lecturer</label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
            >
              <option value="">Choose Faculty...</option>
              {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Schedule Batch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
