
export interface Medicine {
  id: number;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  batchNo: string;
  expiryDate: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  barcode: string;
  description?: string;
  dosage?: string;
  sideEffects?: string;
}

// Common medicine categories
const categories = [
  'Analgesic', 'Antibiotic', 'Antacid', 'Antihistamine', 'Antidepressant', 
  'Antidiabetic', 'Antihypertensive', 'Antiviral', 'Antiseptic', 'Antipyretic',
  'Steroid', 'Multivitamin', 'Supplement', 'Cardiac', 'Respiratory',
  'Gastrointestinal', 'Dermatological', 'Neurological', 'Hormonal', 'Oncology'
];

// Pakistani and international pharmaceutical companies
const manufacturers = [
  'GSK Pakistan', 'Abbott Laboratories', 'Searle Pakistan', 'Getz Pharma',
  'Pfizer Pakistan', 'Hilton Pharma', 'Sami Pharmaceuticals', 'Bayer Pakistan',
  'CCL Pharmaceuticals', 'Continental Biscuits', 'Martin Dow', 'Novartis Pakistan',
  'Roche Pakistan', 'Bosch Pharmaceuticals', 'ICI Pakistan', 'Zafa Pharmaceutical',
  'Wilshire Pharmaceuticals', 'Shaigan Pharmaceuticals', 'AGP Limited',
  'Barrett Hodgson Pakistan', 'Brookes Pharma', 'Consolidated Pharma'
];

// Common generic names and their brand variations
const genericMedicines = [
  { generic: 'Paracetamol', brands: ['Panadol', 'Calpol', 'Fevadol', 'Disprol', 'Pyrol'] },
  { generic: 'Ibuprofen', brands: ['Brufen', 'Advil', 'Motrin', 'Nurofen', 'Combiflam'] },
  { generic: 'Amoxicillin', brands: ['Augmentin', 'Clavamox', 'Biomox', 'Amoxil', 'Clamoxyl'] },
  { generic: 'Azithromycin', brands: ['Zithromax', 'Azee', 'Azithral', 'Zmax', 'Azicip'] },
  { generic: 'Ciprofloxacin', brands: ['Cipro', 'Cifran', 'Ciplox', 'Ciproxin', 'Floxin'] },
  { generic: 'Omeprazole', brands: ['Losec', 'Prilosec', 'Omez', 'Gastrogyl', 'Zegerid'] },
  { generic: 'Metformin', brands: ['Glucophage', 'Diabex', 'Formet', 'Glynase', 'Metfor'] },
  { generic: 'Atorvastatin', brands: ['Lipitor', 'Atorlip', 'Storvas', 'Atocor', 'Atorva'] },
  { generic: 'Losartan', brands: ['Cozaar', 'Losacar', 'Losarfin', 'Repace', 'Angizaar'] },
  { generic: 'Amlodipine', brands: ['Norvasc', 'Amcard', 'Amlong', 'Stamlo', 'Amlip'] },
  { generic: 'Cetirizine', brands: ['Zyrtec', 'Alerid', 'Cetrine', 'Cetiriz', 'Alzyr'] },
  { generic: 'Loratadine', brands: ['Claritin', 'Lorfast', 'Lorinol', 'Clargem', 'Lomilan'] },
  { generic: 'Salbutamol', brands: ['Ventolin', 'Asthalin', 'Airomir', 'Salamol', 'Proventil'] },
  { generic: 'Prednisolone', brands: ['Predmet', 'Prelone', 'Solupred', 'Predsol', 'Precort'] },
  { generic: 'Diclofenac', brands: ['Voltaren', 'Voveran', 'Diclomax', 'Dicloran', 'Inflam'] },
  { generic: 'Ranitidine', brands: ['Zantac', 'Aciloc', 'Rantac', 'Histac', 'Zinetac'] },
  { generic: 'Domperidone', brands: ['Motilium', 'Domstal', 'Dompan', 'Motinorm', 'Dome'] },
  { generic: 'Loperamide', brands: ['Imodium', 'Lopamide', 'Eldoper', 'Pepto', 'Diacure'] },
  { generic: 'Simvastatin', brands: ['Zocor', 'Simvotin', 'Lipvas', 'Simcard', 'Simchol'] },
  { generic: 'Aspirin', brands: ['Disprin', 'Ecosprin', 'Loprin', 'Cardiprin', 'Aspegic'] }
];

