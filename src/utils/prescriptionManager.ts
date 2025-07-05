
export interface Prescription {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female';
  doctorName: string;
  doctorLicense: string;
  hospitalName: string;
  prescriptionDate: string;
  medicines: PrescriptionMedicine[];
  diagnosis: string;
  instructions: string;
  status: 'pending' | 'partial' | 'completed';
  customerId?: string;
  dispensedBy?: string;
  dispensedDate?: string;
  imageUrl?: string;
}

export interface PrescriptionMedicine {
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  dispensed: number;
  instructions: string;
}

function getBackendBaseUrl() {
  // @ts-ignore
  if (window?.electronAPI?.getBackendBaseUrl) {
    // @ts-ignore
    return window.electronAPI.getBackendBaseUrl();
  }
  return 'http://localhost:3001/api';
}

class PrescriptionManager {
  async getAllPrescriptions(): Promise<Prescription[]> {
    const res = await fetch(`${getBackendBaseUrl()}/prescriptions`);
    return res.json();
  }

  async savePrescription(prescription: Prescription): Promise<boolean> {
    if (prescription.id) {
      // Update existing
      await fetch(`${getBackendBaseUrl()}/prescriptions/${prescription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescription)
      });
      return true;
    } else {
      // Create new
      await fetch(`${getBackendBaseUrl()}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescription)
      });
      return true;
    }
  }

  async getPrescription(id: string): Promise<Prescription | null> {
    const prescriptions = await this.getAllPrescriptions();
    return prescriptions.find(p => p.id === id) || null;
  }

  async getCustomerPrescriptions(customerId: string): Promise<Prescription[]> {
    const prescriptions = await this.getAllPrescriptions();
    return prescriptions.filter(p => p.customerId === customerId);
  }

  async dispenseMedicine(prescriptionId: string, medicineIndex: number, quantity: number): Promise<boolean> {
    try {
      const prescription = await this.getPrescription(prescriptionId);
      if (!prescription) return false;

      if (medicineIndex < 0 || medicineIndex >= prescription.medicines.length) return false;

      const medicine = prescription.medicines[medicineIndex];
      if (medicine.dispensed + quantity > medicine.quantity) return false;

      medicine.dispensed += quantity;
      
      // Update prescription status
      const allDispensed = prescription.medicines.every(m => m.dispensed === m.quantity);
      const partiallyDispensed = prescription.medicines.some(m => m.dispensed > 0);
      
      if (allDispensed) {
        prescription.status = 'completed';
        prescription.dispensedDate = new Date().toISOString();
      } else if (partiallyDispensed) {
        prescription.status = 'partial';
      }

      return await this.savePrescription(prescription);
    } catch {
      return false;
    }
  }

  async searchPrescriptions(searchTerm: string): Promise<Prescription[]> {
    const prescriptions = await this.getAllPrescriptions();
    const term = searchTerm.toLowerCase();
    
    return prescriptions.filter(p => 
      p.patientName.toLowerCase().includes(term) ||
      p.doctorName.toLowerCase().includes(term) ||
      p.hospitalName.toLowerCase().includes(term) ||
      p.diagnosis.toLowerCase().includes(term) ||
      p.medicines.some(m => 
        m.name.toLowerCase().includes(term) ||
        m.genericName.toLowerCase().includes(term)
      )
    );
  }

  async getPendingPrescriptions(): Promise<Prescription[]> {
    const prescriptions = await this.getAllPrescriptions();
    return prescriptions.filter(p => p.status === 'pending');
  }

  async getExpiringPrescriptions(days: number = 30): Promise<Prescription[]> {
    const prescriptions = await this.getAllPrescriptions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return prescriptions.filter(p => {
      const prescriptionDate = new Date(p.prescriptionDate);
      return prescriptionDate >= cutoffDate && p.status !== 'completed';
    });
  }

  validateDoctorLicense(license: string): boolean {
    // In a real app, this would validate against DRAP database
    // For now, we'll do basic format validation
    const licensePattern = /^[A-Z]{2}\d{4,6}$/;
    return licensePattern.test(license);
  }

  generatePrescriptionReport(prescriptions: Prescription[]) {
    const total = prescriptions.length;
    const completed = prescriptions.filter(p => p.status === 'completed').length;
    const pending = prescriptions.filter(p => p.status === 'pending').length;
    const partial = prescriptions.filter(p => p.status === 'partial').length;
    
    const topMedicines = this.getTopPrescribedMedicines(prescriptions);
    const topDoctors = this.getTopPrescribingDoctors(prescriptions);
    
    return {
      summary: {
        total,
        completed,
        pending,
        partial,
        completionRate: total > 0 ? (completed / total * 100).toFixed(1) : '0'
      },
      topMedicines,
      topDoctors
    };
  }

  private getTopPrescribedMedicines(prescriptions: Prescription[]) {
    const medicineCount: { [key: string]: number } = {};
    
    prescriptions.forEach(p => {
      p.medicines.forEach(m => {
        medicineCount[m.name] = (medicineCount[m.name] || 0) + m.quantity;
      });
    });
    
    return Object.entries(medicineCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }

  private getTopPrescribingDoctors(prescriptions: Prescription[]) {
    const doctorCount: { [key: string]: number } = {};
    
    prescriptions.forEach(p => {
      doctorCount[p.doctorName] = (doctorCount[p.doctorName] || 0) + 1;
    });
    
    return Object.entries(doctorCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }

  async deletePrescription(id: string): Promise<boolean> {
    try {
      await fetch(`${getBackendBaseUrl()}/prescriptions/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      return false;
    }
  }
}

export const prescriptionManager = new PrescriptionManager();
