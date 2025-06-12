
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  User,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import AttendanceForm from './AttendanceForm';
import StaffForm from './StaffForm';

interface StaffAttendanceProps {
  isUrdu: boolean;
}

const StaffAttendance: React.FC<StaffAttendanceProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('attendance');

  const [staff, setStaff] = useState([
    {
      id: 1,
      name: 'Dr. Ahmad Hassan',
      position: 'pharmacist',
      phone: '+92-300-1234567',
      email: 'ahmad@pharmacare.com',
      address: 'Gulshan-e-Iqbal, Karachi',
      salary: '85000',
      joinDate: '2020-01-15',
      status: 'active',
      attendanceRecords: [
        { date: '2024-12-01', checkIn: '09:00', checkOut: '18:00', status: 'present' },
        { date: '2024-12-02', checkIn: '09:15', checkOut: '18:00', status: 'late' },
        { date: '2024-12-03', checkIn: '', checkOut: '', status: 'absent' }
      ]
    },
    {
      id: 2,
      name: 'Ms. Fatima Khan',
      position: 'assistant',
      phone: '+92-321-9876543',
      email: 'fatima@pharmacare.com',
      address: 'North Nazimabad, Karachi',
      salary: '45000',
      joinDate: '2021-03-20',
      status: 'active',
      attendanceRecords: [
        { date: '2024-12-01', checkIn: '09:00', checkOut: '17:00', status: 'present' },
        { date: '2024-12-02', checkIn: '09:00', checkOut: '13:00', status: 'halfDay' },
        { date: '2024-12-03', checkIn: '09:00', checkOut: '17:00', status: 'present' }
      ]
    }
  ]);

  const [attendanceRecords, setAttendanceRecords] = useState([
    { id: 1, staffId: 1, staffName: 'Dr. Ahmad Hassan', date: '2024-12-08', checkIn: '09:00', checkOut: '18:00', status: 'present', notes: '' },
    { id: 2, staffId: 2, staffName: 'Ms. Fatima Khan', date: '2024-12-08', checkIn: '09:05', checkOut: '17:00', status: 'late', notes: 'Traffic delay' },
    { id: 3, staffId: 1, staffName: 'Dr. Ahmad Hassan', date: '2024-12-07', checkIn: '', checkOut: '', status: 'absent', notes: 'Sick leave' }
  ]);

  const text = {
    en: {
      title: 'Staff & Attendance',
      attendance: 'Attendance',
      staffManagement: 'Staff Management',
      searchPlaceholder: 'Search staff...',
      addAttendance: 'Mark Attendance',
      addStaff: 'Add Staff',
      exportReport: 'Export Report',
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
      inactive: 'Inactive'
    },
    ur: {
      title: 'عملہ اور حاضری',
      attendance: 'حاضری',
      staffManagement: 'عملے کا انتظام',
      searchPlaceholder: 'عملہ تلاش کریں...',
      addAttendance: 'حاضری درج کریں',
      addStaff: 'عملہ شامل کریں',
      exportReport: 'رپورٹ ایکسپورٹ کریں',
      monthlyView: 'ماہانہ منظر',
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
      inactive: 'غیر فعال'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttendance = attendanceRecords.filter(record =>
    record.date.startsWith(selectedMonth) &&
    (searchTerm === '' || record.staffName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveAttendance = (attendanceData: any) => {
    setAttendanceRecords([...attendanceRecords, { ...attendanceData, id: Date.now() }]);
  };

  const handleSaveStaff = (staffData: any) => {
    if (editingStaff) {
      setStaff(staff.map(s => s.id === staffData.id ? staffData : s));
    } else {
      setStaff([...staff, staffData]);
    }
    setEditingStaff(null);
  };

  const handleEditStaff = (staffMember: any) => {
    setEditingStaff(staffMember);
    setShowStaffForm(true);
  };

  const handleDeleteStaff = (staffId: number) => {
    setStaff(staff.filter(s => s.id !== staffId));
  };

  const exportAttendanceReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Staff Name,Date,Check In,Check Out,Status,Notes\n"
      + filteredAttendance.map(record => 
          `${record.staffName},${record.date},${record.checkIn},${record.checkOut},${record.status},${record.notes}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'halfDay':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "destructive" | "secondary" | "outline" } = {
      present: 'default',
      absent: 'destructive',
      late: 'secondary',
      halfDay: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{t[status as keyof typeof t] || status}</Badge>;
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attendance">{t.attendance}</TabsTrigger>
          <TabsTrigger value="staff">{t.staffManagement}</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40"
              />
              <Button onClick={() => setShowAttendanceForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t.addAttendance}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{t.monthlyView} - {selectedMonth}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{record.staffName}</h4>
                        <p className="text-sm text-gray-600">{record.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="text-gray-600">{t.checkIn}: </span>
                        <span className="font-medium">{record.checkIn || '-'}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">{t.checkOut}: </span>
                        <span className="font-medium">{record.checkOut || '-'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(record.status)}
                        {getStatusBadge(record.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowStaffForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addStaff}
            </Button>
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
                      <Button size="sm" variant="outline" onClick={() => handleDeleteStaff(staffMember.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {showAttendanceForm && (
        <AttendanceForm
          isUrdu={isUrdu}
          onClose={() => setShowAttendanceForm(false)}
          onSave={handleSaveAttendance}
        />
      )}

      {showStaffForm && (
        <StaffForm
          isUrdu={isUrdu}
          onClose={() => {
            setShowStaffForm(false);
            setEditingStaff(null);
          }}
          onSave={handleSaveStaff}
          staff={editingStaff}
        />
      )}
    </div>
  );
};

export default StaffAttendance;
