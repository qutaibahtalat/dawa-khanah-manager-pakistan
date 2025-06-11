
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Clock, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter
} from 'lucide-react';

interface StaffAttendanceProps {
  isUrdu: boolean;
}

const StaffAttendance: React.FC<StaffAttendanceProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const text = {
    en: {
      title: 'Staff Attendance',
      searchPlaceholder: 'Search staff...',
      todayAttendance: "Today's Attendance",
      attendanceReport: 'Attendance Report',
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
      thisMonth: 'This Month'
    },
    ur: {
      title: 'عملے کی حاضری',
      searchPlaceholder: 'عملہ تلاش کریں...',
      todayAttendance: 'آج کی حاضری',
      attendanceReport: 'حاضری کی رپورٹ',
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
      thisMonth: 'اس مہینے'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Sample staff attendance data
  const staffAttendance = [
    {
      id: 1,
      name: 'Dr. Ali Hassan',
      position: 'Manager',
      checkIn: '09:00',
      checkOut: '18:00',
      workingHours: '9h 0m',
      status: 'present',
      branch: 'Main Branch'
    },
    {
      id: 2,
      name: 'Ahmad Raza',
      position: 'Pharmacist',
      checkIn: '09:15',
      checkOut: '17:45',
      workingHours: '8h 30m',
      status: 'late',
      branch: 'Main Branch'
    },
    {
      id: 3,
      name: 'Fatima Ali',
      position: 'Sales Assistant',
      checkIn: '09:00',
      checkOut: '13:00',
      workingHours: '4h 0m',
      status: 'halfDay',
      branch: 'Main Branch'
    },
    {
      id: 4,
      name: 'Hassan Sheikh',
      position: 'Inventory Manager',
      checkIn: '',
      checkOut: '',
      workingHours: '0h 0m',
      status: 'absent',
      branch: 'DHA Branch'
    }
  ];

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
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            {t.filter}
          </Button>
          <Button variant="outline">
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

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>{t.todayAttendance}</span>
          </CardTitle>
        </CardHeader>
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
                
                <div className="grid grid-cols-4 gap-4 text-center">
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
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffAttendance;
