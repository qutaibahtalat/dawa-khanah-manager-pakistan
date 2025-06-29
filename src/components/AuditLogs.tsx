
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Search, 
  Filter,
  Calendar,
  User,
  Activity,
  Loader2
} from 'lucide-react';
import { reportExporter } from '@/utils/reportExporter';
import { toast } from '@/components/ui/use-toast';

interface AuditLogsProps {
  isUrdu: boolean;
}

const AuditLogs: React.FC<AuditLogsProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const text = {
    en: {
      title: 'Audit Logs',
      searchPlaceholder: 'Search logs...',
      user: 'User',
      action: 'Action',
      entity: 'Entity',
      timestamp: 'Timestamp',
      details: 'Details',
      filterAll: 'All Actions',
      export: 'Export Logs'
    },
    ur: {
      title: 'آڈٹ لاگز',
      searchPlaceholder: 'لاگز تلاش کریں...',
      user: 'صارف',
      action: 'عمل',
      entity: 'ادارہ',
      timestamp: 'وقت',
      details: 'تفصیلات',
      filterAll: 'تمام اعمال',
      export: 'لاگز ایکسپورٹ کریں'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Sample audit log data
  const auditLogs = [
    {
      id: 1,
      user: 'Admin',
      action: 'ADD_MEDICINE',
      entityId: 'MED_001',
      timestamp: '2024-06-11 14:30:25',
      details: 'Added Panadol Extra to inventory'
    },
    {
      id: 2,
      user: 'Pharmacist',
      action: 'SALE_COMPLETE',
      entityId: 'SALE_154',
      timestamp: '2024-06-11 14:25:10',
      details: 'Completed sale worth PKR 450.00'
    },
    {
      id: 3,
      user: 'Admin',
      action: 'DELETE_MEDICINE',
      entityId: 'MED_045',
      timestamp: '2024-06-11 13:45:30',
      details: 'Deleted expired medicine batch'
    },
    {
      id: 4,
      user: 'Manager',
      action: 'UPDATE_SETTINGS',
      entityId: 'SETTINGS',
      timestamp: '2024-06-11 12:15:45',
      details: 'Updated tax rate to 17%'
    }
  ];

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'ADD_MEDICINE': return 'default';
      case 'DELETE_MEDICINE': return 'destructive';
      case 'SALE_COMPLETE': return 'secondary';
      case 'UPDATE_SETTINGS': return 'outline';
      default: return 'default';
    }
  };

  const filteredLogs = auditLogs.filter(log =>
    (filterAction === 'all' || log.action === filterAction) &&
    (log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportLogs = async (format: 'pdf' | 'excel') => {
    try {
      setIsExporting(true);
      
      // Prepare the export data
      const exportData = {
        title: `Audit_Logs_${new Date().toISOString().split('T')[0]}`,
        headers: [
          'Timestamp',
          'User',
          'Action',
          'Entity ID',
          'Details',
          'Status'
        ],
        data: filteredLogs.map(log => [
          log.timestamp,
          log.user,
          log.action.replace('_', ' '),
          log.entityId,
          log.details,
          'Completed' // Assuming all logs are completed actions
        ]),
        metadata: {
          'Report Type': 'Audit Logs',
          'Total Logs': filteredLogs.length.toString(),
          'Date Range': 'All Time', // Could be dynamic based on filter
          'Generated At': new Date().toLocaleString(),
          'Branch': 'Main Branch' // Could be dynamic in a real app
        }
      };

      // Call the appropriate export function
      if (format === 'pdf') {
        reportExporter.exportToPDF(exportData);
      } else {
        reportExporter.exportToExcel(exportData);
      }

      // Show success message
      toast({
        title: isUrdu ? 'لاگز ایکسپورٹ ہو گئے' : 'Logs Exported',
        description: isUrdu 
          ? `آڈٹ لاگز کامیابی سے ${format === 'pdf' ? 'پی ڈی ایف' : 'ایکسل'} میں ایکسپورٹ ہو گئے`
          : `Audit logs successfully exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: isUrdu ? 'خرابی' : 'Error',
        description: isUrdu 
          ? 'لاگز ایکسپورٹ کرتے وقت خرابی آئی ہے' 
          : 'Failed to export logs',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => handleExportLogs('pdf')}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            {t.export} PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExportLogs('excel')}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            {t.export} Excel
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
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
        <select 
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="all">{t.filterAll}</option>
          <option value="ADD_MEDICINE">Add Medicine</option>
          <option value="DELETE_MEDICINE">Delete Medicine</option>
          <option value="SALE_COMPLETE">Sale Complete</option>
          <option value="UPDATE_SETTINGS">Update Settings</option>
        </select>
      </div>

      {/* Audit Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{log.user}</span>
                      <Badge variant={getActionBadgeColor(log.action) as any}>
                        {log.action.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{log.details}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{log.timestamp}</span>
                      <span>Entity: {log.entityId}</span>
                    </div>
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

export default AuditLogs;
