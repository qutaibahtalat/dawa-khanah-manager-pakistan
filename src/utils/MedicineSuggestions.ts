import Papa from 'papaparse';

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  strength: string;
  form: string;
}

let medicineDatabase: Medicine[] = [];

export const loadMedicineDatabase = async (filePath: string): Promise<void> => {
  try {
    console.log('Loading medicine database from:', filePath);
    const response = await fetch(filePath);
    const text = await response.text();
    console.log('CSV content length:', text.length);
    
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('Parsed medicines count:', results.data.length);
        medicineDatabase = results.data.map((med: any, index: number) => ({
          id: `med-${index}`,
          name: med.name || '',
          genericName: med.genericName || '',
          manufacturer: med.manufacturer || '',
          strength: med.strength || '',
          form: med.form || ''
        }));
      }
    });
  } catch (error) {
    console.error('Error loading medicine database:', error);
  }
};

export const getMedicineSuggestions = (query: string, limit = 5): Medicine[] => {
  if (!query || !medicineDatabase.length) return [];
  
  const lowerQuery = query.toLowerCase();
  return medicineDatabase
    .filter(med => 
      med.name.toLowerCase().includes(lowerQuery) ||
      med.genericName.toLowerCase().includes(lowerQuery)
    )
    .slice(0, limit);
};
