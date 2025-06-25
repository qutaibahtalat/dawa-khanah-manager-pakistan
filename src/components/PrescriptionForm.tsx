
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface PrescriptionFormProps {
  isUrdu: boolean;
  onClose: () => void;
  onSave: (prescription: any) => void;
  prescription?: any;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ isUrdu, onClose, onSave, prescription }) => {
  const [formData, setFormData] = useState({
    patientName: prescription?.patientName || '',
    doctorName: prescription?.doctorName || '',
    date: prescription?.date || new Date().toISOString().split('T')[0],
    medicines: prescription?.medicines || [{ name: '', dosage: '', quantity: 1 }],
    instructions: prescription?.instructions || ''
  });

  const text = {
    en: {
      title: prescription ? 'Edit Prescription' : 'Add Prescription',
      patientName: 'Patient Name',
      doctorName: 'Doctor Name',
      date: 'Date',
      medicines: 'Medicines',
      medicineName: 'Medicine Name',
      dosage: 'Dosage',
      quantity: 'Quantity',
      instructions: 'Instructions',
      addMedicine: 'Add Medicine',
      save: 'Save',
      cancel: 'Cancel'
    },
    ur: {
      title: prescription ? 'نسخہ تبدیل کریں' : 'نسخہ شامل کریں',
      patientName: 'مریض کا نام',
      doctorName: 'ڈاکٹر کا نام',
      date: 'تاریخ',
      medicines: 'ادویات',
      medicineName: 'دوا کا نام',
      dosage: 'خوراک',
      quantity: 'مقدار',
      instructions: 'ہدایات',
      addMedicine: 'دوا شامل کریں',
      save: 'محفوظ کریں',
      cancel: 'منسوخ'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', quantity: 1 }]
    }));
  };

  const removeMedicine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const updateMedicine = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const newMedicines = [...prev.medicines];
      newMedicines[index] = {
        ...newMedicines[index],
        [field]: field === 'quantity' ? (Number(value) || 0) : value
      };
      return {
        ...prev,
        medicines: newMedicines
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prescriptionData = {
      ...formData,
      id: prescription?.id || `RX${Date.now()}`,
      status: prescription?.status || 'pending'
    };
    onSave(prescriptionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t.patientName}</Label>
                <Input
                  value={formData.patientName}
                  onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>{t.doctorName}</Label>
                <Input
                  value={formData.doctorName}
                  onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                  required
                />
              </div>
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>{t.medicines}</Label>
                <Button type="button" variant="outline" size="sm" onClick={addMedicine}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t.addMedicine}
                </Button>
              </div>
              
              {formData.medicines.map((medicine, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-5">
                    <Input
                      placeholder={t.medicineName}
                      value={medicine.name}
                      onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      placeholder={t.dosage}
                      value={medicine.dosage}
                      onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder={t.quantity}
                      value={medicine.quantity}
                      onChange={(e) => updateMedicine(index, 'quantity', parseInt(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeMedicine(index)}
                      disabled={formData.medicines.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Label>{t.instructions}</Label>
              <Textarea
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                rows={3}
              />
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

export default PrescriptionForm;
