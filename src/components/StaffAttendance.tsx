import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AttendanceForm from './AttendanceForm';
import { 
  Search, 
  Clock, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  Plus,
  Edit
} from 'lucide-react';

interface StaffAttendanceProps {
  isUrdu: boolean;
}

const StaffAttendance: React.FC<StaffAttendanceProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const text = {
    en: {
      title: 'Staff Attendance',
      searchPlaceholder: 'Search staff...',
      todayAttendance: "Today's Attendance",
      monthlyAttendance: 'Monthly Attendance',
      attendanceReport: 'Attendance Report',
      markAttendance: 'Mark Attendance',
      clockIn: 'Clock In',
      clockOut: 'Clock Out',
      staffName: 'Staff Name',
      position: 'Position',
      checkIn: 'Check In',
      checkOut: 'Check Out',
      workingHours: 'Working Hours',
      status: 'Status',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      halfDay: 'Half Day',
      export: 'Export Report',
      filter: 'Filter',
      total: 'Total',
      onTime: 'On Time',
      thisMonth: 'This Month',
      edit: 'Edit'
    },
    ur: {
      title: 'عملے کی حاضری',
      searchPlaceholder: 'عملہ تلاش کریں...',
      todayAttendance: 'آج کی حاضری',
      monthlyAttendance: 'ماہانہ حاضری',
      attendanceReport: 'حاضری کی رپورٹ',
      markAttendance: 'حاضری درج کریں',
      clockIn: 'آمد',
      clockOut: 'رخصت',
      staffName: 'عملے کا نام',
      position: 'عہدہ',
      checkIn: 'آمد کا وقت',
      checkOut: 'رخصت کا وقت',
      workingHours: 'کام کے گھنٹے',
      status: 'حالت',
      present: 'حاضر',
      absent: 'غائب',
      late: 'دیر',
      halfDay: 'آدھا دن',
      export: 'رپورٹ ایکسپورٹ',
      filter: 'فلٹر',
      total: 'کل',
      onTime: 'وقت پر',
      thisMonth: 'اس مہینے',
      edit: 'تبدیل کریں'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Sample staff data
  const staffList = [
    { id: 1, name: 'Dr. Ali Hassan', position: 'Manager', branch: 'Main Branch' },
    { id: 2, name: 'Ahmad Raza', position: 'Pharmacist', branch: 'Main Branch' },
    { id: 3, name: 'Fatima Ali', position: 'Sales Assistant', branch: 'Main Branch' },
    { id: 4, name: 'Hassan Sheikh', position: 'Inventory Manager', branch: 'DHA Branch' }
  ];

  // Initialize with sample attendance data
  const [staffAttendance, setStaffAttendance] = useState([
    {
      id: 1,
      name: 'Dr. Ali Hassan',
      position: 'Manager',
      checkIn: '09:00',
      checkOut: '18:00',
      workingHours: '9h 0m',
      status: 'present',
      branch: 'Main Branch',
      date: selectedDate
    },
    {
      id: 2,
      name: 'Ahmad Raza',
      position: 'Pharmacist',
      checkIn: '09:15',
      checkOut: '17:45',
      workingHours: '8h 30m',
      status: 'late',
      branch: 'Main Branch',
      date: selectedDate
    }
  ]);

  const handleSaveAttendance = (attendance: any) => {
    const newAttendance = {
      ...attendance,
      id: Date.now(),
      workingHours: calculateWorkingHours(attendance.checkIn, attendance.checkOut)
    };
    
    setStaffAttendance(prev => [...prev, newAttendance]);
    console.log('Attendance saved:', newAttendance);
  };

  const calculateWorkingHours = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return '0h 0m';
    
    const start = new Date(`2000-01-01T${checkIn}`);
    const end = new Date(`2000-01-01T${checkOut}`);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    const hours = Math.floor(diff);
    const minutes = Math.floor((diff - hours) * 60);
    
    return `${hours}h ${minutes}m`;
  };

  const exportAttendance = () => {
    const data = staffAttendance.map(record => ({
      Name: record.name,
      Position: record.position,
      Date: record.date || selectedDate,
      CheckIn: record.checkIn,
      CheckOut: record.checkOut,
      WorkingHours: record.workingHours,
      Status: record.status
    }));

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t.present}</Badge>;
      case 'absent':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t.absent}</Badge>;
      case 'late':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />{t.late}</Badge>;
      case 'halfDay':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />{t.halfDay}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredStaff = staffAttendance.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = staffAttendance.filter(s => s.status === 'present').length;
  const absentCount = staffAttendance.filter(s => s.status === 'absent').length;
  const lateCount = staffAttendance.filter(s => s.status === 'late').length;
  const totalStaff = staffAttendance.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setShowAttendanceForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t.markAttendance}
          </Button>
          <Button variant="outline" onClick={exportAttendance}>
            <Download className="h-4 w-4 mr-2" />
            {t.export}
          </Button>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalStaff}</p>
                <p className="text-sm text-gray-600">{t.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                <p className="text-sm text-gray-600">{t.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                <p className="text-sm text-gray-600">{t.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
                <p className="text-sm text-gray-600">{t.late}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Daily and Monthly View */}
      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">{t.todayAttendance}</TabsTrigger>
          <TabsTrigger value="monthly">{t.monthlyAttendance}</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          {/* Search and Date Filter */}
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
          </div>

          {/* Daily Attendance Table */}
          <Card>
            <CardContent>
              <div className="space-y-4">
                {filteredStaff.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{staff.name}</h3>
                        <p className="text-sm text-gray-600">{staff.position}</p>
                        <p className="text-xs text-gray-500">{staff.branch}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4 text-center items-center">
                      <div>
                        <p className="text-sm font-medium">{staff.checkIn || '--'}</p>
                        <p className="text-xs text-gray-500">{t.checkIn}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{staff.checkOut || '--'}</p>
                        <p className="text-xs text-gray-500">{t.checkOut}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{staff.workingHours}</p>
                        <p className="text-xs text-gray-500">{t.workingHours}</p>
                      </div>
                      <div>
                        {getStatusBadge(staff.status)}
                      </div>
                      <div>
                        <Button size="sm" variant="outline" onClick={() => {
                          setSelectedStaff(staff);
                          setShowAttendanceForm(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="flex space-x-4">
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-48"
            />
          </div>
          
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-600">Monthly attendance summary for {selectedMonth}</p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">22</p>
                  <p className="text-sm text-gray-600">Present Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">3</p>
                  <p className="text-sm text-gray-600">Absent Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">2</p>
                  <p className="text-sm text-gray-600">Late Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">88%</p>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Attendance Form Modal */}
      {showAttendanceForm && (
        <AttendanceForm
          isUrdu={isUrdu}
          onClose={() => {
            setShowAttendanceForm(false);
            setSelectedStaff(null);
          }}
          onSave={handleSaveAttendance}
          staff={selectedStaff}
        />
      )}
    </div>
  );
};

export default StaffAttendance;
