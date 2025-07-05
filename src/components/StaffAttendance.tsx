import React, { useState, useEffect } from 'react';
import { staffService, Staff as BackendStaff, AttendanceRecord, LeaveRecord, DeductionRecord } from '@/services/staffService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Clock, 
  User,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar as CalendarIcon
} from 'lucide-react';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import AttendanceForm from './AttendanceForm';
import StaffForm from './StaffForm';
import StaffReport from './StaffReport';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface StaffAttendanceProps {
  isUrdu: boolean;
}

type Staff = Omit<BackendStaff, 'status'> & {
  status?: 'active' | 'inactive';
};

interface TranslationKeys {
  title: string;
  attendance: string;
  staffManagement: string;
  searchPlaceholder: string;
  addAttendance: string;
  addStaff: string;
  exportReport: string;
  dailyView: string;
  monthlyView: string;
  filterMonth: string;
  staffName: string;
  position: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  notes: string;
  present: string;
  absent: string;
  late: string;
  halfDay: string;
  phone: string;
  email: string;
  salary: string;
  joinDate: string;
  edit: string;
  delete: string;
  view: string;
  pharmacist: string;
  assistant: string;
  cashier: string;
  manager: string;
  active: string;
  inactive: string;
  noRecords: string;
  noRecordsDesc: string;
  employee: string;
  time: string;
};

