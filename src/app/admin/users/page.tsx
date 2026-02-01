'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Search, ShieldCheck, Mail, Calendar, 
  ExternalLink, MoreVertical, CheckCircle2, XCircle
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { toast } from 'sonner';
import SpinningLoader from '@/src/components/SpinningLoader';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  planType: string;
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  if (loading && users.length === 0) return <SpinningLoader fullScreen={true} />;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">User_Directory</h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Managing {users.length} registered identities</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by email/name..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-900 border-4 border-white font-black uppercase text-xs focus:bg-white focus:text-black transition-all outline-none"
                />
            </div>
            <button type="submit" className="px-8 py-4 bg-[#3C48F5] border-4 border-white font-black uppercase text-xs shadow-[4px_4px_0px_0px_#fff]">Filter</button>
        </form>
      </header>

      {/* USERS TABLE */}
      <div className="bg-zinc-900 border-4 border-white overflow-hidden shadow-[16px_16px_0px_0px_#3C48F5]">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-white text-black border-b-4 border-black">
                          <th className="p-4 font-black uppercase text-xs">Identity</th>
                          <th className="p-4 font-black uppercase text-xs">Plan_Status</th>
                          <th className="p-4 font-black uppercase text-xs">Activity</th>
                          <th className="p-4 font-black uppercase text-xs">Join_Date</th>
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
                              <td className="p-4">
                                  <p className="text-[10px] font-mono uppercase text-gray-400">
                                      {new Date(user.createdAt).toLocaleDateString()}
                                  </p>
                              </td>
                              <td className="p-4">
                                  <div className="flex gap-2">
                                      <button className="p-2 hover:bg-white hover:text-black border-2 border-transparent hover:border-black transition-all">
                                          <ShieldCheck size={18} />
                                      </button>
                                      <button className="p-2 hover:bg-white hover:text-black border-2 border-transparent hover:border-black transition-all">
                                          <ExternalLink size={18} />
                                      </button>
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
