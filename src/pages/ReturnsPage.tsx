import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReturnForm } from '@/components/returns/ReturnForm';
import { ReturnHistory } from '@/components/returns/ReturnHistory';
import { useToast } from '@/components/ui/use-toast';
import { returnService, ReturnReason } from '@/services/returnService';
import { useAuth } from '@/hooks/useAuth';

export function ReturnsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('customer');
  const [returnHistory, setReturnHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await returnService.getRecentReturns();
      setReturnHistory(history);
    };
    loadHistory();
  }, []);

  const handleSuccess = async (
    type: 'customer' | 'supplier', 
    medicine: {id: string, name: string}, 
    quantity: number, 
    reason: string,
    reasonCategory: ReturnReason
  ) => {
    try {
      await returnService.addReturn({
        type,
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity,
        reason,
        reasonCategory,
        processedBy: user?.name || 'System'
      });
      
      // Refresh history
      const history = await returnService.getRecentReturns();
      setReturnHistory(history);
      
      toast({
        title: 'Success',
        description: 'Return processed and recorded',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record return history',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Returns Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">Customer Returns</TabsTrigger>
              <TabsTrigger value="supplier">Supplier Returns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Process Customer Return</h2>
                <ReturnForm 
                  type="customer" 
                  onSuccess={(medicine, quantity, reason, reasonCategory) => 
                    handleSuccess('customer', medicine, quantity, reason, reasonCategory)
                  } 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="supplier">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Process Supplier Return</h2>
                <ReturnForm 
                  type="supplier" 
                  onSuccess={(medicine, quantity, reason, reasonCategory) => 
                    handleSuccess('supplier', medicine, quantity, reason, reasonCategory)
                  } 
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Returns</h2>
            <ReturnHistory data={returnHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
