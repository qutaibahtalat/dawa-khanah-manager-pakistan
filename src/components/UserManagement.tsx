import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'pharmacist' | 'cashier';
  password: string;
}

const USER_STORAGE_KEY = 'pharmacy_users';

const defaultUsers: User[] = [
  { id: 1, username: 'admin', name: 'Administrator', role: 'admin', password: 'admin' },
  { id: 2, username: 'pharmacist', name: 'Pharmacist', role: 'pharmacist', password: 'pharmacist' },
  { id: 3, username: 'cashier', name: 'Cashier', role: 'cashier', password: 'cashier' },
];

function getUsers(): User[] {
  const saved = localStorage.getItem(USER_STORAGE_KEY);
  return saved ? JSON.parse(saved) : defaultUsers;
}

function saveUsers(users: User[]) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

const UserManagement: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>(getUsers());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [newUser, setNewUser] = useState<Partial<User>>({ username: '', name: '', role: 'cashier', password: '' });
  const [changeOwnPassword, setChangeOwnPassword] = useState(false);
  const [ownPassword, setOwnPassword] = useState('');
  const [ownNewPassword, setOwnNewPassword] = useState('');

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditData({ ...user });
  };

  const handleEditSave = () => {
    setUsers(users.map(u => u.id === editingId ? { ...u, ...editData } as User : u));
    setEditingId(null);
    setEditData({});
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.name) return;
    const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    setUsers([...users, { ...newUser, id } as User]);
    setNewUser({ username: '', name: '', role: 'cashier', password: '' });
  };

  const handleDelete = (id: number) => {
    if (id === currentUser.id) return;
    setUsers(users.filter(u => u.id !== id));
  };

  const handleOwnPasswordChange = () => {
    if (!ownPassword || !ownNewPassword) return;
    setUsers(users.map(u =>
      u.id === currentUser.id && u.password === ownPassword
        ? { ...u, password: ownNewPassword }
        : u
    ));
    setOwnPassword('');
    setOwnNewPassword('');
    setChangeOwnPassword(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="font-semibold mb-2">All Users</h2>
          <table className="w-full mb-4 border text-left">
            <thead>
              <tr>
                <th className="p-2 border">Username</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="p-2 border">{user.username}</td>
                  <td className="p-2 border">{editingId === user.id ? (
                    <Input
                      value={editData.name as string}
                      onChange={e => setEditData({ ...editData, name: e.target.value })}
                    />
                  ) : user.name}</td>
                  <td className="p-2 border">{editingId === user.id ? (
                    <Select value={editData.role as string} onValueChange={val => setEditData({ ...editData, role: val as User['role'] })}>
  <SelectTrigger className="w-[120px]">
    <SelectValue placeholder="Role" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="admin">Admin</SelectItem>
    <SelectItem value="pharmacist">Pharmacist</SelectItem>
    <SelectItem value="cashier">Cashier</SelectItem>
  </SelectContent>
</Select>
                  ) : user.role}</td>
                  <td className="p-2 border space-x-1">
                    {editingId === user.id ? (
                      <>
                        <Button size="sm" onClick={handleEditSave}>Save</Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                        <Input
                          placeholder="New Password"
                          type="password"
                          value={editData.password || ''}
                          onChange={e => setEditData({ ...editData, password: e.target.value })}
                          className="mt-1"
                        />
                      </>
                    ) : (
                      <>
                        <Button size="sm" onClick={() => handleEdit(user)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)} disabled={user.id === currentUser.id}>Delete</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="font-semibold mb-2">Add New User</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <Input
              placeholder="Username"
              value={newUser.username || ''}
              onChange={e => setNewUser({ ...newUser, username: e.target.value })}
            />
            <Input
              placeholder="Name"
              value={newUser.name || ''}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
            />
            <Select value={newUser.role as string} onValueChange={val => setNewUser({ ...newUser, role: val as User['role'] })}>
  <SelectTrigger className="w-[120px]">
    <SelectValue placeholder="Role" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="admin">Admin</SelectItem>
    <SelectItem value="pharmacist">Pharmacist</SelectItem>
    <SelectItem value="cashier">Cashier</SelectItem>
  </SelectContent>
</Select>
            <Input
              placeholder="Password"
              type="password"
              value={newUser.password || ''}
              onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            />
            <Button onClick={handleAddUser}>Add User</Button>
          </div>

          <h2 className="font-semibold mb-2">Change Own Password</h2>
          {!changeOwnPassword ? (
            <Button onClick={() => setChangeOwnPassword(true)}>Change Password</Button>
          ) : (
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Current Password"
                type="password"
                value={ownPassword}
                onChange={e => setOwnPassword(e.target.value)}
              />
              <Input
                placeholder="New Password"
                type="password"
                value={ownNewPassword}
                onChange={e => setOwnNewPassword(e.target.value)}
              />
              <Button onClick={handleOwnPasswordChange}>Save</Button>
              <Button variant="secondary" onClick={() => setChangeOwnPassword(false)}>Cancel</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