// Dosage forms
const dosageForms = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Suspension'];

// Generate random barcode
const generateBarcode = (): string => {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
};

// Generate random batch number
const generateBatchNo = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  return letters.charAt(Math.floor(Math.random() * letters.length)) +
         Array.from({ length: 5 }, () => numbers.charAt(Math.floor(Math.random() * numbers.length))).join('');
};

// Generate random expiry date between 2025 and 2029
const generateExpiryDate = (): string => {
  const year = 2025 + Math.floor(Math.random() * 5);
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

// Generate medicine database
export const generateMedicineDatabase = (count: number = 20000): Medicine[] => {
  const medicines: Medicine[] = [];
  
  for (let i = 1; i <= count; i++) {
    // Select random generic medicine
    const genericMed = genericMedicines[Math.floor(Math.random() * genericMedicines.length)];
    const brand = genericMed.brands[Math.floor(Math.random() * genericMed.brands.length)];
    
    // Add dosage and form variations
    const dosageForm = dosageForms[Math.floor(Math.random() * dosageForms.length)];
    const dosages = ['250mg', '500mg', '100mg', '50mg', '10mg', '20mg', '40mg', '5ml', '10ml'];
    const dosage = dosages[Math.floor(Math.random() * dosages.length)];
    
    const fullName = `${brand} ${dosage} ${dosageForm}`;
    
    // Generate prices
    const purchasePrice = Math.floor(Math.random() * 500) + 5; // PKR 5-505
    const salePrice = Math.floor(purchasePrice * (1.2 + Math.random() * 0.8)); // 20-100% markup
    
    const medicine: Medicine = {
      id: i,
      name: fullName,
      genericName: genericMed.generic,
      category: categories[Math.floor(Math.random() * categories.length)],
      manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
      batchNo: generateBatchNo(),
      expiryDate: generateExpiryDate(),
      purchasePrice: purchasePrice,
      salePrice: salePrice,
      quantity: Math.floor(Math.random() * 1000) + 10, // 10-1010 quantity
      barcode: generateBarcode(),
      dosage: `${dosage} ${dosageForm}`,
      description: `${genericMed.generic} ${dosage} ${dosageForm} - Used for therapeutic purposes`,
      sideEffects: 'Consult doctor for side effects and precautions'
    };
    
    medicines.push(medicine);
  }
  
  // Add some variations to make it more realistic
  for (let i = 0; i < Math.min(1000, count / 20); i++) {
    const randomIndex = Math.floor(Math.random() * medicines.length);
    medicines[randomIndex].quantity = Math.floor(Math.random() * 10); // Some low stock items
  }
  
  return medicines;
};

// Search medicines by name, generic name, or barcode
export const searchMedicines = (medicines: Medicine[], searchTerm: string): Medicine[] => {
  const term = searchTerm.toLowerCase();
  return medicines.filter(med => 
    med.name.toLowerCase().includes(term) ||
    med.genericName.toLowerCase().includes(term) ||
    med.barcode.includes(term) ||
    med.category.toLowerCase().includes(term) ||
    med.manufacturer.toLowerCase().includes(term)
  );
};

// Get medicines by category
export const getMedicinesByCategory = (medicines: Medicine[], category: string): Medicine[] => {
  return medicines.filter(med => med.category === category);
};

// Get low stock medicines
export const getLowStockMedicines = (medicines: Medicine[], threshold: number = 50): Medicine[] => {
  return medicines.filter(med => med.quantity <= threshold);
};

// Get expiring medicines
export const getExpiringMedicines = (medicines: Medicine[], daysThreshold: number = 90): Medicine[] => {
  const today = new Date();
  const thresholdDate = new Date(today.getTime() + (daysThreshold * 24 * 60 * 60 * 1000));
  
  return medicines.filter(med => {
    const expiryDate = new Date(med.expiryDate);
    return expiryDate <= thresholdDate;
  });
};
