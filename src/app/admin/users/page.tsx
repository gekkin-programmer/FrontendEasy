'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldCheck, Mail, Calendar, 
  ExternalLink, MoreVertical, CheckCircle2, XCircle, Trash2, Ban, Ghost,
  AlertTriangle
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { toast } from 'sonner';
import SpinningLoader from '@/src/components/SpinningLoader';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NeuModal, NeuButton } from '@/src/components/eazypost/DashboardUI';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  planType: string;
  status: string;
  role: string;
  createdAt: string;
  lastLoginAt: string;
  _count: {
    posts: number;
    createdSocialAccounts: number;
  }
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async (query: string = '') => {
    setLoading(true);
    try {
      const res = await api.get<User[]>(`/admin/users?search=${query}`);
      setUsers(res);
    } catch (e) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusUpdate = async (userId: string, status: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status });
      toast.success(`User status updated to ${status}`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      toast.success("User permanently deleted");
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (e) {
      toast.error("Failed to delete user");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleCleanupDB = async () => {
    if (!confirm("🚨 TOTAL_WIPE: This will delete ALL non-admin users and their data. Are you absolutely sure?")) return;
    try {
      const res = await api.post<any>('/admin/db-cleanup', {});
      toast.success(`Cleanup successful: ${res.deletedCount} users removed`);
      fetchUsers();
    } catch (e) {
      toast.error("Failed to cleanup database");
    }
  };

  if (loading && users.length === 0) return <SpinningLoader fullScreen={true} />;

  return (
    <div className="space-y-8">
      {/* 🔴 DELETION MODAL */}
      <NeuModal 
        isOpen={!!userToDelete} 
        onClose={() => setUserToDelete(null)} 
        title="CRITICAL_OPERATION"
      >
        <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-red-50 border-4 border-red-600 text-red-600">
                <AlertTriangle size={48} strokeWidth={3} />
                <div>
                    <p className="font-black uppercase text-lg leading-tight">Permanent_Wipe</p>
                    <p className="font-bold text-xs">This action will erase all associated data, posts, and social links.</p>
                </div>
            </div>
            
            <div className="p-4 border-2 border-black bg-zinc-50 font-mono text-xs dark:text-black">
                <p>TARGET_ID: {userToDelete?.id}</p>
                <p>IDENTITY: {userToDelete?.email}</p>
            </div>

            <div className="flex flex-col gap-2">
                <button 
                    onClick={handleDeleteUser}
                    className="w-full py-4 bg-red-600 text-white border-4 border-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                    Confirm_Deletion_Sequence
                </button>
                <button 
                    onClick={() => setUserToDelete(null)}
                    className="w-full py-2 font-bold uppercase text-xs hover:underline dark:text-white text-black"
                >
                    Abort_Process
                </button>
            </div>
        </div>
      </NeuModal>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">User_Directory</h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Managing {users.length} registered identities</p>
          <button 
            onClick={handleCleanupDB}
            className="mt-4 text-[10px] font-black uppercase text-red-500 border-2 border-red-500 px-2 py-1 hover:bg-red-500 hover:text-white transition-all"
          >
            Run_System_Cleanup (Admins Only)
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by email/name..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-900 border-4 border-white font-black uppercase text-xs focus:bg-white focus:text-black transition-all outline-none text-white focus:text-black"
                />
            </div>
            <button type="submit" className="px-8 py-4 bg-[#3C48F5] border-4 border-white font-black uppercase text-xs shadow-[4px_4px_0px_0px_#fff] text-white">Filter</button>
        </form>
      </header>

      {/* USERS TABLE */}
      <div className="bg-zinc-900 border-4 border-white overflow-hidden shadow-[16px_16px_0px_0px_#3C48F5]">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-white">
                  <thead>
                      <tr className="bg-white text-black border-b-4 border-black">
                          <th className="p-4 font-black uppercase text-xs">Identity</th>
                          <th className="p-4 font-black uppercase text-xs">Status</th>
                          <th className="p-4 font-black uppercase text-xs">Plan_Status</th>
                          <th className="p-4 font-black uppercase text-xs">Activity</th>
                          <th className="p-4 font-black uppercase text-xs">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-zinc-800">
                      {users.map((user) => (
                          <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors">
                              <td className="p-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-[#3C48F5] border-2 border-white flex items-center justify-center font-black">
                                          {user.firstName?.charAt(0) || 'U'}
                                      </div>
                                      <div>
                                          <p className="font-black uppercase text-sm tracking-tight">{user.firstName} {user.lastName}</p>
                                          <p className="text-[10px] font-mono text-gray-500">{user.email}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="p-4">
                                  <span className={`px-2 py-0.5 border-2 text-[8px] font-black uppercase tracking-tighter ${
                                      user.status === 'ACTIVE' ? 'border-green-500 text-green-500' : 
                                      user.status === 'BANNED' ? 'border-red-500 text-red-500 bg-red-500/10' :
                                      user.status === 'SHADOW_BANNED' ? 'border-purple-500 text-purple-500' :
                                      'border-zinc-500 text-zinc-500'
                                  }`}>
                                      {user.status}
                                  </span>
                              </td>
                              <td className="p-4">
                                  <span className={`px-3 py-1 border-2 font-black text-[10px] uppercase ${
                                      user.planType === 'FREE' ? 'border-zinc-700 text-gray-500' : 'border-[#3C48F5] text-[#3C48F5]'
                                  }`}>
                                      {user.planType}
                                  </span>
                              </td>
                              <td className="p-4">
                                  <div className="space-y-1">
                                      <p className="text-[10px] font-black uppercase opacity-60">Posts: {user._count.posts}</p>
                                      <p className="text-[10px] font-black uppercase opacity-60">Nodes: {user._count.createdSocialAccounts}</p>
                                  </div>
                              </td>
                              <td className="p-4 text-right">
                                  <div className="flex gap-2 justify-end">
                                      <Popover>
                                          <PopoverTrigger asChild>
                                              <button className="p-2 hover:bg-white hover:text-black border-2 border-transparent hover:border-black transition-all">
                                                  <MoreVertical size={18} />
                                              </button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-48 bg-white border-4 border-black p-0 rounded-none shadow-[8px_8px_0px_0px_#000]" align="end">
                                              <div className="flex flex-col font-black uppercase text-[10px] text-black">
                                                  <button onClick={() => handleStatusUpdate(user.id, 'ACTIVE')} className="p-3 text-left hover:bg-blue-50 border-b-2 border-zinc-100 flex items-center gap-2"><CheckCircle2 size={14}/> Reactive User</button>
                                                  <button onClick={() => handleStatusUpdate(user.id, 'SHADOW_BANNED')} className="p-3 text-left hover:bg-purple-50 border-b-2 border-zinc-100 flex items-center gap-2 text-purple-600"><Ghost size={14}/> Shadow Ban</button>
                                                  <button onClick={() => handleStatusUpdate(user.id, 'BANNED')} className="p-3 text-left hover:bg-red-50 border-b-2 border-zinc-100 flex items-center gap-2 text-red-600"><Ban size={14}/> Hard Ban</button>
                                                  <button onClick={() => setUserToDelete(user)} className="p-3 text-left hover:bg-red-600 hover:text-white flex items-center gap-2 text-red-600 transition-colors"><Trash2 size={14}/> Delete from DB</button>
                                              </div>
                                          </PopoverContent>
                                      </Popover>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}