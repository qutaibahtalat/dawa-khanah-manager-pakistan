
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Clock, Save } from 'lucide-react';

interface AttendanceFormProps {
  isUrdu: boolean;
  onClose: () => void;
  onSave: (attendance: any) => void;
  staff?: any;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({ isUrdu, onClose, onSave, staff }) => {
  const [formData, setFormData] = useState({
    staffId: staff?.id || '',
    staffName: staff?.name || '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present',
    notes: ''
  });

  const text = {
    en: {
      title: 'Mark Attendance',
      staffName: 'Staff Name',
      date: 'Date',
      checkIn: 'Check In Time',
      checkOut: 'Check Out Time',
      status: 'Status',
      notes: 'Notes',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      halfDay: 'Half Day',
      save: 'Save',
      cancel: 'Cancel'
    },
    ur: {
      title: 'حاضری درج کریں',
      staffName: 'عملے کا نام',
      date: 'تاریخ',
      checkIn: 'آمد کا وقت',
      checkOut: 'رخصت کا وقت',
      status: 'حالت',
      notes: 'نوٹس',
      present: 'حاضر',
      absent: 'غائب',
      late: 'دیر',
      halfDay: 'آدھا دن',
      save: 'محفوظ کریں',
      cancel: 'منسوخ'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t.title}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t.staffName}</Label>
              <Input
                value={formData.staffName}
                onChange={(e) => setFormData({...formData, staffName: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label>{t.date}</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.checkIn}</Label>
                <Input
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                />
              </div>
              <div>
                <Label>{t.checkOut}</Label>
                <Input
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label>{t.status}</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">{t.present}</SelectItem>
                  <SelectItem value="absent">{t.absent}</SelectItem>
                  <SelectItem value="late">{t.late}</SelectItem>
                  <SelectItem value="halfDay">{t.halfDay}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {t.save}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                {t.cancel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceForm;
