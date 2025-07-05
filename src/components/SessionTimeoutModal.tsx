import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SessionTimeoutModalProps {
  open: boolean;
  onLogin: () => void;
}

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({ open, onLogin }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md w-full mx-auto text-center rounded-lg shadow-2xl border-2 border-blue-400 animate-fade-in bg-gradient-to-br from-white via-blue-50 to-blue-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-700 mb-2">Session Expired</DialogTitle>
        </DialogHeader>
        <div className="mb-4 text-gray-700 text-lg">
          For your security, please log in again.<br />
          <span className="block mt-2 text-base text-blue-500 font-semibold">You were inactive for 15 minutes.</span>
        </div>
        <Button className="mt-2 px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg text-lg font-semibold transition-all" onClick={onLogin}>
          Login Again
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SessionTimeoutModal;