const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const StaffAttendance: React.FC<StaffAttendanceProps> = ({ isUrdu }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showStaffReport, setShowStaffReport] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [activeTab, setActiveTab] = useState('daily');
  const [loadingButton, setLoadingButton] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [salaryData, setSalaryData] = useState<any[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<any[]>([]);
  const [deductionRecords, setDeductionRecords] = useState<any[]>([]);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDeductionDialog, setShowDeductionDialog] = useState(false);
  const [showSalaryDialog, setShowSalaryDialog] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [leaveData, setLeaveData] = useState({ days: 0, reason: '', type: '' });
  const [deductionData, setDeductionData] = useState({ amount: 0, reason: '' });
  const [salaryDataState, setSalaryDataState] = useState({ amount: 0, bonus: 0, month: '' });
  const [salaryRecords, setSalaryRecords] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Staff | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  // Attendance Settings state
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [deductions, setDeductions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Attendance Settings
  const [attendanceSettings, setAttendanceSettings] = useState(() => {
    const saved = localStorage.getItem('pharmacy_attendance_settings');
    return saved
      ? JSON.parse(saved)
      : {
          leaveDeduction: 0,
          lateDeduction: 0,
          earlyOutDeduction: 0,
          clockInTime: '09:00',
          clockOutTime: '18:00',
        };
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffData = await staffService.getStaff();
        setStaff(staffData.map(staff => ({
          ...staff,
          status: staff.status === 'Active' ? 'active' : 'inactive'
        })));
      } catch (error) {
        console.error('Failed to fetch staff:', error);
      }
    };
    
    fetchStaff();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [staffRes, attendanceRes, leavesRes, deductionsRes] = await Promise.all([
          staffService.getStaff(),
          staffService.getAttendance(),
          staffService.getLeaves(),
          staffService.getDeductions()
        ]);
        setStaff(staffRes.map(staff => ({
          ...staff,
          status: staff.status === 'Active' ? 'active' : 'inactive'
        })));
        setAttendanceRecords(attendanceRes);
        setLeaves(leavesRes);
        setDeductions(deductionsRes);
        setError(null);
      } catch (e: any) {
        setError('Failed to load staff/attendance data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const text = {
    en: {
      title: 'Staff & Attendance',
      attendance: 'Attendance',
      staffManagement: 'Staff Management',
      searchPlaceholder: 'Search staff...',
      addAttendance: 'Add Attendance',
      addStaff: 'Add Staff',
      exportReport: 'Export Report',
      dailyView: 'Daily View',
      monthlyView: 'Monthly View',
      filterMonth: 'Filter by Month',
      staffName: 'Staff Name',
      position: 'Position',
      date: 'Date',
      checkIn: 'Check In',
      checkOut: 'Check Out',
      status: 'Status',
      notes: 'Notes',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      halfDay: 'Half Day',
      phone: 'Phone',
      email: 'Email',
      salary: 'Salary',
      joinDate: 'Join Date',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      pharmacist: 'Pharmacist',
      assistant: 'Assistant',
      cashier: 'Cashier',
      manager: 'Manager',
      active: 'Active',
      inactive: 'Inactive',
      noRecords: 'No attendance records',
      noRecordsDesc: 'No attendance records found for the selected period',
      employee: 'Employee',
      time: 'Time',
    },
    ur: {
      title: 'عملہ اور حاضری',
      attendance: 'حاضری',
      staffManagement: 'عملے کا انتظام',
      searchPlaceholder: 'عملہ تلاش کریں...',
      addAttendance: 'حاضری شامل کریں',
      addStaff: 'عملہ شامل کریں',
      exportReport: 'رپورٹ برآمد کریں',
      dailyView: 'روزانہ نظارہ',
      monthlyView: 'ماہانہ نظارہ',
      filterMonth: 'مہینے کے ذریعے فلٹر',
      staffName: 'عملے کا نام',
      position: 'عہدہ',
      date: 'تاریخ',
      checkIn: 'آمد',
      checkOut: 'رخصت',
      status: 'حالت',
      notes: 'نوٹس',
      present: 'حاضر',
      absent: 'غائب',
      late: 'دیر',
      halfDay: 'آدھا دن',
      phone: 'فون',
      email: 'ای میل',
      salary: 'تنخواہ',
      joinDate: 'شمولیت کی تاریخ',
      edit: 'تبدیل کریں',
      delete: 'حذف کریں',
      view: 'دیکھیں',
      pharmacist: 'فارماسسٹ',
      assistant: 'اسسٹنٹ',
      cashier: 'کیشیئر',
      manager: 'منیجر',
      active: 'فعال',
      inactive: 'غیر فعال',
      noRecords: 'کوئی حاضری ریکارڈ نہیں ملا',
      noRecordsDesc: 'منتخب مدت کے لیے کوئی حاضری کا ریکارڈ دستیاب نہیں ہے',
      employee: 'ملازم',
      time: 'وقت',
    }
  };

  const t = isUrdu ? text.ur : text.en;

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttendance = attendanceRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = record.date.startsWith(selectedMonth);
    return matchesSearch && matchesDate;
  });

  const todaysAttendance = attendanceRecords.filter(
    record => record.date === new Date().toISOString().split('T')[0]
  );

  const handleAddAttendance = async (attendanceData: Omit<AttendanceRecord, 'id'>) => {
    try {
      setLoading(true);
      await staffService.addAttendance(attendanceData);
      const updated = await staffService.getAttendance();
      setAttendanceRecords(updated);
      toast({
        title: isUrdu ? 'حاضری کامیابی سے محفوظ ہو گئی' : 'Attendance saved successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Failed to save attendance:', error);
      toast({
        title: isUrdu ? 'حاضری محفوظ کرنے میں ناکامی' : 'Failed to save attendance',
        variant: 'destructive'
      });
    } finally {
      setShowAttendanceForm(false);
      setLoading(false);
    }
  };

  const handleSaveStaff = async (staffData: Omit<Staff, 'id'>) => {
    try {
      const savedStaff = await staffService.addStaff({
        ...staffData,
        status: staffData.status === 'active' ? 'Active' : 'Inactive'
      });
      
      // Update staff list with new member
      setStaff(prevStaff => [...prevStaff, {
        ...savedStaff,
        status: savedStaff.status === 'Active' ? 'active' : 'inactive'
      }]);
      
      // Close form and reset editing state
      setShowStaffForm(false);
      setEditingStaff(null);
      
      return savedStaff;
    } catch (error) {
      console.error('Failed to save staff:', error);
      throw error;
    }
  };

  const handleEditStaff = async (staffData: Staff) => {
    try {
      const updatedStaff = await staffService.updateStaff({
        ...staffData,
        status: staffData.status === 'active' ? 'Active' : 'Inactive'
      });
      setStaff(prevStaff => prevStaff.map(s => s.id === updatedStaff.id ? {
        ...updatedStaff,
        status: updatedStaff.status === 'Active' ? 'active' : 'inactive'
      } : s));
      return updatedStaff;
    } catch (error) {
      console.error('Failed to update staff:', error);
      throw error;
    }
  };

  const handleDeleteStaff = async (staffId: string | number) => {
    setLoading(true);
    try {
      await staffService.deleteStaff(staffId);
      setStaff(await staffService.getStaff());
    } catch (error) {
      toast({ title: isUrdu ? 'عملہ حذف نہیں ہوا' : 'Failed to delete staff', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleTimeAction = async (record: any, action: 'checkIn' | 'checkOut') => {
    const buttonId = `${record.staffId}-${record.date}-${action}`;
    setLoadingButton(buttonId);
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    // Determine if this is a new record or updating an existing one
    const existingRecordIndex = attendanceRecords.findIndex(
      r => r.staffId === record.staffId && r.date === record.date
    );

    const updatedRecord = {
      ...record,
      [action]: timeString,
      status: action === 'checkIn' ? 'present' : record.status
    };

    let updatedRecords;
    if (existingRecordIndex >= 0) {
      // Update existing record
      updatedRecords = [...attendanceRecords];
      updatedRecords[existingRecordIndex] = updatedRecord;
    } else {
      // Add new record
      updatedRecords = [...attendanceRecords, updatedRecord];
    }

    setAttendanceRecords(updatedRecords);
    
    // Save to backend
    try {
      await staffService.updateAttendance(updatedRecords);
    } catch (error) {
      console.error('Failed to update attendance:', error);
    }
    
    // Reset loading state after a short delay
    setTimeout(() => setLoadingButton(null), 300);
  };

  // Export Attendance Report (stub)
  const exportAttendanceReport = () => {
    toast({
      title: isUrdu ? 'ایکسپورٹ فیچر دستیاب نہیں' : 'Export not implemented',
      description: isUrdu ? 'حاضری رپورٹ ایکسپورٹ فیچر جلد دستیاب ہوگا' : 'Attendance report export feature coming soon.',
      variant: 'destructive',
    });
  };

  // Status icon stub
  const getStatusIcon = (status: string) => {
    // You can use Lucide icons here if you want
    return null;
  };

  // Status badge stub
  const getStatusBadge = (status: string) => {
    return null;
  };

  // Confirm delete stub
  const confirmDelete = () => {
    finalConfirmDelete();
  };

  // Status badge stub

  const handleClockInOut = async (staffId: string) => {
    setLoadingButton(`clock-${staffId}`);
    
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Check if staff has already clocked in today
      const existingRecord = attendanceRecords.find(
        (record) => record.staffId === staffId && record.date === today
      );
      
      if (existingRecord) {
        // Clock out
        const updatedRecord = {
          ...existingRecord,
          clockOut: now.toISOString(),
          hoursWorked: calculateHoursWorked(existingRecord.clockIn, now.toISOString())
        };
        
        // Update attendance record
        const updatedAttendance = attendanceRecords.map(record => 
          record.id === existingRecord.id ? updatedRecord : record
        );
        
        setAttendanceRecords(updatedAttendance);
        
        // Save to backend
        try {
          await staffService.updateAttendance(updatedAttendance);
        } catch (error) {
          console.error('Failed to update attendance:', error);
        }
      } else {
        // Clock in
        const newRecord = {
          id: Math.random().toString(36).substr(2, 9),
          staffId,
          date: today,
          clockIn: now.toISOString(),
          status: 'Present'
        };
        
        setAttendanceRecords([...attendanceRecords, newRecord]);
        
        // Save to backend
        try {
          await staffService.addAttendance(newRecord);
        } catch (error) {
          console.error('Failed to add attendance:', error);
        }
      }
    } finally {
      setLoadingButton(null);
    }
  };

  const calculateHoursWorked = (clockIn: string, clockOut: string) => {
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    return ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2);
  };

  const handleRequestDelete = (item: any) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const finalConfirmDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      if (activeTab === 'staff') {
        await staffService.deleteStaff(itemToDelete.id);
        setStaff(await staffService.getStaff());
      } else {
        await staffService.deleteAttendance(itemToDelete.id);
        setAttendanceRecords(await staffService.getAttendance());
      }
    } catch (error) {
      toast({ title: isUrdu ? 'حذف ناکام' : 'Failed to delete', variant: 'destructive' });
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      setLoading(false);
    }
  };

  const handleAddLeave = async () => {
    if (!currentStaff) return;
    setLoading(true);
    try {
      await staffService.addLeave({
        staffId: currentStaff.id,
        staffName: currentStaff.name,
        ...leaveData,
        date: new Date().toISOString().split('T')[0]
      });
      setLeaves(await staffService.getLeaves());
      setShowLeaveDialog(false);
      setLeaveData({ days: 0, reason: '', type: '' });
    } catch (error) {
      toast({ title: isUrdu ? 'خرابی' : 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeduction = async () => {
    if (!currentStaff) return;
    setLoading(true);
    try {
      await staffService.addDeduction({
        staffId: currentStaff.id,
        staffName: currentStaff.name,
        ...deductionData,
        date: new Date().toISOString().split('T')[0]
      });
      setDeductionRecords(await staffService.getDeductions());
      //   title: isUrdu ? 'کٹوتی درج ہو گئی' : 'Deduction Added',
      //   description: isUrdu 
      //     ? `${currentStaff.name} کی کٹوتی کامیابی سے درج ہو گئی` 
      //     : `Deduction recorded for ${currentStaff.name}`,
      //   variant: 'default'
      // });
      
      setShowDeductionDialog(false);
      setDeductionData({ amount: 0, reason: '' });
    } catch (error) {
      console.error('Failed to add deduction:', error);
      // toast({
      //   title: isUrdu ? 'خرابی' : 'Error',
      //   description: isUrdu 
      //     ? 'کٹوتی درج کرنے میں خرابی آئی ہے' 
      //     : 'Failed to record deduction',
      //   variant: 'destructive'
      // });
    }
  };

  const handleAddSalary = async () => {
    try {
      const updatedSalaries = [...salaryRecords];
      updatedSalaries.push({
        id: Date.now().toString(),
        staffId: currentStaff.id,
        staffName: currentStaff.name,
        ...salaryDataState,
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      });
      
      setSalaryRecords(updatedSalaries);
      localStorage.setItem('pharmacy_salaries', JSON.stringify(updatedSalaries));
      
      // toast({
      //   title: isUrdu ? 'تنخواہ درج ہو گئی' : 'Salary Added',
      //   description: isUrdu 
      //     ? `${currentStaff.name} کی تنخواہ کامیابی سے درج ہو گئی` 
      //     : `Salary recorded for ${currentStaff.name}`,
      //   variant: 'default'
      // });
      
      setShowSalaryDialog(false);
      setSalaryDataState({ amount: 0, bonus: 0, month: '' });
    } catch (error) {
      console.error('Failed to add salary:', error);
      // toast({
      //   title: isUrdu ? 'خرابی' : 'Error',
      //   description: isUrdu 
      //     ? 'تنخواہ درج کرنے میں خرابی آئی ہے' 
      //     : 'Failed to record salary',
      //   variant: 'destructive'
      // });
    }
  };

  const handleDeleteConfirmation = (item: any, type: 'staff' | 'attendance' | 'leave' | 'deduction' | 'salary') => {
    setItemToDelete({ ...item, type });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      if (!itemToDelete) return;
      
      switch (itemToDelete.type) {
        case 'staff':
          const updatedStaff = staff.filter((s: any) => s.id !== itemToDelete.id);
          setStaff(updatedStaff);
          localStorage.setItem('pharmacy_staff', JSON.stringify(updatedStaff));
          break;
        
        case 'attendance':
          const updatedAttendance = attendanceRecords.filter((a: any) => a.id !== itemToDelete.id);
          setAttendanceRecords(updatedAttendance);
          localStorage.setItem('pharmacy_attendance', JSON.stringify(updatedAttendance));
          break;
          
        case 'leave':
          const updatedLeaves = leaveRecords.filter((l: any) => l.id !== itemToDelete.id);
          setLeaveRecords(updatedLeaves);
          localStorage.setItem('pharmacy_leaves', JSON.stringify(updatedLeaves));
          break;
          
        case 'deduction':
          const updatedDeductions = deductionRecords.filter((d: any) => d.id !== itemToDelete.id);
          setDeductionRecords(updatedDeductions);
          localStorage.setItem('pharmacy_deductions', JSON.stringify(updatedDeductions));
          break;
          
        case 'salary':
          const updatedSalaries = salaryRecords.filter((s: any) => s.id !== itemToDelete.id);
          setSalaryRecords(updatedSalaries);
          localStorage.setItem('pharmacy_salaries', JSON.stringify(updatedSalaries));
          break;
      }
      
      // toast({
      //   title: isUrdu ? 'کامیابی' : 'Success',
      //   description: isUrdu 
      //     ? 'ریکارڈ کامیابی سے حذف ہو گیا' 
      //     : 'Record deleted successfully',
      //   variant: 'default'
      // });
    } catch (error) {
      console.error('Failed to delete:', error);
      // toast({
      //   title: isUrdu ? 'خرابی' : 'Error',
      //   description: isUrdu 
      //     ? 'ریکارڈ حذف کرنے میں خرابی آئی ہے' 
      //     : 'Failed to delete record',
      //   variant: 'destructive'
      // });
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportAttendanceReport}>
            <Download className="h-4 w-4 mr-2" />
            {t.exportReport}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">{t.dailyView}</TabsTrigger>
          <TabsTrigger value="monthly">{t.monthlyView}</TabsTrigger>
          <TabsTrigger value="staff">{t.staffManagement}</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <div className="space-y-4">
            {todaysAttendance.map((record) => (
              <div key={`${record.staffId}-${record.date}`} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium">{record.staffName}</h4>
                </div>
                <div className="flex items-center space-x-4">
                  <Button 
                    variant={record.checkIn ? 'outline' : 'default'}
                    onClick={() => handleTimeAction(record, 'checkIn')}
                    disabled={!!record.checkIn || loadingButton === `${record.staffId}-${record.date}-checkIn`}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {record.checkIn || t.checkIn}
                  </Button>
                  <Button 
                    variant={record.checkOut ? 'outline' : 'default'}
                    onClick={() => handleTimeAction(record, 'checkOut')}
                    disabled={!record.checkIn || !!record.checkOut || loadingButton === `${record.staffId}-${record.date}-checkOut`}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {record.checkOut || t.checkOut}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <div className="space-y-4">
            {filteredAttendance.map((record) => {
              const totalDays = getDaysInMonth(new Date(selectedMonth));
              const presentDays = attendanceRecords.filter(
                r => r.staffId === record.staffId && 
                     r.date.startsWith(selectedMonth) && 
                     r.status === 'present'
              ).length;
              const deductions = deductionRecords.filter(
                d => d.staffId === record.staffId && 
                     d.date.startsWith(selectedMonth)
              );
              
              return (
                <div key={`${record.staffId}-${record.date}`} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{record.staffName}</h4>
                      <p className="text-sm text-gray-600">
                        {presentDays}/{totalDays} days present
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">
                      Deductions: {deductions.reduce((sum, d) => sum + d.amount, 0)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {deductions.length} records
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => setShowStaffReport(true)}
                className="w-full sm:w-auto"
              >
                <FileText className="h-4 w-4 mr-2" />
                Staff Report
              </Button>
              <Button 
                onClick={() => setShowStaffForm(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t.addStaff}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staffMember) => (
              <Card key={staffMember.id} className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{staffMember.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{t[staffMember.position as keyof typeof t] || staffMember.position}</p>
                      </div>
                    </div>
                    <Badge variant={staffMember.status === 'active' ? 'default' : 'secondary'}>
                      {staffMember.status === 'active' ? t.active : t.inactive}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">{t.phone}: </span>
                      <span>{staffMember.phone}</span>
                    </div>
                    <div>
                      <span className="font-medium">{t.email}: </span>
                      <span>{staffMember.email}</span>
                    </div>
                    <div>
                      <span className="font-medium">{t.salary}: </span>
                      <span>PKR {parseInt(staffMember.salary).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">{t.joinDate}: </span>
                      <span>{staffMember.joinDate}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="text-xs text-gray-500">ID: {staffMember.id}</span>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" onClick={() => handleEditStaff(staffMember)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRequestDelete(staffMember)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedEmployee(staffMember);
                        setShowProfile(true);
                      }}>
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Leave Deduction (Rs)</Label>
                    <Input 
                      type="number" 
                      value={attendanceSettings.leaveDeduction}
                      onChange={(e) => setAttendanceSettings({
                        ...attendanceSettings,
                        leaveDeduction: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Late Deduction (Rs)</Label>
                    <Input 
                      type="number" 
                      value={attendanceSettings.lateDeduction}
                      onChange={(e) => setAttendanceSettings({
                        ...attendanceSettings,
                        lateDeduction: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Early Out Deduction (Rs)</Label>
                    <Input 
                      type="number" 
                      value={attendanceSettings.earlyOutDeduction}
                      onChange={(e) => setAttendanceSettings({
                        ...attendanceSettings,
                        earlyOutDeduction: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Official Clock-in Time</Label>
                    <Input 
                      type="time" 
                      value={attendanceSettings.clockInTime}
                      onChange={(e) => setAttendanceSettings({
                        ...attendanceSettings,
                        clockInTime: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Official Clock-out Time</Label>
                    <Input 
                      type="time" 
                      value={attendanceSettings.clockOutTime}
                      onChange={(e) => setAttendanceSettings({
                        ...attendanceSettings,
                        clockOutTime: e.target.value
                      })}
                    />
                  </div>
                </div>
                <Button 
                  type="button"
                  onClick={() => {
                    toast({
                      title: 'Settings saved successfully',
                      variant: 'default'
                    });
                  }}
                >
                  Save Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Wrap all modals and dialogs in a fragment to ensure a single root element */}
      <>
        {showAttendanceForm && (
          <AttendanceForm
            isUrdu={isUrdu}
            staffList={staff}
            onClose={() => setShowAttendanceForm(false)}
            onSave={(data) => {
              console.log('Saving attendance data:', data);
              handleAddAttendance(data);
            }}
          />
        )}

        {showStaffForm && (
          <StaffForm
            isUrdu={isUrdu}
            staff={editingStaff}
            onClose={() => {
              setShowStaffForm(false);
              setEditingStaff(null);
            }}
            onSave={async (staffData) => {
              try {
                let savedStaff;
                if (editingStaff) {
                  savedStaff = await handleEditStaff({ ...staffData, id: editingStaff.id });
                } else {
                  savedStaff = await handleSaveStaff(staffData);
                }
                
                // Update local state
                const updatedStaff = editingStaff 
                  ? staff.map(s => s.id === editingStaff.id ? savedStaff : s)
                  : [...staff, savedStaff];
                  
                setStaff(updatedStaff);
                setShowStaffForm(false);
                setEditingStaff(null);
                
                // Show success feedback
                toast({
                  title: editingStaff ? 'Staff updated successfully' : 'Staff added successfully',
                  variant: 'default'
                });
                
              } catch (error) {
                toast({
                  title: 'Failed to save staff',
                  description: error.message,
                  variant: 'destructive'
                });
              }
            }}
          />
        )}

        {showStaffReport && (
          <StaffReport
            isUrdu={isUrdu}
            staffList={staff}
            attendanceRecords={attendanceRecords}
            onClose={() => setShowStaffReport(false)}
          />
        )}

        {showDeleteConfirm && (
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  {itemToDelete?.name ? 
                    `Are you sure you want to delete ${itemToDelete.name}?` :
                    'Are you sure you want to delete this record?'}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    This action requires double verification. Deleting cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmDelete}
                  >
                    First Verification
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={finalConfirmDelete}
                    disabled={!itemToDelete?.verified}
                  >
                    Final Confirm
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {showProfile && selectedEmployee && (
          <Dialog open={showProfile} onOpenChange={setShowProfile}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedEmployee.name}'s Profile</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Total Leaves</h3>
                    <p>{selectedEmployee.totalLeaves || 0}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <Badge variant={selectedEmployee.status === 'Active' ? 'default' : 'destructive'}>
                      {selectedEmployee.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Base Salary</h3>
                    <p>{selectedEmployee.baseSalary?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Total Deductions</h3>
                    <p>{selectedEmployee.totalDeductions?.toLocaleString() || 0}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Net Salary</h3>
                  <p>{(selectedEmployee.baseSalary - selectedEmployee.totalDeductions)?.toLocaleString() || 0}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Clock In/Out History</h3>
                  <div className="space-y-2 mt-2">
                    {selectedEmployee.clockHistory?.map((entry: any) => (
                      <div key={entry.date} className="flex justify-between">
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                        <span>{entry.type}: {entry.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    </div>
  );
};

export default StaffAttendance;