// Minimal backend API client for staff/attendance management
// All methods async, no localStorage/IndexedDB, network-synced
// getBackendBaseUrl is not exported from backend.ts; define it here for compatibility
function getBackendBaseUrl() {
  // Use proxy path configured in vite.config.ts
  return '/api';
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

export interface Staff {
  id: string | number;
  name: string;
  position: string;
  phone: string;
  email: string;
  address: string;
  salary: string;
  joinDate: string;
  status: string;
  attendanceRecords?: any[];
}

export interface AttendanceRecord {
  id: string | number;
  staffId: string | number;
  staffName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  notes?: string;
}

export interface LeaveRecord {
  id: string | number;
  staffId: string | number;
  staffName: string;
  days: number;
  reason: string;
  type: string;
  date: string;
}

export interface DeductionRecord {
  id: string | number;
  staffId: string | number;
  staffName: string;
  amount: number;
  reason: string;
  date: string;
}

export const staffService = {
  async getStaff(): Promise<Staff[]> {
    const res = await fetch(`${getBackendBaseUrl()}/staff`, { headers: defaultHeaders });
    if (!res.ok) throw new Error('Failed to fetch staff');
    return res.json();
  },
  async addStaff(staff: Omit<Staff, 'id'>): Promise<Staff> {
    console.log('Making API request to:', `${getBackendBaseUrl()}/staff`);
    console.log('Request payload:', staff);
    
    try {
      const res = await fetch(`${getBackendBaseUrl()}/staff`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(staff)
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('API Error:', {
          url: res.url,
          status: res.status,
          error: errorData
        });
        throw new Error(errorData.message || `API request failed with status ${res.status}`);
      }
      
      const responseData = await res.json();
      console.log('API Success:', responseData);
      return responseData;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  },
  async updateStaff(staff: Staff): Promise<Staff> {
    const res = await fetch(`${getBackendBaseUrl()}/staff/${staff.id}` ,{
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(staff)
    });
    if (!res.ok) throw new Error('Failed to update staff');
    return res.json();
  },
  async deleteStaff(id: string | number): Promise<void> {
    const res = await fetch(`${getBackendBaseUrl()}/staff/${id}`, { method: 'DELETE', headers: defaultHeaders });
    if (!res.ok) throw new Error('Failed to delete staff');
  },
  async getAttendance(): Promise<AttendanceRecord[]> {
    const res = await fetch(`${getBackendBaseUrl()}/attendance`, { headers: defaultHeaders });
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },
  async addAttendance(record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
    const res = await fetch(`${getBackendBaseUrl()}/attendance`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(record)
    });
    if (!res.ok) throw new Error('Failed to add attendance');
    return res.json();
  },
  async updateAttendance(record: AttendanceRecord): Promise<AttendanceRecord> {
    const res = await fetch(`${getBackendBaseUrl()}/attendance/${record.id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(record)
    });
    if (!res.ok) throw new Error('Failed to update attendance');
    return res.json();
  },
  async deleteAttendance(id: string | number): Promise<void> {
    const res = await fetch(`${getBackendBaseUrl()}/attendance/${id}`, { method: 'DELETE', headers: defaultHeaders });
    if (!res.ok) throw new Error('Failed to delete attendance');
  },
  async getLeaves(): Promise<LeaveRecord[]> {
    const res = await fetch(`${getBackendBaseUrl()}/leaves`, { headers: defaultHeaders });
    if (!res.ok) throw new Error('Failed to fetch leaves');
    return res.json();
  },
  async addLeave(record: Omit<LeaveRecord, 'id'>): Promise<LeaveRecord> {
    const res = await fetch(`${getBackendBaseUrl()}/leaves`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(record)
    });
    if (!res.ok) throw new Error('Failed to add leave');
    return res.json();
  },
  async getDeductions(): Promise<DeductionRecord[]> {
    const res = await fetch(`${getBackendBaseUrl()}/deductions`, { headers: defaultHeaders });
    if (!res.ok) throw new Error('Failed to fetch deductions');
    return res.json();
  },
  async addDeduction(record: Omit<DeductionRecord, 'id'>): Promise<DeductionRecord> {
    const res = await fetch(`${getBackendBaseUrl()}/deductions`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(record)
    });
    if (!res.ok) throw new Error('Failed to add deduction');
    return res.json();
  }
};
