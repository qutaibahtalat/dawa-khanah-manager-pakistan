import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApi } from '@/api/backend';

interface UserProfileProps {
  user: any;
  isUrdu: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, isUrdu, onClose }) => {
  const text = {
    en: {
      profile: 'Profile',
      attendance: 'Attendance',
      clockIn: 'Clock In',
      clockOut: 'Clock Out',
      monthlyAttendance: 'Monthly Attendance',
      deductions: 'Deductions',
      close: 'Close'
    },
    ur: {
      profile: 'پروفائل',
      attendance: 'حاضری',
      clockIn: 'کلاک ان',
      clockOut: 'کلاک آؤٹ',
      monthlyAttendance: 'ماہانہ حاضری',
      deductions: 'کٹوتیاں',
      close: 'بند کریں'
    }
  };

  const t = isUrdu ? text.ur : text.en;
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Fetch monthly attendance on mount and when month/year changes
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch(`/api/attendance/monthly?userId=${user.id}&month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`);
        const data = await response.json();
        setAttendanceRecords(data);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      }
    };
    
    if (user.id) {
      fetchAttendance();
    }
  }, [user.id, currentDate]);

  const handleClockIn = async () => {
    try {
      const response = await fetch('/api/attendance/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (response.ok) {
        alert('Clocked in successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Clock in error:', error);
      alert('Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      const response = await fetch('/api/attendance/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (response.ok) {
        alert('Clocked out successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Clock out error:', error);
      alert('Failed to clock out');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">{t.profile}</TabsTrigger>
            <TabsTrigger value="attendance">{t.attendance}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            {/* Profile details here */}
            <p>{user.name}</p>
            <p>{user.role}</p>
          </TabsContent>
          
          <TabsContent value="attendance">
            <div className="flex gap-2 mb-4">
              <Button onClick={handleClockIn}>{t.clockIn}</Button>
              <Button onClick={handleClockOut}>{t.clockOut}</Button>
            </div>
            
            <h3 className="text-lg font-semibold">{t.monthlyAttendance}</h3>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>{record.clockIn}</td>
                    <td>{record.clockOut || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>{t.close}</Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
