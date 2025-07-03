import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { AlertTriangle } from 'lucide-react';

interface DoubleConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  checklist?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DoubleConfirmDialog: React.FC<DoubleConfirmDialogProps> = ({
  open,
  title = 'Confirm Deletion',
  description = 'This action is irreversible. Please confirm you understand the consequences before proceeding.',
  checklist = [
    'I understand this action cannot be undone.',
    'I have reviewed the item and wish to permanently delete it.'
  ],
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel
}) => {
  const [checked, setChecked] = useState<boolean[]>(Array(checklist.length).fill(false));

  const allChecked = checked.every(Boolean);

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 text-gray-700">{description}</div>
        <div className="space-y-2 my-2">
          {checklist.map((item, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <Checkbox
                checked={checked[idx]}
                onCheckedChange={v => setChecked(c => c.map((val, i) => i === idx ? !!v : val))}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="destructive" disabled={!allChecked} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
