import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Pill } from 'lucide-react';
import { useAuditLog } from '@/contexts/AuditLogContext';

interface LoginProps {
  onLogin: (user: any) => void;
  isUrdu: boolean;
  setIsUrdu: (value: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, isUrdu, setIsUrdu }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { logAction } = useAuditLog();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      const user = {
        id: 1,
        username: credentials.username,
        role: 'admin',
        name: credentials.username === 'admin' ? 'Administrator' : 'Pharmacist'
      };
      onLogin(user);
      
      // Log the login action
      logAction('LOGIN', 
        isUrdu ? `${user.name} نے لاگ ان کیا` : `${user.name} logged in`,
        'user',
        user.id.toString()
      );
      
      setLoading(false);
    }, 1000);
  };

  const text = {
    en: {
      title: 'Mindspire Pharmacy POS',
      subtitle: 'Pakistan #1 Modern Pharmacy Management System',
      username: 'Username',
      password: 'Password',
      login: 'Sign In',
      demo: 'Demo Login',
      adminDemo: 'Admin Demo',
      pharmacistDemo: 'Pharmacist Demo'
    },
    ur: {
      
      title: 'مائنڈسپائر فارمیسی POS',
      subtitle: 'پاکستان کا #1 جدید فارمیسی مینجمنٹ سسٹم',
      username: 'صارف نام',
      password: 'پاس ورڈ',
      login: 'لاگ ان',
      demo: 'ڈیمو لاگ ان',
      adminDemo: 'ایڈمن ڈیمو',
      pharmacistDemo: 'فارماسسٹ ڈیمو'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-500 to-green-400 animate-gradient-x p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-lg animate-fade-in">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Pill className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className={`text-3xl font-extrabold text-primary drop-shadow-md animate-fade-in-slow${isUrdu ? ' urdu-font' : ''}`}>{isUrdu ? <span className="urdu-font">{t.title}</span> : t.title}</CardTitle>
          <p className={`text-base font-medium text-gray-600 mt-2 animate-fade-in-slow${isUrdu ? ' urdu-font' : ''}`}>{isUrdu ? <span className="urdu-font">{t.subtitle}</span> : t.subtitle}</p>
          
          
          <div className="flex justify-center mt-4">
            <Button
              variant={isUrdu ? "default" : "outline"}
              size="sm"
              onClick={() => setIsUrdu(true)}
              className="mr-2"
            >
              <span className="urdu-font">اردو</span>
            </Button>
            <Button
              variant={!isUrdu ? "default" : "outline"}
              size="sm"
              onClick={() => setIsUrdu(false)}
            >
              English
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t.login}</TabsTrigger>
              <TabsTrigger value="demo">{t.demo}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t.username}</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder={t.username}
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t.password}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t.password}
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {loading ? 'Signing in...' : t.login}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="demo">
              <div className="space-y-2">
                <Button
                  onClick={() => onLogin({ id: 1, username: 'admin', role: 'admin', name: 'Administrator' })}
                  className="w-full"
                  variant="outline"
                >
                  {t.adminDemo}
                </Button>
                <Button
                  onClick={() => onLogin({ id: 2, username: 'pharmacist', role: 'pharmacist', name: 'Pharmacist' })}
                  className="w-full"
                  variant="outline"
                >
                  {t.pharmacistDemo}
                </Button>
                <Button
                  onClick={() => onLogin({ id: 3, username: 'cashier', role: 'cashier', name: 'Cashier' })}
                  className="w-full"
                  variant="outline"
                >
                  {isUrdu ? 'کیشئر ڈیمو' : 'Cashier Demo'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
