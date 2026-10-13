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
  Clock,
  Edit,
  Trash2
} from "lucide-react";
import { toast } from "react-hot-toast";
import { formatCurrency, formatDate } from "../../../firebase/helpers";

type AcademyTab = "students" | "batches" | "attendance" | "fees" | "exams" | "certificates";

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState<AcademyTab>("students");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string>("");

  // CRUD instances
  const { data: students, add: addStudent, update: updateStudent, remove: deleteStudent } = useCRUD("academy_students");
  const { data: batches, add: addBatch, update: updateBatch, remove: deleteBatch } = useCRUD("academy_batches");
  const { data: courses } = useCRUD("courses");
  const { data: employees } = useCRUD("employees");
  const { data: attendanceLogs, add: addAttendance, update: updateAttendance, remove: deleteAttendance } = useCRUD("academy_attendance");
  const { data: feeLedgers, add: addFee, update: updateFee, remove: deleteFee } = useCRUD("academy_fees");
  const { data: examScores, add: addExam, update: updateExam, remove: deleteExam } = useCRUD("academy_exams");
  const { data: certificates, add: addCertificate, update: updateCertificate, remove: deleteCertificate } = useCRUD("academy_certificates");

  // Edit Academy item modal states
  const [editAcademyOpen, setEditAcademyOpen] = useState(false);
  const [editAcademyType, setEditAcademyType] = useState<"student" | "batch" | "attendance" | "fee" | "exam" | "certificate">("student");
  const [editingAcademyItem, setEditingAcademyItem] = useState<any>(null);

  // Edit fields
  const [editFieldName, setEditFieldName] = useState("");
  const [editFieldPhone, setEditFieldPhone] = useState("");
  const [editFieldEmail, setEditFieldEmail] = useState("");
  const [editFieldCourse, setEditFieldCourse] = useState("");
  const [editFieldBatch, setEditFieldBatch] = useState("");
  const [editFieldTiming, setEditFieldTiming] = useState("");
  const [editFieldFaculty, setEditFieldFaculty] = useState("");
  const [editFieldDate, setEditFieldDate] = useState("");
  const [editFieldStatus, setEditFieldStatus] = useState("");
  const [editFieldRemark, setEditFieldRemark] = useState("");
  const [editFieldTotal, setEditFieldTotal] = useState(0);
  const [editFieldPaid, setEditFieldPaid] = useState(0);
  const [editFieldDueDate, setEditFieldDueDate] = useState("");
  const [editFieldExam, setEditFieldExam] = useState("");
  const [editFieldScore, setEditFieldScore] = useState("");
  const [editFieldResult, setEditFieldResult] = useState("");

  // Local Form state placeholders
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  const [batchName, setBatchName] = useState("");
  const [batchTiming, setBatchTiming] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");

  // New Form states for other modules
  const [attStudent, setAttStudent] = useState("");
  const [attDate, setAttDate] = useState(new Date().toISOString().split("T")[0]);
  const [attStatus, setAttStatus] = useState("Present");
  const [attRemark, setAttRemark] = useState("");

  const [examStudent, setExamStudent] = useState("");
  const [examName, setExamName] = useState("");
  const [examScore, setExamScore] = useState("");
  const [examDate, setExamDate] = useState(new Date().toISOString().split("T")[0]);
  const [examResult, setExamResult] = useState("Pass");

  const [certStudent, setCertStudent] = useState("");
  const [certCourse, setCertCourse] = useState("");
  const [certDate, setCertDate] = useState(new Date().toISOString().split("T")[0]);
  const [certFaculty, setCertFaculty] = useState("");
  const [certStatus, setCertStatus] = useState("Issued");

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

      // Auto-create fee ledger entry
      const courseObj = courses.find(c => c.name === selectedCourse);
      const feeAmount = courseObj?.price || 0;
      await addFee({
        student: studentName,
        course: selectedCourse,
        total: feeAmount,
        paid: 0,
        balance: feeAmount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "Unpaid"
      });

      setStudentName("");
      setStudentPhone("");
      setStudentEmail("");
      setModalOpen(false);
      toast.success("Student successfully enrolled and fee ledger auto-created.");
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

  const handleLogAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attStudent || !attDate) {
      toast.error("Please select a student and fill in the date.");
      return;
    }
    const studentObj = students.find(s => s.id === attStudent);
    try {
      await addAttendance({
        student: studentObj?.name || "Unknown Student",
        course: studentObj?.enrolledCourse || "Unassigned",
        date: attDate,
        status: attStatus,
        remark: attRemark
      });
      setAttStudent("");
      setAttRemark("");
      setModalOpen(false);
      toast.success("Attendance logged successfully.");
    } catch (err) {}
  };

  const handleRecordExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examStudent || !examName || !examScore) {
      toast.error("Please fill all required exam details.");
      return;
    }
    const studentObj = students.find(s => s.id === examStudent);
    try {
      await addExam({
        student: studentObj?.name || "Unknown Student",
        exam: examName,
        score: examScore,
        date: examDate,
        result: examResult
      });
      setExamStudent("");
      setExamName("");
      setExamScore("");
      setModalOpen(false);
      toast.success("Exam results recorded successfully.");
    } catch (err) {}
  };

  const handleAwardCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certStudent || !certCourse || !certFaculty) {
      toast.error("Please fill in student, course, and signing faculty.");
      return;
    }
    const studentObj = students.find(s => s.id === certStudent);
    try {
      await addCertificate({
        student: studentObj?.name || "Unknown Student",
        course: certCourse,
        issuedDate: certStatus === "Issued" ? certDate : "Awaiting Finals",
        authority: certFaculty,
        status: certStatus
      });
      setCertStudent("");
      setCertCourse("");
      setCertFaculty("");
      setModalOpen(false);
      toast.success("Certificate recorded successfully.");
    } catch (err) {}
  };

  const handlePayFees = async (item: any) => {
    try {
      await updateFee(item.id, {
        paid: item.total,
        balance: 0,
        status: "Paid",
        dueDate: "Paid"
      });
      toast.success(`Fee collected successfully for ${item.student}.`);
    } catch (err) {
      toast.error("Failed to collect fee.");
    }
  };

  const handlePrintCertificate = (item: any) => {
    toast.success(`Printing Certificate ID: ${item.id} for ${item.student}`);
  };

  const openEditAcademyModal = (type: "student" | "batch" | "attendance" | "fee" | "exam" | "certificate", item: any) => {
    setEditAcademyType(type);
    setEditingAcademyItem(item);
    if (type === "student") {
      setEditFieldName(item.name || "");
      setEditFieldPhone(item.phone || "");
      setEditFieldEmail(item.email || "");
      setEditFieldCourse(item.enrolledCourse || "");
      setEditFieldBatch(item.batch || "Unassigned");
      setEditFieldStatus(item.status || "Active");
    } else if (type === "batch") {
      setEditFieldName(item.name || "");
      setEditFieldTiming(item.timing || "");
      setEditFieldCourse(item.course || "");
      setEditFieldFaculty(item.faculty || "Unassigned");
    } else if (type === "attendance") {
      setEditFieldName(item.student || "");
      setEditFieldDate(item.date || "");
      setEditFieldStatus(item.status || "Present");
      setEditFieldRemark(item.remark || "");
    } else if (type === "fee") {
      setEditFieldName(item.student || "");
      setEditFieldCourse(item.course || "");
      setEditFieldTotal(item.total || 0);
      setEditFieldPaid(item.paid || 0);
      setEditFieldDueDate(item.dueDate || "");
      setEditFieldStatus(item.status || "Unpaid");
    } else if (type === "exam") {
      setEditFieldName(item.student || "");
      setEditFieldExam(item.exam || "");
      setEditFieldScore(item.score || "");
      setEditFieldDate(item.date || "");
      setEditFieldResult(item.result || "Pass");
    } else if (type === "certificate") {
      setEditFieldName(item.student || "");
      setEditFieldCourse(item.course || "");
      setEditFieldDate(item.issuedDate || "");
      setEditFieldFaculty(item.authority || "");
      setEditFieldStatus(item.status || "Issued");
    }
    setEditAcademyOpen(true);
  };

  const handleEditAcademySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAcademyItem) return;

    try {
      if (editAcademyType === "student") {
        await updateStudent(editingAcademyItem.id, {
          name: editFieldName,
          phone: editFieldPhone,
          email: editFieldEmail,
          enrolledCourse: editFieldCourse,
          batch: editFieldBatch,
          status: editFieldStatus
        });
      } else if (editAcademyType === "batch") {
        await updateBatch(editingAcademyItem.id, {
          name: editFieldName,
          timing: editFieldTiming,
          course: editFieldCourse,
          faculty: editFieldFaculty
        });
      } else if (editAcademyType === "attendance") {
        await updateAttendance(editingAcademyItem.id, {
          date: editFieldDate,
          status: editFieldStatus,
          remark: editFieldRemark
        });
      } else if (editAcademyType === "fee") {
        const total = Number(editFieldTotal) || 0;
        const paid = Number(editFieldPaid) || 0;
        await updateFee(editingAcademyItem.id, {
          total,
          paid,
          balance: Math.max(0, total - paid),
          dueDate: editFieldDueDate,
          status: paid >= total ? "Paid" : "Pending"
        });
      } else if (editAcademyType === "exam") {
        await updateExam(editingAcademyItem.id, {
          exam: editFieldExam,
          score: editFieldScore,
          date: editFieldDate,
          result: editFieldResult
        });
      } else if (editAcademyType === "certificate") {
        await updateCertificate(editingAcademyItem.id, {
          course: editFieldCourse,
          issuedDate: editFieldDate,
          authority: editFieldFaculty,
          status: editFieldStatus
        });
      }
      setEditAcademyOpen(false);
      toast.success("Academy record updated successfully.");
    } catch (e: any) {
      toast.error("Failed to update record: " + e.message);
    }
  };

  // Dynamic Render columns depending on active tab
  const studentCols = [
    { accessorKey: "name", header: "Student Name", cell: ({ row }: any) => <span className="font-semibold text-slate-800">{row.getValue("name")}</span> },
    { accessorKey: "phone", header: "Mobile" },
    { accessorKey: "enrolledCourse", header: "Enrolled Course" },
    { accessorKey: "batch", header: "Batch" },
    { accessorKey: "status", header: "Enroll Status", cell: ({ row }: any) => <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-bold text-[10px]">Active</span> },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openEditAcademyModal("student", item)}
              title="Edit Student"
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-indigo-50/50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={async () => {
                if (confirm(`Remove student "${item.name}"?`)) {
                  await deleteStudent(item.id);
                }
              }}
              title="Delete Student"
              className="p-1.5 text-slate-500 hover:text-danger hover:bg-rose-50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      }
    }
  ];

  const batchCols = [
    { accessorKey: "name", header: "Batch Name", cell: ({ row }: any) => <span className="font-semibold text-slate-800">{row.getValue("name")}</span> },
    { accessorKey: "course", header: "Course Plan" },
    { accessorKey: "timing", header: "Timing Slot" },
    { accessorKey: "faculty", header: "Instructing Faculty" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openEditAcademyModal("batch", item)}
              title="Edit Batch"
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-indigo-50/50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={async () => {
                if (confirm(`Remove batch "${item.name}"?`)) {
                  await deleteBatch(item.id);
                }
              }}
              title="Delete Batch"
              className="p-1.5 text-slate-500 hover:text-danger hover:bg-rose-50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      }
    }
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
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openEditAcademyModal("attendance", item)}
              title="Edit Attendance"
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-indigo-50/50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={async () => {
                if (confirm(`Remove attendance for "${item.student}"?`)) {
                  await deleteAttendance(item.id);
                }
              }}
              title="Delete Attendance"
              className="p-1.5 text-slate-500 hover:text-danger hover:bg-rose-50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      }
    }
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
      header: "Actions",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            {item.balance > 0 ? (
              <button
                onClick={() => handlePayFees(item)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-white font-bold text-[10px] rounded-lg shadow-xs"
              >
                <CreditCard size={10} /> Collect Fee
              </button>
            ) : (
              <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-0.5"><Check size={12} /> Clear</span>
            )}
            <button
              onClick={() => openEditAcademyModal("fee", item)}
              title="Edit Fee Ledger"
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-indigo-50/50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={async () => {
                if (confirm(`Remove fee record for "${item.student}"?`)) {
                  await deleteFee(item.id);
                }
              }}
              title="Delete Fee Record"
              className="p-1.5 text-slate-500 hover:text-danger hover:bg-rose-50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Trash2 size={12} />
            </button>
          </div>
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
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openEditAcademyModal("exam", item)}
              title="Edit Exam Record"
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-indigo-50/50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={async () => {
                if (confirm(`Remove exam score for "${item.student}"?`)) {
                  await deleteExam(item.id);
                }
              }}
              title="Delete Exam Score"
              className="p-1.5 text-slate-500 hover:text-danger hover:bg-rose-50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      }
    }
  ];

  const certificateCols = [
    { accessorKey: "student", header: "Student Name", cell: ({ row }: any) => <span className="font-semibold text-slate-800">{row.getValue("student")}</span> },
    { accessorKey: "course", header: "Course Major" },
    { accessorKey: "issuedDate", header: "Award Date" },
    { accessorKey: "authority", header: "Signed Faculty" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-1.5">
            {item.status === "Issued" && (
              <button
                onClick={() => handlePrintCertificate(item)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-850 hover:bg-slate-900 text-white font-bold text-[10px] rounded-lg shadow-xs"
              >
                <Printer size={10} /> Print
              </button>
            )}
            <button
              onClick={() => openEditAcademyModal("certificate", item)}
              title="Edit Certificate"
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-indigo-50/50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={async () => {
                if (confirm(`Remove certificate for "${item.student}"?`)) {
                  await deleteCertificate(item.id);
                }
              }}
              title="Delete Certificate"
              className="p-1.5 text-slate-500 hover:text-danger hover:bg-rose-50 rounded-lg transition-colors border border-slate-200/70"
            >
              <Trash2 size={12} />
            </button>
          </div>
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
        <div className="flex gap-2">
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
          {activeTab === "attendance" && (
            <button
              onClick={() => {
                setModalType("attendance");
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors"
            >
              <Plus size={14} /> Log Attendance
            </button>
          )}
          {activeTab === "exams" && (
            <button
              onClick={() => {
                setModalType("exam");
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors"
            >
              <Plus size={14} /> Record Exam Marks
            </button>
          )}
          {activeTab === "certificates" && (
            <button
              onClick={() => {
                setModalType("certificate");
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-xs transition-colors"
            >
              <Plus size={14} /> Award Certificate
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
            {attendanceLogs.length > 0 ? (
              <Table columns={attendanceCols} data={attendanceLogs} searchKey="student" searchPlaceholder="Search student..." />
            ) : (
              <EmptyState 
                title="No attendance logged yet"
                description="Keep track of students' daily rosters and timing delays."
                actionText="Log First Attendance"
                onAction={() => {
                  setModalType("attendance");
                  setModalOpen(true);
                }}
              />
            )}
          </div>
        )}

        {activeTab === "fees" && (
          <div className="space-y-4 bg-white">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Academy Course Fee Accounts</h3>
            {feeLedgers.length > 0 ? (
              <Table columns={feeCols} data={feeLedgers} searchKey="student" searchPlaceholder="Search student..." />
            ) : (
              <EmptyState 
                title="No fee accounts generated"
                description="Fee ledgers will automatically build once you enroll students into course major tracks."
              />
            )}
          </div>
        )}

        {activeTab === "exams" && (
          <div className="space-y-4 bg-white">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Student Examination Scores</h3>
            {examScores.length > 0 ? (
              <Table columns={examCols} data={examScores} searchKey="student" searchPlaceholder="Search student..." />
            ) : (
              <EmptyState 
                title="No exam records registered"
                description="Add mid-term or styling practical test marks for admitted scholars."
                actionText="Record First Exam Score"
                onAction={() => {
                  setModalType("exam");
                  setModalOpen(true);
                }}
              />
            )}
          </div>
        )}

        {activeTab === "certificates" && (
          <div className="space-y-4 bg-white">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Certificate Awards Registry</h3>
            {certificates.length > 0 ? (
              <Table columns={certificateCols} data={certificates} searchKey="student" searchPlaceholder="Search student..." />
            ) : (
              <EmptyState 
                title="No certifications awarded yet"
                description="Award signed certificates for scholars who successfully clear styling courses."
                actionText="Award First Certificate"
                onAction={() => {
                  setModalType("certificate");
                  setModalOpen(true);
                }}
              />
            )}
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

      {/* Log Attendance Dialog */}
      <Modal
        isOpen={modalOpen && modalType === "attendance"}
        onClose={() => setModalOpen(false)}
        title="Log Academy Attendance"
        size="md"
      >
        <form onSubmit={handleLogAttendance} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Select Student *</label>
            <select
              required
              value={attStudent}
              onChange={(e) => setAttStudent(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
            >
              <option value="">Choose Student...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.enrolledCourse})</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Date *</label>
            <input
              type="date"
              required
              value={attDate}
              onChange={(e) => setAttDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Status *</label>
            <select
              required
              value={attStatus}
              onChange={(e) => setAttStatus(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
            >
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Remarks / Notes</label>
            <input
              type="text"
              placeholder="e.g. 15m delay, left early, etc."
              value={attRemark}
              onChange={(e) => setAttRemark(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
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
              Log Attendance
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Exam Marks Dialog */}
      <Modal
        isOpen={modalOpen && modalType === "exam"}
        onClose={() => setModalOpen(false)}
        title="Record Examination Marks"
        size="md"
      >
        <form onSubmit={handleRecordExam} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Select Student *</label>
            <select
              required
              value={examStudent}
              onChange={(e) => setExamStudent(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
            >
              <option value="">Choose Student...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Exam Subject / Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mid-Term Hair Cut Practical"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Score / Grade *</label>
            <input
              type="text"
              required
              placeholder="e.g. 85/100, A+, 92%"
              value={examScore}
              onChange={(e) => setExamScore(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Exam Date *</label>
            <input
              type="date"
              required
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Result *</label>
            <select
              required
              value={examResult}
              onChange={(e) => setExamResult(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
            >
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
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
              Record Exam
            </button>
          </div>
        </form>
      </Modal>

      {/* Award Certificate Dialog */}
      <Modal
        isOpen={modalOpen && modalType === "certificate"}
        onClose={() => setModalOpen(false)}
        title="Award Signed Certificate"
        size="md"
      >
        <form onSubmit={handleAwardCertificate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Select Student *</label>
            <select
              required
              value={certStudent}
              onChange={(e) => {
                setCertStudent(e.target.value);
                const s = students.find(stud => stud.id === e.target.value);
                if (s) setCertCourse(s.enrolledCourse);
              }}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
            >
              <option value="">Choose Student...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Course Major Track *</label>
            <input
              type="text"
              required
              readOnly
              placeholder="Select student to auto-populate course"
              value={certCourse}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Award Date *</label>
            <input
              type="date"
              required
              value={certDate}
              onChange={(e) => setCertDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Signing Authority (Faculty) *</label>
            <select
              required
              value={certFaculty}
              onChange={(e) => setCertFaculty(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
            >
              <option value="">Choose Faculty...</option>
              {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Status *</label>
            <select
              required
              value={certStatus}
              onChange={(e) => setCertStatus(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
            >
              <option value="Issued">Issued</option>
              <option value="Pending">Pending</option>
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
              Award Certificate
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Academy Record Modal */}
      <Modal
        isOpen={editAcademyOpen}
        onClose={() => setEditAcademyOpen(false)}
        title={`Edit ${editAcademyType.charAt(0).toUpperCase() + editAcademyType.slice(1)} Record`}
        size="md"
      >
        <form onSubmit={handleEditAcademySubmit} className="space-y-4">
          {editAcademyType === "student" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={editFieldName}
                  onChange={(e) => setEditFieldName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Mobile *</label>
                  <input
                    type="text"
                    required
                    value={editFieldPhone}
                    onChange={(e) => setEditFieldPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Email</label>
                  <input
                    type="email"
                    value={editFieldEmail}
                    onChange={(e) => setEditFieldEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Enrolled Course Plan</label>
                  <select
                    value={editFieldCourse}
                    onChange={(e) => setEditFieldCourse(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
                  >
                    <option value="">Choose course...</option>
                    {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Assigned Batch</label>
                  <select
                    value={editFieldBatch}
                    onChange={(e) => setEditFieldBatch(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
                  >
                    <option value="Unassigned">Unassigned</option>
                    {batches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Status</label>
                <select
                  value={editFieldStatus}
                  onChange={(e) => setEditFieldStatus(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </>
          )}

          {editAcademyType === "batch" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Batch Title *</label>
                <input
                  type="text"
                  required
                  value={editFieldName}
                  onChange={(e) => setEditFieldName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Timing Slot *</label>
                <input
                  type="text"
                  required
                  value={editFieldTiming}
                  onChange={(e) => setEditFieldTiming(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Linked Course *</label>
                  <select
                    value={editFieldCourse}
                    onChange={(e) => setEditFieldCourse(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
                  >
                    <option value="">Select course...</option>
                    {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Faculty Instructor</label>
                  <select
                    value={editFieldFaculty}
                    onChange={(e) => setEditFieldFaculty(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
                  >
                    <option value="Unassigned">Unassigned</option>
                    {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {editAcademyType === "attendance" && (
            <>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700">
                Student: {editFieldName}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Date *</label>
                  <input
                    type="date"
                    required
                    value={editFieldDate}
                    onChange={(e) => setEditFieldDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Attendance Status *</label>
                  <select
                    value={editFieldStatus}
                    onChange={(e) => setEditFieldStatus(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Remarks / Notes</label>
                <input
                  type="text"
                  value={editFieldRemark}
                  onChange={(e) => setEditFieldRemark(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                />
              </div>
            </>
          )}

          {editAcademyType === "fee" && (
            <>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700">
                Student: {editFieldName} • Course: {editFieldCourse}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Total Tuition Fee (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editFieldTotal}
                    onChange={(e) => setEditFieldTotal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Amount Paid To Date (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editFieldPaid}
                    onChange={(e) => setEditFieldPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Balance Pending</label>
                  <input
                    type="text"
                    disabled
                    value={`₹${Math.max(0, editFieldTotal - editFieldPaid)}`}
                    className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Due Date / Status</label>
                  <input
                    type="text"
                    value={editFieldDueDate}
                    onChange={(e) => setEditFieldDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                  />
                </div>
              </div>
            </>
          )}

          {editAcademyType === "exam" && (
            <>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700">
                Student: {editFieldName}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Exam Subject / Title *</label>
                <input
                  type="text"
                  required
                  value={editFieldExam}
                  onChange={(e) => setEditFieldExam(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Score / Grade *</label>
                  <input
                    type="text"
                    required
                    value={editFieldScore}
                    onChange={(e) => setEditFieldScore(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Date</label>
                  <input
                    type="date"
                    required
                    value={editFieldDate}
                    onChange={(e) => setEditFieldDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Result</label>
                  <select
                    value={editFieldResult}
                    onChange={(e) => setEditFieldResult(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
                  >
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                    <option value="Distinction">Distinction</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {editAcademyType === "certificate" && (
            <>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700">
                Student: {editFieldName}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Course Major *</label>
                <input
                  type="text"
                  required
                  value={editFieldCourse}
                  onChange={(e) => setEditFieldCourse(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Award Date</label>
                  <input
                    type="date"
                    value={editFieldDate}
                    onChange={(e) => setEditFieldDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Signing Faculty</label>
                  <select
                    value={editFieldFaculty}
                    onChange={(e) => setEditFieldFaculty(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
                  >
                    <option value="">Select faculty...</option>
                    {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Status</label>
                <select
                  value={editFieldStatus}
                  onChange={(e) => setEditFieldStatus(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-primary text-slate-850"
                >
                  <option value="Issued">Issued</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditAcademyOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
