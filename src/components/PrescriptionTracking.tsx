
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PrescriptionForm from './PrescriptionForm';
import { 
  FileText, 
  Upload, 
  Search, 
  Calendar,
  User,
  Pill,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Edit,
  Plus
} from 'lucide-react';

interface PrescriptionTrackingProps {
  isUrdu: boolean;
}

const PrescriptionTracking: React.FC<PrescriptionTrackingProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<any>(null);

  const text = {
    en: {
      title: 'Prescription Tracking',
      searchPlaceholder: 'Search by patient name, doctor, or prescription ID...',
      addPrescription: 'Add Prescription',
      prescriptionDetails: 'Prescription Details',
      patientName: 'Patient Name',
      doctorName: 'Doctor Name',
      prescriptionDate: 'Date',
      status: 'Status',
      medicines: 'Medicines',
      dosage: 'Dosage',
      instructions: 'Instructions',
      uploadImage: 'Upload Image',
      pending: 'Pending',
      dispensed: 'Dispensed',
      partial: 'Partial',
      completed: 'Completed',
      view: 'View',
      edit: 'Edit',
      dispense: 'Dispense',
      print: 'Print',
      download: 'Download'
    },
    ur: {
      title: 'نسخے کی ٹریکنگ',
      searchPlaceholder: 'مریض کے نام، ڈاکٹر، یا نسخہ آئی ڈی سے تلاش کریں...',
      addPrescription: 'نسخہ شامل کریں',
      prescriptionDetails: 'نسخے کی تفصیلات',
      patientName: 'مریض کا نام',
      doctorName: 'ڈاکٹر کا نام',
      prescriptionDate: 'تاریخ',
      status: 'حالت',
      medicines: 'ادویات',
      dosage: 'خوراک',
      instructions: 'ہدایات',
      uploadImage: 'تصویر اپ لوڈ',
      pending: 'زیر التوا',
      dispensed: 'دیا گیا',
      partial: 'جزوی',
      completed: 'مکمل',
      view: 'دیکھیں',
      edit: 'تبدیل کریں',
      dispense: 'دیں',
      print: 'پرنٹ',
      download: 'ڈاؤن لوڈ'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Sample prescription data with state management
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 'RX001',
      patientName: 'Ahmed Hassan',
      doctorName: 'Dr. Sarah Khan',
      date: '2024-12-10',
      status: 'pending',
      medicines: [
        { name: 'Augmentin 625mg', dosage: '1 tablet twice daily', quantity: 10 },
        { name: 'Panadol Extra', dosage: '1 tablet when needed', quantity: 20 }
      ],
      instructions: 'Take with food. Complete the course.',
      imageUrl: null
    },
    {
      id: 'RX002',
      patientName: 'Fatima Ali',
      doctorName: 'Dr. Ahmed Malik',
      date: '2024-12-09',
      status: 'dispensed',
      medicines: [
        { name: 'Brufen 400mg', dosage: '1 tablet three times daily', quantity: 15 }
      ],
      instructions: 'Take after meals for 5 days.',
      imageUrl: null
    }
  ]);

  const handleAddPrescription = (prescriptionData: any) => {
    setPrescriptions(prev => [...prev, prescriptionData]);
    console.log('Prescription added:', prescriptionData);
  };

  const handleEditPrescription = (prescriptionData: any) => {
    setPrescriptions(prev => prev.map(p => 
      p.id === prescriptionData.id ? prescriptionData : p
    ));
    console.log('Prescription updated:', prescriptionData);
  };

  const downloadPrescription = (prescription: any) => {
    // Create a simple text format for download
    const content = `
PRESCRIPTION - ${prescription.id}
==============================
Patient: ${prescription.patientName}
Doctor: ${prescription.doctorName}
Date: ${prescription.date}
Status: ${prescription.status}

MEDICINES:
${prescription.medicines.map((med: any) => 
  `- ${med.name}\n  Dosage: ${med.dosage}\n  Quantity: ${med.quantity}`
).join('\n')}

INSTRUCTIONS:
${prescription.instructions}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prescription_${prescription.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'dispensed': return 'default';
      case 'partial': return 'outline';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'dispensed': return CheckCircle;
      case 'partial': return AlertCircle;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t.addPrescription}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => {
              const StatusIcon = getStatusIcon(prescription.status);
              return (
                <Card key={prescription.id} className="cursor-pointer hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-lg">{prescription.id}</h3>
                          <Badge variant={getStatusColor(prescription.status) as any}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {t[prescription.status as keyof typeof t] || prescription.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{prescription.patientName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{prescription.doctorName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{prescription.date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Pill className="h-4 w-4 text-gray-400" />
                            <span>{prescription.medicines.length} medicines</span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">
                          <strong>{t.medicines}:</strong> {prescription.medicines.map(m => m.name).join(', ')}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedPrescription(prescription)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingPrescription(prescription)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => downloadPrescription(prescription)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {selectedPrescription && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t.prescriptionDetails}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="medicines">Medicines</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="space-y-3 text-sm">
                      <div>
                        <label className="font-medium">{t.patientName}:</label>
                        <p>{selectedPrescription.patientName}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.doctorName}:</label>
                        <p>{selectedPrescription.doctorName}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.prescriptionDate}:</label>
                        <p>{selectedPrescription.date}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.instructions}:</label>
                        <p>{selectedPrescription.instructions}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="medicines">
                    <div className="space-y-3">
                      {selectedPrescription.medicines.map((medicine: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium">{medicine.name}</p>
                          <p className="text-sm text-gray-600">{medicine.dosage}</p>
                          <p className="text-xs text-gray-500">Qty: {medicine.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add Prescription Form */}
      {showAddForm && (
        <PrescriptionForm
          isUrdu={isUrdu}
          onClose={() => setShowAddForm(false)}
          onSave={handleAddPrescription}
        />
      )}

      {/* Edit Prescription Form */}
      {editingPrescription && (
        <PrescriptionForm
          isUrdu={isUrdu}
          onClose={() => setEditingPrescription(null)}
          onSave={handleEditPrescription}
          prescription={editingPrescription}
        />
      )}
    </div>
  );
};

export default PrescriptionTracking;
