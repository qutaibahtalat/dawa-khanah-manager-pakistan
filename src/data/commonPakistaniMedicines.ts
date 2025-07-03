interface CommonMedicine {
  name: string;
  genericName: string;
  manufacturer?: string;
  category?: string;
}

const commonPakistaniMedicines: CommonMedicine[] = [
  { name: 'Panadol', genericName: 'Paracetamol', category: 'Analgesic' },
  { name: 'Brufen', genericName: 'Ibuprofen', category: 'Analgesic' },
  { name: 'Augmentin', genericName: 'Amoxicillin + Clavulanate', category: 'Antibiotic' },
  { name: 'Zithromax', genericName: 'Azithromycin', category: 'Antibiotic' },
  { name: 'Ciproxin', genericName: 'Ciprofloxacin', category: 'Antibiotic' },
  { name: 'Omez', genericName: 'Omeprazole', category: 'Antacid' },
  { name: 'Glucophage', genericName: 'Metformin', category: 'Antidiabetic' },
  { name: 'Lipitor', genericName: 'Atorvastatin', category: 'Cardiovascular' },
  { name: 'Cozaar', genericName: 'Losartan', category: 'Antihypertensive' },
  { name: 'Norvasc', genericName: 'Amlodipine', category: 'Antihypertensive' },
  { name: 'Zyrtec', genericName: 'Cetirizine', category: 'Antihistamine' },
  { name: 'Claritin', genericName: 'Loratadine', category: 'Antihistamine' },
  { name: 'Ventolin', genericName: 'Salbutamol', category: 'Respiratory' },
  { name: 'Predmet', genericName: 'Prednisolone', category: 'Steroid' },
  { name: 'Voltaren', genericName: 'Diclofenac', category: 'Analgesic' },
  { name: 'Zantac', genericName: 'Ranitidine', category: 'Antacid' },
  { name: 'Motilium', genericName: 'Domperidone', category: 'Gastrointestinal' },
  { name: 'Imodium', genericName: 'Loperamide', category: 'Gastrointestinal' },
  { name: 'Zocor', genericName: 'Simvastatin', category: 'Cardiovascular' },
  { name: 'Disprin', genericName: 'Aspirin', category: 'Analgesic' },
  { name: 'Arinac', genericName: 'Ibuprofen + Pseudoephedrine', category: 'Analgesic' },
  { name: 'Flagyl', genericName: 'Metronidazole', category: 'Antibiotic' },
  { name: 'Avil', genericName: 'Pheniramine', category: 'Antihistamine' },
  { name: 'Risek', genericName: 'Omeprazole', category: 'Antacid' },
  { name: 'Nims', genericName: 'Nimesulide', category: 'Analgesic' },
  { name: 'Calpol', genericName: 'Paracetamol', category: 'Analgesic' },
  { name: 'Combiflam', genericName: 'Ibuprofen + Paracetamol', category: 'Analgesic' },
  { name: 'Seclo', genericName: 'Omeprazole', category: 'Antacid' },
  { name: 'Cipralex', genericName: 'Escitalopram', category: 'Antidepressant' },
  { name: 'Xanax', genericName: 'Alprazolam', category: 'Antidepressant' }
];

export default commonPakistaniMedicines;
